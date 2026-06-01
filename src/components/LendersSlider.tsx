import React from "react";
import { Building2, Award } from "lucide-react";

export default function LendersSlider() {
  const lenders = [
    { name: "Commonwealth Bank", short: "CBA", tier: "Big 4 Bank" },
    { name: "Westpac", short: "WBC", tier: "Big 4 Bank" },
    { name: "National Australia Bank", short: "NAB", tier: "Big 4 Bank" },
    { name: "ANZ Bank", short: "ANZ", tier: "Big 4 Bank" },
    { name: "Macquarie Bank", short: "MQG", tier: "Major Lender" },
    { name: "ING", short: "ING", tier: "Digital Lender" },
    { name: "St.George Bank", short: "STG", tier: "Regional Giant" },
    { name: "Bankwest", short: "BWA", tier: "Owner Occupier Focus" },
    { name: "Suncorp", short: "SUN", tier: "National Insurer" },
    { name: "Pepper Money", short: "PPM", tier: "Specialist Lender" },
    { name: "Liberty Financial", short: "LBY", tier: "Flexible Commercial" },
  ];

  // Double list to make infinite scrolling marquee seamless
  const duplicatedLenders = [...lenders, ...lenders, ...lenders];

  return (
    <div className="py-12 border-t border-b border-zinc-900/60 bg-zinc-950/20 backdrop-blur-md relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] uppercase tracking-wider font-mono font-medium mb-3">
          <Award className="w-3 h-3" />
          Australia-wide Network
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
          Lender Network & Panel Collaborations
        </h3>
        <p className="text-zinc-500 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
          Comparing 1,350+ products across 31+ accredited lenders including Australia's Big 4, digital neo-banks, and commercial giants.
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Left Fade Mask */}
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        
        {/* Right Fade Mask */}
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Rolling Track */}
        <div className="flex gap-6 overflow-hidden select-none">
          <div className="animate-marquee flex gap-6 items-center">
            {duplicatedLenders.map((lender, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl py-3 px-5 hover:border-zinc-700 hover:bg-zinc-900/50 transition cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-zinc-100 font-display">
                    {lender.short}
                  </span>
                  <span className="block text-[9px] text-zinc-400 leading-none">
                    {lender.name}
                  </span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-950 text-blue-400/90 font-mono self-start mt-0.5 border border-zinc-800">
                  {lender.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
