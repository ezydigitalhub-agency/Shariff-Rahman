import React, { useState } from "react";
import { Plus, Percent, Trash2, Eye, X, Printer } from "lucide-react";

interface InvoicingSystemProps {
  invoiceItems: any[];
  setInvoiceItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function InvoicingSystem({ invoiceItems, setInvoiceItems }: InvoicingSystemProps) {
  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [invNum, setInvNum] = useState(() => `INV-2026-0${Math.floor(10 + Math.random() * 90)}`);
  const [invDate, setInvDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [invClient, setInvClient] = useState("");
  const [invDetails, setInvDetails] = useState("");
  const [invItemDesc, setInvItemDesc] = useState("Mortgage broker advisory commissions");
  const [invItemPrice, setInvItemPrice] = useState("");
  const [invItemQty, setInvItemQty] = useState("1");
  const [invTaxRate, setInvTaxRate] = useState("10");
  const [invNotes, setInvNotes] = useState("");
  const [invStatus, setInvStatus] = useState("Sent");
  const [selectedInvoicePreview, setSelectedInvoicePreview] = useState<any | null>(null);

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClient.trim() || !invItemPrice) return;

    const newInvoiceObj = {
      id: invNum,
      date: invDate,
      dueDate: invDueDate,
      client: invClient.trim(),
      details: invDetails.trim(),
      items: [{
        description: invItemDesc.trim(),
        qty: parseFloat(invItemQty),
        price: parseFloat(invItemPrice)
      }],
      taxRate: parseFloat(invTaxRate),
      status: invStatus,
      notes: invNotes.trim()
    };

    setInvoiceItems([newInvoiceObj, ...invoiceItems]);
    setInvClient("");
    setInvDetails("");
    setInvItemPrice("");
    setInvNotes("");
    setShowAddInvoiceForm(false);
  };

