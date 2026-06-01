import React from "react";
import { Briefcase, Milestone, GraduationCap, Trophy, Award, Landmark, Sparkles, Network } from "lucide-react";
import { ExperienceNode } from "../types";

export default function ExperienceGrid() {
  const experiences: ExperienceNode[] = [
    {
      company: "Mortgage Broker Assist (MBAT)",
      role: "Principal, Founder & Mentor",
      duration: "2018 - Present",
      description: "Providing high-performance back-office loan processing, expert-level CRM orchestration, virtual assistant operations, and MFAA/FBAA approved mentoring for brokers nationwide.",
      iconType: "assist"
    },
    {
      company: "Mortgage Australia Group",
      role: "Authorised Credit Representative",
      duration: "2018 - Present",
      description: "Accredited advisor (CRN 503529) organizing professional home financing solutions with direct connection to Australia's largest broking network responsible for 1 in 10 home loans.",
      iconType: "broker"
    },
    {
      company: "Commonwealth Bank of Australia(CBA)",
      role: "Wealth Planning & Advisor Support",
      duration: "Prior to 2014",
      description: "Delivering detailed client financial planning and banking services inside Australia's peak financial institution. Developed extreme competency in credit analysis and bank underwriting parameters.",
      iconType: "bank"
    },
    {
      company: "National Independent Broking",
      role: "Fully Accredited Advisor",
      duration: "Since 2014",
      description: "Began independent mortgage brokerage services in Harrison ACT and surround districts, serving client refinance, first home buying, and business investment needs.",
      iconType: "mentor"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "assist":
        return <Network className="w-5 h-5 text-blue-400" />;
      case "broker":
        return <Award className="w-5 h-5 text-blue-400" />;
      case "bank":
        return <Landmark className="w-5 h-5 text-blue-400" />;
      default:
        return <Milestone className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <section id="experience" className="px-6 py-24 text-center max-w-6xl mx-auto border-t border-zinc-900">
      
      <div className="mb-12">
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">CAREER INSIGHTS</span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white mt-1">
          Professional Experience
        </h2>
        <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">
          From central banking environments to launching independent support networks for brokers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {experiences.map((exp, idx) => (
          <div
            key={idx}
            className="group aspect-[3/4.2] sm:aspect-[4/5] rounded-3xl p-6 border border-white/10 bg-zinc-900/10 backdrop-blur-xl hover:bg-zinc-900/30 hover:border-blue-500/30 hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between text-left relative overflow-hidden"
          >
            {/* Ambient Background Element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[30px] rounded-full group-hover:bg-blue-500/10" />

            {/* Top Container */}
            <div>
              {/* Icon Wrap */}
              <div className="w-10 h-10 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center mb-5 group-hover:scale-110 duration-300">
                {getIcon(exp.iconType)}
              </div>

              {/* Role Title */}
              <h3 className="text-base font-bold font-display text-white sm:text-lg leading-tight group-hover:text-blue-400 duration-300">
                {exp.role}
              </h3>

              {/* Company & Badge */}
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                {exp.company}
              </p>

              {/* Description Snippet */}
              <p className="text-[11px] leading-relaxed text-zinc-500 mt-4 group-hover:text-zinc-400 duration-200">
                {exp.description}
              </p>
            </div>

            {/* Bottom Duration Badge */}
            <div className="text-[10px] text-zinc-500 font-mono tracking-wider pt-4 border-t border-zinc-900 mt-auto">
              {exp.duration}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
