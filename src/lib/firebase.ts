import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
  Timestamp,
  setDoc,
  getDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// Spreadsheet Constants
export const SPREADSHEET_ID = "1LKX8Klgff1rCkg5WHgpOB0AyutsElafTRfLOTNMdWo4";

// Memory cache for Google OAuth Access Token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Google Auth Provider setup with Sheets scope
export const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

/**
 * Initialize Google Auth State and listen for changes
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Handle direct Google sign-in to retrieve Sheets access token
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Unable to retrieve Google Sheets access credentials from Firebase Auth.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Authentication error during Google Sign-In:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Log out and clear the cached OAuth credentials
 */
export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getAccessToken = (): string | null => cachedAccessToken;
export const setAccessToken = (token: string | null) => { cachedAccessToken = token; };

/* ================================================================
   LEAD SUBMISSIONS
   ================================================================ */

export interface Submission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  loanType: string;
  loanAmount: string;
  message: string;
  syncedToSheet: boolean;
  createdAt?: any;
}

export const saveSubmissionToFirestore = async (data: Omit<Submission, "syncedToSheet">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "submissions"), {
      ...data,
      syncedToSheet: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Firestore submission write failed:", error);
    throw error;
  }
};

export const fetchSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Submission[];
  } catch (error) {
    console.error("Failed to read submissions from database:", error);
    throw error;
  }
};

/* ================================================================
   GOOGLE SHEETS SYNC
   ================================================================ */

export const getFirstWorksheetTitle = async (accessToken: string, spreadsheetId: string): Promise<string> => {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Metadata read failed");
    const metadata = await res.json();
    const sheets = metadata.sheets;
    if (sheets && sheets.length > 0) return sheets[0].properties.title;
    return "Sheet1";
  } catch {
    return "Sheet1";
  }
};

export const appendSubmissionsToSheet = async (accessToken: string, submissions: Submission[]): Promise<boolean> => {
  if (submissions.length === 0) return true;
  try {
    const sheetName = await getFirstWorksheetTitle(accessToken, SPREADSHEET_ID);
    const range = `${sheetName}!A:G`;
    const rows = submissions.map(sub => {
      let formattedDate = "";
      if (sub.createdAt) {
        if (sub.createdAt.toDate) formattedDate = sub.createdAt.toDate().toLocaleString("en-AU");
        else if (sub.createdAt instanceof Date) formattedDate = sub.createdAt.toLocaleString("en-AU");
        else formattedDate = new Date(sub.createdAt).toLocaleString("en-AU");
      } else {
        formattedDate = new Date().toLocaleString("en-AU");
      }
      return [sub.id || "N/A", formattedDate, sub.name, sub.email, sub.phone, sub.loanType, sub.loanAmount, sub.message || ""];
    });
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
      { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ values: rows }) }
    );
    if (!response.ok) { const errBody = await response.json().catch(() => ({})); console.error("Google Sheets API rejected:", errBody); return false; }
    return true;
  } catch (error) {
    console.error("Google Sheets synchronization error:", error);
    return false;
  }
};

export const syncUnsyncedToSheets = async (accessToken: string): Promise<{ success: number; failed: number }> => {
  try {
    const q = query(collection(db, "submissions"), where("syncedToSheet", "==", false));
    const snapshot = await getDocs(q);
    const unsyncedDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Submission[];
    if (unsyncedDocs.length === 0) return { success: 0, failed: 0 };
    const syncOk = await appendSubmissionsToSheet(accessToken, unsyncedDocs);
    if (!syncOk) throw new Error("Append execution returned falsy status");
    let successCount = 0, failedCount = 0;
    for (const sub of unsyncedDocs) {
      if (!sub.id) continue;
      try { await updateDoc(doc(db, "submissions", sub.id), { syncedToSheet: true }); successCount++; }
      catch (err) { console.error(`Failed to update sync flag for ${sub.id}:`, err); failedCount++; }
    }
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error("Sheet synchronization failed:", error);
    throw error;
  }
};

