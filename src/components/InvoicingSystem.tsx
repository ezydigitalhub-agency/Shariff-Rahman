import React, { useState } from "react";
import { Plus, Trash2, Eye, X, Printer, Landmark, Sparkles, Send, BellRing, ClipboardCheck, MailCheck, ShieldCheck, Mail } from "lucide-react";
import { Client } from "./ClientList";

interface InvoicingSystemProps {
  invoiceItems: any[];
  setInvoiceItems: React.Dispatch<React.SetStateAction<any[]>>;
  clients: Client[];
  editAllowed: boolean;
}

export default function InvoicingSystem({ invoiceItems, setInvoiceItems, clients, editAllowed }: InvoicingSystemProps) {
  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"ledgers" | "automation">("ledgers");

  // Form states
  const [invNum, setInvNum] = useState(() => `INV-2026-0${Math.floor(10 + Math.random() * 90)}`);
  const [invDate, setInvDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [customClientName, setCustomClientName] = useState("");
  const [customClientEmail, setCustomClientEmail] = useState("");
  const [customClientAddress, setCustomClientAddress] = useState("");
  const [customClientABN, setCustomClientABN] = useState("");

  const [invDetails, setInvDetails] = useState("Corporate Brokerage Services & Settlement Advisory");
  const [invItemDesc, setInvItemDesc] = useState("Mortgage broker advisory commissions and consultation");
  const [invItemPrice, setInvItemPrice] = useState("");
  const [invItemQty, setInvItemQty] = useState("1");
  const [invTaxRate, setInvTaxRate] = useState("10");
  const [invCompany, setInvCompany] = useState<"EZY MORTGAGE AUSTRALIA PTY LTD" | "EZY OUTSOURCE PTY LTD">("EZY MORTGAGE AUSTRALIA PTY LTD");
  const [invNotes, setInvNotes] = useState("");
  const [invStatus, setInvStatus] = useState("Sent");

  const [selectedInvoicePreview, setSelectedInvoicePreview] = useState<any | null>(null);

  // Simulation Inbox logs/templates
  const [simLog, setSimLog] = useState<string[]>([]);
  const [previewEmailMessage, setPreviewEmailMessage] = useState<any | null>(null);

  const getCompanyBankDetails = (company: "EZY MORTGAGE AUSTRALIA PTY LTD" | "EZY OUTSOURCE PTY LTD") => {
    if (company === "EZY MORTGAGE AUSTRALIA PTY LTD") {
      return {
        bankName: "Commonwealth Bank of Australia (CBA)",
        bsb: "062-900",
        accNum: "1045 8892"
      };
    } else {
      return {
        bankName: "National Australia Bank (NAB)",
        bsb: "082-057",
        accNum: "9942 5110"
      };
    }
  };

  const handleClientSelectChange = (id: string) => {
    setSelectedClientId(id);
    if (id && id !== "custom") {
      const match = clients.find(c => c.id === id);
      if (match) {
        setCustomClientName(match.name);
        setCustomClientEmail(match.email);
        setCustomClientAddress(match.address);
        setCustomClientABN(match.abn);
        setInvCompany(match.companyCategory);
      }
    } else {
      setCustomClientName("");
      setCustomClientEmail("");
      setCustomClientAddress("");
      setCustomClientABN("");
    }
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot create invoices.");
      return;
    }

    if (!customClientName.trim() || !invItemPrice) return;

    const newInvoiceObj = {
      id: invNum,
      companyCategory: invCompany,
      date: invDate,
      dueDate: invDueDate,
      client: customClientName.trim(),
      clientEmail: customClientEmail.trim() || "unspecified@client.com.au",
      clientAddress: customClientAddress.trim(),
      clientABN: customClientABN.trim(),
      details: invDetails.trim(),
      items: [{
        description: invItemDesc.trim(),
        qty: parseFloat(invItemQty),
        price: parseFloat(invItemPrice)
      }],
      taxRate: parseFloat(invTaxRate),
      status: invStatus,
      notes: invNotes.trim(),
      sentCount: invStatus === "Sent" ? 1 : 0,
      reminderSentCount: 0,
      lastMailLog: invStatus === "Sent" ? "Day 1 Initial dispatch" : ""
    };

    setInvoiceItems([newInvoiceObj, ...invoiceItems]);
    
    // Reset Form
    setSelectedClientId("");
    setCustomClientName("");
    setCustomClientEmail("");
    setCustomClientAddress("");
    setCustomClientABN("");
    setInvItemPrice("");
    setInvNotes("");
    setShowAddInvoiceForm(false);
  };

  const handleCycleStatus = (id: string) => {
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot cycle invoice states.");
      return;
    }
    const updated = invoiceItems.map((inv) => {
      if (inv.id === id) {
        const nextStatus: Record<string, string> = { "Draft": "Sent", "Sent": "Paid", "Paid": "Draft" };
        const statusVal = nextStatus[inv.status] || "Sent";
        return { ...inv, status: statusVal };
      }
      return inv;
    });
    setInvoiceItems(updated);
  };

  const handleDeleteInvoice = (id: string) => {
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot destroy templates.");
      return;
    }
    if (window.confirm("Permanently destroy invoice template profile?")) {
      setInvoiceItems(invoiceItems.filter((i) => i.id !== id));
    }
  };

  // Automated Monthly Dispatch simulation (Day 1 of Month)
  const runMonthlyDay1Simulation = () => {
    if (!editAllowed) return;

    const logs: string[] = [];
    const updated = invoiceItems.map(inv => {
      // "monthly 1 day they will auto go to invoice clients mail address"
      if (inv.status !== "Paid" && inv.status !== "Draft") {
        logs.push(`📧 Automatically auto-sent Day 1 invoice ${inv.id} to client: ${inv.client} (${inv.clientEmail})`);
        return {
          ...inv,
          sentCount: (inv.sentCount || 0) + 1,
          lastMailLog: `Day 1 Monthly auto-sent summary dispatch`
        };
      }
      return inv;
    });

    if (logs.length === 0) {
      logs.push("ℹ️ Day 1 Cron Scheduler executed: No active unpaid or non-draft invoices registered.");
    }

    setInvoiceItems(updated);
    setSimLog(prev => [...logs, ...prev]);
    alert("Day 1 Monthly Automation completed!\nInvoices successfully auto-routed to client mailboxes.");
  };

  // Automated 14 Days unpaid Reminder check
  const run14DaysReminderSimulation = () => {
    if (!editAllowed) return;

    const logs: string[] = [];
    const updated = invoiceItems.map(inv => {
      // "after 14 days auto again reminder mail will go to them... if paid not going"
      if (inv.status === "Sent") {
        logs.push(`⚠️ REMINDER DISPATCH: Invoice ${inv.id} is outstanding. Auto-dispatched 14-days past reminder notice to ${inv.client} (${inv.clientEmail})`);
        return {
          ...inv,
          reminderSentCount: (inv.reminderSentCount || 0) + 1,
          lastMailLog: `14-Days unpaid reminder dispatched`
        };
      }
      return inv;
    });

    if (logs.length === 0) {
      logs.push("ℹ️ 14-Day Outstanding reminder task completed: No unpaid invoices require attention.");
    }

    setInvoiceItems(updated);
    setSimLog(prev => [...logs, ...prev]);
    alert("14 Days Overdue Automations completed!\nDispatched strict payment compliance remind mailers.");
  };

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
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-sans">Outstanding Invoice Fees</span>
          <span className="block text-2xl font-extrabold text-[#ff6100] tracking-tight mt-1 font-sans">
            ${totalOutstanding.toLocaleString()} AUD
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Invoices awaiting bank transfer</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#010b1a] border border-[#004A99]/25 p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab("ledgers")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === "ledgers" ? "bg-[#ff6900] text-white" : "text-zinc-400 hover:text-white"}`}
        >
          Ledger Matrix
        </button>
        <button
          onClick={() => setActiveTab("automation")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === "automation" ? "bg-[#ff6900] text-white" : "text-zinc-400 hover:text-white"}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Scheduler SIM
        </button>
      </div>

      {activeTab === "ledgers" ? (
        <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6100] font-bold">
                XERO INTEGRATED BILLS
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Corporate Tax Invoicing system</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Draft professional tax invoices for clients. Swaps BSB indices automatically for EZY Mortgage Australia or EZY Outsource.
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

          {/* New invoice entry */}
          {showAddInvoiceForm && (
            <form onSubmit={handleAddInvoice} className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#004A99]/15 pb-2">
                <h4 className="text-xs font-mono tracking-widest text-[#ff6100] uppercase font-bold text-zinc-300">Custom Broker/Advisor Invoicing Claim</h4>
                {!editAllowed && <span className="text-[10px] text-red-400">✕ READ ONLY</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Invoice Number</label>
                  <input
                    type="text"
                    required
                    disabled={!editAllowed}
                    value={invNum}
                    onChange={(e) => setInvNum(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Invoicing Company Account</label>
                  <select
                    disabled={!editAllowed}
                    value={invCompany}
                    onChange={(e) => {
                      setInvCompany(e.target.value as any);
                    }}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none transition leading-relaxed text-zinc-100"
                  >
                    <option value="EZY MORTGAGE AUSTRALIA PTY LTD border border-[#ff6900]/20">EZY MORTGAGE AUSTRALIA PTY LTD</option>
                    <option value="EZY OUTSOURCE PTY LTD">EZY OUTSOURCE PTY LTD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Issue Date</label>
                  <input
                    type="date"
                    required
                    disabled={!editAllowed}
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    disabled={!editAllowed}
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400 font-sans">Bind Registered Client</label>
                  <select
                    disabled={!editAllowed}
                    value={selectedClientId}
                    onChange={(e) => handleClientSelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-white rounded-xl focus:outline-none font-sans"
                  >
                    <option value="">-- Manual Client Profile Input --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD" ? "Mortgage" : "Outsource"})</option>
                    ))}
                    <option value="custom">-- Custom Client (Unregistered) --</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Client Contact Person Name</label>
                  <input
                    type="text"
                    required
                    disabled={!editAllowed || (selectedClientId !== "custom" && selectedClientId !== "")}
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-rose-500 text-white rounded-xl focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Recipient Email (Auto-Delivery)</label>
                  <input
                    type="email"
                    required
                    disabled={!editAllowed || (selectedClientId !== "custom" && selectedClientId !== "")}
                    value={customClientEmail}
                    onChange={(e) => setCustomClientEmail(e.target.value)}
                    placeholder="customer@email.com.au"
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Client ABN Number</label>
                  <input
                    type="text"
                    disabled={!editAllowed || (selectedClientId !== "custom" && selectedClientId !== "")}
                    value={customClientABN}
                    onChange={(e) => setCustomClientABN(e.target.value)}
                    placeholder="ABN xx xxx xxx"
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Company Invoice Statement Address</label>
                  <input
                    type="text"
                    disabled={!editAllowed || (selectedClientId !== "custom" && selectedClientId !== "")}
                    value={customClientAddress}
                    onChange={(e) => setCustomClientAddress(e.target.value)}
                    placeholder="E.g. Canberra, ACT 2601"
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-3">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Itemized Work Details</label>
                  <input
                    type="text"
                    required
                    disabled={!editAllowed}
                    value={invItemDesc}
                    onChange={(e) => setInvItemDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Advisory Retainer Cost (AUD $)</label>
                  <input
                    type="number"
                    required
                    disabled={!editAllowed}
                    value={invItemPrice}
                    onChange={(e) => setInvItemPrice(e.target.value)}
                    placeholder="E.g. 4800"
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400">Quantity</label>
                  <input
                    type="number"
                    required
                    disabled={!editAllowed}
                    value={invItemQty}
                    onChange={(e) => setInvItemQty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400 font-sans">State initial state</label>
                  <select
                    disabled={!editAllowed}
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 text-white rounded-xl text-zinc-100 focus:outline-none"
                  >
                    <option value="Sent">Sent (Will auto-deliver monthly Day 1)</option>
                    <option value="Paid">Cleared / Paid (Complied)</option>
                    <option value="Draft">Draft Mode</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-1 sm:col-span-3">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400 font-sans">Remarks / Custom Remittance Notes</label>
                  <textarea
                    disabled={!editAllowed}
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    placeholder="Any specific split comments or custom instructions."
                    rows={2}
                    className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl"
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
                  disabled={!editAllowed}
                  className="px-4 py-1.5 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-lg transition"
                >
                  Issue Tax Invoice
                </button>
              </div>
            </form>
          )}

          {/* Table List of Invoices */}
          <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                  <th className="p-4">Invoice ID #</th>
                  <th className="p-4">Recipient Client Org</th>
                  <th className="p-4">Charging Company</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4">Date Due</th>
                  <th className="p-4">GST Included Total</th>
                  <th className="p-4">Auto-Schedules Status</th>
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
                        <span className="text-[10px] text-zinc-400 block mt-0.5">{item.clientEmail || "No digital index"}</span>
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
                      <td className="p-4 text-zinc-400 font-mono">{item.date}</td>
                      <td className="p-4 text-zinc-400 font-mono">{item.dueDate}</td>
                      <td className="p-4 font-mono font-extrabold text-white">
                        ${totalVal.toLocaleString()} AUD
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleCycleStatus(item.id)}
                            disabled={!editAllowed}
                            className={`inline-flex items-center gap-1 text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border select-none cursor-pointer duration-300 w-fit ${
                              item.status === "Paid"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : item.status === "Sent"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                                : "bg-zinc-850 text-zinc-500 border-zinc-700"
                            }`}
                            title="Click to cycle status"
                          >
                            {item.status}
                          </button>
                          <span className="text-[8px] font-mono text-zinc-500">
                            Sent x{item.sentCount || 1} | Reminder x{item.reminderSentCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoicePreview(item)}
                            className="p-1.5 bg-[#02132a]/80 hover:bg-[#ff6900]/10 hover:text-[#ff6900] text-zinc-400 rounded-lg border border-[#004A99]/20 hover:border-[#ff6900]/35 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(item.id)}
                            disabled={!editAllowed}
                            className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 disabled:opacity-30 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
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
      ) : (
        /* Automation Simulation Station code */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-xs">
          {/* Controls column */}
          <div className="lg:col-span-5 bg-[#02132a] border border-[#004A99]/20 p-6 rounded-3xl space-y-6">
            <div>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6900] font-bold">
                XERO DISPATCH ROBOTICS
              </span>
              <h3 className="text-base font-bold text-white mt-1">Xero Auto-Mailer Simulator</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Experience of Shariff full invoice business logic. Dispatches PDFs, templates, and logs on the exact schedule set.
              </p>
            </div>

            <div className="space-y-4 bg-[#010b1a]/60 border border-[#004A99]/25 p-4 rounded-2xl">
              <h4 className="text-xs font-mono text-[#ff6900] font-bold uppercase tracking-wider">Simulation triggers</h4>
              
              <div className="space-y-3.5">
                <button
                  type="button"
                  disabled={!editAllowed}
                  onClick={runMonthlyDay1Simulation}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition disabled:opacity-35"
                >
                  <Send className="w-4 h-4" />
                  Trigger "Day 1" Auto-Delivery (All Unpaid)
                </button>

                <p className="text-[10px] text-zinc-400 font-sans italic">
                  Rule: Sends invoice PDF details directly to registered clients. Safe to run.
                </p>

                <button
                  type="button"
                  disabled={!editAllowed}
                  onClick={run14DaysReminderSimulation}
                  className="w-full py-2.5 bg-gradient-to-r from-[#ff6900] to-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,105,0,0.3)] transition disabled:opacity-35"
                >
                  <BellRing className="w-4 h-4" />
                  Trigger "14-Day Overdue" Reminder (All Sent/Unpaid)
                </button>

                <p className="text-[10px] text-zinc-400 font-sans italic">
                  Rule: Skips Paid indices. Reforces reminder notices with banking details.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/40 border border-[#004A99]/15 rounded-2xl">
              <h4 className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase mb-2">Automated Rules Status</h4>
              <ul className="space-y-2 text-[11px] text-zinc-300 font-sans">
                <li className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><b>Day 1 Dispatch:</b> Auto-delivery active.</span>
                </li>
                <li className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><b>14-Day Reminders:</b> Dispatches if unpaid.</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ff6900] shrink-0" />
                  <span><b>Aussie Accounts Embedded:</b> BSB/ACC auto-appended.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Logs Terminal and Email Previewer column */}
          <div className="lg:col-span-7 bg-[#02132a] border border-[#004A99]/20 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#004A99]/10">
                <h3 className="font-bold text-white text-sm">Automated Event Pipeline Output</h3>
                <button 
                  onClick={() => setSimLog([])}
                  className="text-[9px] font-mono uppercase bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded"
                >
                  Clear Console Logs
                </button>
              </div>

              {/* Logs terminal */}
              <div className="bg-black/90 rounded-2xl p-4 border border-[#004A99]/15 font-mono text-[10px] text-zinc-400 text-left space-y-1.5 h-36 overflow-y-auto leading-normal">
                {simLog.length === 0 ? (
                  <div className="text-zinc-600 italic">No automations executed in this sandbox session. Press triggers on the left to simulate!</div>
                ) : (
                  simLog.map((log, idx) => (
                    <div key={idx} className="border-b border-zinc-950 pb-1 last:border-0">
                      <span className="text-[#ff6900] mr-1.5">[ROBOTIC ENGINE]:</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Demo Email Header */}
              <div className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-5 space-y-3.5 text-left">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  Simulator Email Template Preview & Branding
                </span>
                
                <div className="border border-[#004A99]/15 rounded-xl p-4 bg-white text-zinc-900 space-y-4 leading-relaxed text-xs">
                  {/* Branding Header */}
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <div>
                      <span className="font-extrabold text-[13px] tracking-tight text-zinc-950 block">EZY DIGITAL HUB</span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Australian Business Portal</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-zinc-900 text-white rounded text-[8px] font-bold tracking-widest uppercase">LOGO MOCKUP</span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-zinc-900">Dear Client Business Representative,</p>
                    <p>Your monthly tax services statement with <b>Ezy Mortgage Australia / Ezy Outsource</b> is enclosed. Details are as follows:</p>
                  </div>

                  {/* Summary grid */}
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 grid grid-cols-2 gap-2 text-[11px] text-zinc-700">
                    <div><b className="text-zinc-500">Invoice Reference ID:</b> INV-2026-Demo</div>
                    <div><b className="text-zinc-500">Gross Total Amount:</b> $3,850.00 AUD</div>
                    <div><b className="text-zinc-500">Payment Term:</b> Net 14 Days</div>
                    <div><b className="text-zinc-500">Service Area:</b> Backoffice Admin Outsourcing</div>
                  </div>

                  <div className="space-y-2.5">
                    <p>To settle, direct deposit transfers should be processed to the authorized Australian bank account listed below:</p>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 rounded-xl font-mono text-[11px] space-y-0.5">
                      <div className="font-bold">EZY MORTGAGE AUSTRALIA PTY LTD:</div>
                      <div>Bank: Commonwealth Bank of Australia</div>
                      <div className="flex gap-4">
                        <span>BSB: 062-900</span>
                        <span>Account Number: 1045 8892</span>
                      </div>
                    </div>
                    <div className="p-3 bg-[#ff6900]/10 border border-[#ff6900]/30 text-amber-900 rounded-xl font-mono text-[11px] space-y-0.5">
                      <div className="font-bold">EZY OUTSOURCE PTY LTD:</div>
                      <div>Bank: National Australia Bank (NAB)</div>
                      <div className="flex gap-4">
                        <span>BSB: 082-057</span>
                        <span>Account Number: 9942 5110</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 text-center italic border-t border-zinc-100 pt-3">
                    Enclosed under security rules. No action is required if previously cleared.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Tax Invoice Print/PDF overlay */}
      {selectedInvoicePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-zinc-900 rounded-3xl max-w-2xl w-full relative overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto font-sans animate-zoom-in">
            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-widest block">
                  XERO COMPLIANT TAX STATEMENT
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 font-sans">{selectedInvoicePreview.companyCategory}</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Invoice ID: {selectedInvoicePreview.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoicePreview(null)}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoiced parties details */}
            <div className="grid grid-cols-2 gap-6 text-xs leading-relaxed">
              <div>
                <span className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Invoiced From</span>
                <span className="text-sm font-bold text-zinc-900 block font-sans">{selectedInvoicePreview.companyCategory}</span>
                <span className="text-zinc-600 block mt-0.5">Authorised Canberra Hub #503529</span>
                <span className="text-zinc-600 block">Harrison ACT, Canberra, Australia</span>
                <span className="text-zinc-600 block font-mono">ABN: 54 624 883 912</span>
              </div>
              <div className="text-right">
                <span className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">To Authorized Client</span>
                <span className="text-sm font-bold text-zinc-900 block font-sans">{selectedInvoicePreview.client}</span>
                <span className="text-zinc-650 block mt-0.5">{selectedInvoicePreview.clientEmail}</span>
                {selectedInvoicePreview.clientAddress && <span className="text-zinc-500 block">{selectedInvoicePreview.clientAddress}</span>}
                {selectedInvoicePreview.clientABN && <span className="text-zinc-400 block font-mono font-bold mt-1">ABN: {selectedInvoicePreview.clientABN}</span>}
                <div className="mt-3 text-[11px] font-mono space-y-0.5">
                  <div><span className="text-zinc-500">Date Issued:</span> {selectedInvoicePreview.date}</div>
                  <div><span className="text-zinc-500 font-bold">Payment Due:</span> {selectedInvoicePreview.dueDate}</div>
                  <div><span className="text-zinc-500">State:</span> <b className="uppercase">{selectedInvoicePreview.status}</b></div>
                </div>
              </div>
            </div>

            {/* Calculations lines list */}
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

            {/* Totals */}
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
                  ${computeTotal(selectedInvoicePreview).toLocaleString()} AUD
                </span>
              </div>
            </div>

            {/* Banking Accounts block */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-[11px] leading-relaxed text-zinc-600">
              <h4 className="font-bold text-zinc-800 text-xs mb-1 uppercase tracking-wider font-sans">Authorized Direct Remittance account details</h4>
              <p>Please execute standard bank transfer splits using the explicit company account designated for this contract below. Append reference: <b>{selectedInvoicePreview.id}</b></p>
              
              <div className="mt-3.5 pt-3.5 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl border font-sans ${selectedInvoicePreview.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD" ? "bg-emerald-500/5 border-emerald-500/20 text-zinc-900" : "bg-zinc-100 opacity-60 text-zinc-500"}`}>
                  <div className="font-bold text-zinc-900">EZY MORTGAGE AUSTRALIA PTY LTD</div>
                  <div className="font-mono text-[10px] mt-1 space-y-0.5">
                    <div>Bank: Commonwealth Bank of Australia</div>
                    <div>BSB: 062-900</div>
                    <div>Account: 1045 8892</div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border font-sans ${selectedInvoicePreview.companyCategory === "EZY OUTSOURCE PTY LTD" ? "bg-emerald-500/5 border-emerald-500/20 text-zinc-900" : "bg-zinc-100 opacity-60 text-zinc-500"}`}>
                  <div className="font-bold text-zinc-900">EZY OUTSOURCE PTY LTD</div>
                  <div className="font-mono text-[10px] mt-1 space-y-0.5">
                    <div>Bank: National Australia Bank (NAB)</div>
                    <div>BSB: 082-057</div>
                    <div>Account: 9942 5110</div>
                  </div>
                </div>
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
