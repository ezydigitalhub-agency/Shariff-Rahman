import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Users, 
  TrendingUp, 
  Calendar, 
  Search, 
  LogOut, 
  ExternalLink, 
  Settings, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
  DollarSign,
  Briefcase,
  HelpCircle,
  Bell,
  ChevronRight,
  Plus,
  Percent,
  Check,
  Printer,
  Eye,
  EyeOff,
  LayoutDashboard,
  CreditCard,
  Receipt
} from "lucide-react";
import { 
  db,
  fetchSubmissions, 
  syncUnsyncedToSheets, 
  getAccessToken,
  SPREADSHEET_ID,
  Submission
} from "../lib/firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import UserManagement from "./UserManagement";
import IncomeTracker from "./IncomeTracker";
import ExpenseTracker from "./ExpenseTracker";
import InvoicingSystem from "./InvoicingSystem";

interface AdminPanelProps {
  onBackToHome: () => void;
}

export default function AdminPanel({ onBackToHome }: AdminPanelProps) {
  // Authentication states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot password flow states
  const [showForgotFlow, setShowForgotFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: Send request, 2: Insert code, 3: Set new pass
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetNotification, setResetNotification] = useState<string | null>(null);
  const [simulatedMailInbox, setSimulatedMailInbox] = useState<string | null>(null);

  // Client Dashboard States
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "synced">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    totalVolume: 0
  });

  // Admin Credentials Storage (persisted state in localStorage to support live code checks)
  const [activeAdminPassword, setActiveAdminPassword] = useState(() => {
    return localStorage.getItem("mag_admin_password") || "@#Superadmin@#";
  });

  useEffect(() => {
    localStorage.setItem("mag_admin_password", activeAdminPassword);
  }, [activeAdminPassword]);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "income" | "expense" | "invoices">("overview");

  // User Management State
  const [adminUsers, setAdminUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem("mag_admin_users");
    if (saved) return JSON.parse(saved);
    return [
      { id: "u-1", name: "Shariff Rahman", email: "shariff@mortgagebrokerassist.com.au", role: "Principal Broker", allowedMenus: ["overview", "income", "expense", "invoices"] },
      { id: "u-2", name: "Assist Team Support", "email": "assist@mortgagebrokerassist.com.au", role: "Administrative Assistant", allowedMenus: ["overview", "invoices"] },
      { id: "u-3", name: "External Auditor", "email": "audits@ezydigitalhub.com", role: "Financial Accountant", allowedMenus: ["income", "expense"] }
    ];
  });

  useEffect(() => {
    localStorage.setItem("mag_admin_users", JSON.stringify(adminUsers));
  }, [adminUsers]);

  // Add User Form States
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Administrative Assistant");
  const [newUserAllowedMenus, setNewUserAllowedMenus] = useState<string[]>(["overview"]);

  // Income State
  const [incomeItems, setIncomeItems] = useState<any[]>(() => {
    const saved = localStorage.getItem("mag_income_items");
    if (saved) return JSON.parse(saved);
    return [
      { id: "inc-1", date: "2026-05-15", client: "James & Sarah Harrison Home Loan", amount: 6200, brokerageRate: 0.65, category: "Upfront Commission", status: "Paid", notes: "Settled with St. George. Capital count: $950,000" },
      { id: "inc-2", date: "2026-05-28", client: "Liam O'Connor Refinance Deal", amount: 2850, brokerageRate: 0.55, category: "Upfront Commission", status: "Paid", notes: "Macquarie Bank refinance. Fast clearance." },
      { id: "inc-3", date: "2026-06-01", client: "Emily Watson First Home Buyer ACT", amount: 4850, brokerageRate: 0.65, category: "Upfront Commission", status: "Pending", notes: "Approved by Commonwealth Bank. Settling mid June." }
    ];
  });

  useEffect(() => {
    localStorage.setItem("mag_income_items", JSON.stringify(incomeItems));
  }, [incomeItems]);

  // Add Income Form States
  const [showAddIncomeForm, setShowAddIncomeForm] = useState(false);
  const [incClient, setIncClient] = useState("");
  const [incDate, setIncDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incAmount, setIncAmount] = useState("");
  const [incRate, setIncRate] = useState("0.65");
  const [incCategory, setIncCategory] = useState("Upfront Commission");
  const [incStatus, setIncStatus] = useState("Paid");
  const [incNotes, setIncNotes] = useState("");

  // Expense State
  const [expenseItems, setExpenseItems] = useState<any[]>(() => {
    const saved = localStorage.getItem("mag_expense_items");
    if (saved) return JSON.parse(saved);
    return [
      { id: "exp-1", date: "2026-05-02", category: "Software Licences", amount: 420, payee: "NextGen Aggregator Platform", description: "Lending CRM monthly membership quota subscription" },
      { id: "exp-2", date: "2026-05-10", category: "Compliance & Training", amount: 180, payee: "MFAA Association", description: "National compliance seminar attendance fee" },
      { id: "exp-3", date: "2026-05-20", category: "Marketing Ads", amount: 1250, payee: "Google Search Campaigns", description: "Canberra home loan buyer keyword outreach ads" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("mag_expense_items", JSON.stringify(expenseItems));
  }, [expenseItems]);

  // Add Expense Form States
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expCategory, setExpCategory] = useState("Software Licences");
  const [expAmount, setExpAmount] = useState("");
  const [expPayee, setExpPayee] = useState("");
  const [expDesc, setExpDesc] = useState("");

  // Invoicing State
  const [invoiceItems, setInvoiceItems] = useState<any[]>(() => {
    const saved = localStorage.getItem("mag_invoice_items");
    if (saved) return JSON.parse(saved);
    return [
      { id: "INV-2026-001", date: "2026-05-08", dueDate: "2026-05-22", client: "Mortgage Australia Aggregator Group", details: "Harrison ACT Office ref", items: [{ description: "Brokerage commission claim split standard", qty: 1, price: 6200 }], status: "Paid", taxRate: 10, notes: "Processed automatically via NextGen aggregation node" },
      { id: "INV-2026-002", date: "2026-05-29", dueDate: "2026-06-12", client: "Macquarie Lending Operations", details: "Sydney HQ Refinance Node", items: [{ description: "Upfront brokerage settlement fee share", qty: 1, price: 2850 }], status: "Paid", taxRate: 10, notes: "Receipt verified by Macquarie" },
      { id: "INV-2026-003", date: "2026-06-02", dueDate: "2026-06-16", client: "Westpac Bank ACT Desk", details: "CBA Canberra branch ref 88", items: [{ description: "Advisory support split for professional mentoring", qty: 1, price: 1200 }], status: "Sent", taxRate: 10, notes: "Mentorship verification attached" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("mag_invoice_items", JSON.stringify(invoiceItems));
  }, [invoiceItems]);

  // Add Invoice Form States
  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [invNum, setInvNum] = useState(() => `INV-2026-0${Math.floor(10 + Math.random() * 90)}`);
  const [invDate, setInvDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [invClient, setInvClient] = useState("");
  const [invDetails, setInvDetails] = useState("");
  const [invItemDesc, setInvItemDesc] = useState("Mortgage broker advisory commissions");
  const [invItemPrice, setInvItemPrice] = useState("");
  const [invItemQty, setInvItemQty] = useState("1");
  const [invTaxRate, setInvTaxRate] = useState("10");
  const [invNotes, setInvNotes] = useState("");
  const [invStatus, setInvStatus] = useState("Sent");
  const [selectedInvoicePreview, setSelectedInvoicePreview] = useState<any | null>(null);
  const [simulatedUserSession, setSimulatedUserSession] = useState<any | null>(null);

  // Load Submissions
  const loadSubmissionsData = async () => {
    setLoading(true);
    try {
      const data = await fetchSubmissions();
      setSubmissions(data);
      computeStats(data);
    } catch (err) {
      console.error("Database initialization parameters warning:", err);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (data: Submission[]) => {
    const total = data.length;
    const synced = data.filter(s => s.syncedToSheet).length;
    const pending = total - synced;
    
    // Parse total target volume
    const totalVolume = data.reduce((sum, item) => {
      const amountStr = item.loanAmount || "";
      const num = parseInt(amountStr.replace(/[^0-9]/g, "")) || 0;
      return sum + num;
    }, 0);

    setStats({ total, synced, pending, totalVolume });
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadSubmissionsData();
    }
  }, [isLoggedIn]);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const checkEmail = email.trim().toLowerCase();
    
    if (checkEmail === "ezydigitalhub@gmail.com" && password === activeAdminPassword) {
      setIsLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError("Invalid combination. Confirm superadmin identity.");
    }
  };

  // Handle Send Reset Verification Code
  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail.trim().toLowerCase() !== "ezydigitalhub@gmail.com") {
      setResetNotification("Error: Email address does not match Superadmin owner account.");
      return;
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResetStep(2);
    setResetNotification("Verification instructions dispatched.");

    // Simulate sending an email with a visually stunning diagnostic toast box
    setSimulatedMailInbox(`[Simulated Mail Box: ezydigitalhub@gmail.com]
Subject: Admin Password Security Access Code
Your verification authentication code is: ${code}`);

    // Auto-remove notification after reading
    setTimeout(() => {
      setResetNotification(null);
    }, 5000);
  };

  // Handle Verify Code
  const handleVerifyResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode === generatedCode) {
      setResetStep(3);
      setResetNotification("Code verified. Supply new password credentials below.");
      setSimulatedMailInbox(null);
    } else {
      setResetNotification("Verification failed. Code mismatches or expired.");
    }
  };

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetNotification("Password must count at least 6 characters.");
      return;
    }
    
    setActiveAdminPassword(newPassword);
    setResetStep(1);
    setShowForgotFlow(false);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setSimulatedMailInbox(null);
    alert("Superadmin password update processed. Log in using your new credentials.");
  };

  // Trigger Sheet Sync
  const handleSheetSync = async () => {
    // Get sheets user login token
    const token = getAccessToken();
    if (!token) {
      alert("Authorize first using Google Auth at the bottom of the contact form!");
      return;
    }

    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncUnsyncedToSheets(token);
      setSyncStatus(`Sync success! Created ${res.success} rows, failures: ${res.failed}.`);
      loadSubmissionsData();
    } catch (err: any) {
      setSyncStatus("Failed to process Google Spreadsheet write operations. Re-authenticate standard permissions.");
    } finally {
      setSyncing(false);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Delete lead capture from local storage registries permanently?")) return;
    try {
      await deleteDoc(doc(db, "submissions", id));
      loadSubmissionsData();
    } catch (err) {
      alert("Database constraints prevented deletion.");
    }
  };

  // Toggle synced status manually for debugging
  const handleToggleSyncStatus = async (item: Submission) => {
    if (!item.id) return;
    try {
      const docRef = doc(db, "submissions", item.id);
      await updateDoc(docRef, { syncedToSheet: !item.syncedToSheet });
      loadSubmissionsData();
    } catch (err) {
      alert("Failed to modify record state.");
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.loanType.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "pending") return matchesSearch && !s.syncedToSheet;
    if (statusFilter === "synced") return matchesSearch && s.syncedToSheet;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#010b1a] text-zinc-100 font-bai selection:bg-[#ff6900]/30 selection:text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* Absolute Decorative Glow Matrix */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#004A99]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff6900]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Embedded Simulated Inbox Notifications */}
      {simulatedMailInbox && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-zinc-950/95 border border-[#ff6900] rounded-xl p-4 shadow-[0_4px_30px_rgba(255,105,0,0.25)] backdrop-blur-xl shrink-0">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest text-[#ff6900] font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              Simulated Mail Server Dispatch
            </span>
            <button onClick={() => setSimulatedMailInbox(null)} className="text-zinc-500 hover:text-white shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {simulatedMailInbox}
          </pre>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                alert("Verification code copied.");
              }}
              className="text-[9px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-100 px-2 py-1 rounded border border-zinc-800 transition uppercase cursor-pointer"
            >
              Copy Verification Code
            </button>
          </div>
        </div>
      )}

      {/* LOGIN OR RESET PAGE */}
      {!isLoggedIn ? (
        <div className="max-w-[420px] mx-auto mt-16 sm:mt-24 relative z-10">
          
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#ff6900]/10 border border-[#ff6900]/30 rounded-xl text-[#ff6900]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">Superadmin Gateway</h1>
              <p className="text-xs text-zinc-400 mt-1">Lending insights, pipeline analytics and sheets automation</p>
            </div>
          </div>

          <div className="bg-[#02132a] border border-[#004A99]/40 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,74,153,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#ff6900]" />

            {!showForgotFlow ? (
              // Standard Login
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Owner Identifier (Email)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email"
                      required
                      placeholder="ezydigitalhub@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#010b1a]/80 border border-[#004A99]/50 focus:border-[#ff6900] text-sm text-white rounded-xl focus:outline-none transition font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">Security passphrase</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowForgotFlow(true);
                        setResetStep(1);
                        setResetNotification(null);
                      }}
                      className="text-[10px] text-[#ff6900] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#010b1a]/80 border border-[#004A99]/50 focus:border-[#ff6900] text-sm text-white rounded-xl focus:outline-none transition font-sans"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-[#ff6900] hover:bg-[#e05c00] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 hover:shadow-[0_0_15px_rgba(255,105,0,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Retrieve Console
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              // Password Reset Section
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#ff6900]" />
                  <span>Administrative Verification Chain</span>
                </div>

                {resetNotification && (
                  <div className="bg-zinc-900 border border-zinc-800 text-xs p-3 rounded-lg text-zinc-300 text-center">
                    {resetNotification}
                  </div>
                )}

                {resetStep === 1 && (
                  <form onSubmit={handleSendResetCode} className="space-y-4">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      To safeguard active financial data structures, verification is required. Provide the registered admin account index to trigger a security token.
                    </p>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500">Account Index</label>
                      <input 
                        type="email"
                        required
                        placeholder="ezydigitalhub@gmail.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-[#010b1a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition font-sans"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-[#ff6900] hover:bg-[#e05c00] text-white text-xs font-bold uppercase tracking-wide rounded-xl transition cursor-pointer"
                    >
                      Dispatch Authorization Code
                    </button>
                  </form>
                )}

                {resetStep === 2 && (
                  <form onSubmit={handleVerifyResetCode} className="space-y-4">
                    <p className="text-[11px] text-[#ff6900] leading-relaxed">
                      Verification code has been synchronized. Extract the token from the simulated mail dashboard popup in the bottom corner of your screen.
                    </p>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500">6-Digit Code</label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full px-4 py-2 bg-[#010b1a] border border-[#004A99]/50 focus:border-[#ff6900] text-center tracking-[0.5em] text-sm text-white rounded-xl focus:outline-none transition font-sans"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-[#ff6900] hover:bg-[#e05c00] text-white text-xs font-bold uppercase tracking-wide rounded-xl transition cursor-pointer"
                    >
                      Authenticate Code
                    </button>
                  </form>
                )}

                {resetStep === 3 && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <p className="text-[11px] text-zinc-400">
                      Supply the update secure passphrase string to reset admin credentials.
                    </p>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500">New Password</label>
                      <input 
                        type="password"
                        required
                        placeholder="Enter secure password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-[#010b1a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition font-sans"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition cursor-pointer"
                    >
                      Commit Password Reset
                    </button>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForgotFlow(false);
                      setSimulatedMailInbox(null);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white"
                  >
                    Return to normal authentication
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <button 
              onClick={onBackToHome}
              className="text-xs text-zinc-500 hover:text-[#ff6900] transition flex items-center gap-1 mx-auto"
            >
              ← Back to Client Portal Page
            </button>
          </div>

        </div>
      ) : (
        // DASHBOARD PANEL LAYOUT
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#02132a] border border-[#004A99]/30 p-5 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6900]/10 border border-[#ff6900]/20 flex items-center justify-center text-[#ff6900] shrink-0">
                <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono tracking-wider text-[#ff6900] font-bold uppercase bg-[#ff6900]/10 px-2 py-0.5 rounded-full border border-[#ff6900]/20">
                    SUPERADMIN ACTIVE
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-zinc-400 font-mono">Live Monitoring</span>
                </div>
                <h1 className="text-xl font-bold font-display text-white mt-0.5">Shariff Lead Routing Desk</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400 hidden sm:block">
                Registered Superadmin: <b className="text-white">ezydigitalhub@gmail.com</b>
              </span>
              <button 
                onClick={() => {
                  setIsLoggedIn(false);
                  setEmail("");
                  setPassword("");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-xs transition font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout console
              </button>
              <button 
                onClick={onBackToHome}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs transition font-bold cursor-pointer"
              >
                Go to Website
              </button>
            </div>
          </div>

          {/* Active Simulation Sandbox Notifications Banner */}
          {simulatedUserSession && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span>
                  Active Restricted View Sandbox: Impersonating <b>{simulatedUserSession.name}</b> ({simulatedUserSession.role}). 
                  You only see options permitted in User Management!
                </span>
              </div>
              <button 
                onClick={() => setSimulatedUserSession(null)}
                className="px-3 py-1 bg-amber-500 hover:bg-[#ff6900] text-black hover:text-white font-extrabold text-[10px] uppercase rounded-lg transition shrink-0 select-none cursor-pointer"
              >
                Cancel Impersonation
              </button>
            </div>
          )}

          {/* Side-by-Side Sidebar and Viewport columns */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Sidebar Menu Panel */}
            <div className="w-full lg:w-64 shrink-0 bg-[#02132a] border border-[#004A99]/20 p-5 rounded-3xl space-y-2">
              <div className="pb-3 border-b border-[#004A99]/15">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6900] font-bold">Admin Directory</span>
                <h3 className="text-sm font-bold text-white mt-1">Practice Control Hub</h3>
              </div>
              
              <div className="space-y-1 pt-2">
                {[
                  { id: "overview", label: "Overview Panel", icon: LayoutDashboard },
                  { id: "users", label: "User Management", icon: Users },
                  { id: "income", label: "Income Tracker", icon: CreditCard },
                  { id: "expense", label: "Expense Ledger", icon: Receipt },
                  { id: "invoices", label: "Invoicing System", icon: FileText }
                ].map((item) => {
                  const allowedTabsList = simulatedUserSession
                    ? simulatedUserSession.allowedMenus
                    : ["overview", "users", "income", "expense", "invoices"];

                  if (!allowedTabsList.includes(item.id)) return null;
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-[#ff6900] text-white shadow-lg shadow-[#ff6900]/20"
                          : "text-zinc-400 hover:text-white hover:bg-[#004A99]/15"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                        {item.label}
                      </span>
                      {item.id === "users" && adminUsers.length > 0 && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${isActive ? "bg-white/20 text-white" : "bg-[#004A99]/40 text-blue-200"}`}>
                          {adminUsers.length}
                        </span>
                      )}
                      {item.id === "income" && incomeItems.length > 0 && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${isActive ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300"}`}>
                          {incomeItems.length}
                        </span>
                      )}
                      {item.id === "invoices" && invoiceItems.length > 0 && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${isActive ? "bg-white/20 text-white" : "bg-[#ff6900]/25 text-amber-200"}`}>
                          {invoiceItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#004A99]/15 text-center">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Settle Time: 12:03 UTC
                </span>
              </div>
            </div>

            {/* Main Tab Viewport */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Conditional Viewport Panels */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Metric Cards Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total leads card */}
            <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#004A99]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Grand Inbox Leads</span>
                  <span className="block text-2xl font-extrabold text-white tracking-tight leading-none">
                    {loading ? "..." : stats.total}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-2">Overall captured inquiries</p>
                </div>
                <div className="p-2.5 bg-[#004A99]/10 rounded-xl text-[#004A99] border border-[#004A99]/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Synced to spreadsheets */}
            <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-mono tracking-wider text-emerald-500 uppercase">Synchronized Row Count</span>
                  <span className="block text-2xl font-extrabold text-emerald-400 tracking-tight leading-none">
                    {loading ? "..." : stats.synced}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-2">Successfully appended columns</p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Pending synchronization */}
            <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff6900]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-mono tracking-wider text-[#ff6900] uppercase">Pending Integration Synced</span>
                  <span className="block text-2xl font-extrabold text-[#ff6900] tracking-tight leading-none">
                    {loading ? "..." : stats.pending}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-2">Captured locally in Firestore</p>
                </div>
                <div className="p-2.5 bg-[#ff6900]/10 rounded-xl text-[#ff6900] border border-[#ff6900]/20">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Total pipeline volume value */}
            <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-mono tracking-wider text-blue-400 uppercase">Inquired Capital Volume</span>
                  <span className="block text-xl font-extrabold text-white tracking-tight leading-none">
                    ${(stats.totalVolume / 1000000).toFixed(2)}M AUD
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-2">Combined home loans value bounds</p>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

          </div>

          {/* Integrated Charts & Manual Sheet Controller */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Google Sheets Trigger Station */}
            <div className="lg:col-span-4 bg-[#02132a] border border-[#004A99]/20 p-6 rounded-3xl space-y-5">
              <div>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6900] font-bold">Sheets Sync Engine</span>
                <h3 className="text-base font-bold text-white mt-1">Google Sheets Control Deck</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Triggers immediate structural cell transfers directly into the linked Google Sheets ledger file. Keep data pipelines clean.
                </p>
              </div>

              <div className="p-4 bg-[#010b1a]/80 border border-[#004A99]/40 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Destination File URL:</span>
                  <span className="text-[10px] font-bold text-zinc-300">Spreadsheet Matrix</span>
                </div>
                <p className="font-mono text-[10px] text-zinc-400 break-all select-all font-sans">
                  {SPREADSHEET_ID}
                </p>
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#ff6900] font-semibold hover:underline mt-1"
                >
                  View Live in Google Sheets Hub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {syncStatus && (
                <div className="p-3 bg-[#010b1a]/60 border border-[#ff6900]/20 text-zinc-300 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#ff6900] font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Engine Output Note</span>
                  </div>
                  <p className="opacity-90">{syncStatus}</p>
                </div>
              )}

              <button 
                onClick={handleSheetSync}
                disabled={syncing || stats.pending === 0}
                className="w-full py-3.5 bg-gradient-to-r from-[#ff6900] to-[#e05c00] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 hover:shadow-[0_0_20px_rgba(255,105,0,0.3)] disabled:opacity-50 disabled:hover:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Publishing rows..." : stats.pending === 0 ? "Spreadsheet fully synced" : `Append ${stats.pending} pending rows`}
              </button>

              <div className="text-[10px] text-zinc-500 font-mono text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Authorized with credential index</span>
              </div>
            </div>

            {/* SVG Visual Chart Analytics (Replaces heavy recharts packages) */}
            <div className="lg:col-span-8 bg-[#02132a] border border-[#004A99]/20 p-6 rounded-3xl flex flex-col justify-between">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">Pipeline telemetry</span>
                  <h3 className="text-base font-bold text-white mt-1">Lead Submission Distribution</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6900]" />
                    First Home Purchase
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004A99]" />
                    Refinancing
                  </span>
                </div>
              </div>

              {/* Majestic SVG Area Chart Visual */}
              <div className="h-52 w-full mt-6 relative">
                {submissions.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 italic">
                    Capture more client submissions to render trends
                  </div>
                ) : (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff6900" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#ff6900" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#004A99" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#004A99" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#004A99" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Chart path representing simulated pipeline frequency */}
                    <path
                      d="M 0,130 C 50,110 100,50 150,80 C 200,105 250,30 300,50 C 350,70 400,20 450,10 L 500,20 L 500,150 L 0,150 Z"
                      fill="url(#chartGlow)"
                    />
                    <path
                      d="M 0,130 C 50,110 100,50 150,80 C 200,105 250,30 300,50 C 350,70 400,20 450,10 L 500,20"
                      fill="none"
                      stroke="#ff6900"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Anchor point glow markers */}
                    <circle cx="150" cy="80" r="4.5" fill="#010b1a" stroke="#ff6900" strokeWidth="3" />
                    <circle cx="300" cy="50" r="4.5" fill="#010b1a" stroke="#ff6900" strokeWidth="3" />
                    <circle cx="450" cy="10" r="4.5" fill="#010b1a" stroke="#ff6900" strokeWidth="3" />
                  </svg>
                )}
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-2 pt-2 border-t border-[#004A99]/10">
                <span>Scenario Baseline Start</span>
                <span>Active Engagement Intersect</span>
                <span>Max Target Capacity Reached</span>
              </div>
            </div>

          </div>

          {/* Submissions Lead Registry table */}
          <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">Pipeline Matrix</span>
                <h3 className="text-base font-bold text-white mt-0.5">Leads Database Registry</h3>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search input */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    placeholder="Search client index..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-1.5 bg-[#010b1a] border border-[#004A99]/40 focus:border-[#ff6900] text-xs rounded-xl focus:outline-none transition text-white"
                  />
                </div>

                {/* Filter buttons */}
                <div className="flex bg-[#010b1a] border border-[#004A99]/40 p-1 rounded-xl shrink-0">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition cursor-pointer ${statusFilter === "all" ? "bg-[#ff6900]/10 text-[#ff6900]" : "text-zinc-400"}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition cursor-pointer ${statusFilter === "pending" ? "bg-[#ff6900]/10 text-[#ff6900]" : "text-zinc-400"}`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => setStatusFilter("synced")}
                    className={`px-3 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition cursor-pointer ${statusFilter === "synced" ? "bg-[#ff6900]/10 text-[#ff6900]" : "text-zinc-400"}`}
                  >
                    Synced
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500 gap-2 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-[#ff6900]" />
                Pulling leads database indexes...
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 italic text-xs">
                No matching submission rows registered in database.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                      <th className="p-4">Submission ID</th>
                      <th className="p-4">Client Details</th>
                      <th className="p-4">Loan Requirement</th>
                      <th className="p-4">Capital Target</th>
                      <th className="p-4">System Status</th>
                      <th className="p-4 text-center">Sheet Override</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#004A99]/10">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition">
                        <td className="p-4 font-mono text-[10px] text-zinc-500">
                          #{sub.id?.slice(0, 8) || "N/A"}
                        </td>
                        <td className="p-4">
                          <span className="font-extrabold text-white block text-sm">{sub.name}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">{sub.email}</span>
                          <span className="text-[10px] text-zinc-400 block font-mono font-sans mt-0.5">{sub.phone}</span>
                        </td>
                        <td className="p-4 text-zinc-300 font-medium">
                          <span className="px-2 py-0.5 rounded-full bg-[#004A99]/20 text-blue-300 text-[10px] font-semibold border border-[#004A99]/30">
                            {sub.loanType || "Home Loan"}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-medium text-white">
                          {sub.loanAmount || "N/A"}
                        </td>
                        <td className="p-4">
                          {sub.syncedToSheet ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              Synced to Sheet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff6900] bg-[#ff6900]/10 px-2 py-0.5 rounded-full border border-[#ff6900]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6900] animate-pulse" />
                              Firestore Only
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleSyncStatus(sub)}
                            className="text-[10px] font-semibold text-[#004A99] hover:text-[#ff6900] bg-[#02132a]/80 px-2.5 py-1 rounded-lg border border-[#004A99]/20 hover:border-[#ff6900]/30 transition uppercase cursor-pointer"
                            title="Force toggles synchronization status"
                          >
                            Toggle State
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="p-2 bg-[#02132a]/80 hover:bg-[#ff6900]/10 hover:text-[#ff6900] text-zinc-400 rounded-xl border border-[#004A99]/30 hover:border-[#ff6900]/40 transition cursor-pointer"
                              title="Review Scenario message text"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sub.id && handleDeleteSubmission(sub.id)}
                              className="p-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-xl border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

                </div>
              )}

              {activeTab === "users" && (
                <UserManagement
                  adminUsers={adminUsers}
                  setAdminUsers={setAdminUsers}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  setSimulatedUserSession={setSimulatedUserSession}
                />
              )}

              {activeTab === "income" && (
                <IncomeTracker
                  incomeItems={incomeItems}
                  setIncomeItems={setIncomeItems}
                />
              )}

              {activeTab === "expense" && (
                <ExpenseTracker
                  expenseItems={expenseItems}
                  setExpenseItems={setExpenseItems}
                />
              )}

              {activeTab === "invoices" && (
                <InvoicingSystem
                  invoiceItems={invoiceItems}
                  setInvoiceItems={setInvoiceItems}
                />
              )}

            </div>
          </div>

        </div>
      )}

      {/* LEAD DETAIL DIALOG DRAWER OVERLAY */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#02132a] border border-[#004A99]/30 rounded-3xl max-w-lg w-full relative overflow-hidden shadow-[0_10px_45px_rgba(0,0,0,0.8)]">
            
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#ff6900]" />

            <div className="p-6 border-b border-[#004A99]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#ff6900]/10 border border-[#ff6900]/20 text-[#ff6900] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Client Scenario Dossier</h3>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">ID: {selectedSubmission.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-[#004A99]/20 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[350px] overflow-y-auto">
              {/* Contact Data Card */}
              <div className="space-y-3 bg-[#010b1a]/60 border border-[#004A99]/20 p-4 rounded-xl">
                <h4 className="text-[10px] font-mono tracking-wider font-semibold text-zinc-500 uppercase">Contact index details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-zinc-500 text-[10px] uppercase">Contact Name</span>
                    <span className="text-white text-sm font-bold block mt-0.5">{selectedSubmission.name}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-[10px] uppercase">Phone/Mobile Number</span>
                    <a href={`tel:${selectedSubmission.phone}`} className="text-[#ff6900] text-sm hover:underline font-bold block mt-0.5">{selectedSubmission.phone}</a>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-zinc-500 text-[10px] uppercase">Secure Email Index</span>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-blue-400 font-semibold text-sm hover:underline block mt-0.5">{selectedSubmission.email}</a>
                  </div>
                </div>
              </div>

              {/* Loan requirements card */}
              <div className="grid grid-cols-2 gap-4 bg-[#010b1a]/60 border border-[#004A99]/20 p-4 rounded-xl">
                <div>
                  <span className="block text-zinc-500 text-[10px] uppercase">Mortgage Type</span>
                  <span className="text-white text-sm font-bold block mt-0.5">{selectedSubmission.loanType}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-[10px] uppercase">Financing Target Capital</span>
                  <span className="text-white text-sm font-bold block mt-0.5">{selectedSubmission.loanAmount}</span>
                </div>
              </div>

              {/* Message Block */}
              <div className="space-y-2">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-zinc-500">Scenario details & client notes</span>
                <div className="p-4 bg-[#010b1a]/40 border border-[#004A99]/10 rounded-xl text-zinc-300 leading-relaxed max-h-32 overflow-y-auto italic">
                  {selectedSubmission.message ? `"${selectedSubmission.message}"` : "(Client submitted details without message segment text)"}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#004A99]/10 bg-[#010b1a]/20 flex justify-end gap-3 text-xs">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl transition cursor-pointer"
              >
                Close details window
              </button>
              <button 
                onClick={() => {
                  window.open(`mailto:${selectedSubmission.email}?subject=Direct response to your mortgage inquiry scenario&body=Hi ${selectedSubmission.name}, thanks for reaching out to Shariff Rahman mortgage broker.`);
                }}
                className="px-4 py-2 bg-[#ff6900] hover:bg-[#e05c00] text-white font-bold rounded-xl transition cursor-pointer"
              >
                Email response
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
