import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  ChevronRight, 
  ArrowDownRight, 
  User, 
  MapPin, 
  Compass, 
  FileCheck, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  Users
} from "lucide-react";

// Import modular subcomponents
import GlowBackground from "./components/GlowBackground";
import Header from "./components/Header";
import MortgageCalculator from "./components/MortgageCalculator";
import LendersSlider from "./components/LendersSlider";
import ExperienceGrid from "./components/ExperienceGrid";
import QualificationsGrid from "./components/QualificationsGrid";
import ContactForm from "./components/ContactForm";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeServiceTab, setActiveServiceTab] = useState<"loans" | "support">("loans");

  // Handle Initial Entrance Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Section Tracking on Scroll (Matches the original structural JS behavior)
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["services", "experience", "qualifications", "contact"];
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;

      // Check hero first
      const heroElement = document.getElementById("hero");
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        if (rect.bottom > window.innerHeight * 0.4) {
          setActiveSection("hero");
          return;
        }
      }

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          const topPosition = rect.top + window.scrollY;
          const bottomPosition = topPosition + rect.height;

          if (scrollPosition >= topPosition && scrollPosition < bottomPosition) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative min-h-screen text-zinc-100 font-sans selection:bg-blue-600/30 selection:text-blue-100">
      
      {/* Dynamic Ambient Blur Background */}
      <GlowBackground />

      {/* Loader Sequence */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center"
          >
            <div className="text-center space-y-4">
              <motion.h1 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl sm:text-3xl font-bold font-display tracking-[0.25em] text-white uppercase font-serif"
              >
                SHARIFF RAHMAN
              </motion.h1>
              <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                Lending Intelligence & Broker Support
              </div>
              <div className="w-12 h-[1px] bg-blue-500 mx-auto mt-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header */}
      {!isLoading && <Header activeSection={activeSection} />}

      {/* HERO SECTION */}
      <section 
        id="hero" 
        className="min-h-screen flex items-center pt-28 pb-16 px-4 sm:px-6 relative"
      >
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Hero Left Content Block (Col-7) */}
          <div className="md:col-span-7 space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[11px] font-mono uppercase font-semibold"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                Principal Broker & Approved Mentor
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-none"
              >
                Shariff Rahman
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-blue-400 text-lg sm:text-xl font-semibold tracking-tight font-display"
              >
                Principal Mortgage Broker & Mentor
              </motion.p>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto md:mx-0"
            >
              Australian-based mortgage expert holding a Bachelor of Commerce in Accounting. 
              Delivering high-performance home loans, structural refinancing, and MFAA/FBAA approved mentoring nationwide. 
              Backed by Mortgage Australia Group—the group organizing 1 in every 10 home loans across Australia.
            </motion.p>

            {/* Quick stats grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0 border-t border-zinc-900 pt-6"
            >
              <div>
                <span className="block text-xl font-bold font-display text-white">1,350+</span>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-medium">Financial Products</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-display text-white">31+ Accredited</span>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-medium">Australian Lenders</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap justify-center md:justify-start gap-4"
            >
              <button
                onClick={() => handleScrollToSection("contact")}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Initiate Assessment
              </button>

              <button
                onClick={() => handleScrollToSection("services")}
                className="px-8 py-3.5 border border-white/20 hover:border-white hover:bg-white/5 text-zinc-300 hover:text-white rounded-full font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105"
              >
                Services Overview
              </button>
            </motion.div>

            {/* Quick credentials footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center md:justify-start gap-4 text-[11px] text-zinc-500 font-mono"
            >
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                Harrison ACT
              </span>
              <span className="text-zinc-800">|</span>
              <span className="flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                MFAA Approved
              </span>
              <span className="text-zinc-800">|</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                FBAA Approved
              </span>
            </motion.div>
          </div>

          {/* Hero Right Media Graphic (Col-5) */}
          <div className="md:col-span-5 flex justify-center relative">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative w-[280px] sm:w-[340px] aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 group shadow-2xl hover:border-blue-500/40 duration-300"
            >
              {/* Backglow element behind avatar */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-15" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-blue-400/10 opacity-30 blur-xl group-hover:opacity-50 duration-300" />

              <img
                src="https://ezydigitalhub.com/wp-content/uploads/2026/04/Asset-203.webp"
                alt="Shariff Rahman Mortgage Broker"
                className="w-full h-full object-cover relative z-10 transition duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Float Badge overlay */}
              <div className="absolute bottom-5 left-5 right-5 z-20 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight leading-none">Shariff Rahman</h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1 leading-none">Credit Representative #503529</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* CORE SERVICES TABBED SECTION */}
      <section 
        id="services" 
        className="px-4 sm:px-6 py-20 text-center max-w-6xl mx-auto"
      >
        <div className="mb-12">
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">OFFERINGS & COVERAGE</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white mt-1">
            Brokerage & Subcontract Operations
          </h2>
          <p className="text-zinc-400 text-sm mt-3 max-w-lg mx-auto">
            Choose between consumer financial products and premium backend processing help for registered Australian mortgage brokers.
          </p>
        </div>

        {/* Tab Pills Selection (Matches original video pills layout style) */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-zinc-900/60 border border-zinc-800 p-1 rounded-full backdrop-blur-lg">
            <button
              onClick={() => setActiveServiceTab("loans")}
              className={`px-6 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition ${
                activeServiceTab === "loans"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mortgage & Financing
            </button>
            <button
              onClick={() => setActiveServiceTab("support")}
              className={`px-6 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition ${
                activeServiceTab === "support"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Broker Support (MBAT)
            </button>
          </div>
        </div>

        {/* Dynamic Tab Cards Content */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
          {activeServiceTab === "loans" ? (
            <>
              {/* Home Purchase */}
              <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 space-y-4 hover:border-blue-500/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 duration-200">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">Competitive Purchase Loans</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tailored loan structures for first-home buyers, upgraders, and seasoned real estate investors. Utilizing state-of-the-art matching algorithms to pair your scenario with the correct lender parameters.
                </p>
                <ul className="text-[10px] text-zinc-500 space-y-1 font-mono pt-2 border-t border-zinc-900">
                  <li>• First Home Grant advice and structuring</li>
                  <li>• Complete comparison of Big 4 & boutique lenders</li>
                  <li>• Maximum borrowing capacity assessments</li>
                </ul>
              </div>

              {/* Loan Refinance */}
              <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 space-y-4 hover:border-blue-500/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 duration-200">
                  <Percent className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">Home Loan Refinancing</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Is your bank taking you for granted? Refinance to unlock competitive discount rates, restructure loan segments, consolidate auxiliary debts, and unlock equity reserves for home improvements or equity reinvesting.
                </p>
                <ul className="text-[10px] text-zinc-500 space-y-1 font-mono pt-2 border-t border-zinc-900">
                  <li>• Cash backs & fee rebate tracking</li>
                  <li>• Interest rate deduction audits</li>
                  <li>• Variable vs Fixed segmentation</li>
                </ul>
              </div>

              {/* Commercial Loans */}
              <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 space-y-4 hover:border-blue-500/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 duration-200">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">Commercial & Asset Finance</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Funding pathways for properties under commercial titles, property developments, machinery purchases, business expansions, and cash flow structures. Fast approvals via specialized commercial lenders.
                </p>
                <ul className="text-[10px] text-zinc-500 space-y-1 font-mono pt-2 border-t border-zinc-900">
                  <li>• Low-Doc commercial lending guidelines</li>
                  <li>• Asset, vehicle, and equipment lease lines</li>
                  <li>• Flexible repayment schedule alignments</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Back Office Processing */}
              <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 space-y-4 hover:border-blue-500/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 duration-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">End-to-End Loan Processing</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Free up your calendar and spend more time shaking hands with clients. MBAT represents a premium outsourced processing arm handling backend calculations, lender packet generation, and data compilation.
                </p>
                <ul className="text-[10px] text-zinc-500 space-y-1 font-mono pt-2 border-t border-zinc-900">
                  <li>• Accurate lender validation checks</li>
                  <li>• Full packaging logic & CRM uploads</li>
                  <li>• Continuous tracking until Settlement</li>
                </ul>
              </div>

              {/* CRM & Virtual Assistant */}
              <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 space-y-4 hover:border-blue-500/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 duration-200">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">Asynchronous Virtual Assistant</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Structured CRM data entry, automated email sequences, document checklist triggers, and customer query desks tailored entirely for active boutique mortgage brokers seeking systematic leverage.
                </p>
                <ul className="text-[10px] text-zinc-500 space-y-1 font-mono pt-2 border-t border-zinc-900">
                  <li>• CRM record audits and cleanups</li>
                  <li>• Client follow-up reminder matrices</li>
                  <li>• Post-settlement client care automation</li>
                </ul>
              </div>

              {/* Mentor Services */}
              <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 space-y-4 hover:border-blue-500/20 transition group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 duration-200">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">Approved Mentoring Pathway</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  MFAA & FBAA accredited mentorship for emerging brokers looking to satisfy strict first-two-year compliance guidelines. Learn loan structuring, client management, and aggregate parameters.
                </p>
                <ul className="text-[10px] text-zinc-500 space-y-1 font-mono pt-2 border-t border-zinc-900">
                  <li>• Official MFAA/FBAA sign-offs</li>
                  <li>• One-on-one deal construction audits</li>
                  <li>• Broker business development strategies</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Embed Interactive Loan Calculator - Majestic Value Adding Element */}
        <div className="mt-16 text-left">
          <MortgageCalculator />
        </div>

      </section>

      {/* DETAILED PROFESSIONAL CAREER GRID */}
      <ExperienceGrid />

      {/* EDUCATIONAL & REGULATORY COMPLIANCE GRID */}
      <QualificationsGrid />

      {/* LENDERS INFINITE SCROLLER */}
      <LendersSlider />

      {/* APPOINTMENT & CONTACT FORM */}
      <ContactForm />

      {/* MAIN FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-16 px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Regulatory Section */}
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-sm font-bold text-zinc-400 font-display uppercase tracking-wider">Credibility Disclosures</h4>
              <p className="leading-relaxed text-zinc-500">
                Shariff Rahman is an Authorised Credit Representative number <b>503529</b> of the Mortgage Australia Group Pty Ltd (Australian Credit Licence number representing compliance parameters with national ASIC guidelines). 
                Mortgage Australia Group is one of Australia's peak and largest home loan broking companies organizing over 1 in 10 mortgage applications nationwide monthly.
              </p>
              <p className="leading-relaxed text-zinc-500">
                <b>Harrison ACT 2914</b>. Operating locally in Canberra ACT the capital region while supplying outsourced virtual assistance, mentoring, and support nationwide to accredited brokers of MFAA & FBAA associations.
              </p>
            </div>

            {/* Insurance details */}
            <div className="md:col-span-4 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider block">Insured Underwrite</span>
              <p className="leading-relaxed text-zinc-500 text-[11px]">
                Professional Indemnity Cover against all advisory and processing actions up to <b>$20,000,000</b> to guarantee risk mitigation for clients and third-party partners.
              </p>
            </div>

          </div>

          <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <p>© 2026 Mortgage Broker Assist (MBAT) & Shariff Rahman. All Rights Reserved.</p>
            <div className="flex gap-4">
              <a href="#hero" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-white transition">Top</a>
              <span className="text-zinc-800">•</span>
              <a href="tel:0412028735" className="hover:text-white transition">0412 028 735</a>
              <span className="text-zinc-800">•</span>
              <a href="#contact" onClick={(e) => { e.preventDefault(); handleScrollToSection("contact"); }} className="hover:text-white transition">Free Audit</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
