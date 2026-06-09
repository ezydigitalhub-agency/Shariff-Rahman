import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, TrendingUp, Wallet, FileText, ShieldCheck,
  Plus, Search, Trash2, Pencil, X, CheckCircle2, Clock, AlertTriangle,
  Send, Building2, Mail, LogOut, Eye, Lock, Sun, Moon, ClipboardCheck,
  Paperclip, Upload, FileIcon, Download, RotateCcw, AlertCircle
} from "lucide-react";
import XeroSales from "./XeroSales";
import XeroInvoices from "./XeroInvoices";
import { uploadExpenseAttachment, saveEditRequest, getPendingEditRequests, resolveEditRequest } from "../lib/firebase";
import type { ExpenseAttachment, ExpenseEditRequest } from "../lib/firebase";

/* ----------------------------------------------------------------------- *
 *  EZY GROUP — Business Admin Panel
 *  Roles: Super Admin / Manager / Admin
 * ----------------------------------------------------------------------- */

interface AdminPanelProps {
  onBackToHome: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const COMPANIES = {
  mortgage: "EZY MORTGAGE AUSTRALIA PTY LTD",
  outsource: "EZY OUTSOURCE PTY LTD",
};

const BANK_ACCOUNTS = [
  { label: "Account 1 — NAB", bsb: "083-004", acc: "12 345 6789", name: "EZY Mortgage Australia Pty Ltd" },
  { label: "Account 2 — CBA", bsb: "062-001", acc: "98 765 4321", name: "EZY Outsource Pty Ltd" },
];

const INCOME_CATEGORIES = ["Loan Settlement", "Brokerage Commission", "Outsourcing Fee", "Consulting", "Other"];
const SERVICES = ["Home Loan", "Refinance", "Commercial Loan", "Back-office", "Lead Generation", "Accounting Support"];
const EXPENSE_CATEGORIES = ["Office Operations", "Administration", "Subscription Purchase", "Salary Expense"];

// Sections each role can see
const ROLE_MENUS: Record<string, string[]> = {
  "Super Admin": ["overview", "clients", "income", "expense", "invoices", "users", "approvals"],
  "Manager":     ["income", "expense", "invoices"],
  "Admin":       ["expense"],
};

const SECTIONS = ["overview", "clients", "income", "expense", "invoices", "users", "approvals"];

/* ---------- permission helpers ---------- */
function permsFor(role: string) {
  const p: Record<string, string> = {};
  SECTIONS.forEach(s => p[s] = "none");
  const menus = ROLE_MENUS[role] || [];
  menus.forEach(s => p[s] = "edit");
  return p;
}

/* ---------- seed data ---------- */
const seed = () => ({
  clients: [
    { id: "c1", name: "Daniel Whitmore", email: "daniel@brightside.com.au", phone: "0412 334 556", companyName: "Brightside Realty", address: "12 Pitt St, Sydney NSW 2000", abn: "53 004 085 616", company: "mortgage" },
    { id: "c2", name: "Aisha Khan", email: "aisha@nexushold.com.au", phone: "0433 221 110", companyName: "Nexus Holdings", address: "88 Collins St, Melbourne VIC 3000", abn: "11 222 333 444", company: "outsource" },
    { id: "c3", name: "Marco Ferreira", email: "marco@coastline.com.au", phone: "0401 998 776", companyName: "Coastline Group", address: "5 Eagle St, Brisbane QLD 4000", abn: "62 110 220 330", company: "mortgage" },
  ],
  income: [
    { id: "i1", clientId: "c1", company: "mortgage", category: "Loan Settlement", service: "Home Loan", amount: 8500, date: "2026-05-12", status: "paid", note: "Settlement bonus" },
    { id: "i2", clientId: "c3", company: "mortgage", category: "Brokerage Commission", service: "Refinance", amount: 4200, date: "2026-05-20", status: "unpaid", note: "Awaiting lender" },
    { id: "i3", clientId: "c2", company: "outsource", category: "Outsourcing Fee", service: "Back-office", amount: 6300, date: "2026-05-28", status: "paid", note: "Monthly retainer" },
    { id: "i4", clientId: "c2", company: "outsource", category: "Consulting", service: "Accounting Support", amount: 2100, date: "2026-06-02", status: "unpaid", note: "" },
  ],
  expenses: [
    { id: "e1", company: "mortgage", category: "Office Operations", sub: "Rent", amount: 3200, date: "2026-05-01", note: "Sydney office", attachments: [], firstEditUsed: false, editRequests: [] },
    { id: "e2", company: "outsource", category: "Subscription Purchase", sub: "Xero + CRM", amount: 480, date: "2026-05-03", note: "", attachments: [], firstEditUsed: false, editRequests: [] },
    { id: "e3", company: "mortgage", category: "Salary Expense", sub: "Sarah Lin (Broker)", amount: 6500, date: "2026-05-30", note: "May salary", attachments: [], firstEditUsed: false, editRequests: [] },
    { id: "e4", company: "outsource", category: "Salary Expense", sub: "Team — Manila", amount: 4800, date: "2026-05-30", note: "May salary", attachments: [], firstEditUsed: false, editRequests: [] },
    { id: "e5", company: "mortgage", category: "Administration", sub: "Accounting fees", amount: 950, date: "2026-05-15", note: "", attachments: [], firstEditUsed: false, editRequests: [] },
  ],
  invoices: [
    { id: "inv1", number: "INV-1001", clientId: "c1", company: "mortgage", issueDate: "2026-05-01", dueDate: "2026-05-15", status: "paid", items: [{ desc: "Home loan brokerage service", qty: 1, price: 8500 }], autoGenerated: false, emailSentAt: "2026-05-01T09:00:00Z", reminderSentAt: null, reminderSentCount: 0, lastMailLog: "Invoice sent 1 May 2026" },
    { id: "inv2", number: "INV-1002", clientId: "c2", company: "outsource", issueDate: "2026-05-01", dueDate: "2026-05-15", status: "sent", items: [{ desc: "Monthly back-office retainer", qty: 1, price: 6300 }], autoGenerated: true, emailSentAt: "2026-05-01T09:00:00Z", reminderSentAt: "2026-05-15T09:00:00Z", reminderSentCount: 1, lastMailLog: "Reminder sent 15 May 2026" },
    { id: "inv3", number: "INV-1003", clientId: "c3", company: "mortgage", issueDate: "2026-04-01", dueDate: "2026-04-15", status: "overdue", items: [{ desc: "Refinance commission", qty: 1, price: 4200 }], autoGenerated: true, emailSentAt: "2026-04-01T09:00:00Z", reminderSentAt: "2026-04-15T09:00:00Z", reminderSentCount: 1, lastMailLog: "Reminder sent 15 Apr 2026" },
  ],
  users: [
    { id: "u1", name: "Shariff Rahman", email: "shariff@ezygroup.com.au", role: "Super Admin", perms: permsFor("Super Admin") },
    { id: "u2", name: "Operations Manager", email: "ops@ezygroup.com.au", role: "Manager", perms: permsFor("Manager") },
    { id: "u3", name: "Accounts Staff", email: "accounts@ezygroup.com.au", role: "Admin", perms: permsFor("Admin") },
  ],
  // Pending edit requests (stored locally alongside DB; synced to Firestore in production)
  editRequests: [] as any[],
});

/* ---------- storage layer ---------- */
const KEY = "ezy_admin_db_v4";
async function loadDB() {
  try {
    const localVal = localStorage.getItem(KEY);
    if (localVal) return JSON.parse(localVal);
    if (typeof window !== "undefined" && (window as any).storage) {
      const r = await (window as any).storage.get(KEY);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) { /* not found */ }
  const data = seed();
  saveDB(data);
  return data;
}

async function saveDB(data: any) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    if (typeof window !== "undefined" && (window as any).storage) {
      await (window as any).storage.set(KEY, JSON.stringify(data));
    }
  } catch (e) { /* memory only */ }
}

/* ---------- helpers ---------- */
const fmt = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);
const fmt2 = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n || 0);
const uid = () => Math.random().toString(36).slice(2, 9);
const invTotal = (inv: any) => inv.items.reduce((s: number, it: any) => s + it.qty * it.price, 0);
const gstOf = (sub: number) => Math.round(sub * 0.1 * 100) / 100;

const PALETTE = ["#1f7a52", "#d9930a", "#2563eb", "#9333ea", "#0891b2", "#64748b"];

