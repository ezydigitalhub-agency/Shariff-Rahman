import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

interface HeaderProps {
  activeSection: string;
}

export default function Header({ activeSection }: HeaderProps) {
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
        <div className="relative flex justify-between items-center bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 transition-all duration-300">
          
          {/* Logo / Left Block */}
          <a 
            href="#hero" 
            onClick={(e) => handleNavClick(e, "hero")}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full pr-2"
          >
            <div className="relative overflow-hidden w-8 h-8 rounded-full border border-white/20 group-hover:border-blue-400 duration-300">
              <img
                src="https://ezydigitalhub.com/wp-content/uploads/2026/04/Asset-203.webp"
                alt="Shariff Rahman"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Shariff Rahman
              </span>
              <span className="text-[9px] text-zinc-400 leading-none">
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
                className={`relative text-xs tracking-wide uppercase font-medium py-1 px-2 focus:outline-none duration-300 transition-colors ${
                  activeSection === item.id 
                    ? "text-blue-400" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.span
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Hire Me CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-mono pr-2 border-r border-zinc-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              CRN 503529
            </span>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="group text-xs font-semibold px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition duration-300 flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            >
              Get Free Assessment
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 md:hidden z-50"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Navigation</span>
              <span className="text-xs text-zinc-400 font-mono">Canberra | Harrison ACT</span>
            </div>
            
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`py-2 text-md font-medium text-left border-b border-zinc-900/50 transition-colors ${
                  activeSection === item.id ? "text-blue-400" : "text-zinc-300 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}

            <div className="mt-4 flex flex-col gap-3">
              <span className="text-[10px] text-zinc-400 text-center font-mono py-1 rounded bg-zinc-900">
                Authorised Credit Rep #503529 | MFAA & FBAA Mentor
              </span>
              <a
                href="tel:0412028735"
                className="w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition duration-200"
              >
                Call: 0412 028 735
              </a>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "contact")}
                className="w-full text-center py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm rounded-xl border border-zinc-800 transition duration-200"
              >
                Direct Message Assistance
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
