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



    </section>
  );
}

