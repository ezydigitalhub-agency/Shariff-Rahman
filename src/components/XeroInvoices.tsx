import React, { useState } from "react";
import {
  Search, Bell, Settings, HelpCircle, ChevronDown, Plus, Mail, Download,
  Upload, Filter, MoreHorizontal, ArrowUpDown, ChevronRight, CheckCircle2,
  AlertCircle, RefreshCw, Send, Check
} from "lucide-react";

interface XeroInvoicesProps {
  isDarkMode: boolean;
}

interface InvoiceItem {
  number: string;
  ref: string;
  to: string;
  date: string;
  dueDate: string;
  paid: number;
  due: number;
  status: "Draft" | "Awaiting Approval" | "Awaiting Payment" | "Paid" | "Repeating";
  sent: boolean;
}

export default function XeroInvoices({ isDarkMode }: XeroInvoicesProps) {
  const [selectedOrg, setSelectedOrg] = useState("EDH");
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Sales");
  
  // Custom dropdown for 'New Invoice'
  const [showNewInvoiceDropdown, setShowNewInvoiceDropdown] = useState(true); // Open by default as requested!
  const [activeTab, setActiveTab] = useState<"All" | "Draft" | "Awaiting Approval" | "Awaiting Payment" | "Paid" | "Repeating">("All");
  
  // Invoice Reminders state
  const [remindersOn, setRemindersOn] = useState(false);

  // Invoices list state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      number: "INV-0002",
      ref: "newaz",
      to: "Rakib",
      date: "8 Jun 2026",
      dueDate: "15 Jun 2026",
      paid: 0.00,
      due: 300.00,
      status: "Draft",
      sent: false
    },
    {
      number: "INV-0001",
      ref: "Ad camp",
      to: "Rakib",
      date: "1 Jun 2026",
      dueDate: "8 Jun 2026",
      paid: 0.00,
      due: 25648.86, // Added to total 25,948.86 of Drafts from Sales overview!
      status: "Draft",
      sent: false
    }
  ]);

  const orgs = ["EDH", "Ezy Mortgage", "Ezy Outsource"];
  const menuOptions = ["Home", "Sales", "Purchases", "Reporting", "Accounting", "Tax", "Contacts", "Projects"];
  
  // Add a new invoice to table interactively
  const handleCreateMockInvoice = (status: "Draft" | "Awaiting Approval" | "Awaiting Payment" | "Paid" | "Repeating") => {
    const nextNum = `INV-000${invoices.length + 1}`;
    const newInv: InvoiceItem = {
      number: nextNum,
      ref: "Quick Invoice",
      to: "Rakib",
      date: "8 Jun 2026",
      dueDate: "22 Jun 2026",
      paid: 0.00,
      due: 1500.00,
      status: status,
      sent: false
    };
    setInvoices([newInv, ...invoices]);
    setShowNewInvoiceDropdown(false);
  };

  // Filter items based on selected tab
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "All") return true;
    return inv.status === activeTab;
  });

  // Calculate counts for status tags
  const draftCount = invoices.filter(i => i.status === "Draft").length;
  const awaitingApprovalCount = invoices.filter(i => i.status === "Awaiting Approval").length;
  const awaitingPaymentCount = invoices.filter(i => i.status === "Awaiting Payment").length;
  const paidCount = invoices.filter(i => i.status === "Paid").length;
  const repeatingCount = invoices.filter(i => i.status === "Repeating").length;

  // Theme support
  const pageBg = isDarkMode ? "bg-[#0c1017] text-gray-200" : "bg-[#f4f5f7] text-[#1a1d21]";
  const cardBg = isDarkMode ? "bg-[#111620] border-[#1e2633]" : "bg-white border-zinc-200";
  const headerBg = isDarkMode ? "bg-[#151c28] border-[#1e2633]" : "bg-[#1e2a38] text-white";
  const secondaryText = isDarkMode ? "text-gray-400" : "text-zinc-500";
  const selectTheme = isDarkMode ? "bg-[#151c28] border-zinc-800 text-white" : "bg-white border-zinc-200 text-gray-800";
  const hoverRowTheme = isDarkMode ? "hover:bg-[#151c28]/40" : "hover:bg-slate-50";

  return (
    <div className={`w-full ${pageBg} font-sans pb-12 transition-colors duration-300`}>
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 mt-4">
        
        {/* Header Title + Stats bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className={`text-2xl font-bold font-serif ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Invoices (EDH)
            </h2>
            <p className={`text-xs ${secondaryText}`}>
              Generate repeating billing matrices, distribute customer statements, and synchronize ledger feeds.
            </p>
          </div>
          
          {/* Invoice Reminders toggle */}
          <div className={`p-3 rounded-lg border flex items-center gap-4 text-xs font-medium shadow-sm bg-slate-500/5 ${isDarkMode ? "border-zinc-800" : "border-zinc-200"}`}>
            <span className={secondaryText}>Invoice Reminders:</span>
            <button
              onClick={() => setRemindersOn(!remindersOn)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all relative ${
                remindersOn
                  ? "bg-emerald-500 text-white" 
                  : "bg-zinc-500/20 text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {remindersOn ? "On (Active)" : "Off"}
            </button>
          </div>
        </div>

        {/* 2. Action Buttons & New Invoice Dropdown Area */}
        <div className="flex flex-wrap items-center gap-3 mb-6 relative">
          
          {/* New Invoice Dropdown Controller */}
          <div className="relative">
            <button
              onClick={() => setShowNewInvoiceDropdown(!showNewInvoiceDropdown)}
              className="bg-[#13b5ea] hover:bg-[#119ecb] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>New Invoice</span>
              <ChevronDown size={14} />
            </button>

            {/* Dynamic Dropdown Panel (Shown by default on load, toggleable) */}
            {showNewInvoiceDropdown && (
              <div 
                className={`absolute left-0 mt-2 w-64 rounded-xl shadow-xl z-50 border p-2 transition-all p-3 ${
                  isDarkMode ? "bg-[#111620] border-zinc-800" : "bg-white border-zinc-200"
                }`}
                style={{ minWidth: "260px" }}
              >
                <div className={`text-[10px] uppercase font-bold tracking-wider mb-2 px-3 ${secondaryText}`}>
                  Billing Inputs
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleCreateMockInvoice("Draft")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-[#13b5ea]/15 transition-colors font-semibold flex items-center justify-between"
                  >
                    <span>New Invoice</span>
                    <span className="text-[9px] bg-slate-500/10 px-1.5 py-0.5 rounded">Standard</span>
                  </button>
                  <button
                    onClick={() => handleCreateMockInvoice("Repeating")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-[#13b5ea]/15 transition-colors font-semibold flex items-center justify-between"
                  >
                    <span>New Repeating Invoice</span>
                    <span className="text-[9px] text-[#13b5ea] bg-[#13b5ea]/10 px-1.5 py-0.5 rounded font-bold">Auto</span>
                  </button>
                  <button
                    onClick={() => alert("Select a Contact group for billing setup")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-500/10 transition-colors text-slate-400 font-medium"
                  >
                    INVOICE TO... Add contact group
                  </button>
                  <button
                    onClick={() => handleCreateMockInvoice("Awaiting Approval")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-500/10 transition-colors text-slate-400 font-medium"
                  >
                    New Repeating Invoice
                  </button>
                  <button
                    onClick={() => handleCreateMockInvoice("Awaiting Payment")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-[#13b5ea]/15 transition-colors font-semibold text-rose-500 hover:text-rose-600"
                  >
                    New Credit Note
                  </button>
                </div>

                <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 my-2 pt-2"></div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => alert("Distributing system wide customer statements...")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-500/10 transition-colors font-medium flex items-center gap-2"
                  >
                    <Send size={12} className="text-zinc-400" />
                    <span>Send Statements</span>
                  </button>
                  <button
                    onClick={() => alert("Awaiting sales ledger XML/CSV imports...")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-500/10 transition-colors font-medium flex items-center gap-2"
                  >
                    <Upload size={12} className="text-zinc-400" />
                    <span>Import</span>
                  </button>
                  <button
                    onClick={() => alert("Downloading active sales table to CSV...")}
                    className="w-full text-left px-3 py-2 rounded text-xs hover:bg-slate-500/10 transition-colors font-medium flex items-center gap-2"
                  >
                    <Download size={12} className="text-zinc-400" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info button */}
          <button 
            onClick={() => setShowNewInvoiceDropdown(prev => !prev)}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-800 hover:bg-slate-500/5 text-xs font-semibold cursor-pointer flex items-center gap-1"
          >
            Dropdown: {showNewInvoiceDropdown ? "Opened" : "Closed"}
          </button>
        </div>

        {/* 3. Invoice Status Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2 mb-6">
          {(["All", "Draft", "Awaiting Approval", "Awaiting Payment", "Paid", "Repeating"] as const).map((tab) => {
            // Mapping dynamic count indicators
            let countLabel = "";
            let isSelected = activeTab === tab;
            
            if (tab === "Draft") countLabel = ` (${draftCount})`;
            else if (tab === "Awaiting Approval") countLabel = ` (${awaitingApprovalCount})`;
            else if (tab === "Awaiting Payment") countLabel = ` (${awaitingPaymentCount})`;
            else if (tab === "Paid") countLabel = ` (${paidCount})`;
            else if (tab === "Repeating") countLabel = ` (${repeatingCount})`;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#13b5ea] text-[#13b5ea] font-bold"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-zinc-500"
                }`}
              >
                {tab}{countLabel}
              </button>
            );
          })}
        </div>

        {/* 4. Invoice Table Card */}
        <div className={`border rounded-xl shadow-sm ${cardBg}`}>
          <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-slate-500/5 rounded-t-xl text-xs">
            <span className="font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">
              Active Listing Matrix
            </span>
            <span className="font-bold text-[#13b5ea] bg-[#13b5ea]/10 px-2.5 py-1 rounded-full text-[11px]">
              Total Items: {filteredInvoices.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-slate-500/5 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Number</th>
                  <th className="p-4">Ref</th>
                  <th className="p-4">To</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Paid</th>
                  <th className="p-4 text-right">Due</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.number} className={`${hoverRowTheme} transition-colors`}>
                    {/* Number */}
                    <td className="p-4 font-bold text-[#13b5ea] hover:underline cursor-pointer">
                      {inv.number}
                    </td>
                    {/* Ref */}
                    <td className="p-4 font-mono text-slate-400">
                      {inv.ref || "—"}
                    </td>
                    {/* To */}
                    <td className="p-4 font-semibold text-slate-800 dark:text-white">
                      {inv.to}
                    </td>
                    {/* Date */}
                    <td className="p-4 text-slate-500">
                      {inv.date}
                    </td>
                    {/* Due Date */}
                    <td className="p-4 text-slate-500">
                      {inv.dueDate}
                    </td>
                    {/* Paid */}
                    <td className="p-4 text-right font-mono text-slate-400">
                      {inv.paid.toFixed(2)}
                    </td>
                    {/* Due */}
                    <td className="p-4 text-right font-mono font-bold text-slate-800 dark:text-white">
                      {inv.due.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                    </td>
                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === "Draft" 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : inv.status === "Repeating"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    {/* Sent Checkbox / Action */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        {inv.sent ? (
                          <div className="h-4 w-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-sm">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const next = invoices.map(i => i.number === inv.number ? { ...i, sent: true } : i);
                              setInvoices(next);
                            }}
                            className="text-[10px] hover:text-[#13b5ea] text-zinc-400 cursor-pointer flex items-center gap-1 bg-slate-500/10 hover:bg-[#13b5ea]/10 px-2 py-0.5 rounded"
                            title="Mark as Sent"
                          >
                            <span>Mark sent</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table summary row */}
          <div className="p-4 flex justify-between items-center bg-slate-500/5 rounded-b-xl border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs">
            <span className={secondaryText}>
              Showing {filteredInvoices.length} of {invoices.length} invoices in ledger database
            </span>
            <div className="flex gap-4">
              <div>
                <span className={secondaryText}>Total outstanding draft: </span>
                <span className="font-bold text-[#13b5ea] font-mono">
                  ${invoices.filter(i => i.status === "Draft").reduce((sum, current) => sum + current.due, 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