  const handleCycleStatus = (id: string) => {
    const updated = invoiceItems.map((inv) => {
      if (inv.id === id) {
        const nextStatus: Record<string, string> = { "Draft": "Sent", "Sent": "Paid", "Paid": "Draft" };
        return { ...inv, status: nextStatus[inv.status] || "Sent" };
      }
      return inv;
    });
    setInvoiceItems(updated);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Permanently destroy invoice template profile?")) {
      setInvoiceItems(invoiceItems.filter((i) => i.id !== id));
    }
  };

  // Compute Grand totals of all invoices
  const computeTotal = (inv: any) => {
    const sub = inv.items.reduce((acc: number, it: any) => acc + (it.price * it.qty), 0);
    return sub + (sub * ((inv.taxRate || 10) / 100));
  };

  const grandInvoiced = invoiceItems.reduce((acc, inv) => acc + computeTotal(inv), 0);
  const totalPaidInvoiced = invoiceItems.filter((i) => i.status === "Paid").reduce((acc, inv) => acc + computeTotal(inv), 0);
  const totalOutstanding = invoiceItems.filter((i) => i.status !== "Paid").reduce((acc, inv) => acc + computeTotal(inv), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Grand Invoiced Capital</span>
          <span className="block text-2xl font-extrabold text-white tracking-tight mt-1 font-sans">
            ${grandInvoiced.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Combined face value of generated invoices</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Collections Cleared</span>
          <span className="block text-2xl font-extrabold text-emerald-400 tracking-tight mt-1 font-sans">
            ${totalPaidInvoiced.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Successfully collected capital</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl relative overflow-hidden">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Outstanding Invoiced Fee</span>
          <span className="block text-2xl font-extrabold text-[#ff6100] tracking-tight mt-1 font-sans">
            ${totalOutstanding.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Invoices awaiting bank transfer</p>
        </div>
      </div>

      {/* Header & Record Button */}
      <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6100] font-bold">
              Client Invoicing Unit
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Corporate Tax Invoicing Hub</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Draft official tax invoices for aggregator fee splits, mentorship payouts, or direct lender consulting fees.
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddInvoiceForm(!showAddInvoiceForm);
              setInvNum(`INV-2026-0${Math.floor(10 + Math.random() * 90)}`);
            }}
            className="px-4 py-2 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            {showAddInvoiceForm ? "Hide Form" : "Compose Client Invoice"}
          </button>
        </div>

        {/* Composition Form */}
        {showAddInvoiceForm && (
          <form onSubmit={handleAddInvoice} className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-4 sm:p-6 space-y-4">
            <h4 className="text-xs font-mono tracking-widest text-[#ff6100] uppercase font-bold">New Tax Invoice Parameters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invNum}
                  onChange={(e) => setInvNum(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Invoice Date</label>
                <input
                  type="date"
                  required
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Client / Organization Recipient</label>
                <input
                  type="text"
                  required
                  value={invClient}
                  onChange={(e) => setInvClient(e.target.value)}
                  placeholder="e.g. Westpac Lending Operations ACT Desk"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Client Details / Office Reference</label>
                <input
                  type="text"
                  value={invDetails}
                  onChange={(e) => setInvDetails(e.target.value)}
                  placeholder="e.g. Regional CRM Ref ACT-884"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Itemized Description</label>
                <input
                  type="text"
                  required
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Unit Cost (AUD $)</label>
                <input
                  type="number"
                  required
                  value={invItemPrice}
                  onChange={(e) => setInvItemPrice(e.target.value)}
                  placeholder="e.g. 5500"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Quantity</label>
                <input
                  type="number"
                  required
                  value={invItemQty}
                  onChange={(e) => setInvItemQty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">GST Rate %</label>
                <input
                  type="number"
                  required
                  value={invTaxRate}
                  onChange={(e) => setInvTaxRate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Initial Invoice State</label>
                <select
                  value={invStatus}
                  onChange={(e) => setInvStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
                  <option value="Sent">Sent / Outstanding</option>
                  <option value="Paid">Cleared / Paid</option>
                  <option value="Draft">Draft Mode</option>
                </select>
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Client Statement Notes / Bank Info</label>
                <textarea
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="E.g. Bank remittance target: Westpac Acc 8472-392"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddInvoiceForm(false)}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-lg transition"
              >
                Issue Invoicing Claim
              </button>
            </div>
          </form>
        )}

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                <th className="p-4">Invoice ID #</th>
                <th className="p-4">Recipient Client Org</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Total Amount (GST Incl)</th>
                <th className="p-4">Status (Click Cycle)</th>
                <th className="p-4 text-right">Invoices Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#004A99]/10">
              {invoiceItems.map((item) => {
                const totalVal = computeTotal(item);
                return (
                  <tr key={item.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition animate-fade-in">
                    <td className="p-4 font-mono font-bold text-[#ff6100] tracking-wide">{item.id}</td>
                    <td className="p-4">
                      <span className="font-extrabold text-white block text-sm">{item.client}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{item.details}</span>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono">{item.date}</td>
                    <td className="p-4 text-zinc-400 font-mono">{item.dueDate}</td>
                    <td className="p-4 font-mono font-extrabold text-white">
                      ${totalVal.toLocaleString()} AUD
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleCycleStatus(item.id)}
                        className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border select-none cursor-pointer duration-300 ${
                          item.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : item.status === "Sent"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            : "bg-zinc-850 text-zinc-500 border-zinc-700"
                        }`}
                        title="Click to cycle status (Draft -> Sent -> Paid)"
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoicePreview(item)}
                          className="p-1.5 bg-[#02132a]/80 hover:bg-[#ff6100]/10 hover:text-[#ff6100] text-zinc-400 rounded-lg border border-[#004A99]/20 hover:border-[#ff6100]/35 transition cursor-pointer"
                          title="Preview / Print official Corporate Tax Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(item.id)}
                          className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Corporate Tax Invoice Preview Overlay */}
      {selectedInvoicePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-zinc-900 rounded-3xl max-w-2xl w-full relative overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto font-sans animate-zoom-in">
            {/* Action triggers */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[10px] font-mono copywriting text-emerald-600 font-bold uppercase tracking-widest">
                  MFAA Accredited Brokerage Claim
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">TAX INVOICE</h2>
                <p className="text-xs text-zinc-500 font-mono mt-1">Invoice ID: {selectedInvoicePreview.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setSelectedInvoicePreview(null)}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Parties details */}
            <div className="grid grid-cols-2 gap-6 text-xs leading-relaxed">
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">From Practitioner</span>
                <span className="text-sm font-bold text-zinc-900 block font-sans">Shariff Rahman Mortgage Advisory</span>
                <span className="text-zinc-600 block mt-0.5">Authorised Credit Representative #503529</span>
                <span className="text-zinc-600 block">Harrison ACT, Canberra</span>
                <span className="text-zinc-600 block font-mono">CRN: 503529 | MFAA Mentor Group</span>
              </div>
              <div className="text-right">
                <span className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Invoiced Recipient</span>
                <span className="text-sm font-bold text-zinc-900 block font-sans">{selectedInvoicePreview.client}</span>
                <span className="text-zinc-600 block mt-0.5">{selectedInvoicePreview.details || "Ref Account Ledger Portal"}</span>
                <div className="mt-3 text-[11px] font-mono space-y-0.5">
                  <div><span className="text-zinc-500">Date Issued:</span> {selectedInvoicePreview.date}</div>
                  <div><span className="text-zinc-500 font-bold">Payment Due:</span> {selectedInvoicePreview.dueDate}</div>
                  <div><span className="text-zinc-500">Claim State:</span> <b className="uppercase">{selectedInvoicePreview.status}</b></div>
                </div>
              </div>
            </div>

            {/* Itemization Ledger Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[9px]">
                    <th className="p-3">Work Item Description</th>
                    <th className="p-3 text-center">Qty / Rate</th>
                    <th className="p-3 text-right">Raw Item total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {selectedInvoicePreview.items.map((it: any, idx: number) => (
                    <tr key={idx} className="text-zinc-750">
                      <td className="p-3 font-medium text-zinc-900">{it.description}</td>
                      <td className="p-3 text-center font-mono">{it.qty} x ${parseFloat(it.price).toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold">${(it.qty * it.price).toLocaleString()} AUD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Details block */}
            <div className="flex flex-col items-end text-xs space-y-1.5 pt-2 border-t border-zinc-200">
              <div className="flex justify-between w-64">
                <span className="text-zinc-500">Gross Items Subtotal:</span>
                <span className="font-mono">${selectedInvoicePreview.items.reduce((acc: number, it: any) => acc + (it.price * it.qty), 0).toLocaleString()} AUD</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-zinc-500">GST Commission Levy ({selectedInvoicePreview.taxRate || 10}%):</span>
                <span className="font-mono">
                  ${(selectedInvoicePreview.items.reduce((acc: number, it: any) => acc + (it.price * it.qty), 0) * ((selectedInvoicePreview.taxRate || 10)/100)).toLocaleString()} AUD
                </span>
              </div>
              <div className="flex justify-between w-64 border-t border-zinc-300 pt-2 text-sm font-extrabold text-zinc-950">
                <span>Grand Total Due (GST Incl):</span>
                <span className="font-mono">
                  ${(
                    selectedInvoicePreview.items.reduce((acc: number, it: any) => acc + (it.price * it.qty), 0) * (1 + ((selectedInvoicePreview.taxRate || 10)/100))
                  ).toLocaleString()} AUD
                </span>
              </div>
            </div>

            {/* Transfer directions split */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-[11px] leading-relaxed text-zinc-600">
              <h4 className="font-bold text-zinc-800 text-xs mb-1 uppercase tracking-wider font-sans">Direct Bank Remittance Instructions</h4>
              <p>Ensure settlement references state invoice claim code: <b>{selectedInvoicePreview.id}</b>. Direct transfer is preferred to help with bookkeeping clearance:</p>
              <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[10px] text-zinc-700">
                <div><b className="text-zinc-500">Target Bank:</b> Westpac Canberra</div>
                <div><b className="text-zinc-500">Biller BSB:</b> 032-723</div>
                <div><b className="text-zinc-500">Account No:</b> 847293-273</div>
              </div>
            </div>

            <div className="text-center font-mono text-[9px] text-zinc-400 border-t border-zinc-200 pt-4 uppercase">
              Thank you for your partner assistance & dedication to client mortgage success
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
