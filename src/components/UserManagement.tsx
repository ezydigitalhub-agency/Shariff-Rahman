import React, { useState } from "react";
import { Plus, X, Check, Trash2, ShieldCheck, UserCheck, ShieldAlert } from "lucide-react";

interface UserManagementProps {
  adminUsers: any[];
  setAdminUsers: React.Dispatch<React.SetStateAction<any[]>>;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setSimulatedUserSession: (user: any) => void;
  currentSimulatedUser: any;
}

export default function UserManagement({
  adminUsers,
  setAdminUsers,
  activeTab,
  setActiveTab,
  setSimulatedUserSession,
  currentSimulatedUser
}: UserManagementProps) {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Administrative Assistant");
  const [newUserAuthority, setNewUserAuthority] = useState<"CEO" | "edit" | "view">("edit");
  const [newUserAllowedMenus, setNewUserAllowedMenus] = useState<string[]>(["overview", "clients", "income", "expense", "invoices"]);

  const isCEO = !currentSimulatedUser || currentSimulatedUser.authority === "CEO";

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCEO) {
      alert("Permission Denied: Only CEO Master accounts can onboard new team members.");
      return;
    }

    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUserObj = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      authority: newUserAuthority,
      allowedMenus: newUserAuthority === "CEO" 
        ? ["overview", "clients", "income", "expense", "invoices", "users"]
        : newUserAllowedMenus
    };

    setAdminUsers([...adminUsers, newUserObj]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Administrative Assistant");
    setNewUserAuthority("edit");
    setNewUserAllowedMenus(["overview", "clients", "income", "expense", "invoices"]);
    setShowAddUserForm(false);
  };

  const handleToggleMenu = (userId: string, menuKey: string) => {
    if (!isCEO) {
      alert("Permission Denied: Only CEO can toggle menu visibility settings.");
      return;
    }

    const updated = adminUsers.map((u) => {
      if (u.id === userId) {
        if (u.authority === "CEO") return u; // CEO always has access to all
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

  const handleToggleAuthority = (userId: string, value: "CEO" | "edit" | "view") => {
    if (!isCEO) {
      alert("Permission Denied: Only CEO master accounts can promote/demote security clearance.");
      return;
    }

    const updated = adminUsers.map((u) => {
      if (u.id === userId) {
        if (userId === "u-1" && value !== "CEO") {
          alert("The main founder CEO cannot be demoted.");
          return u;
        }
        return { 
          ...u, 
          authority: value,
          allowedMenus: value === "CEO" 
            ? ["overview", "clients", "income", "expense", "invoices", "users"]
            : u.allowedMenus
        };
      }
      return u;
    });
    setAdminUsers(updated);
  };

  const handleDeleteUser = (userId: string) => {
    if (!isCEO) {
      alert("Permission Denied: Only CEO accounts can revoke user records.");
      return;
    }
    if (userId === "u-1") {
      alert("The primary CEO master index cannot be deleted.");
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
            Access Controls Systems
          </span>
          <h3 className="text-xl font-bold text-white mt-0.5">Role Permission Directories</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Configure access tokens, section lists, and action scopes. **CEO Master accounts** can create staff, configure checkboxes, or limit users to "View Only" lists.
          </p>
        </div>
        
        {isCEO ? (
          <button
            onClick={() => setShowAddUserForm(!showAddUserForm)}
            className="px-4 py-2 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            {showAddUserForm ? "Hide Form" : "Establish Team User"}
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Impersonation View is Restrained</span>
          </div>
        )}
      </div>

      {showAddUserForm && isCEO && (
        <form onSubmit={handleAddUser} className="bg-[#010b1a]/80 border border-[#004A99]/40 rounded-2xl p-4 sm:p-6 space-y-4">
          <h4 className="text-xs font-mono tracking-widest text-[#ff6100] uppercase font-bold">New User Account Configuration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Full Name</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="E.g. Liam Smith"
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
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
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Professional Title</label>
              <input
                type="text"
                required
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                placeholder="e.g. Associate Mortgages Broker"
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl focus:outline-none font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Authority Clearance Level</label>
              <select
                value={newUserAuthority}
                onChange={(e) => setNewUserAuthority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#02132a] border border-[#004A99]/50 focus:border-[#ff6100] text-white rounded-xl transition font-sans"
              >
                <option value="CEO">CEO (Unlimited Access & Controls)</option>
                <option value="edit">Manager / Specialist (Can See & Edit & Input)</option>
                <option value="view">Staff Associate (View-Only / Just See)</option>
              </select>
            </div>
          </div>

          {newUserAuthority !== "CEO" && (
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">Visible Sections checklist</label>
              <div className="flex flex-wrap gap-4 text-xs">
                {[
                  { id: "overview", label: "Overview panel" },
                  { id: "clients", label: "Clients list" },
                  { id: "income", label: "Income Tracker" },
                  { id: "expense", label: "Expense Ledger" },
                  { id: "invoices", label: "Invoice System" }
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-zinc-300 cursor-pointer hover:text-white select-none">
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
          )}

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
              className="px-4 py-1.5 bg-[#ff6100] hover:bg-[#e05c00] text-white text-xs font-bold rounded-lg transition"
            >
              Save Team Record
            </button>
          </div>
        </form>
      )}

      {/* User Ledger Matrix */}
      <div className="overflow-x-auto border border-[#004A99]/20 rounded-2xl bg-[#010b1a]/40 text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#02132a]/80 border-b border-[#004A99]/20 text-zinc-400 font-semibold uppercase font-mono tracking-wider text-[9px]">
              <th className="p-4">User Details</th>
              <th className="p-4">Staff Role</th>
              <th className="p-4">Authority Clearance</th>
              <th className="p-4">Sidebar Viewable Tabs (Toggle Checkboxes)</th>
              <th className="p-4 text-center font-sans">Role Impersonation Switch</th>
              <th className="p-4 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#004A99]/10">
            {adminUsers.map((user) => {
              const activeSuper = user.authority === "CEO";
              return (
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
                    <div className="flex bg-[#010b1a] border border-[#004A99]/30 p-1 rounded-xl w-fit">
                      {[
                        { val: "CEO", label: "CEO" },
                        { val: "edit", label: "Edit" },
                        { val: "view", label: "See" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleToggleAuthority(user.id, item.val as any)}
                          className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                            user.authority === item.val
                              ? "bg-[#ff6100] text-white"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={`Set authority level to ${item.label}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.authority === "CEO" ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 block w-fit font-bold uppercase">
                        MASTER BYPASSED (ALL SITES)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { key: "overview", label: "Overview" },
                          { key: "clients", label: "Clients" },
                          { key: "income", label: "Income" },
                          { key: "expense", label: "Expense" },
                          { key: "invoices", label: "Invoices" }
                        ].map((opt) => {
                          const allowed = (user.allowedMenus || []).includes(opt.key);
                          return (
                            <button
                              key={opt.key}
                              disabled={!isCEO}
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
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {currentSimulatedUser && currentSimulatedUser.id === user.id ? (
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white rounded px-2 py-1 flex items-center justify-center gap-1 w-fit mx-auto">
                        <UserCheck className="w-3.5 h-3.5" />
                        ACTIVE USER Context
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSimulatedUserSession(user);
                          const userMenus = user.authority === "CEO" 
                            ? ["overview", "clients", "income", "expense", "invoices", "users"]
                            : (user.allowedMenus || []);
                          if (userMenus.length > 0) {
                            if (!userMenus.includes(activeTab)) {
                              setActiveTab(userMenus[0]);
                            }
                          } else {
                            setActiveTab("overview");
                          }
                          alert(`Switched context successfully to: ${user.name}.\nCleareance Access Privilege: ${user.authority === "CEO" ? "CEO MASTER" : user.authority === "edit" ? "EDIT & INPUT" : "VIEW ONLY"}.`);
                        }}
                        className="px-3 py-1 bg-[#02132a]/80 hover:bg-[#ff6100]/10 text-zinc-300 hover:text-[#ff6100] text-[10px] font-semibold rounded-lg border border-[#004A99]/25 hover:border-[#ff6100]/40 transition uppercase cursor-pointer"
                      >
                        Activate Role Context
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={!isCEO || user.id === "u-1"}
                      className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 disabled:opacity-30 rounded-lg border border-red-500/10 hover:border-red-500/30 transition cursor-pointer"
                      title="Revoke client assistant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
