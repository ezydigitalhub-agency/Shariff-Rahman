import React, { useState } from "react";
import { Plus, X, Check, Trash2, Users } from "lucide-react";

interface UserManagementProps {
  adminUsers: any[];
  setAdminUsers: React.Dispatch<React.SetStateAction<any[]>>;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setSimulatedUserSession: (user: any) => void;
}

export default function UserManagement({
  adminUsers,
  setAdminUsers,
  activeTab,
  setActiveTab,
  setSimulatedUserSession
}: UserManagementProps) {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Administrative Assistant");
  const [newUserAllowedMenus, setNewUserAllowedMenus] = useState<string[]>(["overview"]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUserObj = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      allowedMenus: newUserAllowedMenus
    };

    setAdminUsers([...adminUsers, newUserObj]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Administrative Assistant");
    setNewUserAllowedMenus(["overview"]);
    setShowAddUserForm(false);
  };

  const handleToggleMenu = (userId: string, menuKey: string) => {
    const updated = adminUsers.map((u) => {
      if (u.id === userId) {
        const hasMenu = u.allowedMenus.includes(menuKey);
        const nextMenus = hasMenu
          ? u.allowedMenus.filter((m: string) => m !== menuKey)
          : [...u.allowedMenus, menuKey];
        return { ...u, allowedMenus: nextMenus };
      }
      return u;
    });
    setAdminUsers(updated);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === "u-1") {
      alert("The primary principal broker cannot be deleted.");
      return;
    }
    if (window.confirm("Permanently revoke credentials and permissions for this user?")) {
      setAdminUsers(adminUsers.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="bg-[#02132a] border border-[#004A99]/20 rounded-3xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="block text-[9px] font-mono uppercase tracking-widest text-[#ff6100] font-bold">
            Access Controls
          </span>
          <h3 className="text-xl font-bold text-white mt-0.5">Administrative User Permissions</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Configure which directories and system views specific assist staff, brokers, or accountants can interact with.
          </p>
        </div>
        <button
          onClick={() => setShowAddUserForm(!showAddUserForm)}
          className="px-4 py-2 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          {showAddUserForm ? "Hide Form" : "Register Team User"}
        </button>
      </div>

      {showAddUserForm && (
        <form onSubmit={handleAddUser} className="bg-[#010b1a]/80 border border-[#004A99]/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <h4 className="text-xs font-mono tracking-widest text-[#ff6100] uppercase font-bold">New User Dossier</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Full Name</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="E.g. Liam Smith"
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="liam@brokerassist.com.au"
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-none font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Professional Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-xs text-white rounded-xl focus:outline-none transition leading-relaxed font-sans"
              >
                <option value="Principal Broker">Principal Broker</option>
                <option value="Associate Broker">Associate Broker</option>
                <option value="Administrative Assistant">Administrative Assistant</option>
                <option value="External Accountant">External Accountant</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-mono text-zinc-400">Assign Visible Sidebar Options</label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: "overview", label: "Overview Panel" },
                { id: "income", label: "Income Tracker" },
                { id: "expense", label: "Expense Ledger" },
                { id: "invoices", label: "Invoicing System" }
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={newUserAllowedMenus.includes(opt.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewUserAllowedMenus([...newUserAllowedMenus, opt.id]);
                      } else {
                        setNewUserAllowedMenus(newUserAllowedMenus.filter((m) => m !== opt.id));
                      }
                    }}
                    className="rounded border-[#004A99]/50 text-[#ff6100] focus:ring-[#ff6100] bg-[#02132a]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddUserForm(false)}
              className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Save User Profile
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
              <th className="p-4">User Details</th>
              <th className="p-4">Staff Role</th>
              <th className="p-4">Menu Visibility Allocations (Click to Toggle)</th>
              <th className="p-4 text-center">Simulation Sandbox</th>
              <th className="p-4 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#004A99]/10">
            {adminUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[#004A99]/5 text-zinc-300 transition">
                <td className="p-4">
                  <span className="font-extrabold text-white block text-sm">{user.name}</span>
                  <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">{user.email}</span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full bg-[#004A99]/20 text-blue-300 text-[10px] font-semibold border border-[#004A99]/30">
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "overview", label: "Overview" },
                      { key: "income", label: "Income" },
                      { key: "expense", label: "Expense" },
                      { key: "invoices", label: "Invoices" }
                    ].map((opt) => {
                      const allowed = user.allowedMenus.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleToggleMenu(user.id, opt.key)}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono border transition flex items-center gap-1 cursor-pointer ${
                            allowed
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-950/40 text-zinc-500 border-zinc-900 line-through"
                          }`}
                          title={`Toggle ${opt.label} access for ${user.name}`}
                        >
                          {allowed ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <X className="w-2.5 h-2.5 text-zinc-500" />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => {
                      setSimulatedUserSession(user);
                      if (user.allowedMenus && user.allowedMenus.length > 0) {
                        if (!user.allowedMenus.includes(activeTab)) {
                          setActiveTab(user.allowedMenus[0]);
                        }
                      } else {
                        setActiveTab("overview");
                      }
                      alert(`Dashboard view switched to simulated restricted view for ${user.name}.\nYou will only see permitted tabs now.`);
                    }}
                    className="px-3 py-1 bg-[#02132a]/80 hover:bg-[#ff6100]/10 text-zinc-300 hover:text-[#ff6100] text-[10px] font-semibold rounded-lg border border-[#004A99]/25 hover:border-[#ff6100]/40 transition uppercase cursor-pointer"
                  >
                    Impersonate Role
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg border border-red-500/15 hover:border-red-500/30 transition cursor-pointer"
                    title="Revoke client assistant"
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
  );
}
