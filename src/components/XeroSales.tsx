import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";
import {
  Search, Bell, Settings, HelpCircle, ChevronDown, Plus, ExternalLink,
  DollarSign, ArrowUpRight, TrendingUp, CheckCircle, FileText, ClipboardList
} from "lucide-react";

interface XeroSalesProps {
  isDarkMode: boolean;
}

export default function XeroSales({ isDarkMode }: XeroSalesProps) {
  const [selectedOrg, setSelectedOrg] = useState("EDH");
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Sales");

  const orgs = ["EDH", "Ezy Mortgage", "Ezy Outsource"];
  const menuOptions = ["Home", "Sales", "Purchases", "Reporting", "Accounting", "Tax", "Contacts", "Projects"];

  // Custom empty/flat data for Recharts, representing "Older", "Apr", "May", "Jun", "Jul", "Future"
  const chartData = [
    { name: "Older", value: 0 },
    { name: "Apr", value: 0 },
    { name: "May", value: 0 },
    { name: "Jun", value: 0 },
    { name: "Jul", value: 0 },
    { name: "Future", value: 0 },
  ];

  // Theme colors
  const pageBg = isDarkMode ? "bg-[#0c1017] text-gray-200" : "bg-[#f4f5f7] text-[#1a1d21]";
  const cardBg = isDarkMode ? "bg-[#111620] border-[#1e2633]" : "bg-white border-zinc-200";
  const headerBg = isDarkMode ? "bg-[#151c28] border-[#1e2633]" : "bg-[#1e2a38] text-white";
  const labelColor = isDarkMode ? "text-gray-400" : "text-[#555] font-medium";
  const valueColor = isDarkMode ? "text-white" : "text-zinc-900";
  const secondaryText = isDarkMode ? "text-gray-400" : "text-zinc-500";

  return (
    <div className={`w-full ${pageBg} font-sans pb-12 transition-colors duration-300`}>
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-4">
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white font-serif" : "text-gray-900 font-serif"}`}>
              Sales overview (EDH)
            </h2>
            <p className={`text-xs ${secondaryText} mt-1`}>
              Integration Sync: Real-time business sales diagnostics & status dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <div className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
              <CheckCircle size={12} />
              Synced with bank feed
            </div>
          </div>
        </div>

        {/* 2-Column Bento Box Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols in LG screens) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* INVOICES AND PAYMENTS */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText size={18} className="text-[#13b5ea]" />
                  Invoices and Payments
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded bg-[#13b5ea]/10 text-[#13b5ea] font-semibold`}>
                  Primary Ledger
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-500/5 hover:bg-[#13b5ea]/5 transition-all text-center">
                  <div className={`text-xs ${secondaryText}`}>Draft (2)</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${valueColor}`}>25,948.86</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-500/5 hover:bg-slate-500/10 transition-all text-center">
                  <div className={`text-xs ${secondaryText}`}>Awaiting approval (0)</div>
                  <div className={`text-xl font-semibold font-mono mt-1 text-slate-400`}>0.00</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-500/5 hover:bg-amber-500/5 transition-all text-center">
                  <div className={`text-xs ${secondaryText}`}>Awaiting payment (0)</div>
                  <div className={`text-xl font-semibold font-mono mt-1 text-slate-400`}>0.00</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-500/5 hover:bg-red-500/5 transition-all text-center">
                  <div className={`text-xs ${secondaryText}`}>Overdue (0)</div>
                  <div className={`text-xl font-semibold font-mono mt-1 text-slate-400`}>0.00</div>
                </div>
              </div>
            </div>

            {/* MONEY COMING IN & TRENDS */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    Money Coming In
                  </h3>
                  <p className={`text-xs ${secondaryText} mt-0.5`}>Weekly collection projection & invoices distribution</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <span className={`text-[10px] block uppercase tracking-wider ${secondaryText}`}>Due this week</span>
                    <span className="font-mono font-bold text-sm text-[#13b5ea]">0.00 AUD</span>
                  </div>
                  <div className="text-right border-l pl-4 border-zinc-200/50 dark:border-zinc-800/50">
                    <span className={`text-[10px] block uppercase tracking-wider ${secondaryText}`}>Due next week</span>
                    <span className="font-mono font-bold text-sm text-[#13b5ea]">0.00 AUD</span>
                  </div>
                </div>
              </div>

              {/* No active trends / empty graph text */}
              <div className="relative pt-6">
                <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center bg-zinc-950/20 dark:bg-zinc-950/40 backdrop-blur-[1px] rounded-lg">
                  <div className={`text-center p-4 max-w-sm rounded-lg bg-white/90 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-850 shadow-md`}>
                    <p className={`text-xs font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"} uppercase tracking-wider`}>
                      Empty Display
                    </p>
                    <p className={`text-sm font-semibold mt-1 ${isDarkMode ? "text-white" : "text-zinc-800"}`}>
                      No active trends for Older, Apr, May, Jun, Jul, Future
                    </p>
                    <p className={`text-xs ${secondaryText} mt-1`}>
                      All current invoices under these months have a flat balance or are pending ledger sync.
                    </p>
                  </div>
                </div>

                <div className="opacity-25 select-none pointer-events-none">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke={isDarkMode ? "#334155" : "#cbd5e1"} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDarkMode ? "#94a3b8" : "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: isDarkMode ? "#94a3b8" : "#64748b" }} tickFormatter={(val) => `${val}`} />
                      <Bar dataKey="value" fill="#13b5ea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CUSTOMERS OWING THE MOST */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-amber-500" />
                Customers Owing the Most
              </h3>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-8 text-center bg-slate-500/5">
                <p className={`text-sm italic font-medium ${secondaryText}`}>
                  "No contacts have an outstanding amount"
                </p>
                <p className={`text-xs ${secondaryText} mt-1`}>
                  All verified clients in the database have currently cleared or settled their respective invoices.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols in LG screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* ONLINE PAYMENTS (Stripe) */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-4">
                <h3 className="font-bold text-sm">Online Payments</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/10 text-[#13b5ea]">
                  Secure Gateway
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${secondaryText}`}>Powered by:</span>
                  <span className="text-sm font-black tracking-wide text-indigo-500 dark:text-indigo-400">stripe</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {["Visa", "Mastercard", "American Express", "Apple Pay", "Google Pay", "Link"].map((card) => (
                    <span key={card} className="text-[10px] px-2 py-1 rounded bg-slate-500/10 hover:bg-slate-500/15 font-semibold text-slate-500 dark:text-slate-400">
                      {card}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-500/5 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${secondaryText}`}>Total balance</span>
                  <span className="font-mono font-bold text-sm text-slate-400">—</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2 text-[11px]">
                  <span className={secondaryText}>Available to pay out</span>
                  <span className="font-mono text-zinc-400 font-bold"> [Hidden/Blank]</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className={secondaryText}>Next payout</span>
                  <span className="font-mono text-zinc-400 font-bold"> [Hidden/Blank]</span>
                </div>
              </div>
            </div>

            {/* BILLABLE EXPENSES */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <h3 className="font-bold text-sm mb-3">Billable Expenses</h3>
              <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-5 text-center bg-slate-500/5">
                <p className={`text-xs italic ${secondaryText}`}>
                  "No billable expenses to invoice"
                </p>
                <button className="text-xs text-[#13b5ea] hover:underline mt-2 font-medium flex items-center gap-1 mx-auto cursor-pointer">
                  Setup recurring costs <ArrowUpRight size={12} />
                </button>
              </div>
            </div>

            {/* QUOTES */}
            <div className={`p-6 rounded-xl border shadow-sm ${cardBg}`}>
              <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3 mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#13b5ea]" />
                  Quotes
                </h3>
              </div>
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between py-1.5 hover:bg-slate-500/5 px-2 rounded">
                  <span className={secondaryText}>Draft (0)</span>
                  <span className="font-semibold text-slate-400">0.00</span>
                </div>
                <div className="flex justify-between py-1.5 hover:bg-slate-500/5 px-2 rounded">
                  <span className={secondaryText}>Sent (0)</span>
                  <span className="font-semibold text-slate-400">0.00</span>
                </div>
                <div className="flex justify-between py-1.5 hover:bg-slate-500/5 px-2 rounded">
                  <span className={secondaryText}>Accepted (0)</span>
                  <span className="font-semibold text-slate-400">0.00</span>
                </div>
                <div className="flex justify-between py-1.5 hover:bg-slate-500/5 px-2 rounded">
                  <span className={secondaryText}>Expired (0)</span>
                  <span className="font-semibold text-slate-400">0.00</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
