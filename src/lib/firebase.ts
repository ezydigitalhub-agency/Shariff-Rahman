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
  doc, 
  query, 
  where, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

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
        // If logged in via Firebase but token is missing, notify success but with null token
        // The admin can click login again to refresh the Sheets credentials
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

/**
 * Get active cached spreadsheet token
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Inject OAuth access token manually
 */
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Schema interface for lead submissions
 */
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

/**
 * Create a new lead submission in Firestore
 */
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

/**
 * Fetch all submissions from Firestore
 */
export const fetchSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Submission[];
  } catch (error) {
    console.error("Failed to read submissions from database:", error);
    throw error;
  }
};

/**
 * Fetch the first worksheet tab title dynamically to avoid assumes of Sheet1 name
 */
export const getFirstWorksheetTitle = async (accessToken: string, spreadsheetId: string): Promise<string> => {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error("Metadata read failed");
    const metadata = await res.json();
    const sheets = metadata.sheets;
    if (sheets && sheets.length > 0) {
      return sheets[0].properties.title;
    }
    return "Sheet1";
  } catch {
    return "Sheet1"; // fallback safely
  }
};

/**
 * Push an array of submissions to Google Sheets using the Sheets Append API
 */
export const appendSubmissionsToSheet = async (
  accessToken: string,
  submissions: Submission[]
): Promise<boolean> => {
  if (submissions.length === 0) return true;

  try {
    const sheetName = await getFirstWorksheetTitle(accessToken, SPREADSHEET_ID);
    const range = `${sheetName}!A:G`;
    
    // Structure submissions as table row sheets
    // Columns: [ID / Reference, Date, Name, Email, Phone, Inquiry Requirement, Capital Target, Message]
    const rows = submissions.map(sub => {
      let formattedDate = "";
      if (sub.createdAt) {
        if (sub.createdAt.toDate) {
          formattedDate = sub.createdAt.toDate().toLocaleString("en-AU");
        } else if (sub.createdAt instanceof Date) {
          formattedDate = sub.createdAt.toLocaleString("en-AU");
        } else {
          formattedDate = new Date(sub.createdAt).toLocaleString("en-AU");
        }
      } else {
        formattedDate = new Date().toLocaleString("en-AU");
      }

      return [
        sub.id || "N/A",
        formattedDate,
        sub.name,
        sub.email,
        sub.phone,
        sub.loanType,
        sub.loanAmount,
        sub.message || ""
      ];
    });

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: rows
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("Google Sheets API rejected submission append:", errBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Google Sheets synchronization error:", error);
    return false;
  }
};

/**
 * Core Orchestrator: Syncs all pending unsynced submissions to Google Sheets
 */
export const syncUnsyncedToSheets = async (accessToken: string): Promise<{ success: number; failed: number }> => {
  try {
    const q = query(collection(db, "submissions"), where("syncedToSheet", "==", false));
    const snapshot = await getDocs(q);
    const unsyncedDocs = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Submission[];

    if (unsyncedDocs.length === 0) {
      return { success: 0, failed: 0 };
    }

    // Attempt append
    const syncOk = await appendSubmissionsToSheet(accessToken, unsyncedDocs);
    if (!syncOk) {
      throw new Error("Append execution returned falsy status");
    }

    // Flag as synced in Firestore
    let successCount = 0;
    let failedCount = 0;

    for (const sub of unsyncedDocs) {
      if (!sub.id) continue;
      try {
        const docRef = doc(db, "submissions", sub.id);
        await updateDoc(docRef, { syncedToSheet: true });
        successCount++;
      } catch (err) {
        console.error(`Failed to update sync flag for submission ${sub.id}:`, err);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error("Sheet synchronization failed:", error);
    throw error;
  }
};
