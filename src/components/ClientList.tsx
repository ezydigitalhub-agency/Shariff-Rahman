import React, { useState } from "react";
import { Plus, Search, Trash2, ShieldCheck, Mail, Phone, Landmark, MapPin } from "lucide-react";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyCategory: "EZY MORTGAGE AUSTRALIA PTY LTD" | "EZY OUTSOURCE PTY LTD";
  address: string;
  abn: string;
  notes?: string;
  createdAt: string;
}

interface ClientListProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  editAllowed: boolean;
}

export default function ClientList({ clients, setClients, editAllowed }: ClientListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyCategory, setCompanyCategory] = useState<"EZY MORTGAGE AUSTRALIA PTY LTD" | "EZY OUTSOURCE PTY LTD">("EZY MORTGAGE AUSTRALIA PTY LTD");
  const [address, setAddress] = useState("");
  const [abn, setAbn] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot create clients.");
      return;
    }
    if (!name.trim() || !email.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyCategory,
      address: address.trim(),
      abn: abn.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString().split("T")[0]
    };

    setClients([newClient, ...clients]);

    // reset
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setAbn("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDeleteClient = (id: string) => {
    if (!editAllowed) {
      alert("Permission Denied: View Only users cannot delete client records.");
      return;
    }
    if (window.confirm("Permanently erase this client registry record? This will unbind future invoice automation links.")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.abn.includes(searchQuery);
    
    if (categoryFilter === "all") return matchesSearch;
    return matchesSearch && c.companyCategory === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Overview stats for clients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Registered Clients</span>
          <span className="block text-2xl font-extrabold text-blue-400 tracking-tight mt-1 font-sans">
            {clients.length} Corporate Accounts
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Active client databases recorded</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Ezy Mortgage Australia Deals</span>
          <span className="block text-2xl font-extrabold text-[#ff6900] tracking-tight mt-1 font-sans">
            {clients.filter(c => c.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD").length} Accounts
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Brokerage refinancing profiles</p>
        </div>
        <div className="bg-[#02132a] border border-[#004A99]/20 p-5 rounded-2xl">
          <span className="block text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Ezy Outsource PTY LTD Deals</span>
          <span className="block text-2xl font-extrabold text-emerald-400 tracking-tight mt-1 font-sans">
            {clients.filter(c => c.companyCategory === "EZY OUTSOURCE PTY LTD").length} Accounts
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 font-sans">Corporate services outsourced</p>
        </div>
      </div>

      {/* Main Section container */}
      <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6900] font-bold">
              Business Directory Model
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Corporate Client Directory</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Maintain full records for our two main managing corporate companies: Ezy Mortgage Australia and Ezy Outsource.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#ff6900] hover:bg-[#e05c00] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Hide Form" : "Establish New Client"}
          </button>
        </div>

        {/* Client submission creation form */}
        {showAddForm && (
          <form onSubmit={handleAddClient} className="bg-[#010b1a]/85 border border-[#004A99]/30 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#004A99]/15 pb-2">
              <h4 className="text-xs font-mono tracking-widest text-[#ff6900] uppercase font-bold">Client Account Onboarding Parameters</h4>
              {!editAllowed && (
                <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                  ✕ READ ONLY MODE ACTIVE
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Client Contact Person Name</label>
                <input
                  type="text"
                  required
                  disabled={!editAllowed}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shariff Rahman"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Secure Personal Email</label>
                <input
                  type="email"
                  required
                  disabled={!editAllowed}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com.au"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Contact Phone / Phone</label>
                <input
                  type="text"
                  disabled={!editAllowed}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 412 345 678"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Managing Company Category</label>
                <select
                  disabled={!editAllowed}
                  value={companyCategory}
                  onChange={(e) => setCompanyCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans text-zinc-100"
                >
                  <option value="EZY MORTGAGE AUSTRALIA PTY LTD">EZY MORTGAGE AUSTRALIA PTY LTD</option>
                  <option value="EZY OUTSOURCE PTY LTD">EZY OUTSOURCE PTY LTD</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Corporate Business Address</label>
                <input
                  type="text"
                  disabled={!editAllowed}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City State, Australia"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Australian Business Number ABN</label>
                <input
                  type="text"
                  disabled={!editAllowed}
                  value={abn}
                  onChange={(e) => setAbn(e.target.value)}
                  placeholder="ABN 11 000 000 000"
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
                />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-3">
                <label className="block text-[10px] uppercase font-mono text-zinc-400">Internal Operational Notes</label>
                <textarea
                  disabled={!editAllowed}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Brief service description, loan targets or aggregator requirements"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6900] text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editAllowed}
                className="px-4 py-1.5 bg-[#ff6900] hover:bg-[#e05c00] text-white text-xs font-bold rounded-lg transition disabled:opacity-40"
              >
                Onboard Client
              </button>
            </div>
          </form>
        )}

        {/* Filters and List */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text"
              placeholder="Search by name, email, ABN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-[#010b1a] border border-[#004A99]/40 focus:border-[#ff6900] text-xs rounded-xl focus:outline-none transition text-white"
            />
          </div>

          <div className="flex bg-[#010b1a] border border-[#004A99]/40 p-1 rounded-xl">
            {[
              { id: "all", label: "All Sectors" },
              { id: "EZY MORTGAGE AUSTRALIA PTY LTD", label: "Mortgage Australia" },
              { id: "EZY OUTSOURCE PTY LTD", label: "Ezy Outsource" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1 text-[10px] font-semibold rounded-lg uppercase tracking-wide transition cursor-pointer ${categoryFilter === tab.id ? "bg-[#ff6900]/10 text-[#ff6900]" : "text-zinc-400 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client Ledger Table */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 italic text-xs">
            No clients registered under the chosen filters.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40 animate-fade-in text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
                  <th className="p-4">Client Identity</th>
                  <th className="p-4">Contact Indicators</th>
                  <th className="p-4">Associated Company Entity</th>
                  <th className="p-4">Corporate Address</th>
                  <th className="p-4">ABN Number</th>
                  <th className="p-4 text-right">Directory Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#004A99]/10">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition">
                    <td className="p-4">
                      <span className="font-extrabold text-white block text-sm">{client.name}</span>
                      <span className="text-[10px] text-zinc-400 block italic mt-0.5">{client.notes || "No notes appended"}</span>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-[#ff6900]/80" />
                        <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        client.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD"
                          ? "text-[#ff6900] bg-[#ff6900]/10 border-[#ff6900]/20"
                          : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      }`}>
                        <Landmark className="w-3 h-3" />
                        {client.companyCategory === "EZY MORTGAGE AUSTRALIA PTY LTD" ? "EZY MORTGAGE" : "EZY OUTSOURCE"}
                      </span>
                    </td>
                    <td className="p-4 font-sans text-zinc-400 max-w-xs truncate" title={client.address}>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {client.address || "Address not standard"}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-zinc-300">
                      {client.abn || "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        disabled={!editAllowed}
                        className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 disabled:opacity-30 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                        title="Delete client record"
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
