import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface ExpenseTrackerProps {
  expenseItems: any[];
  setExpenseItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ExpenseTracker({ expenseItems, setExpenseItems }: ExpenseTrackerProps) {
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expCategory, setExpCategory] = useState("Software Licences");
  const [expAmount, setExpAmount] = useState("");
  const [expPayee, setExpPayee] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expPayee.trim()) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      date: expDate,
      category: expCategory,
      amount: parseFloat(expAmount),
      payee: expPayee.trim(),
      description: expDesc.trim()
    };

    setExpenseItems([newExp, ...expenseItems]);
    setExpAmount("");
    setExpPayee("");
    setExpDesc("");
    setShowAddExpenseForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Permanently remove this expense item?")) {
      setExpenseItems(expenseItems.filter((e) => e.id !== id));
    }
  };

  const totalExpense = expenseItems.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const highestCategory = expenseItems.length > 0
    ? [...expenseItems].sort((a, b) => b.amount - a.amount)[0].category
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Gross Operational Deficit</span>
          <span className="block text-2xl font-extrabold text-rose-400 tracking-tight mt-1 font-sans">
            ${totalExpense.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Combined back-office & marketing costs</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Highest Expense Outlet</span>
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
            <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6100] font-bold">
              Office Expenditures
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Corporate Operational Expense Log</h3>
            <p className="text-xs text-zinc-400 mt-1 cursor-default leading-relaxed">
              Monitor aggregated operational overhead, advertising budgets, compliance registration fees, and office workspace costs.
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
            <h4 className="text-xs font-mono tracking-widest text-rose-400 uppercase font-bold">Register General Ledger Outflow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Expense Date</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Expense Classification</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
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
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="E.g. 350"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Merchant / Payee Name</label>
                <input
                  type="text"
                  required
                  value={expPayee}
                  onChange={(e) => setExpPayee(e.target.value)}
                  placeholder="e.g. NextGen CRM systems AG"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Description of Transaction Outflow</label>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. CRM monthly aggregator software access quota charge."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
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
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Record Bill
              </button>
            </div>
          </form>
        )}

        {/* Expense Table */}
        <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                <th className="p-4">Paid On Date</th>
                <th className="p-4">Merchant / Payee Name</th>
                <th className="p-4">Corporate Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Outflow Amount</th>
                <th className="p-4 text-right">Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#004A99]/10">
              {expenseItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition animate-fade-in">
                  <td className="p-4 font-mono text-[11px] text-zinc-400">{item.date}</td>
                  <td className="p-4">
                    <span className="font-extrabold text-white block text-sm">{item.payee}</span>
                  </td>
                  <td className="p-4 text-zinc-300 font-medium">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-200 text-[10px] font-semibold border border-rose-500/20">
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