/* ================================================================
   INVOICE FIRESTORE CRUD
   ================================================================ */

export interface InvoiceAttachment {
  name: string;
  url: string;
  type: string;
}

export interface FirestoreInvoice {
  id?: string;
  number: string;
  clientId: string;
  company: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
  items: Array<{ desc: string; qty: number; price: number }>;
  autoGenerated: boolean;
  emailSentAt: string | null;
  reminderSentAt: string | null;
  reminderSentCount: number;
  lastMailLog: string;
  createdAt?: any;
}

export const fetchInvoices = async (): Promise<FirestoreInvoice[]> => {
  try {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as FirestoreInvoice[];
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return [];
  }
};

export const saveInvoice = async (invoice: Omit<FirestoreInvoice, "id" | "createdAt">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "invoices"), {
      ...invoice,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to save invoice:", error);
    throw error;
  }
};

export const updateInvoiceStatus = async (id: string, status: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "invoices", id), { status });
  } catch (error) {
    console.error("Failed to update invoice status:", error);
    throw error;
  }
};

export const updateInvoiceEmailLog = async (id: string, fields: Partial<Pick<FirestoreInvoice, "emailSentAt" | "reminderSentAt" | "reminderSentCount" | "lastMailLog" | "status">>): Promise<void> => {
  try {
    await updateDoc(doc(db, "invoices", id), fields as any);
  } catch (error) {
    console.error("Failed to update invoice email log:", error);
    throw error;
  }
};

export const getUnpaidInvoicesOlderThan14Days = async (): Promise<FirestoreInvoice[]> => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const q = query(
      collection(db, "invoices"),
      where("status", "in", ["sent", "overdue"]),
      where("reminderSentCount", "==", 0)
    );
    const snapshot = await getDocs(q);
    const invoices = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as FirestoreInvoice[];
    return invoices.filter(inv => {
      if (!inv.emailSentAt) return false;
      return new Date(inv.emailSentAt) <= cutoff;
    });
  } catch (error) {
    console.error("Failed to query unpaid invoices:", error);
    return [];
  }
};

/* ================================================================
   EXPENSE ATTACHMENT — FIREBASE STORAGE
   ================================================================ */

export interface ExpenseAttachment {
  name: string;
  url: string;
  type: string;
  storagePath: string;
  uploadedAt: string;
}

/**
 * Upload a memo/document file for an expense to Firebase Storage.
 * Returns the attachment metadata with the public download URL.
 */
export const uploadExpenseAttachment = async (expenseId: string, file: File): Promise<ExpenseAttachment> => {
  try {
    const storagePath = `expenses/${expenseId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return {
      name: file.name,
      url,
      type: file.type,
      storagePath,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to upload attachment:", error);
    throw error;
  }
};

export const deleteExpenseAttachment = async (storagePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Failed to delete attachment:", error);
    throw error;
  }
};

/* ================================================================
   EXPENSE EDIT REQUESTS (for Admin role approval flow)
   ================================================================ */

export interface ExpenseEditRequest {
  id?: string;
  expenseId: string;
  requestedBy: string;
  requestedAt: string;
  proposedChanges: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  resolvedAt?: string;
  resolvedBy?: string;
}

export const saveEditRequest = async (request: Omit<ExpenseEditRequest, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "expense_edit_requests"), {
      ...request,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to save edit request:", error);
    throw error;
  }
};

export const getPendingEditRequests = async (): Promise<ExpenseEditRequest[]> => {
  try {
    const q = query(collection(db, "expense_edit_requests"), where("status", "==", "pending"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseEditRequest[];
  } catch (error) {
    console.error("Failed to fetch pending edit requests:", error);
    return [];
  }
};

export const resolveEditRequest = async (requestId: string, status: "approved" | "rejected", resolvedBy: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "expense_edit_requests", requestId), {
      status,
      resolvedAt: new Date().toISOString(),
      resolvedBy
    });
  } catch (error) {
    console.error("Failed to resolve edit request:", error);
    throw error;
  }
};
