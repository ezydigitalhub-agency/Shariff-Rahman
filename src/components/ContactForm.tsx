import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  Clock, 
  Linkedin, 
  ArrowUpRight,
  Settings,
  RefreshCw,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  Loader2,
  Trash2,
  AlertTriangle,
  Check
} from "lucide-react";
import { ContactFormInput } from "../types";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  saveSubmissionToFirestore, 
  fetchSubmissions, 
  syncUnsyncedToSheets, 
  getAccessToken, 
  SPREADSHEET_ID, 
  Submission,
  db
} from "../lib/firebase";
import { User } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormInput>({
    name: "",
    email: "",
    phone: "",
    loanType: "Home Loan Refinancing",
    loanAmount: "$500,000 - $750,000",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sheets Sync state
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  // Monitor Google Sign In status
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        if (user) {
          loadDbSubmissions();
        }
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch from database
  const loadDbSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const records = await fetchSubmissions();
      setSubmissionsList(records);
    } catch (err) {
      console.error("Failed to load submissions from database:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Google sign in trigger
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        await handleManualSync(res.accessToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate with Google. Make sure permissions are accepted.");
    }
  };

  // Trigger Sheet Sync
  const handleManualSync = async (overrideToken?: string) => {
    const token = overrideToken || getAccessToken();
    if (!token) {
      setErrorMsg("Active session token is missing. Please authorize using the Google button below.");
      return;
    }
    setSyncing(true);
    setErrorMsg(null);
    setSyncResult(null);
    try {
      const res = await syncUnsyncedToSheets(token);
      setSyncResult(res);
      await loadDbSubmissions();
    } catch (err: any) {
      console.error("Sheets synchronization error:", err);
      setErrorMsg("Sheet sync failed. Verify permissions for spreadsheet writing.");
    } finally {
      setSyncing(false);
    }
  };

  // Disconnect auth
  const handleDisconnect = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setSubmissionsList([]);
      setSyncResult(null);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this submission record?")) return;
    try {
      await deleteDoc(doc(db, "submissions", id));
      await loadDbSubmissions();
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Unable to delete. Verify database rules permissions.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in your Name, Email and Contact Number.");
      return;
    }
    
    setSubmitting(true);
    setErrorMsg(null);
    
    try {
      // 1. Write the submission locally to Firestore (anonymous capture)
      const docId = await saveSubmissionToFirestore({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        loanType: formData.loanType,
        loanAmount: formData.loanAmount,
        message: formData.message
      });

      // 2. If the administrator is signed in on this screen, run immediate real-time sync
      const token = getAccessToken();
      if (token) {
        try {
          await syncUnsyncedToSheets(token);
          console.log("Real-time Sheets synchronization accomplished for ID:", docId);
        } catch (sheetErr) {
          console.warn("Immediate Sheet append failed; lead remains in Firestore for subsequent sync:", sheetErr);
        }
      }

      setSubmitting(false);
      setIsSubmitted(true);
      
      // Update local admin registry list if open
      if (currentUser) {
        loadDbSubmissions();
      }
    } catch (err: any) {
      console.error("Form transmission failed:", err);
      setErrorMsg("An error occurred while saving your details. Please call Shariff directly.");
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      loanType: "Home Loan Refinancing",
      loanAmount: "$500,000 - $750,000",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="px-6 py-24 max-w-6xl mx-auto border-t border-zinc-900">
      
      <div className="text-center mb-16">
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">GET ACCORD & ASSIST</span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white mt-1">
          Initiate Free Assessment
        </h2>
        <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
          Need a quick rate check or professional mentor sign-off? Drop a message and receive tailored calculations within 24 hours.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-10 items-stretch">
        
        {/* Contact Links & Directory Info (Col-5) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-display text-white">Direct Communication</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Skip the forms entirely by calling directly or connecting on LinkedIn for urgent pre-approvals or broker subcontracting.
            </p>

            <div className="space-y-4">
              {/* Telephone */}
              <a
                href="tel:0412028735"
                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 hover:border-blue-500/40 hover:bg-zinc-950/70 transition group block"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500">CALL OR TEXT SHARIFF</span>
                  <span className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">0412 028 735</span>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:shariffrahman@mortgageaustralia.com.au"
                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 hover:border-blue-500/40 hover:bg-zinc-950/70 transition group block"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500">EMAIL ENQUIRIES</span>
                  <span className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors break-all">shariffrahman@mortgageaustralia.com.au</span>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/shariffrahman"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 hover:border-blue-500/40 hover:bg-zinc-950/70 transition group block"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 duration-300">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500">CONNECT ON LINKEDIN</span>
                  <span className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    Shariff Rahman LinkedIn
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
                  </span>
                </div>
              </a>

              {/* Location Badge */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/20 border border-zinc-900/50">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 border border-zinc-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500">OFFICE LOCATION</span>
                  <span className="text-xs font-semibold text-zinc-300">Harrison ACT 2914 & Canberra Surrounds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick response stats */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl text-xs text-zinc-400 space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5 leading-none">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Responsive Service Standard
            </span>
            <p className="leading-relaxed">
              Standard turnaround is under <b>2 hours</b> for direct cell or sms, and under <b>24 hours</b> for online processing requests.
            </p>
          </div>

        </div>

        {/* Dynamic Multi-Input Form Block (Col-7) */}
        <div className="md:col-span-7 bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-blue-500/30 transition duration-300 flex flex-col justify-center">
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-medium text-white transition duration-200"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-medium text-white transition duration-200"
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="04XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-medium text-white transition duration-200"
                />
              </div>

              {/* Goal Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Inquiry Requirement</label>
                <select
                  value={formData.loanType}
                  onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-medium text-white transition duration-200 cursor-pointer"
                >
                  <option value="Home Loan Refinancing">Home Loan Refinancing & Savings Audit</option>
                  <option value="First Home Buyers">First Home Buyers Loan Package</option>
                  <option value="Commercial & Business Funding">Commercial & Asset Funding</option>
                  <option value="MBAT Back-office Support">MBAT Broker Subcontracting / Support</option>
                  <option value="MFAA Mentoring Sign-off">MFAA & FBAA Broking Mentorship</option>
                </select>
              </div>

              {/* Estimated Sizing option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Estimated Capital Target</label>
                <select
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-medium text-white transition duration-200 cursor-pointer"
                >
                  <option value="Under $350,000">Under $350,000</option>
                  <option value="$350,000 - $500,000">$350,000 - $500,000</option>
                  <option value="$500,000 - $750,000">$500,000 - $750,000</option>
                  <option value="$750,000 - $1,500,000">$750,000 - $1,500,000</option>
                  <option value="Over $1,500,000">Over $1,500,000</option>
                  <option value="Not Applicable">Not Applicable (Mentoring / Subcontract Support)</option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Brief Details</label>
                <textarea
                  rows={4}
                  placeholder="Outline any key dates, broker scenarios, or loan targets..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-medium text-white transition duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  "Verifying & Routing..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Broker Assistance Form
                  </>
                )}
              </button>

            </form>
          ) : (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">Assessment Form Transmitted</h3>
                <p className="text-zinc-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you, <b>{formData.name}</b>. Your interest in <b>{formData.loanType}</b> has been received. 
                  Shariff Rahman has been notified and will prepare custom lender parameters for you at <b>{formData.email}</b> or call <b>{formData.phone}</b> shortly.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-full transition cursor-pointer"
              >
                Send Another Scenario
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Google Sheets Sync Console / Admin Panel */}
      <div className="mt-16 pt-8 border-t border-zinc-900 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-[#ff6900] animate-pulse" />
            <div>
              <span className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase leading-none">Broker Integration Module</span>
              <span className="text-sm font-bold font-display text-white mt-0.5 block">Google Sheets Lead routing</span>
            </div>
          </div>
          <button
            onClick={() => setShowAdminConsole(!showAdminConsole)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs transition font-medium cursor-pointer"
          >
            <Settings className={`w-3.5 h-3.5 ${showAdminConsole ? "rotate-90 text-blue-500" : ""} transition-transform duration-300`} />
            {showAdminConsole ? "Hide Broker Panel" : "Configure Sheets Sync"}
          </button>
        </div>

        {showAdminConsole && (
          <div className="mt-6 p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 space-y-6">
            
            {/* Authorization Status section */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-6 pb-6 border-b border-zinc-900">
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">Synchronization Connection</h4>
                {currentUser ? (
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-200">
                      Connected as <b className="text-blue-400">{currentUser.email}</b>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Spreadsheet editing permissions granted
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Authorize this app with your Google Account (<code className="text-zinc-300 bg-zinc-900/40 px-1.5 py-0.5 rounded text-[10px]">ezydigitalhub@gmail.com</code>) to let form submissions write directly to your Google Sheets file.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => handleManualSync()}
                      disabled={syncing}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                      {syncing ? "Synchronizing..." : "Sync Pending Leads"}
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-red-950/40 hover:text-red-400 border border-zinc-800 rounded-xl text-xs transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-semibold rounded-xl text-xs transition duration-200 cursor-pointer"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    <span>Authorize with Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notifications Panel */}
            {(syncResult || errorMsg) && (
              <div className="rounded-xl text-xs space-y-1">
                {syncResult && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Sync Action Completed</p>
                      <p className="mt-0.5 opacity-90">
                        Successfully written <b>{syncResult.success}</b> row(s) into the Google Sheets spreadsheet file. Failed rows: {syncResult.failed}.
                      </p>
                    </div>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Execution Warning</p>
                      <p className="mt-0.5 opacity-90">{errorMsg}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Spreadsheet Destination config */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">Destination Excel Sheet</span>
                <p className="font-semibold text-zinc-300 break-all">ID: {SPREADSHEET_ID}</p>
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
              >
                Open Spreadsheet file
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Submissions Lead List */}
            {currentUser && (
              <div className="space-y-3">
                <h5 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase leading-none">Captured Leads database ({submissionsList.length})</h5>
                
                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-6 text-zinc-500 gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    Checking database registry...
                  </div>
                ) : submissionsList.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic py-4">No submissions captured yet.</p>
                ) : (
                  <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-900/80 border-b border-zinc-900 text-zinc-500 font-medium">
                          <th className="p-3">Client</th>
                          <th className="p-3">Mobile No.</th>
                          <th className="p-3">Requirement</th>
                          <th className="p-3">Target</th>
                          <th className="p-2">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {submissionsList.map((sub) => (
                          <tr key={sub.id} className="hover:bg-zinc-900/30 text-zinc-300">
                            <td className="p-3">
                              <span className="font-semibold text-white block text-sm">{sub.name}</span>
                              <span className="text-[10px] text-zinc-500 block mt-0.5">{sub.email}</span>
                            </td>
                            <td className="p-3 font-mono text-zinc-300">{sub.phone}</td>
                            <td className="p-3 text-zinc-400">{sub.loanType}</td>
                            <td className="p-3 text-zinc-400">{sub.loanAmount}</td>
                            <td className="p-2">
                              {sub.syncedToSheet ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                  Synced
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                                  <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => sub.id && handleDeleteSubmission(sub.id)}
                                className="p-1.5 hover:bg-zinc-900 hover:text-red-400 text-zinc-600 rounded-lg transition shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

    </section>
  );
}

