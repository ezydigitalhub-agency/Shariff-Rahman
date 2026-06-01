import React from "react";
import { GraduationCap, Award, Shield, FileText, Heart, MapPin } from "lucide-react";
import { QualificationNode } from "../types";

export default function QualificationsGrid() {
  const academic: QualificationNode[] = [
    {
      title: "Bachelor of Commerce (Accounting)",
      institute: "Macquarie University",
      duration: "Completed Degree",
      highlight: "Heavy focus on credit modeling & corporate underwriting structure."
    },
    {
      title: "Mortgage Broking & Advising",
      institute: "National Cert IV & Diploma",
      duration: "AIG & Kaplan accreditation",
      highlight: "Certificate IV in Mortgage Broking & Diploma in Financial Advising."
    },
    {
      title: "Approved Mentor Status",
      institute: "MFAA & FBAA approved",
      duration: "Since 2018",
      highlight: "Holds full regulatory approval to mentor and sign off on emerging mortgage brokers."
    },
    {
      title: "$20,000,000 Indemnity Cover",
      institute: "Professional Liability Protection",
      duration: "Fully Insured",
      highlight: "Secured with top-tier underwriters to safeguard clients against any transaction contingencies."
    },
    {
      title: "Harrison ACT Community Care",
      institute: "Canberra Region Representative",
      duration: "Harrison Local Resident",
      highlight: "Fully committed to Canberra local first-home buyer advisory and district charities."
    }
  ];

  const getCardIcon = (idx: number) => {
    switch (idx) {
      case 0: return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 1: return <FileText className="w-5 h-5 text-blue-400" />;
      case 2: return <Award className="w-5 h-5 text-blue-400" />;
      case 3: return <Shield className="w-5 h-5 text-emerald-400" />;
      default: return <Heart className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <section id="qualifications" className="px-6 py-24 text-center max-w-6xl mx-auto border-t border-zinc-900">
      
      <div className="mb-12">
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">CREDENTIALS & COMPLIANCE</span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white mt-1">
          Credentials & Qualifications
        </h2>
        <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">
          Fully compliant, insured, and accredited with peak industry bodies (MFAA, FBAA) representing consumer-first lending standards.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {academic.map((node, idx) => (
          <div
            key={idx}
            className="group w-full sm:w-[280px] rounded-3xl p-6 border border-white/10 bg-zinc-900/10 backdrop-blur-xl hover:bg-zinc-900/30 hover:border-blue-500/30 hover:-translate-y-1 duration-300 flex flex-col justify-between text-left"
          >
            <div>
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center mb-4 group-hover:scale-110 duration-300">
                {getCardIcon(idx)}
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold font-display text-white mb-1.5 leading-snug group-hover:text-blue-400 duration-300">
                {node.title}
              </h3>

              {/* Institute */}
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                {node.institute}
              </p>

              {/* Result / Highlight */}
              {node.highlight && (
                <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed group-hover:text-zinc-400 duration-200">
                  {node.highlight}
                </p>
              )}
            </div>

            {/* Bottom tag */}
            {node.duration && (
              <div className="text-[9px] text-zinc-600 font-mono tracking-wider pt-3 border-t border-zinc-900 mt-6 flex items-center gap-1">
                {idx === 4 && <MapPin className="w-2.5 h-2.5 text-zinc-600 shrink-0" />}
                {node.duration}
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
  );
}