/* ======================================================================= */
export default function AdminPanel({ onBackToHome, isDarkMode = false, onToggleTheme }: AdminPanelProps) {
  const [db, setDb] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [section, setSection] = useState("overview");
  const [scope, setScope] = useState("all");

  useEffect(() => {
    loadDB().then((d) => {
      // Migrate old DB — ensure new fields exist on existing records
      d.expenses = (d.expenses || []).map((e: any) => ({
        attachments: [],
        firstEditUsed: false,
        editRequests: [],
        ...e,
      }));
      d.invoices = (d.invoices || []).map((inv: any) => ({
        autoGenerated: false,
        emailSentAt: null,
        reminderSentAt: null,
        reminderSentCount: 0,
        lastMailLog: "",
        ...inv,
      }));
      if (!d.editRequests) d.editRequests = [];
      // Migrate users to new role system if needed
      d.users = (d.users || []).map((u: any) => {
        if (u.role === "CEO") return { ...u, role: "Super Admin", perms: permsFor("Super Admin") };
        if (u.role === "Staff") return { ...u, role: "Admin", perms: permsFor("Admin") };
        if (u.role === "Manager") return { ...u, perms: permsFor("Manager") };
        return u;
      });
      setDb(d);
      setUser(d.users[0]);
    });
  }, []);

  const commit = (next: any) => { setDb(next); saveDB(next); };

  if (!db || !user) return <Splash />;

  const can = (sec: string) => user.perms[sec] && user.perms[sec] !== "none";
  const canEdit = (sec: string) => user.perms[sec] === "edit";
  const isSuperAdmin = user.role === "Super Admin";
  const isAdmin = user.role === "Admin";

  const visibleSections = SECTIONS.filter(can);
  const activeSection = visibleSections.includes(section) ? section : visibleSections[0];

  // Count pending approvals for badge
  const pendingApprovals = (db.editRequests || []).filter((r: any) => r.status === "pending").length;

  return (
    <div className="ezy-root">
      <Styles />
      <aside className="sidebar">
        <div className="brand" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <img
            src="https://ezyhubltd.com/wp-content/uploads/2025/12/Linkdin-Profile@4x-100-scaled.jpg"
            alt="Ezy Group Logo"
            style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }}
            referrerPolicy="no-referrer"
          />
        </div>
        <nav>
          {NAV.filter((n) => can(n.key)).map((n) => (
            <button key={n.key}
              className={`nav-item ${activeSection === n.key ? "active" : ""}`}
              onClick={() => setSection(n.key)}
              style={{ position: "relative" }}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.key === "approvals" && pendingApprovals > 0 && (
                <span style={{ marginLeft: "auto", background: "#ff6900", color: "#fff", borderRadius: "10px", fontSize: "11px", fontWeight: 700, padding: "1px 7px", minWidth: "20px", textAlign: "center" }}>{pendingApprovals}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button className="btn sm full font-semibold" onClick={onBackToHome}
            style={{ background: "#1a212a", borderColor: "#232b34", color: "#cdd3da", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}>
            ← Customer Website
          </button>
          <div className="who">
            <div className="who-name">{user.name}</div>
            <div className="who-role">{user.role}</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{NAV.find((n) => n.key === activeSection)?.label}</h1>
            <p className="crumb">EZY Group · Australia</p>
          </div>
          <div className="top-controls">
            <div className="scope">
              {[["all", "Both Companies"], ["mortgage", "Ezy Mortgage"], ["outsource", "Ezy Outsource"]].map(([k, l]) => (
                <button key={k} className={scope === k ? "on" : ""} onClick={() => setScope(k)}>{l}</button>
              ))}
            </div>
            <select className="user-switch" value={user.id}
              onChange={(e) => { setUser(db.users.find((u: any) => u.id === e.target.value)); }}>
              {db.users.map((u: any) => <option key={u.id} value={u.id}>View as: {u.name} ({u.role})</option>)}
            </select>
            {onToggleTheme && (
              <button onClick={onToggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{ background: isDarkMode ? "#151c28" : "#fff", border: "1px solid", borderColor: isDarkMode ? "#1e2633" : "#e2ddd4", borderRadius: "9px", padding: "9px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isDarkMode ? "#ff6900" : "#2563eb", transition: "all 0.15s", height: "37px", width: "37px" }}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
          </div>
        </header>

        <div className="content">
          {activeSection === "overview"  && <Overview db={db} scope={scope} />}
          {activeSection === "clients"   && <Clients db={db} commit={commit} scope={scope} canEdit={canEdit("clients")} />}
          {activeSection === "income"    && <Income db={db} commit={commit} scope={scope} canEdit={canEdit("income")} />}
          {activeSection === "expense"   && <Expense db={db} commit={commit} scope={scope} canEdit={canEdit("expense")} currentUser={user} isSuperAdmin={isSuperAdmin} isAdminRole={isAdmin} />}
          {activeSection === "invoices"  && <Invoices db={db} commit={commit} scope={scope} canEdit={canEdit("invoices")} isDarkMode={isDarkMode} />}
          {activeSection === "users"     && <UsersMgmt db={db} commit={commit} canEdit={isSuperAdmin} />}
          {activeSection === "approvals" && <Approvals db={db} commit={commit} isSuperAdmin={isSuperAdmin} />}
        </div>
      </main>
    </div>
  );
}

const NAV = [
  { key: "overview",   label: "Overview",        icon: LayoutDashboard },
  { key: "clients",    label: "Client List",      icon: Users },
  { key: "income",     label: "Income",           icon: TrendingUp },
  { key: "expense",    label: "Expense",          icon: Wallet },
  { key: "invoices",   label: "Invoice System",   icon: FileText },
  { key: "users",      label: "User Management",  icon: ShieldCheck },
  { key: "approvals",  label: "Approvals",        icon: ClipboardCheck },
];

/* ============================ OVERVIEW ============================ */
function Overview({ db, scope }: { db: any; scope: string }) {
  const inScope = (c: string) => scope === "all" || c === scope;
  const income = db.income.filter((i: any) => inScope(i.company));
  const expenses = db.expenses.filter((e: any) => inScope(e.company));

  const totalIncome = income.reduce((s: number, i: any) => s + i.amount, 0);
  const paid = income.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);
  const unpaid = totalIncome - paid;
  const totalExpense = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const net = totalIncome - totalExpense;

  const byCompany = Object.keys(COMPANIES).map((k, idx) => ({
    name: k === "mortgage" ? "Ezy Mortgage" : "Ezy Outsource",
    value: db.income.filter((i: any) => i.company === k).reduce((s: number, i: any) => s + i.amount, 0),
    color: PALETTE[idx],
  })).filter((d) => scope === "all" || (scope === "mortgage" && d.name.includes("Mortgage")) || (scope === "outsource" && d.name.includes("Outsource")));

  const paidData = [
    { name: "Paid", value: paid, color: "#1f7a52" },
    { name: "Outstanding", value: unpaid, color: "#d9930a" },
  ];

  const expByCat = EXPENSE_CATEGORIES.map((cat, idx) => ({
    name: cat, value: expenses.filter((e: any) => e.category === cat).reduce((s: number, e: any) => s + e.amount, 0), color: PALETTE[idx],
  })).filter((d) => d.value > 0);

  return (
    <div className="stack">
      <div className="cards">
        <Stat label="Total Income" value={fmt(totalIncome)} tone="green" sub={`${income.length} entries`} />
        <Stat label="Total Expense" value={fmt(totalExpense)} tone="blue" sub={`${expenses.length} entries`} />
        <Stat label="Paid / Received" value={fmt(paid)} tone="green2" sub={`${income.filter((i: any)=>i.status==='paid').length} paid`} />
        <Stat label="Outstanding" value={fmt(unpaid)} tone="amber" sub={`${income.filter((i: any)=>i.status==='unpaid').length} unpaid`} />
      </div>
      <div className="cards">
        <Stat label="Net Position" value={fmt(net)} tone={net >= 0 ? "green" : "red"} sub="Income − Expense" wide />
      </div>
      <div className="chart-grid">
        <Panel title="Income by Company"><DonutChart data={byCompany} /></Panel>
        <Panel title="Paid vs Outstanding"><DonutChart data={paidData} /></Panel>
        <Panel title="Expense Breakdown"><DonutChart data={expByCat} /></Panel>
      </div>
      <Panel title="Income vs Expense by Company">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={Object.keys(COMPANIES).filter(k=>scope==='all'||k===scope).map((k) => ({
            name: k === "mortgage" ? "Ezy Mortgage" : "Ezy Outsource",
            Income: db.income.filter((i: any) => i.company === k).reduce((s: number, i: any) => s + i.amount, 0),
            Expense: db.expenses.filter((e: any) => e.company === k).reduce((s: number, e: any) => s + e.amount, 0),
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => fmt(Number(v))} />
            <Legend />
            <Bar dataKey="Income" fill="#1f7a52" radius={[6,6,0,0]} />
            <Bar dataKey="Expense" fill="#2563eb" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function DonutChart({ data }: { data: any[] }) {
  if (!data.length || data.every((d) => !d.value)) return <div className="empty">No data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip formatter={(v) => fmt(Number(v))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ============================ CLIENTS ============================ */
function Clients({ db, commit, scope, canEdit }: { db: any; commit: (next: any) => void; scope: string; canEdit: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const rows = db.clients
    .filter((c: any) => scope === "all" || c.company === scope)
    .filter((c: any) => [c.name, c.email, c.companyName, c.abn].join(" ").toLowerCase().includes(q.toLowerCase()));

  const save = (c: any) => {
    const next = { ...db };
    if (c.id) next.clients = db.clients.map((x: any) => (x.id === c.id ? c : x));
    else next.clients = [...db.clients, { ...c, id: uid() }];
    commit(next); setOpen(false); setEditing(null);
  };
  const remove = (id: string) => commit({ ...db, clients: db.clients.filter((c: any) => c.id !== id) });

  return (
    <div className="stack">
      <Toolbar q={q} setQ={setQ} placeholder="Search name, ABN, company…"
        action={canEdit && <button className="btn primary" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={16}/> New Client</button>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>ABN</th><th>Entity</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {rows.map((c: any) => (
              <tr key={c.id}>
                <td className="strong">{c.name}<div className="muted-sm">{c.address}</div></td>
                <td>{c.companyName}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.abn}</td>
                <td><Tag>{c.company === "mortgage" ? "Mortgage" : "Outsource"}</Tag></td>
                {canEdit && <td className="row-actions">
                  <button onClick={() => { setEditing(c); setOpen(true); }}><Pencil size={15}/></button>
                  <button onClick={() => remove(c.id)}><Trash2 size={15}/></button>
                </td>}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="empty">No clients found</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <ClientModal client={editing} onSave={save} onClose={() => setOpen(false)} />}
    </div>
  );
}

function ClientModal({ client, onSave, onClose }: { client: any; onSave: (c: any) => void; onClose: () => void }) {
  const [f, setF] = useState(client || { name: "", email: "", phone: "", companyName: "", address: "", abn: "", company: "mortgage" });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={client ? "Edit Client" : "New Client"} onClose={onClose}>
      <div className="form-grid">
        <Field label="Full Name"><input value={f.name} onChange={set("name")} /></Field>
        <Field label="Email"><input value={f.email} onChange={set("email")} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} /></Field>
        <Field label="Company Name"><input value={f.companyName} onChange={set("companyName")} /></Field>
        <Field label="ABN Number"><input value={f.abn} onChange={set("abn")} /></Field>
        <Field label="Belongs To Entity">
          <select value={f.company} onChange={set("company")}>
            <option value="mortgage">Ezy Mortgage Australia</option>
            <option value="outsource">Ezy Outsource</option>
          </select>
        </Field>
        <Field label="Address" wide><input value={f.address} onChange={set("address")} /></Field>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!f.name} onClick={() => onSave(f)}>Save Client</button>
      </div>
    </Modal>
  );
}

/* ============================ INCOME ============================ */
function Income({ db, commit, scope, canEdit }: { db: any; commit: (next: any) => void; scope: string; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [svc, setSvc] = useState("all");
  const clientName = (id: string) => db.clients.find((c: any) => c.id === id)?.name || "—";

  const rows = db.income
    .filter((i: any) => scope === "all" || i.company === scope)
    .filter((i: any) => cat === "all" || i.category === cat)
    .filter((i: any) => svc === "all" || i.service === svc)
    .filter((i: any) => clientName(i.clientId).toLowerCase().includes(q.toLowerCase()));

  const total = rows.reduce((s: number, i: any) => s + i.amount, 0);
  const paid = rows.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);

  const save = (rec: any) => { commit({ ...db, income: [...db.income, { ...rec, id: uid() }] }); setOpen(false); };
  const toggle = (id: string) => commit({ ...db, income: db.income.map((i: any) => i.id === id ? { ...i, status: i.status === "paid" ? "unpaid" : "paid" } : i) });
  const remove = (id: string) => commit({ ...db, income: db.income.filter((i: any) => i.id !== id) });

  return (
    <div className="stack">
      <div className="cards">
        <Stat label="Filtered Income" value={fmt(total)} tone="green" />
        <Stat label="Received" value={fmt(paid)} tone="green2" />
        <Stat label="Outstanding" value={fmt(total - paid)} tone="amber" />
      </div>
      <Toolbar q={q} setQ={setQ} placeholder="Search by client…"
        filters={<>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All categories</option>{INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={svc} onChange={(e) => setSvc(e.target.value)}>
            <option value="all">All services</option>{SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </>}
        action={canEdit && <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> New Income</button>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Client</th><th>Category</th><th>Service</th><th>Entity</th><th className="r">Amount</th><th>Status</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {rows.map((i: any) => (
              <tr key={i.id}>
                <td>{i.date}</td><td className="strong">{clientName(i.clientId)}</td>
                <td>{i.category}</td><td>{i.service}</td>
                <td><Tag>{i.company === "mortgage" ? "Mortgage" : "Outsource"}</Tag></td>
                <td className="r strong">{fmt2(i.amount)}</td>
                <td><button className={`status ${i.status}`} disabled={!canEdit} onClick={() => toggle(i.id)}>{i.status === "paid" ? "Paid" : "Unpaid"}</button></td>
                {canEdit && <td className="row-actions"><button onClick={() => remove(i.id)}><Trash2 size={15}/></button></td>}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="empty">No income records</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <IncomeModal db={db} onSave={save} onClose={() => setOpen(false)} />}
    </div>
  );
}

function IncomeModal({ db, onSave, onClose }: { db: any; onSave: (rec: any) => void; onClose: () => void }) {
  const [f, setF] = useState({ clientId: db.clients[0]?.id || "", company: "mortgage", category: INCOME_CATEGORIES[0], service: SERVICES[0], amount: "", date: new Date().toISOString().slice(0,10), status: "unpaid", note: "" });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="New Income" onClose={onClose}>
      <div className="form-grid">
        <Field label="Client"><select value={f.clientId} onChange={set("clientId")}>{db.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Entity"><select value={f.company} onChange={set("company")}><option value="mortgage">Ezy Mortgage</option><option value="outsource">Ezy Outsource</option></select></Field>
        <Field label="Category"><select value={f.category} onChange={set("category")}>{INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Service"><select value={f.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Amount (AUD)"><input type="number" value={f.amount} onChange={set("amount")} /></Field>
        <Field label="Date"><input type="date" value={f.date} onChange={set("date")} /></Field>
        <Field label="Status"><select value={f.status} onChange={set("status")}><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></Field>
        <Field label="Note" wide><input value={f.note} onChange={set("note")} /></Field>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!f.amount} onClick={() => onSave({ ...f, amount: Number(f.amount) })}>Add Income</button>
      </div>
    </Modal>
  );
}

/* ============================ EXPENSE ============================ */
function Expense({ db, commit, scope, canEdit, currentUser, isSuperAdmin, isAdminRole }: {
  db: any; commit: (next: any) => void; scope: string; canEdit: boolean;
  currentUser: any; isSuperAdmin: boolean; isAdminRole: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [requestEditTarget, setRequestEditTarget] = useState<any>(null);
  const [cat, setCat] = useState("all");

  const rows = db.expenses
    .filter((e: any) => scope === "all" || e.company === scope)
    .filter((e: any) => cat === "all" || e.category === cat);

  const total = rows.reduce((s: number, e: any) => s + e.amount, 0);
  const salary = rows.filter((e: any) => e.category === "Salary Expense").reduce((s: number, e: any) => s + e.amount, 0);

  const save = (rec: any) => { commit({ ...db, expenses: [...db.expenses, { ...rec, id: uid(), attachments: rec.attachments || [], firstEditUsed: false, editRequests: [] }] }); setOpen(false); };

  const saveEdit = (updated: any) => {
    const next = { ...db, expenses: db.expenses.map((e: any) => e.id === updated.id ? { ...updated, firstEditUsed: true } : e) };
    commit(next);
    setEditTarget(null);
  };

  const remove = (id: string) => {
    if (isAdminRole) return; // Admin cannot delete
    commit({ ...db, expenses: db.expenses.filter((e: any) => e.id !== id) });
  };

  // Attach a file to an existing expense
  const handleAttach = async (expenseId: string, file: File) => {
    try {
      const attachment = await uploadExpenseAttachment(expenseId, file);
      const next = {
        ...db,
        expenses: db.expenses.map((e: any) =>
          e.id === expenseId ? { ...e, attachments: [...(e.attachments || []), attachment] } : e
        )
      };
      commit(next);
    } catch {
      alert("File upload failed. Please ensure Firebase Storage is enabled on the Blaze plan.");
    }
  };

  // Submit an edit request (Admin role, after first edit is used)
  const submitEditRequest = (expense: any, proposed: any) => {
    const req = {
      id: uid(),
      expenseId: expense.id,
      requestedBy: currentUser.name,
      requestedAt: new Date().toISOString(),
      proposedChanges: proposed,
      status: "pending",
    };
    const next = {
      ...db,
      editRequests: [...(db.editRequests || []), req],
      expenses: db.expenses.map((e: any) =>
        e.id === expense.id ? { ...e, editRequests: [...(e.editRequests || []), req] } : e
      )
    };
    commit(next);
    setRequestEditTarget(null);
  };

  const canDeleteRow = canEdit && !isAdminRole;

  return (
    <div className="stack">
      <div className="cards">
        <Stat label="Total Expense" value={fmt(total)} tone="blue" />
        <Stat label="Salary Expense" value={fmt(salary)} tone="purple" sub="sub-category" />
        <Stat label="Operating (non-salary)" value={fmt(total - salary)} tone="slate" />
      </div>
      {isAdminRole && (
        <div className="automation-note" style={{ background: "#fff3e0", borderColor: "#ffcc80", color: "#e65100" }}>
          <AlertCircle size={18} />
          <div>
            <strong>Admin Access:</strong> You can add expenses and upload documents. You may edit each expense <strong>once</strong> without approval. Further edits require Super Admin approval — a request will be submitted automatically.
          </div>
        </div>
      )}
      <Toolbar
        filters={<select value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>}
        action={canEdit && <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> New Expense</button>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Detail</th><th>Entity</th><th className="r">Amount</th><th>Attachments</th><th></th></tr></thead>
          <tbody>
            {rows.map((e: any) => {
              const hasPendingRequest = (e.editRequests || []).some((r: any) => r.status === "pending");
              return (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.category === "Salary Expense" ? <Tag tone="purple">Salary</Tag> : e.category}</td>
                  <td className="strong">{e.sub}<div className="muted-sm">{e.note}</div></td>
                  <td><Tag>{e.company === "mortgage" ? "Mortgage" : "Outsource"}</Tag></td>
                  <td className="r strong">{fmt2(e.amount)}</td>
                  <td>
                    <AttachmentCell
                      attachments={e.attachments || []}
                      expenseId={e.id}
                      canUpload={canEdit}
                      onAttach={(file) => handleAttach(e.id, file)}
                    />
                  </td>
                  <td className="row-actions">
                    {canEdit && (
                      hasPendingRequest ? (
                        <span style={{ fontSize: "11px", color: "#d9930a", fontWeight: 600, padding: "3px 8px", background: "#fdeccd", borderRadius: "6px" }}>Pending</span>
                      ) : !e.firstEditUsed ? (
                        <button title="Edit (free first edit)" onClick={() => setEditTarget(e)}><Pencil size={15}/></button>
                      ) : isAdminRole ? (
                        <button title="Request edit (needs Super Admin approval)" onClick={() => setRequestEditTarget(e)} style={{ color: "#d9930a" }}><RotateCcw size={15}/></button>
                      ) : (
                        <button title="Edit" onClick={() => setEditTarget(e)}><Pencil size={15}/></button>
                      )
                    )}
                    {canDeleteRow && <button onClick={() => remove(e.id)}><Trash2 size={15}/></button>}
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={7} className="empty">No expenses</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <ExpenseModal onSave={save} onClose={() => setOpen(false)} />}
      {editTarget && (
        <ExpenseEditModal
          expense={editTarget}
          isAdminRole={isAdminRole}
          onSave={saveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {requestEditTarget && (
        <ExpenseRequestEditModal
          expense={requestEditTarget}
          onSubmit={(proposed) => submitEditRequest(requestEditTarget, proposed)}
          onClose={() => setRequestEditTarget(null)}
        />
      )}
    </div>
  );
}

/* Attachment cell — shows file list and upload dropzone */
function AttachmentCell({ attachments, expenseId, canUpload, onAttach }: {
  attachments: ExpenseAttachment[];
  expenseId: string;
  canUpload: boolean;
  onAttach: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(onAttach);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "160px" }}>
      {(attachments || []).map((att: ExpenseAttachment, i: number) => (
        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#1f7a52", textDecoration: "none" }}
          title={att.name}>
          <FileIcon size={12} />
          <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
          <Download size={11} />
        </a>
      ))}
      {canUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragging ? "#1f7a52" : "#ccc"}`,
            borderRadius: "7px",
            padding: "5px 8px",
            cursor: "pointer",
            fontSize: "11px",
            color: dragging ? "#1f7a52" : "#9aa4af",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: dragging ? "rgba(31,122,82,0.05)" : "transparent",
            transition: "all 0.15s"
          }}
        >
          <Upload size={12} /> Drop or click to attach
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

function ExpenseModal({ onSave, onClose }: { onSave: (rec: any) => void; onClose: () => void }) {
  const [f, setF] = useState({ company: "mortgage", category: EXPENSE_CATEGORIES[0], sub: "", amount: "", date: new Date().toISOString().slice(0,10), note: "" });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const isSalary = f.category === "Salary Expense";
  return (
    <Modal title="New Expense" onClose={onClose}>
      <div className="form-grid">
        <Field label="Entity"><select value={f.company} onChange={set("company")}><option value="mortgage">Ezy Mortgage</option><option value="outsource">Ezy Outsource</option></select></Field>
        <Field label="Category"><select value={f.category} onChange={set("category")}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label={isSalary ? "Employee / Team" : "Detail / Sub-category"}><input value={f.sub} onChange={set("sub")} placeholder={isSalary ? "e.g. Sarah Lin" : "e.g. Rent, Xero"} /></Field>
        <Field label="Amount (AUD)"><input type="number" value={f.amount} onChange={set("amount")} /></Field>
        <Field label="Date"><input type="date" value={f.date} onChange={set("date")} /></Field>
        <Field label="Note" wide><input value={f.note} onChange={set("note")} /></Field>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!f.amount || !f.sub} onClick={() => onSave({ ...f, amount: Number(f.amount) })}>Add Expense</button>
      </div>
    </Modal>
  );
}

function ExpenseEditModal({ expense, isAdminRole, onSave, onClose }: { expense: any; isAdminRole: boolean; onSave: (e: any) => void; onClose: () => void }) {
  const [f, setF] = useState({ ...expense });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={isAdminRole ? "Edit Expense (Free First Edit)" : "Edit Expense"} onClose={onClose}>
      {isAdminRole && (
        <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#e65100" }}>
          This is your one free edit. After saving, further edits will require Super Admin approval.
        </div>
      )}
      <div className="form-grid">
        <Field label="Entity"><select value={f.company} onChange={set("company")}><option value="mortgage">Ezy Mortgage</option><option value="outsource">Ezy Outsource</option></select></Field>
        <Field label="Category"><select value={f.category} onChange={set("category")}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Detail / Sub-category"><input value={f.sub} onChange={set("sub")} /></Field>
        <Field label="Amount (AUD)"><input type="number" value={f.amount} onChange={set("amount")} /></Field>
        <Field label="Date"><input type="date" value={f.date} onChange={set("date")} /></Field>
        <Field label="Note" wide><input value={f.note} onChange={set("note")} /></Field>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onSave({ ...f, amount: Number(f.amount) })}>Save Changes</button>
      </div>
    </Modal>
  );
}

function ExpenseRequestEditModal({ expense, onSubmit, onClose }: { expense: any; onSubmit: (proposed: any) => void; onClose: () => void }) {
  const [f, setF] = useState({ ...expense });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="Request Edit Approval" onClose={onClose}>
      <div style={{ background: "#eef6ff", border: "1px solid #cfe2fb", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#1f4e79" }}>
        Your proposed changes will be sent to the Super Admin for approval. The expense will only be updated after approval.
      </div>
      <div className="form-grid">
        <Field label="Entity"><select value={f.company} onChange={set("company")}><option value="mortgage">Ezy Mortgage</option><option value="outsource">Ezy Outsource</option></select></Field>
        <Field label="Category"><select value={f.category} onChange={set("category")}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Detail / Sub-category"><input value={f.sub} onChange={set("sub")} /></Field>
        <Field label="Amount (AUD)"><input type="number" value={f.amount} onChange={set("amount")} /></Field>
        <Field label="Date"><input type="date" value={f.date} onChange={set("date")} /></Field>
        <Field label="Note" wide><input value={f.note} onChange={set("note")} /></Field>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onSubmit({ company: f.company, category: f.category, sub: f.sub, amount: Number(f.amount), date: f.date, note: f.note })}>Submit for Approval</button>
      </div>
    </Modal>
  );
}

/* ============================ APPROVALS ============================ */
function Approvals({ db, commit, isSuperAdmin }: { db: any; commit: (next: any) => void; isSuperAdmin: boolean }) {
  if (!isSuperAdmin) return <div className="locked"><Lock size={28}/><p>Only the Super Admin can review approval requests.</p></div>;

  const pending = (db.editRequests || []).filter((r: any) => r.status === "pending");
  const resolved = (db.editRequests || []).filter((r: any) => r.status !== "pending");

  const getExpense = (id: string) => db.expenses.find((e: any) => e.id === id);

  const approve = (req: any) => {
    const expense = getExpense(req.expenseId);
    if (!expense) return;
    const updatedExpense = { ...expense, ...req.proposedChanges };
    const updatedRequests = (db.editRequests || []).map((r: any) =>
      r.id === req.id ? { ...r, status: "approved", resolvedAt: new Date().toISOString(), resolvedBy: "Super Admin" } : r
    );
    const updatedExpenses = db.expenses.map((e: any) =>
      e.id === req.expenseId ? {
        ...updatedExpense,
        editRequests: (e.editRequests || []).map((er: any) => er.id === req.id ? { ...er, status: "approved" } : er)
      } : e
    );
    commit({ ...db, editRequests: updatedRequests, expenses: updatedExpenses });
  };

  const reject = (req: any) => {
    const updatedRequests = (db.editRequests || []).map((r: any) =>
      r.id === req.id ? { ...r, status: "rejected", resolvedAt: new Date().toISOString(), resolvedBy: "Super Admin" } : r
    );
    const updatedExpenses = db.expenses.map((e: any) =>
      e.id === req.expenseId ? {
        ...e,
        editRequests: (e.editRequests || []).map((er: any) => er.id === req.id ? { ...er, status: "rejected" } : er)
      } : e
    );
    commit({ ...db, editRequests: updatedRequests, expenses: updatedExpenses });
  };

  return (
    <div className="stack">
      <div className="automation-note">
        <ClipboardCheck size={18} />
        <div>
          <strong>Edit Approvals Queue:</strong> When an Admin role user has already used their one free edit, they must submit a change request. Review proposed changes below and approve or reject each one.
        </div>
      </div>

      {pending.length === 0 && <div className="empty" style={{ paddingTop: "60px" }}>No pending approval requests</div>}

      {pending.map((req: any) => {
        const expense = getExpense(req.expenseId);
        if (!expense) return null;
        return (
          <div key={req.id} className="panel" style={{ border: "1px solid #fdeccd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>Edit Request — <span style={{ color: "#d9930a" }}>{expense.sub}</span></div>
                <div className="muted-sm">Requested by <strong>{req.requestedBy}</strong> · {new Date(req.requestedAt).toLocaleString("en-AU")}</div>
              </div>
              <span style={{ background: "#fdeccd", color: "#a8690a", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>Pending</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div style={{ background: "#faf8f4", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".5px", color: "#9aa4af", marginBottom: "8px" }}>Current Values</div>
                {["category", "sub", "amount", "date", "note"].map(k => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "3px 0", borderBottom: "1px solid #eee" }}>
                    <span style={{ color: "#9aa4af", textTransform: "capitalize" }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{k === "amount" ? fmt2(expense[k]) : (expense[k] || "—")}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".5px", color: "#1f7a52", marginBottom: "8px" }}>Proposed Changes</div>
                {["category", "sub", "amount", "date", "note"].map(k => {
                  const changed = req.proposedChanges[k] !== expense[k];
                  return (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "3px 0", borderBottom: "1px solid rgba(31,122,82,0.15)" }}>
                      <span style={{ color: "#9aa4af", textTransform: "capitalize" }}>{k}</span>
                      <span style={{ fontWeight: 600, color: changed ? "#1f7a52" : "inherit" }}>
                        {k === "amount" ? fmt2(req.proposedChanges[k]) : (req.proposedChanges[k] || "—")}
                        {changed && " ✓"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => reject(req)} style={{ color: "#dc2626", borderColor: "#fca5a5" }}><X size={15}/> Reject</button>
              <button className="btn primary" onClick={() => approve(req)}><CheckCircle2 size={15}/> Approve &amp; Apply</button>
            </div>
          </div>
        );
      })}

      {resolved.length > 0 && (
        <>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "#9aa4af", marginTop: "10px" }}>Resolved ({resolved.length})</div>
          {resolved.map((req: any) => {
            const expense = getExpense(req.expenseId);
            return (
              <div key={req.id} className="panel" style={{ opacity: 0.75 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>Edit Request — {expense?.sub || req.expenseId}</div>
                    <div className="muted-sm">By {req.requestedBy} · Resolved {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString("en-AU") : "—"}</div>
                  </div>
                  <span style={{
                    background: req.status === "approved" ? "#dcf3e8" : "#fde2e1",
                    color: req.status === "approved" ? "#1f7a52" : "#c0392b",
                    fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px"
                  }}>{req.status === "approved" ? "Approved" : "Rejected"}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ============================ INVOICES ============================ */
function Invoices({ db, commit, scope, canEdit, isDarkMode }: { db: any; commit: (next: any) => void; scope: string; canEdit: boolean; isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<"internal" | "xero_sales" | any>("internal");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const client = (id: string) => db.clients.find((c: any) => c.id === id);
  const rows = db.invoices.filter((i: any) => scope === "all" || i.company === scope);

  const save = (inv: any) => {
    const number = "INV-" + (1000 + db.invoices.length + 1);
    commit({ ...db, invoices: [...db.invoices, { ...inv, id: uid(), number, status: "sent", autoGenerated: false, emailSentAt: new Date().toISOString(), reminderSentAt: null, reminderSentCount: 0, lastMailLog: `Invoice created & sent ${new Date().toLocaleDateString("en-AU")}` }] });
    setOpen(false);
  };

  const setStatus = (id: string, status: string) => commit({
    ...db,
    invoices: db.invoices.map((i: any) => i.id === id ? {
      ...i,
      status,
      lastMailLog: status === "paid" ? `Marked paid ${new Date().toLocaleDateString("en-AU")}` : i.lastMailLog
    } : i)
  });

  return (
    <div className="stack">
      {/* Sub tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid rgba(0, 74, 153, 0.16)", paddingBottom: "12px", flexWrap: "wrap" }}>
        {[["xero_sales", "Invoice Overview"], ["internal", "Invoices List"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: "8px 16px", borderRadius: "8px", border: "1px solid",
            background: activeTab === key ? "#ff6900" : "transparent",
            color: activeTab === key ? "#ffffff" : (isDarkMode ? "#ffffff" : "#000000"),
            borderColor: activeTab === key ? "#ff6900" : (isDarkMode ? "#1e2633" : "#cbd5e1"),
            fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
          }}>{label}</button>
        ))}
      </div>

      {activeTab === "internal" ? (
        <>
          <div className="automation-note">
            <Clock size={18} />
            <div>
              <strong>Auto-Invoice System (Active via backend server):</strong> On the 1st of each month, invoices are auto-generated from each client's last invoice and emailed via Gmail SMTP. If unpaid after 14 days, a reminder email is automatically sent. Paid invoices never receive reminders.
            </div>
          </div>
          <Toolbar action={canEdit && <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> Create Invoice</button>} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th><th>Client</th><th>Entity</th><th>Issued</th><th>Due</th>
                  <th className="r">Total (inc GST)</th><th>Status</th><th>Email Log</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((inv: any) => {
                  const sub = invTotal(inv); const total = sub + gstOf(sub);
                  return (
                    <tr key={inv.id}>
                      <td className="strong" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {inv.number}
                        {inv.autoGenerated && (
                          <span style={{ background: "#ff6900", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "4px", letterSpacing: "0.05em" }}>AUTO</span>
                        )}
                      </td>
                      <td>{client(inv.clientId)?.name}</td>
                      <td><Tag>{inv.company === "mortgage" ? "Mortgage" : "Outsource"}</Tag></td>
                      <td>{inv.issueDate}</td>
                      <td>{inv.dueDate}</td>
                      <td className="r strong">{fmt2(total)}</td>
                      <td><InvStatus status={inv.status} /></td>
                      <td>
                        <div style={{ fontSize: "11.5px", color: "#9aa4af" }}>
                          {inv.lastMailLog || "—"}
                          {inv.reminderSentCount > 0 && (
                            <div style={{ color: "#d9930a", fontWeight: 600 }}>Reminder sent ×{inv.reminderSentCount}</div>
                          )}
                        </div>
                      </td>
                      <td className="row-actions">
                        <button onClick={() => setPreview(inv)} title="View / Email template"><Mail size={15}/></button>
                        {canEdit && inv.status !== "paid" && <button onClick={() => setStatus(inv.id, "paid")} title="Mark paid"><CheckCircle2 size={15}/></button>}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan={9} className="empty">No invoices</td></tr>}
              </tbody>
            </table>
          </div>
          {open && <InvoiceModal db={db} onSave={save} onClose={() => setOpen(false)} />}
          {preview && <InvoicePreview inv={preview} client={client(preview.clientId)} onClose={() => setPreview(null)} />}
        </>
      ) : (
        <XeroSales isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

function InvStatus({ status }: { status: string }) {
  const map: Record<string, [string, string, React.ComponentType<any>]> = {
    paid: ["Paid", "green", CheckCircle2],
    sent: ["Sent", "amber", Send],
    overdue: ["Overdue", "red", AlertTriangle],
    draft: ["Draft", "slate", Clock]
  };
  const [label, tone, Icon] = map[status] || map.draft;
  return <span className={`inv-status ${tone}`}><Icon size={13}/> {label}</span>;
}

function InvoiceModal({ db, onSave, onClose }: { db: any; onSave: (inv: any) => void; onClose: () => void }) {
  const [f, setF] = useState<any>({
    clientId: db.clients[0]?.id || "", company: "mortgage",
    issueDate: new Date().toISOString().slice(0,10),
    dueDate: new Date(Date.now() + 14*864e5).toISOString().slice(0,10),
    items: [{ desc: "", qty: 1, price: "" }],
  });
  const setItem = (idx: number, k: string, v: any) => setF({ ...f, items: f.items.map((it: any, i: number) => i === idx ? { ...it, [k]: v } : it) });
  const addItem = () => setF({ ...f, items: [...f.items, { desc: "", qty: 1, price: "" }] });
  const sub = f.items.reduce((s: number, it: any) => s + (Number(it.qty)||0) * (Number(it.price)||0), 0);

  return (
    <Modal title="Create Invoice" onClose={onClose} wide>
      <div className="form-grid">
        <Field label="Client"><select value={f.clientId} onChange={(e) => setF({...f, clientId: e.target.value})}>{db.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Entity"><select value={f.company} onChange={(e) => setF({...f, company: e.target.value})}><option value="mortgage">Ezy Mortgage</option><option value="outsource">Ezy Outsource</option></select></Field>
        <Field label="Issue Date"><input type="date" value={f.issueDate} onChange={(e) => setF({...f, issueDate: e.target.value})} /></Field>
        <Field label="Due Date"><input type="date" value={f.dueDate} onChange={(e) => setF({...f, dueDate: e.target.value})} /></Field>
      </div>
      <div className="line-items">
        <div className="li-head"><span>Description</span><span>Qty</span><span>Unit Price</span><span>Amount</span></div>
        {f.items.map((it: any, i: number) => (
          <div className="li-row" key={i}>
            <input value={it.desc} onChange={(e) => setItem(i, "desc", e.target.value)} placeholder="Service description" />
            <input type="number" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
            <input type="number" value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} placeholder="0" />
            <span className="li-amt">{fmt2((Number(it.qty)||0)*(Number(it.price)||0))}</span>
          </div>
        ))}
        <button className="btn ghost sm" onClick={addItem}><Plus size={14}/> Add line</button>
      </div>
      <div className="totals">
        <div><span>Subtotal</span><b>{fmt2(sub)}</b></div>
        <div><span>GST (10%)</span><b>{fmt2(gstOf(sub))}</b></div>
        <div className="grand"><span>Total</span><b>{fmt2(sub + gstOf(sub))}</b></div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!sub} onClick={() => onSave({ ...f, items: f.items.map((it: any) => ({ ...it, qty: Number(it.qty), price: Number(it.price) })) })}><Send size={15}/> Create &amp; Send</button>
      </div>
    </Modal>
  );
}

function InvoicePreview({ inv, client, onClose }: { inv: any; client: any; onClose: () => void }) {
  const sub = invTotal(inv); const gst = gstOf(sub); const total = sub + gst;
  const entity = COMPANIES[inv.company as keyof typeof COMPANIES];
  return (
    <Modal title={`Email Template · ${inv.number}`} onClose={onClose} wide>
      {inv.autoGenerated && (
        <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "8px", padding: "8px 14px", marginBottom: "14px", fontSize: "12.5px", color: "#e65100", display: "flex", gap: "8px", alignItems: "center" }}>
          <AlertCircle size={15}/> This invoice was auto-generated on the 1st of the month and emailed automatically.
        </div>
      )}
      <div className="email-preview">
        <div className="email-bar">To: {client?.email} &nbsp;·&nbsp; Subject: {inv.number} from {entity}</div>
        <div className="invoice-doc">
          <div className="inv-top">
            <div className="inv-logo">EZY</div>
            <div className="inv-co">
              <div className="inv-co-name">{entity}</div>
              <div className="muted-sm">ABN 00 000 000 000 · Sydney, Australia</div>
            </div>
            <div className="inv-meta">
              <div className="inv-tax">TAX INVOICE</div>
              <div className="muted-sm">{inv.number}</div>
            </div>
          </div>
          <div className="inv-bill">
            <div><div className="lbl">Bill To</div><b>{client?.name}</b><div className="muted-sm">{client?.companyName}<br/>{client?.address}<br/>ABN {client?.abn}</div></div>
            <div className="r"><div className="lbl">Issued</div>{inv.issueDate}<div className="lbl" style={{marginTop:8}}>Due</div>{inv.dueDate}</div>
          </div>
          <table className="inv-table">
            <thead><tr><th>Description</th><th className="r">Qty</th><th className="r">Unit</th><th className="r">Amount</th></tr></thead>
            <tbody>{inv.items.map((it: any, i: number) => <tr key={i}><td>{it.desc}</td><td className="r">{it.qty}</td><td className="r">{fmt2(it.price)}</td><td className="r">{fmt2(it.qty*it.price)}</td></tr>)}</tbody>
          </table>
          <div className="inv-totals">
            <div><span>Subtotal</span><span>{fmt2(sub)}</span></div>
            <div><span>GST 10%</span><span>{fmt2(gst)}</span></div>
            <div className="grand"><span>Total Due</span><span>{fmt2(total)}</span></div>
          </div>
          <div className="inv-pay">
            <div className="lbl">Payment — Direct Deposit</div>
            <div className="pay-grid">
              {BANK_ACCOUNTS.map((b, i) => (
                <div key={i} className="pay-acc">
                  <b>{b.label}</b>
                  <div>{b.name}</div>
                  <div>BSB: {b.bsb}</div>
                  <div>Acc: {b.acc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="inv-foot">Thank you for your business. Please pay by the due date. — {entity}</div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Close</button>
        <button className="btn primary"><Send size={15}/> Send Email (simulated)</button>
      </div>
    </Modal>
  );
}

/* ============================ USER MANAGEMENT ============================ */
function UsersMgmt({ db, commit, canEdit }: { db: any; commit: (next: any) => void; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  if (!canEdit) return <div className="locked"><Lock size={28}/><p>Only the Super Admin can manage users.</p></div>;

  const save = (u: any) => { commit({ ...db, users: [...db.users, { ...u, id: uid() }] }); setOpen(false); };
  const remove = (id: string) => commit({ ...db, users: db.users.filter((u: any) => u.id !== id) });

  const ROLE_DESCRIPTIONS: Record<string, string> = {
    "Super Admin": "Full access to all sections including Approvals, User Management, and system configuration.",
    "Manager": "Can view and input Income, Expense, and Invoice data.",
    "Admin": "Can view and add Expenses, upload documents. One free edit per expense; further edits need Super Admin approval.",
  };

  return (
    <div className="stack">
      <Toolbar action={<button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> Create User</button>} />
      <div className="user-grid">
        {db.users.map((u: any) => (
          <div className="user-card" key={u.id}>
            <div className="user-head">
              <div className="avatar">{u.name.split(" ").map((w: string)=>w[0]).slice(0,2).join("")}</div>
              <div><div className="strong">{u.name}</div><div className="muted-sm">{u.email}</div></div>
              <span className={`role-pill ${u.role.toLowerCase().replace(" ", "-")}`}>{u.role}</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#9aa4af", marginBottom: "14px", lineHeight: "1.5", padding: "10px 12px", background: "rgba(0,0,0,0.03)", borderRadius: "8px" }}>
              {ROLE_DESCRIPTIONS[u.role] || "Standard access."}
            </div>
            <div className="perm-list">
              {SECTIONS.filter(s => s !== "approvals").map((s) => (
                <div className="perm-row" key={s}>
                  <span>{NAV.find((n)=>n.key===s)?.label}</span>
                  <span className={`perm-badge ${u.perms[s] === "edit" ? "edit" : u.perms[s] === "none" ? "none" : "view"}`}>
                    {u.perms[s] === "edit" ? "Edit & Input" : "Hidden"}
                  </span>
                </div>
              ))}
            </div>
            {u.role !== "Super Admin" && <button className="btn ghost sm full" onClick={() => remove(u.id)}><Trash2 size={14}/> Remove</button>}
          </div>
        ))}
      </div>
      {open && <UserModal onSave={save} onClose={() => setOpen(false)} />}
    </div>
  );
}

function UserModal({ onSave, onClose }: { onSave: (u: any) => void; onClose: () => void }) {
  const [f, setF] = useState<any>({ name: "", email: "", role: "Admin" });
  const preview = permsFor(f.role);

  const ROLE_DESCRIPTIONS: Record<string, string> = {
    "Super Admin": "Full access — all menus including Approvals, User Management.",
    "Manager": "Income, Expense, Invoice — can add and input records.",
    "Admin": "Expense only — can add expenses, upload memos/documents, one free edit per expense.",
  };

  return (
    <Modal title="Create User" onClose={onClose} wide>
      <div className="form-grid">
        <Field label="Full Name"><input value={f.name} onChange={(e) => setF({...f, name: e.target.value})} /></Field>
        <Field label="Email"><input value={f.email} onChange={(e) => setF({...f, email: e.target.value})} /></Field>
        <Field label="Role">
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option>Super Admin</option>
            <option>Manager</option>
            <option>Admin</option>
          </select>
        </Field>
        <Field label="Role Description" wide>
          <div style={{ padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "13px", color: "#1f7a52" }}>
            {ROLE_DESCRIPTIONS[f.role]}
          </div>
        </Field>
      </div>
      <div className="perm-editor">
        <div className="perm-editor-head">Section Access (auto-assigned by role)</div>
        {SECTIONS.filter(s => s !== "approvals").map((s) => (
          <div className="perm-edit-row" key={s}>
            <span>{NAV.find((n)=>n.key===s)?.label}</span>
            <span className={`perm-badge ${preview[s] === "edit" ? "edit" : "none"}`}>
              {preview[s] === "edit" ? "Edit & Input" : "Hidden"}
            </span>
          </div>
        ))}
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!f.name} onClick={() => onSave({ ...f, perms: permsFor(f.role) })}>Create User</button>
      </div>
    </Modal>
  );
}

/* ============================ SHARED UI ============================ */
const Splash = () => <div className="splash"><Styles /><div className="logo big">EZY</div><p>Loading console…</p></div>;

function Stat({ label, value, sub, tone = "slate", wide }: { label: string; value: string; sub?: string; tone?: string; wide?: boolean }) {
  return (
    <div className={`stat ${tone} ${wide ? "wide" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="panel"><div className="panel-title">{title}</div>{children}</div>; }
function Tag({ children, tone }: { children: React.ReactNode; tone?: string }) { return <span className={`tag ${tone || ""}`}>{children}</span>; }
function Toolbar({ q, setQ, placeholder, filters, action }: { q?: string; setQ?: (v: string) => void; placeholder?: string; filters?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {setQ && <div className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} /></div>}
        {filters}
      </div>
      {action}
    </div>
  );
}
function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label>; }
function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><button onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ============================ STYLES ============================ */
function Styles() {
  return <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  .ezy-root, .splash { font-family: 'Hanken Grotesk', sans-serif; color: #1a1d21; }
  .ezy-root { display: flex; min-height: 100vh; background: #f6f4f0; }
  .splash { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:14px; color:#6b7280; }

  /* Admin Panel Dark Mode overrides */
  .dark .ezy-root { background: #0c1017; color: #f0f2f5; }
  .dark .topbar { background: #111620; border-bottom: 1px solid #1e2633; color: #fff; }
  .dark .topbar h1 { color: #fff; }
  .dark .scope { background: #1a2332; }
  .dark .scope button { color: #9aa4af; }
  .dark .scope button.on { background: #1f7a52; color: #fff; }
  .dark .user-switch { background: #111620; border-color: #1e2633; color: #f0f2f5; }
  .dark .panel { background: #111620; border-color: #1e2633; color: #fff; }
  .dark .stat { background: #111620; border-color: #1e2633; }
  .dark .stat-value { color: #fff; }
  .dark .stat-label { color: #9aa4af; }
  .dark .stat-sub { color: #7c8794; }
  .dark .toolbar-left select { background: #111620; border-color: #1e2633; color: #f0f2f5; }
  .dark .search { background: #111620; border-color: #1e2633; }
  .dark .search input { background: transparent; color: #fff; }
  .dark .table-wrap { background: #111620; border-color: #1e2633; }
  .dark table { background: #111620; }
  .dark thead th { background: #151c28; border-bottom-color: #1e2633; color: #7c8794; }
  .dark tbody td { border-bottom-color: #1e2633; color: #e2e8f0; }
  .dark tbody tr:hover { background: #161f2e; }
  .dark .muted-sm { color: #8a94a0; }
  .dark .tag { background: #1e293b; color: #9aa4af; }
  .dark .row-actions button { background: #1a2332; color: #9aa4af; }
  .dark .row-actions button:hover { background: #232f44; color: #fff; }
  .dark .automation-note { background: #1a2332; border-color: #232f44; color: #93c5fd; }
  .dark .modal { background: #111620; color: #fff; border: 1px solid #1e2633; }
  .dark .modal-head { border-bottom-color: #1e2633; }
  .dark .modal-head button { background: #1a2332; color: #fff; }
  .dark .field { color: #9aa4af; }
  .dark .field input, .dark .field select { background: #151c28; border-color: #1e2633; color: #fff; }
  .dark .field input:focus, .dark .field select:focus { border-color: #1f7a52; }
  .dark .totals { border-top-color: #1e2633; }
  .dark .totals div { color: #9aa4af; }
  .dark .totals b { color: #fff; }
  .dark .email-preview { border-color: #1e2633; }
  .dark .email-bar { background: #151c28; border-bottom-color: #1e2633; color: #9aa4af; }
  .dark .inv-pay { background: #151c28; }
  .dark .pay-acc { color: #9aa4af; }
  .dark .pay-acc b { color: #fff; }
  .dark .user-card { background: #111620; border-color: #1e2633; color: #fff; }
  .dark .perm-edit-row { border-top-color: #1e2633; }
  .dark .perm-editor { border-color: #1e2633; }
  .dark .perm-editor-head { background: #151c28; color: #9aa4af; }
  .dark .seg { background: #151c28; }
  .dark .seg button { color: #9aa4af; }
  .dark .seg button.on { background: #1f7a52; color: #fff; }

  /* Admin Panel Button Dark Mode overrides */
  .dark .btn { background: #151c28; border-color: #1e2633; color: #f0f2f5; }
  .dark .btn:hover { background: #1f293d; color: #ffffff; }
  .dark .btn.primary { background: #1f7a52; border-color: #1f7a52; color: #ffffff; }
  .dark .btn.primary:hover { background: #1a6645; }
  .dark .btn.ghost { background: none; border: 1px dashed #232f44; color: #9aa4af; }
  .dark .btn.ghost:hover { border-color: #ff6900; color: #ff6900; }

  /* sidebar */
  .sidebar { width: 248px; background:#11161c; color:#cdd3da; display:flex; flex-direction:column; padding:22px 16px; position:sticky; top:0; height:100vh; overflow-y:auto; }
  .brand { display:flex; gap:12px; align-items:center; padding:0 6px 22px; }
  .logo { width:42px; height:42px; border-radius:11px; background:linear-gradient(135deg,#1f7a52,#2bb673); color:#fff; font-weight:700; display:grid; place-items:center; letter-spacing:.5px; font-size:15px; }
  .logo.big { width:64px; height:64px; font-size:22px; border-radius:16px; }
  .brand-name { font-weight:700; color:#fff; letter-spacing:.5px; }
  .brand-sub { font-size:12px; color:#7c8794; }
  nav { display:flex; flex-direction:column; gap:3px; flex:1; }
  .nav-item { display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:10px; background:none; border:none; color:#9aa4af; font-size:14.5px; font-family:inherit; cursor:pointer; text-align:left; transition:.15s; }
  .nav-item:hover { background:#1a212a; color:#e8ecf0; }
  .nav-item.active { background:#1f7a52; color:#fff; font-weight:600; }
  .sidebar-foot { border-top:1px solid #232b34; padding-top:14px; }
  .who-name { color:#fff; font-weight:600; font-size:14px; } .who-role { font-size:12px; color:#7c8794; }

  /* main */
  .main { flex:1; display:flex; flex-direction:column; min-width:0; }
  .topbar { display:flex; justify-content:space-between; align-items:flex-end; padding:24px 32px; background:#fff; border-bottom:1px solid #eae6df; flex-wrap:wrap; gap:16px; }
  .topbar h1 { margin:0; font-family:'Fraunces',serif; font-size:27px; font-weight:600; letter-spacing:-.3px; }
  .crumb { margin:2px 0 0; color:#94a0ab; font-size:13px; }
  .top-controls { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .scope { display:flex; background:#f1efe9; border-radius:10px; padding:3px; }
  .scope button { border:none; background:none; padding:7px 13px; border-radius:8px; font-family:inherit; font-size:13px; color:#6b7280; cursor:pointer; }
  .scope button.on { background:#fff; color:#11161c; font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,.08); }
  .user-switch { padding:9px 12px; border:1px solid #e2ddd4; border-radius:9px; font-family:inherit; font-size:13px; background:#fff; color:#374151; }
  .content { padding:28px 32px; }
  .stack { display:flex; flex-direction:column; gap:20px; }

  /* stats */
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:16px; }
  .stat { background:#fff; border:1px solid #eae6df; border-radius:14px; padding:18px 20px; border-left:4px solid #94a0ab; }
  .stat.green { border-left-color:#1f7a52; } .stat.green2 { border-left-color:#2bb673; }
  .stat.amber { border-left-color:#d9930a; } .stat.blue { border-left-color:#2563eb; }
  .stat.red { border-left-color:#dc2626; } .stat.purple { border-left-color:#9333ea; } .stat.slate { border-left-color:#64748b; }
  .stat.wide { grid-column: span 2; }
  .stat-label { font-size:13px; color:#8a94a0; font-weight:500; }
  .stat-value { font-size:26px; font-weight:700; margin-top:5px; font-variant-numeric:tabular-nums; letter-spacing:-.5px; }
  .stat-sub { font-size:12px; color:#a3acb6; margin-top:3px; }

  /* panels & charts */
  .chart-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px; }
  .panel { background:#fff; border:1px solid #eae6df; border-radius:16px; padding:20px; }
  .panel-title { font-weight:600; font-size:15px; margin-bottom:12px; }
  .empty { text-align:center; color:#a3acb6; padding:40px 0; font-size:14px; }

  /* toolbar */
  .toolbar { display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; }
  .toolbar-left { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .search { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2ddd4; border-radius:10px; padding:9px 13px; color:#9aa4af; }
  .search input { border:none; outline:none; font-family:inherit; font-size:14px; width:230px; color:#1a1d21; }
  .toolbar-left select { padding:9px 12px; border:1px solid #e2ddd4; border-radius:10px; font-family:inherit; font-size:14px; background:#fff; color:#374151; }

  /* buttons */
  .btn { display:inline-flex; align-items:center; gap:7px; padding:10px 16px; border-radius:10px; border:1px solid #e2ddd4; background:#fff; font-family:inherit; font-size:14px; font-weight:500; cursor:pointer; color:#374151; transition:.15s; }
  .btn:hover { background:#f7f5f1; } .btn:disabled { opacity:.45; cursor:not-allowed; }
  .btn.primary { background:#1f7a52; border-color:#1f7a52; color:#fff; } .btn.primary:hover { background:#1a6645; }
  .btn.ghost { background:none; border:1px dashed #cfc8bc; color:#6b7280; } .btn.sm { padding:7px 12px; font-size:13px; } .btn.full { width:100%; justify-content:center; }

  /* tables */
  .table-wrap { background:#fff; border:1px solid #eae6df; border-radius:14px; overflow:hidden; }
  table { width:100%; border-collapse:collapse; }
  thead th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#9aa4af; padding:13px 18px; background:#faf8f4; border-bottom:1px solid #eee; }
  tbody td { padding:14px 18px; border-bottom:1px solid #f2efe9; font-size:14px; vertical-align:top; }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr:hover { background:#fcfbf8; }
  .strong { font-weight:600; } .r { text-align:right; } th.r { text-align:right; }
  .muted-sm { color:#a3acb6; font-size:12.5px; margin-top:2px; }
  .row-actions { display:flex; gap:6px; justify-content:flex-end; align-items:center; }
  .row-actions button { border:none; background:#f3f1ec; width:30px; height:30px; border-radius:8px; cursor:pointer; color:#6b7280; display:grid; place-items:center; }
  .row-actions button:hover { background:#e9e5dd; color:#11161c; }
  .tag { background:#eef2f4; color:#516170; font-size:12px; padding:3px 9px; border-radius:20px; font-weight:500; }
  .tag.purple { background:#f3e8ff; color:#7e22ce; }
  .status { border:none; padding:4px 12px; border-radius:20px; font-size:12.5px; font-weight:600; cursor:pointer; font-family:inherit; }
  .status.paid { background:#dcf3e8; color:#1f7a52; } .status.unpaid { background:#fdeccd; color:#a8690a; }

  /* invoices */
  .automation-note { display:flex; gap:12px; background:#eef6ff; border:1px solid #cfe2fb; color:#1f4e79; padding:14px 16px; border-radius:12px; font-size:13.5px; align-items:flex-start; }
  .automation-note svg { flex-shrink:0; margin-top:1px; }
  .inv-status { display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:600; padding:4px 10px; border-radius:20px; }
  .inv-status.green { background:#dcf3e8; color:#1f7a52; } .inv-status.amber { background:#fdeccd; color:#a8690a; }
  .inv-status.red { background:#fde2e1; color:#c0392b; } .inv-status.slate { background:#eef0f2; color:#64748b; }

  /* modal */
  .overlay { position:fixed; inset:0; background:rgba(17,22,28,.5); display:grid; place-items:center; padding:20px; z-index:50; }
  .modal { background:#fff; border-radius:18px; width:520px; max-width:100%; max-height:90vh; overflow:auto; }
  .modal.wide { width:720px; }
  .modal-head { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid #eee; }
  .modal-head h3 { margin:0; font-family:'Fraunces',serif; font-size:20px; }
  .modal-head button { border:none; background:#f3f1ec; width:32px; height:32px; border-radius:8px; cursor:pointer; }
  .modal-body { padding:22px; }
  .modal-foot { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .field { display:flex; flex-direction:column; gap:5px; font-size:13px; color:#6b7280; font-weight:500; }
  .field.wide { grid-column:span 2; }
  .field input, .field select { padding:10px 12px; border:1px solid #e2ddd4; border-radius:9px; font-family:inherit; font-size:14px; color:#1a1d21; }
  .field input:focus, .field select:focus { outline:none; border-color:#1f7a52; }

  /* line items */
  .line-items { margin-top:18px; }
  .li-head, .li-row { display:grid; grid-template-columns:3fr 1fr 1.4fr 1.4fr; gap:10px; align-items:center; }
  .li-head { font-size:12px; color:#9aa4af; text-transform:uppercase; letter-spacing:.4px; margin-bottom:8px; }
  .li-row { margin-bottom:8px; } .li-row input { padding:9px 11px; border:1px solid #e2ddd4; border-radius:8px; font-family:inherit; font-size:13.5px; }
  .li-amt { text-align:right; font-weight:600; font-variant-numeric:tabular-nums; }
  .totals { margin-top:16px; border-top:1px solid #eee; padding-top:14px; display:flex; flex-direction:column; gap:7px; align-items:flex-end; }
  .totals div { display:flex; gap:40px; font-size:14px; color:#6b7280; } .totals b { color:#1a1d21; min-width:90px; text-align:right; }
  .totals .grand { font-size:18px; } .totals .grand b { color:#1f7a52; }

  /* email/invoice preview */
  .email-preview { border:1px solid #eee; border-radius:12px; overflow:hidden; }
  .email-bar { background:#faf8f4; padding:10px 16px; font-size:12.5px; color:#6b7280; border-bottom:1px solid #eee; }
  .invoice-doc { padding:26px; }
  .inv-top { display:flex; align-items:center; gap:14px; }
  .inv-logo { width:50px; height:50px; border-radius:12px; background:linear-gradient(135deg,#1f7a52,#2bb673); color:#fff; font-weight:700; display:grid; place-items:center; }
  .inv-co { flex:1; } .inv-co-name { font-weight:700; font-size:15px; }
  .inv-meta { text-align:right; } .inv-tax { font-family:'Fraunces',serif; font-size:18px; color:#1f7a52; font-weight:600; }
  .inv-bill { display:flex; justify-content:space-between; margin:22px 0; font-size:13.5px; }
  .lbl { font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#9aa4af; margin-bottom:3px; }
  .inv-table { margin:8px 0; width:100%; border-collapse:collapse; } .inv-table th { background:#faf8f4; font-size:11px; padding:8px 12px; text-align:left; }
  .inv-table td { padding:8px 12px; font-size:13px; }
  .inv-totals { display:flex; flex-direction:column; gap:6px; align-items:flex-end; margin:14px 0; }
  .inv-totals div { display:flex; gap:50px; font-size:13.5px; color:#6b7280; }
  .inv-totals .grand { font-size:16px; font-weight:700; color:#1a1d21; border-top:2px solid #11161c; padding-top:7px; }
  .inv-pay { background:#faf8f4; border-radius:10px; padding:14px 16px; margin-top:10px; }
  .pay-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px; }
  .pay-acc { font-size:13px; color:#516170; } .pay-acc b { color:#1a1d21; display:block; margin-bottom:2px; }
  .inv-foot { text-align:center; color:#9aa4af; font-size:12.5px; margin-top:18px; }

  /* users */
  .user-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; }
  .user-card { background:#fff; border:1px solid #eae6df; border-radius:16px; padding:20px; }
  .user-head { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .avatar { width:44px; height:44px; border-radius:12px; background:#11161c; color:#fff; display:grid; place-items:center; font-weight:600; font-size:15px; flex-shrink:0; }
  .role-pill { margin-left:auto; font-size:11.5px; font-weight:700; padding:4px 11px; border-radius:20px; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; }
  .role-pill.super-admin { background:#1f7a52; color:#fff; }
  .role-pill.manager { background:#eef6ff; color:#1f4e79; }
  .role-pill.admin { background:#f3f1ec; color:#6b7280; }
  .role-pill.ceo { background:#1f7a52; color:#fff; }
  .perm-list { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
  .perm-row { display:flex; justify-content:space-between; font-size:13px; color:#516170; }
  .perm-badge { font-size:11.5px; font-weight:600; padding:2px 9px; border-radius:6px; }
  .perm-badge.edit { background:#dcf3e8; color:#1f7a52; } .perm-badge.view { background:#eef6ff; color:#1f4e79; } .perm-badge.none { background:#f3f1ec; color:#a3acb6; }
  .perm-editor { margin-top:18px; border:1px solid #eee; border-radius:12px; overflow:hidden; }
  .perm-editor-head { background:#faf8f4; padding:11px 14px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#9aa4af; }
  .perm-edit-row { display:flex; justify-content:space-between; align-items:center; padding:11px 14px; border-top:1px solid #f2efe9; font-size:14px; }
  .locked { text-align:center; padding:70px 0; color:#a3acb6; } .locked p { margin-top:10px; }
  @media (max-width:640px){ .sidebar{ display:none; } .form-grid{ grid-template-columns:1fr; } .field.wide{ grid-column:auto; } .modal.wide{ width:calc(100vw - 40px); } }
  `}</style>;
}
