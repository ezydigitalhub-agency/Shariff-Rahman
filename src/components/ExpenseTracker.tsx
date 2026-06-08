import React, { useState } from "react";
import { Plus, Trash2, Landmark, Search, ShieldCheck } from "lucide-react";

interface ExpenseTrackerProps {
  expenseItems: any[];
  setExpenseItems: React.Dispatch<React.SetStateAction<any[]>>;
  editAllowed: boolean;
}

export default function ExpenseTracker({ expenseItems, setExpenseItems, editAllowed }: ExpenseTrackerProps) {
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  const [expDate, setExpDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expCategory, setExpCategory] = useState("Software Licences");
  const [expAmount, setExpAmount] = useState("");
  const [expPayee, setExpPayee] = useState("");
  const [expCompany, setExpCompany] = useState<"EZY MORTGAGE AUSTRALIA PTY LTD" | "EZY OUTSOURCE PTY LTD">("EZY MORTGAGE AUSTRALIA PTY LTD");
  const [expDesc, setExpDesc] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot create expense bills.");
      return;
    }
    if (!expAmount || !expPayee.trim()) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      date: expDate,
      category: expCategory,
      amount: parseFloat(expAmount),
      payee: expPayee.trim(),
      companyCategory: expCompany,
      description: expDesc.trim()
    };

    setExpenseItems([newExp, ...expenseItems]);
    setExpAmount("");
    setExpPayee("");
    setExpDesc("");
    setShowAddExpenseForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot delete expense logs.");
      return;
    }
    if (window.confirm("Permanently remove this expense item?")) {
      setExpenseItems(expenseItems.filter((e) => e.id !== id));
    }
  };

  // Filters
  const filteredExpenses = expenseItems.filter((item) => {
    const matchesSearch = 
      item.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (companyFilter === "all") return matchesSearch;
    return matchesSearch && item.companyCategory === companyFilter;
  });

  const totalExpense = filteredExpenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const totalMortgageExpense = filteredExpenses.filter(e => e.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD").reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const totalOutsourceExpense = filteredExpenses.filter(e => e.companyCategory === "EZY OUTSOURCE PTY LTD").reduce((acc, e) => acc + parseFloat(e.amount), 0);
  
  const highestCategory = filteredExpenses.length > 0
    ? [...filteredExpenses].sort((a, b) => b.amount - a.amount)[0].category
    : "N/A";

  const totalSalaryExpenses = filteredExpenses
    .filter(e => e.category === "Salary Expense")
    .reduce((acc, e) => acc + parseFloat(e.amount), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Gross Operational Deficit</span>
          <span className="block text-2xl font-extrabold text-rose-400 tracking-tight mt-1 font-sans">
            ${totalExpense.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">
            Mortgage: <b className="text-white">${totalMortgageExpense.toLocaleString()}</b> | Outsource: <b className="text-white">${totalOutsourceExpense.toLocaleString()}</b>
          </p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Salary Outlays Overhead</span>
          <span className="block text-2xl font-extrabold text-amber-200 tracking-tight mt-1 font-sans">
            ${totalSalaryExpenses.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2">Aggregated employee & staff salaries</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Heaviest Overhead Outlet</span>
          <span className="block text-xl font-extrabold text-white tracking-tight mt-1">
            {highestCategory}
          </span>
          <p className="text-[10px] text-zinc-500 mt-2">Heaviest monthly expenditure category</p>
        </div>
      </div>

      {/* Header & Record Button */}
      <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              Office Expenditures
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Corporate Operational Expense Log</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Log office operation costs, licensing retainer subscriptions, administrative fees, and monthly salary drawouts.
            </p>
          </div>
          <button
            onClick={() => setShowAddExpenseForm(!showAddExpenseForm)}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            {showAddExpenseForm ? "Hide Form" : "Log Workspace Expense"}
          </button>
        </div>

        {/* Recording Form */}
        {showAddExpenseForm && (
          <form onSubmit={handleAddExpense} className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#004A99]/15 pb-2">
              <h4 className="text-xs font-mono tracking-widest text-rose-400 uppercase font-bold">Register General Ledger Outflow</h4>
              {!editAllowed && (
                <span className="text-[10px] text-red-400 font-mono">✕ READ ONLY ACCESS ACTIVE</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Expense Date</label>
                <input
                  type="date"
                  required
                  disabled={!editAllowed}
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Target Corporate Company</label>
                <select
                  disabled={!editAllowed}
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
                  <option value="EZY MORTGAGE AUSTRALIA PTY LTD">EZY MORTGAGE AUSTRALIA PTY LTD</option>
                  <option value="EZY OUTSOURCE PTY LTD">EZY OUTSOURCE PTY LTD</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Expense Classification</label>
                <select
                  disabled={!editAllowed}
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
                  <option value="Salary Expense">Salary Expense (Sub category)</option>
                  <option value="Software Licences">Software & Licensing CRM</option>
                  <option value="Lead Acquisition Ads">Marketing & Ad Keywords</option>
                  <option value="Travel and Fuel">Travel & Fuel Logistics</option>
                  <option value="Compliance & Training">Compliance & Licensing Fees</option>
                  <option value="Office and Postage">Office Supplies & Rent</option>
                  <option value="Mentoring Supplies">Mentoring Materials</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Charged Amount (AUD $)</label>
                <input
                  type="number"
                  required
                  disabled={!editAllowed}
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="E.g. 3500"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>

              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Merchant / Staff Payee Name</label>
                <input
                  type="text"
                  required
                  disabled={!editAllowed}
                  value={expPayee}
                  onChange={(e) => setExpPayee(e.target.value)}
                  placeholder="e.g. Liam Smith (Accountant salary)"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>

              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Description of Transaction Outflow</label>
                <textarea
                  disabled={!editAllowed}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Monthly salary payout for administration assistant split."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddExpenseForm(false)}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editAllowed}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-30"
              >
                Record Bill
              </button>
            </div>
          </form>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text"
              placeholder="Search payee or descriptor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-[#010b1a] border border-[#004A99]/40 focus:border-[#ff6900] text-xs rounded-xl focus:outline-none transition text-white"
            />
          </div>

          <div className="flex bg-[#010b1a] border border-[#004A99]/40 p-1 rounded-xl shrink-0">
            {[
              { id: "all", label: "Consolidated Group" },
              { id: "EZY MORTGAGE AUSTRALIA PTY LTD", label: "Ezy Mortgage" },
              { id: "EZY OUTSOURCE PTY LTD", label: "Ezy Outsource" }
            ].map((opt) => (
              <button 
                key={opt.id}
                onClick={() => setCompanyFilter(opt.id)}
                className={`px-3 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition cursor-pointer ${companyFilter === opt.id ? "bg-rose-500/10 text-rose-400" : "text-zinc-400 hover:text-white"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Table */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 italic text-xs">
            No matching corporate expense entries registered in database ledger.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                  <th className="p-4">Paid On Date</th>
                  <th className="p-4">Merchant / Staff Payee</th>
                  <th className="p-4">Charged Entity</th>
                  <th className="p-4">Corporate Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Outflow Amount</th>
                  <th className="p-4 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#004A99]/10">
                {filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition animate-fade-in">
                    <td className="p-4 font-mono text-[11px] text-zinc-400">{item.date}</td>
                    <td className="p-4">
                      <span className="font-extrabold text-white block text-sm">{item.payee}</span>
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
                    <td className="p-4 text-zinc-300 font-medium">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.category === "Salary Expense"
                          ? "bg-amber-400/15 text-amber-200 border-amber-400/20"
                          : "bg-rose-500/10 text-rose-200 border-rose-500/20"
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="p-4 font-mono font-extrabold text-rose-300">
                      -${parseFloat(item.amount).toLocaleString()} AUD
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
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
