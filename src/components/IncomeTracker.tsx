import React, { useState } from "react";
import { Plus, Percent, Trash2, Landmark, Search, ShieldCheck } from "lucide-react";
import { Client } from "./ClientList";

interface IncomeTrackerProps {
  incomeItems: any[];
  setIncomeItems: React.Dispatch<React.SetStateAction<any[]>>;
  clients: Client[];
  editAllowed: boolean;
}

export default function IncomeTracker({ incomeItems, setIncomeItems, clients, editAllowed }: IncomeTrackerProps) {
  const [showAddIncomeForm, setShowAddIncomeForm] = useState(false);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form states
  const [selectedClientId, setSelectedClientId] = useState("");
  const [customClientName, setCustomClientName] = useState("");
  const [incDate, setIncDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incAmount, setIncAmount] = useState("");
  const [incRate, setIncRate] = useState("0.65");
  const [incCategory, setIncCategory] = useState("Upfront Commission");
  const [incService, setIncService] = useState("Mortgage Broking");
  const [incCompany, setIncCompany] = useState<"EZY MORTGAGE AUSTRALIA PTY LTD" | "EZY OUTSOURCE PTY LTD">("EZY MORTGAGE AUSTRALIA PTY LTD");
  const [incStatus, setIncStatus] = useState("Paid");
  const [incNotes, setIncNotes] = useState("");

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot log income.");
      return;
    }

    let clientName = "";
    if (selectedClientId && selectedClientId !== "custom") {
      const match = clients.find(c => c.id === selectedClientId);
      clientName = match ? match.name : "Unknown Client";
    } else {
      clientName = customClientName.trim();
    }

    if (!clientName || !incAmount) return;

    const newInc = {
      id: `inc-${Date.now()}`,
      client: clientName,
      clientId: selectedClientId !== "custom" ? selectedClientId : undefined,
      date: incDate,
      amount: parseFloat(incAmount),
      brokerageRate: parseFloat(incRate),
      category: incCategory,
      service: incService,
      companyCategory: incCompany,
      status: incStatus,
      notes: incNotes.trim()
    };

    setIncomeItems([newInc, ...incomeItems]);
    setSelectedClientId("");
    setCustomClientName("");
    setIncAmount("");
    setIncNotes("");
    setShowAddIncomeForm(false);
  };

  const handleToggleStatus = (id: string) => {
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot modify status.");
      return;
    }
    const updated = incomeItems.map((item) => {
      if (item.id === id) {
        return { ...item, status: item.status === "Paid" ? "Pending" : "Paid" };
      }
      return item;
    });
    setIncomeItems(updated);
  };

  const handleDeleteIncome = (id: string) => {
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot delete logs.");
      return;
    }
    if (window.confirm("Permanently erase commission row item from books?")) {
      setIncomeItems(incomeItems.filter((i) => i.id !== id));
    }
  };

  // Filter items
  const filteredIncome = incomeItems.filter(item => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.client || "").toLowerCase().includes(term) ||
      (item.notes || "").toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term) ||
      (item.service || "").toLowerCase().includes(term);

    const matchesCompany = companyFilter === "all" || item.companyCategory === companyFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCompany && matchesCategory;
  });

  // Calculations based on filtered lists
  const myMortgageIncomeCleared = filteredIncome
    .filter(i => i.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD" && i.status === "Paid")
    .reduce((acc, i) => acc + parseFloat(i.amount), 0);

  const myOutsourceIncomeCleared = filteredIncome
    .filter(i => i.companyCategory === "EZY OUTSOURCE PTY LTD" && i.status === "Paid")
    .reduce((acc, i) => acc + parseFloat(i.amount), 0);

  const totalSettled = filteredIncome.reduce((acc, i) => acc + (i.status === "Paid" ? parseFloat(i.amount) : 0), 0);
  const totalOutstanding = filteredIncome.reduce((acc, i) => acc + (i.status === "Pending" ? parseFloat(i.amount) : 0), 0);
  const totalUnderwritten = filteredIncome.reduce((acc, i) => acc + (parseFloat(i.amount) / (i.brokerageRate || 0.65)), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Settled Cashflows (Cleared)</span>
          <span className="block text-2xl font-extrabold text-emerald-400 tracking-tight mt-1 font-sans">
            ${totalSettled.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">
            Mortgage: <b className="text-white">${myMortgageIncomeCleared.toLocaleString()}</b> | Outsource: <b className="text-white">${myOutsourceIncomeCleared.toLocaleString()}</b>
          </p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Unsettled Commissions</span>
          <span className="block text-2xl font-extrabold text-[#ff6100] tracking-tight mt-1 font-sans">
            ${totalOutstanding.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Deals approved, pending final settlement</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Underwritten Portfolio</span>
          <span className="block text-2xl font-extrabold text-white tracking-tight mt-1 font-sans">
            ${(totalUnderwritten / 1000000).toFixed(2)}M AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Sum of underlying loan volume values</p>
        </div>
      </div>

      {/* Header & Record Button */}
      <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6100] font-bold">
              Commissions & Fee Splits
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Corporate Commissions & Incomes</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Verify incoming commission receipts, service milestones, or advisory retainers grouped by respective sub-entities.
            </p>
          </div>
          <button
            onClick={() => setShowAddIncomeForm(!showAddIncomeForm)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            {showAddIncomeForm ? "Hide Form" : "Record Commission Log"}
          </button>
        </div>

        {/* Recording Form */}
        {showAddIncomeForm && (
          <form onSubmit={handleAddIncome} className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#004A99]/15 pb-2">
              <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">Record Commission Allocation Details</h4>
              {!editAllowed && (
                <span className="text-[10px] text-red-400 font-mono">✕ READ ONLY ACCESS ACTIVE</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Target Managing Company</label>
                <select
                  disabled={!editAllowed}
                  value={incCompany}
                  onChange={(e) => setIncCompany(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                >
                  <option value="EZY MORTGAGE AUSTRALIA PTY LTD">EZY MORTGAGE AUSTRALIA PTY LTD</option>
                  <option value="EZY OUTSOURCE PTY LTD">EZY OUTSOURCE PTY LTD</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Select Registered Client</label>
                <select
                  disabled={!editAllowed}
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
                  <option value="">-- Choose Onboarded Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD" ? "Mortgage" : "Outsource"})</option>
                  ))}
                  <option value="custom">-- Custom Client Name (Unmanaged) --</option>
                </select>
              </div>

              {(selectedClientId === "custom" || !selectedClientId) && (
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Custom Lead / Descriptor Name</label>
                  <input
                    type="text"
                    required
                    disabled={!editAllowed}
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="Enter full descriptive client name"
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Settlement Date</label>
                <input
                  type="date"
                  required
                  disabled={!editAllowed}
                  value={incDate}
                  onChange={(e) => setIncDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Commission Amount (AUD $)</label>
                <input
                  type="number"
                  required
                  disabled={!editAllowed}
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  placeholder="E.g. 5200"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Upfront Percentage Split</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  disabled={!editAllowed}
                  value={incRate}
                  onChange={(e) => setIncRate(e.target.value)}
                  placeholder="E.g. 0.65"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Commission Classification Category</label>
                <select
                  disabled={!editAllowed}
                  value={incCategory}
                  onChange={(e) => setIncCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                >
                  <option value="Upfront Commission">Upfront Broker Commission</option>
                  <option value="Trail Commission">Trail Commission Revenue</option>
                  <option value="Direct Advisory Fee">Direct Consulting / Retainer</option>
                  <option value="Milestone Outsource Split">Milestone Outsourced Delivery</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Offered Service / Project</label>
                <select
                  disabled={!editAllowed}
                  value={incService}
                  onChange={(e) => setIncService(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                >
                  <option value="Mortgage Broking & Refinancing">Mortgage Broking & Refinancing</option>
                  <option value="First Home Buyer Advisory">First Home Buyer Advisory</option>
                  <option value="Backoffice Administration Outsourcing">Backoffice Admin Outsourcing</option>
                  <option value="Technical System Setup & Development">SysDev Integration</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Remittance Status</label>
                <select
                  disabled={!editAllowed}
                  value={incStatus}
                  onChange={(e) => setIncStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                >
                  <option value="Paid">Cleared / Paid</option>
                  <option value="Pending">Pending Sync / Broker Hold</option>
                </select>
              </div>

              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Internal Bookkeeping notes</label>
                <textarea
                  disabled={!editAllowed}
                  value={incNotes}
                  onChange={(e) => setIncNotes(e.target.value)}
                  placeholder="Record deal IDs, aggregator names, or specific split structures in this detail row."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddIncomeForm(false)}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editAllowed}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-30"
              >
                Save Income Record
              </button>
            </div>
          </form>
        )}

        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text"
              placeholder="Search by client index or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-[#010b1a] border border-[#004A99]/40 focus:border-[#ff6900] text-xs rounded-xl focus:outline-none transition text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#010b1a] border border-[#004A99]/45 text-[10px] font-semibold rounded-xl text-zinc-300 focus:outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="Upfront Commission">Upfront broker</option>
              <option value="Trail Commission">Trail revenue</option>
              <option value="Direct Advisory Fee">Direct retainer</option>
              <option value="Milestone Outsource Split">Milestone outsourcing</option>
            </select>

            {/* Filter by Target Company Category */}
            <div className="flex bg-[#010b1a] border border-[#004A99]/40 p-1 rounded-xl shrink-0">
              {[
                { id: "all", label: "Group overall" },
                { id: "EZY MORTGAGE AUSTRALIA PTY LTD", label: "Ezy Mortgage" },
                { id: "EZY OUTSOURCE PTY LTD", label: "Ezy Outsource" }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setCompanyFilter(opt.id)}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition cursor-pointer ${companyFilter === opt.id ? "bg-[#ff6900]/10 text-[#ff6900]" : "text-zinc-400 hover:text-white"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        {filteredIncome.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 italic text-xs">
            No matching cashflow entries found under selected ledger rules.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                  <th className="p-4">Settled Date</th>
                  <th className="p-4">Client Deal Information</th>
                  <th className="p-4">Assigned Company</th>
                  <th className="p-4">Service Category</th>
                  <th className="p-4">Brokerage rate</th>
                  <th className="p-4">Net Comm. (AUD)</th>
                  <th className="p-4">Settlement Checks</th>
                  <th className="p-4 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#004A99]/10">
                {filteredIncome.map((item) => (
                  <tr key={item.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition animate-fade-in">
                    <td className="p-4 font-mono text-[11px] text-zinc-400">{item.date}</td>
                    <td className="p-4">
                      <span className="font-extrabold text-white block text-sm">{item.client}</span>
                      <span className="text-[10px] text-zinc-400 block italic mt-0.5">
                        {item.notes || "No extra audit notes filed"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border ${
                        item.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD"
                          ? "text-[#ff6900] bg-[#ff6900]/5 border-[#ff6900]/25"
                          : "text-emerald-400 bg-emerald-500/5 border-emerald-500/25"
                      }`}>
                        <Landmark className="w-2.5 h-2.5" />
                        {item.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD" ? "MORTGAGE" : "OUTSOURCE"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300 block font-semibold">{item.category}</span>
                      <span className="text-[10px] text-zinc-500 block">{item.service || "Standard Broker Advisory"}</span>
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3 text-[#ff6100]/80" />
                        {item.brokerageRate || "0.65"} %
                      </span>
                    </td>
                    <td className="p-4 font-mono font-extrabold text-white">
                      ${parseFloat(item.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        disabled={!editAllowed}
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer select-none transition-all duration-300 ${
                          item.status === "Paid"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Paid" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                        {item.status === "Paid" ? "Cleared" : "Pending"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteIncome(item.id)}
                        disabled={!editAllowed}
                        className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 disabled:opacity-30 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
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
    </div>
  );
}
