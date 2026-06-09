import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight, ShieldCheck, User, Sun, Moon } from "lucide-react";

interface HeaderProps {
  activeSection: string;
  onNavigate?: (path: string) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({ activeSection, onNavigate, isDarkMode = true, onToggleTheme }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "qualifications", label: "Qualifications" },
    { id: "contact", label: "Contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for header spacing
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-4 left-0 w-full z-50 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className={`relative flex justify-between items-center px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-xl border ${
          isDarkMode 
            ? "bg-[#041126]/60 border-white/10 text-zinc-100 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
            : "bg-white/80 border-zinc-200 text-zinc-800 shadow-lg"
        }`}>
          
          {/* Logo / Left Block */}
          <a 
            href="#hero" 
            onClick={(e) => handleNavClick(e, "hero")}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full pr-2"
          >
            <div className={`relative overflow-hidden w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              isDarkMode ? "border-white/20 group-hover:border-[#ff6900]" : "border-zinc-300 group-hover:border-[#ff6900]"
            }`}>
              <img
                src="https://ezyhubltd.com/wp-content/uploads/2025/12/Linkdin-Profile@4x-100-scaled.jpg"
                alt="Shariff Rahman"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight transition-colors" style={{ color: "#ffffff" }}>
                Shariff Rahman
              </span>
              <span className="text-[9px] leading-none transition-colors font-semibold" style={{ color: "#ffffff" }}>
                Mortgage Broker Assist
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative text-xs tracking-wide uppercase font-semibold py-1 px-2 focus:outline-none duration-300 transition-colors ${
                  activeSection === item.id 
                    ? (isDarkMode ? "text-[#00fbff]" : "text-blue-600") 
                    : (isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900")
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.span
                    layoutId="activeUnderline"
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full ${
                      isDarkMode ? "bg-[#00fbff] shadow-[0_0_8px_#00fbff]" : "bg-blue-600"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Hire Me CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <span className={`text-[10px] font-mono pr-2 border-r flex items-center gap-1 ${
              isDarkMode ? "text-zinc-400 border-zinc-800" : "text-zinc-500 border-zinc-200"
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              CRN 503529
            </span>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className={`group text-xs font-semibold px-4 py-1.5 rounded-full transition duration-300 flex items-center gap-1.5 ${
                isDarkMode 
                  ? "bg-[#ff6900] hover:bg-[#ff8c3a] text-white hover:shadow-[0_0_15px_rgba(255,105,0,0.5)]" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg"
              }`}
            >
              Get Free Assessment
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Dark & Light Theme Switcher */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                isDarkMode 
                  ? "bg-zinc-950/60 border-white/10 hover:border-[#00fbff] text-zinc-400 hover:text-[#00fbff]" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#ff6900]" /> : <Moon className="w-4 h-4 text-blue-700" />}
            </button>

            {/* Admin Console Access icon link */}
            <button
              onClick={() => onNavigate?.("/adminpanel")}
              className={`p-2 rounded-full transition duration-200 cursor-pointer flex items-center justify-center relative group border ${
                isDarkMode 
                  ? "bg-zinc-950/60 border-white/10 hover:border-[#ff6900] text-zinc-400 hover:text-[#ff6900]" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200 hover:text-[#ff6900]"
              }`}
              title="Superadmin Active Console login"
            >
              <User className="w-4 h-4" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-900 text-[9px] font-mono tracking-wide uppercase px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none whitespace-nowrap text-zinc-200">
                Admin Console
              </span>
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme switcher on mobile */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer border ${
                isDarkMode 
                  ? "bg-zinc-950/60 border-white/10 text-zinc-400" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-600"
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#ff6900]" /> : <Moon className="w-4 h-4 text-blue-700" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1.5 rounded-full transition-colors ${
                isDarkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-800/50" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-20 left-4 right-4 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 md:hidden z-50 border ${
              isDarkMode 
                ? "bg-zinc-950/95 backdrop-blur-2xl border-zinc-800/80 text-zinc-300" 
                : "bg-white/95 backdrop-blur-2xl border-zinc-200 text-zinc-800 shadow-xl"
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDarkMode ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-500"
            }`}>
              <span className="text-xs uppercase tracking-widest font-mono">Navigation</span>
              <span className="text-xs font-mono">Canberra | Harrison ACT</span>
            </div>
            
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`py-2 text-md font-semibold text-left border-b transition-colors ${
                  isDarkMode ? "border-zinc-900/50" : "border-zinc-100"
                } ${
                  activeSection === item.id 
                    ? (isDarkMode ? "text-[#00fbff]" : "text-blue-600") 
                    : (isDarkMode ? "text-zinc-300 hover:text-white" : "text-zinc-600 hover:text-zinc-900")
                }`}
              >
                {item.label}
              </a>
            ))}

            <div className="mt-4 flex flex-col gap-3">
              <span className={`text-[10px] text-center font-mono py-1.5 rounded ${
                isDarkMode ? "text-zinc-400 bg-zinc-900" : "text-zinc-600 bg-zinc-100"
              }`}>
                Authorised Credit Rep #503529 | MFAA & FBAA Mentor
              </span>
              <a
                href="tel:0412028735"
                className={`w-full text-center py-3 text-white font-semibold text-sm rounded-xl transition duration-200 ${
                  isDarkMode 
                    ? "bg-[#ff6900] hover:bg-[#ff8c3a]" 
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                Call: 0412 028 735
              </a>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "contact")}
                className={`w-full text-center py-3 font-semibold text-sm rounded-xl border transition duration-200 ${
                  isDarkMode 
                    ? "bg-zinc-900 hover:bg-zinc-850 border-zinc-850 text-zinc-300" 
                    : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                }`}
              >
                Direct Message Assistance
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate?.("/adminpanel");
                }}
                className={`w-full text-center py-3 font-semibold text-sm font-bai rounded-xl border transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  isDarkMode 
                    ? "bg-zinc-950/80 hover:bg-zinc-900 text-[#ff6900]/85 border-[#ff6900]/20 hover:border-[#ff6900]/40" 
                    : "bg-orange-50 hover:bg-[#ff6900]/10 text-[#ff6900] border-[#ff6900]/20"
                }`}
              >
                <User className="w-4 h-4 text-[#ff6900]" />
                Admin Panel Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
