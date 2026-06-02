import React, { useState } from "react";
import { Plus, Percent, Trash2, DollarSign } from "lucide-react";

interface IncomeTrackerProps {
  incomeItems: any[];
  setIncomeItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function IncomeTracker({ incomeItems, setIncomeItems }: IncomeTrackerProps) {
  const [showAddIncomeForm, setShowAddIncomeForm] = useState(false);
  const [incClient, setIncClient] = useState("");
  const [incDate, setIncDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [incAmount, setIncAmount] = useState("");
  const [incRate, setIncRate] = useState("0.65");
  const [incCategory, setIncCategory] = useState("Upfront Commission");
  const [incStatus, setIncStatus] = useState("Paid");
  const [incNotes, setIncNotes] = useState("");

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incClient.trim() || !incAmount) return;

    const newInc = {
      id: `inc-${Date.now()}`,
      client: incClient.trim(),
      date: incDate,
      amount: parseFloat(incAmount),
      brokerageRate: parseFloat(incRate),
      category: incCategory,
      status: incStatus,
      notes: incNotes.trim()
    };

    setIncomeItems([newInc, ...incomeItems]);
    setIncClient("");
    setIncAmount("");
    setIncNotes("");
    setShowAddIncomeForm(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = incomeItems.map((item) => {
      if (item.id === id) {
        return { ...item, status: item.status === "Paid" ? "Pending" : "Paid" };
      }
      return item;
    });
    setIncomeItems(updated);
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm("Permanently erase commission row item from books?")) {
      setIncomeItems(incomeItems.filter((i) => i.id !== id));
    }
  };

  const totalSettled = incomeItems.reduce((acc, i) => acc + (i.status === "Paid" ? parseFloat(i.amount) : 0), 0);
  const totalOutstanding = incomeItems.reduce((acc, i) => acc + (i.status === "Pending" ? parseFloat(i.amount) : 0), 0);
  const totalUnderwritten = incomeItems.reduce((acc, i) => acc + (parseFloat(i.amount) / (i.brokerageRate || 0.65)), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Settled Brokerage Volume</span>
          <span className="block text-2xl font-extrabold text-emerald-400 tracking-tight mt-1 font-sans">
            ${totalSettled.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Paid upfront commissions cleared</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Unsettled Commissions</span>
          <span className="block text-2xl font-extrabold text-[#ff6100] tracking-tight mt-1 font-sans">
            ${totalOutstanding.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Deals approved, pending final settlement</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Underwritten Pipeline Capital</span>
          <span className="block text-2xl font-extrabold text-white tracking-tight mt-1 font-sans">
            ${(totalUnderwritten / 1000000).toFixed(2)}M AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Combined client home loan balance totals</p>
        </div>
      </div>

      {/* Header & Record Button */}
      <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6100] font-bold">
              Commissions & Fee Splits
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Corporate Commissions Ledger</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Monitor incoming commission cashflows, upfront brokerage percentages, and pending lender settle times.
            </p>
          </div>
          <button
            onClick={() => setShowAddIncomeForm(!showAddIncomeForm)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            {showAddIncomeForm ? "Hide Form" : "Record Settlement Commission"}
          </button>
        </div>

        {/* Recording Form */}
        {showAddIncomeForm && (
          <form onSubmit={handleAddIncome} className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-4 sm:p-6 space-y-4">
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold">Record Commission Allocation Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Client / Loan Scenario Descriptor</label>
                <input
                  type="text"
                  required
                  value={incClient}
                  onChange={(e) => setIncClient(e.target.value)}
                  placeholder="e.g. Liam O'Connor Refinance & Multi-Property Structure"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Settlement Date</label>
                <input
                  type="date"
                  required
                  value={incDate}
                  onChange={(e) => setIncDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Commission Amount (AUD $)</label>
                <input
                  type="number"
                  required
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  placeholder="E.g. 5200"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Lender Upfront Brokerage %</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={incRate}
                  onChange={(e) => setIncRate(e.target.value)}
                  placeholder="E.g. 0.65"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Status</label>
                <select
                  value={incStatus}
                  onChange={(e) => setIncStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
                  <option value="Paid">Cleared / Paid</option>
                  <option value="Pending">Pending Lender Clearance</option>
                </select>
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Internal Audit Notes</label>
                <textarea
                  value={incNotes}
                  onChange={(e) => setIncNotes(e.target.value)}
                  placeholder="E.g. Westpac Fast clearance split aggregator claim."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-emerald-500 text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
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
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Record Commission
              </button>
            </div>
          </form>
        )}

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                <th className="p-4">Settlement Date</th>
                <th className="p-4">Client Deal Information</th>
                <th className="p-4">Upfront Comm %</th>
                <th className="p-4">Commissions Value</th>
                <th className="p-4">Status Check (Click Toggle)</th>
                <th className="p-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#004A99]/10">
              {incomeItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition animate-fade-in">
                  <td className="p-4 font-mono text-[11px] text-zinc-400">{item.date}</td>
                  <td className="p-4">
                    <span className="font-extrabold text-white block text-sm">{item.client}</span>
                    <span className="text-[10px] text-zinc-400 block italic mt-0.5">
                      {item.notes || "No extra audit notes filed"}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3 text-[#ff6100]/80" />
                      {item.brokerageRate || "0.65"} %
                    </span>
                  </td>
                  <td className="p-4 font-mono font-extrabold text-white">
                    ${parseFloat(item.amount).toLocaleString()} AUD
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer select-none transition-all duration-300 ${
                        item.status === "Paid"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      title="Click to toggle payment status"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Paid" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                      {item.status === "Paid" ? "Cleared / Paid" : "Pending Sync"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteIncome(item.id)}
                      className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
