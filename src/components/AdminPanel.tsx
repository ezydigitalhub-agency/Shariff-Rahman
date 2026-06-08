import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, TrendingUp, Wallet, FileText, ShieldCheck,
  Plus, Search, Trash2, Pencil, X, CheckCircle2, Clock, AlertTriangle,
  Send, Building2, Mail, LogOut, Eye, Lock, Sun, Moon,
} from "lucide-react";
import XeroSales from "./XeroSales";
import XeroInvoices from "./XeroInvoices";

/* ----------------------------------------------------------------------- *
 *  EZY GROUP — Business Admin Panel (interactive prototype)
 *  Two entities: EZY MORTGAGE AUSTRALIA PTY LTD & EZY OUTSOURCE PTY LTD
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
const SECTIONS = ["overview", "clients", "income", "expense", "invoices", "users", "xero_sales", "xero_invoices"];

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
    { id: "e1", company: "mortgage", category: "Office Operations", sub: "Rent", amount: 3200, date: "2026-05-01", note: "Sydney office" },
    { id: "e2", company: "outsource", category: "Subscription Purchase", sub: "Xero + CRM", amount: 480, date: "2026-05-03", note: "" },
    { id: "e3", company: "mortgage", category: "Salary Expense", sub: "Sarah Lin (Broker)", amount: 6500, date: "2026-05-30", note: "May salary" },
    { id: "e4", company: "outsource", category: "Salary Expense", sub: "Team — Manila", amount: 4800, date: "2026-05-30", note: "May salary" },
    { id: "e5", company: "mortgage", category: "Administration", sub: "Accounting fees", amount: 950, date: "2026-05-15", note: "" },
  ],
  invoices: [
    { id: "inv1", number: "INV-1001", clientId: "c1", company: "mortgage", issueDate: "2026-05-01", dueDate: "2026-05-15", status: "paid",
      items: [{ desc: "Home loan brokerage service", qty: 1, price: 8500 }] },
    { id: "inv2", number: "INV-1002", clientId: "c2", company: "outsource", issueDate: "2026-05-01", dueDate: "2026-05-15", status: "sent",
      items: [{ desc: "Monthly back-office retainer", qty: 1, price: 6300 }] },
    { id: "inv3", number: "INV-1003", clientId: "c3", company: "mortgage", issueDate: "2026-04-01", dueDate: "2026-04-15", status: "overdue",
      items: [{ desc: "Refinance commission", qty: 1, price: 4200 }] },
  ],
  users: [
    { id: "u1", name: "Managing Director", email: "md@ezygroup.com.au", role: "CEO", perms: fullPerms() },
    { id: "u2", name: "Operations Manager", email: "ops@ezygroup.com.au", role: "Manager",
      perms: { overview: "view", clients: "edit", income: "edit", expense: "view", invoices: "edit", users: "none", xero_sales: "edit", xero_invoices: "edit" } },
    { id: "u3", name: "Accounts Staff", email: "accounts@ezygroup.com.au", role: "Staff",
      perms: { overview: "view", clients: "view", income: "edit", expense: "edit", invoices: "view", users: "none", xero_sales: "view", xero_invoices: "view" } },
  ],
});

function fullPerms() {
  const p: any = {};
  SECTIONS.forEach((s) => (p[s] = "edit"));
  return p;
}

/* ---------- storage layer (persists across sessions, falls back to memory) ---------- */
const KEY = "ezy_admin_db_v3";
async function loadDB() {
  try {
    const localVal = localStorage.getItem(KEY);
    if (localVal) return JSON.parse(localVal);

    if (typeof window !== "undefined" && (window as any).storage) {
      const r = await (window as any).storage.get(KEY);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) { /* not found / unavailable */ }
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
  const [scope, setScope] = useState("all"); // all | mortgage | outsource

  useEffect(() => { loadDB().then((d) => { setDb(d); setUser(d.users[0]); }); }, []);
  const commit = (next: any) => { setDb(next); saveDB(next); };

  if (!db || !user) return <Splash />;

  const can = (sec: string) => user.perms[sec] && user.perms[sec] !== "none";
  const canEdit = (sec: string) => user.perms[sec] === "edit";
  const visibleSections = SECTIONS.filter(can);
  const activeSection = visibleSections.includes(section) ? section : visibleSections[0];

  return (
    <div className="ezy-root">
      <Styles />
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">EZY</div>
          <div>
            <div className="brand-name">EZY GROUP</div>
            <div className="brand-sub">Business Console</div>
          </div>
        </div>
        <nav>
          {NAV.filter((n) => can(n.key)).map((n) => (
            <button key={n.key}
              className={`nav-item ${activeSection === n.key ? "active" : ""}`}
              onClick={() => setSection(n.key)}>
              <n.icon size={18} /> <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            className="btn sm full font-semibold" 
            onClick={onBackToHome}
            style={{ 
              background: "#1a212a", 
              borderColor: "#232b34", 
              color: "#cdd3da", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "6px",
              cursor: "pointer"
            }}
          >
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
              <button
                onClick={onToggleTheme}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{
                  background: isDarkMode ? "#151c28" : "#fff",
                  border: "1px solid",
                  borderColor: isDarkMode ? "#1e2633" : "#e2ddd4",
                  borderRadius: "9px",
                  padding: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isDarkMode ? "#ff6900" : "#2563eb",
                  transition: "all 0.15s",
                  height: "37px",
                  width: "37px"
                }}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
          </div>
        </header>

        <div className="content">
          {activeSection === "overview" && <Overview db={db} scope={scope} />}
          {activeSection === "clients" && <Clients db={db} commit={commit} scope={scope} canEdit={canEdit("clients")} />}
          {activeSection === "income" && <Income db={db} commit={commit} scope={scope} canEdit={canEdit("income")} />}
          {activeSection === "expense" && <Expense db={db} commit={commit} scope={scope} canEdit={canEdit("expense")} />}
          {activeSection === "invoices" && <Invoices db={db} commit={commit} scope={scope} canEdit={canEdit("invoices")} />}
          {activeSection === "users" && <UsersMgmt db={db} commit={commit} canEdit={canEdit("users")} />}
          {activeSection === "xero_sales" && <XeroSales isDarkMode={isDarkMode} />}
          {activeSection === "xero_invoices" && <XeroInvoices isDarkMode={isDarkMode} />}
        </div>
      </main>
    </div>
  );
}

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "clients", label: "Client List", icon: Users },
  { key: "income", label: "Income", icon: TrendingUp },
  { key: "expense", label: "Expense", icon: Wallet },
  { key: "invoices", label: "Invoice System", icon: FileText },
  { key: "users", label: "User Management", icon: ShieldCheck },
  { key: "xero_sales", label: "Xero Sales Overview (EDH)", icon: TrendingUp },
  { key: "xero_invoices", label: "Xero Invoices Overview (EDH)", icon: FileText },
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
        <Panel title="Income by Company">
          <DonutChart data={byCompany} />
        </Panel>
        <Panel title="Paid vs Outstanding">
          <DonutChart data={paidData} />
        </Panel>
        <Panel title="Expense Breakdown">
          <DonutChart data={expByCat} />
        </Panel>
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
function Expense({ db, commit, scope, canEdit }: { db: any; commit: (next: any) => void; scope: string; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("all");
  const rows = db.expenses
    .filter((e: any) => scope === "all" || e.company === scope)
    .filter((e: any) => cat === "all" || e.category === cat);
  const total = rows.reduce((s: number, e: any) => s + e.amount, 0);
  const salary = rows.filter((e: any) => e.category === "Salary Expense").reduce((s: number, e: any) => s + e.amount, 0);

  const save = (rec: any) => { commit({ ...db, expenses: [...db.expenses, { ...rec, id: uid() }] }); setOpen(false); };
  const remove = (id: string) => commit({ ...db, expenses: db.expenses.filter((e: any) => e.id !== id) });

  return (
    <div className="stack">
      <div className="cards">
        <Stat label="Total Expense" value={fmt(total)} tone="blue" />
        <Stat label="Salary Expense" value={fmt(salary)} tone="purple" sub="sub-category" />
        <Stat label="Operating (non-salary)" value={fmt(total - salary)} tone="slate" />
      </div>
      <Toolbar
        filters={<select value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>}
        action={canEdit && <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> New Expense</button>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Detail / Sub-category</th><th>Entity</th><th className="r">Amount</th>{canEdit && <th></th>}</tr></thead>
          <tbody>
            {rows.map((e: any) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.category === "Salary Expense" ? <Tag tone="purple">Salary</Tag> : e.category}</td>
                <td className="strong">{e.sub}<div className="muted-sm">{e.note}</div></td>
                <td><Tag>{e.company === "mortgage" ? "Mortgage" : "Outsource"}</Tag></td>
                <td className="r strong">{fmt2(e.amount)}</td>
                {canEdit && <td className="row-actions"><button onClick={() => remove(e.id)}><Trash2 size={15}/></button></td>}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="empty">No expenses</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <ExpenseModal onSave={save} onClose={() => setOpen(false)} />}
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
        <Field label={isSalary ? "Employee / Team (sub-category)" : "Detail / Sub-category"}><input value={f.sub} onChange={set("sub")} placeholder={isSalary ? "e.g. Sarah Lin" : "e.g. Rent, Xero"} /></Field>
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

/* ============================ INVOICES ============================ */
function Invoices({ db, commit, scope, canEdit }: { db: any; commit: (next: any) => void; scope: string; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const client = (id: string) => db.clients.find((c: any) => c.id === id);
  const rows = db.invoices.filter((i: any) => scope === "all" || i.company === scope);

  const save = (inv: any) => {
    const number = "INV-" + (1000 + db.invoices.length + 1);
    commit({ ...db, invoices: [...db.invoices, { ...inv, id: uid(), number, status: "sent" }] });
    setOpen(false);
  };
  const setStatus = (id: string, status: string) => commit({ ...db, invoices: db.invoices.map((i: any) => i.id === id ? { ...i, status } : i) });

  return (
    <div className="stack">
      <div className="automation-note">
        <Clock size={18} />
        <div>
          <strong>Automation (built in production):</strong> on the 1st of each month invoices auto-email to the client, payment auto-marks the invoice paid, and an unpaid invoice triggers a reminder after 14 days — repeating until paid. In this prototype you can preview the email template and run the steps manually below.
        </div>
      </div>
      <Toolbar action={canEdit && <button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> Create Invoice</button>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Invoice #</th><th>Client</th><th>Entity</th><th>Issued</th><th>Due</th><th className="r">Total (inc GST)</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((inv: any) => {
              const sub = invTotal(inv); const total = sub + gstOf(sub);
              return (
                <tr key={inv.id}>
                  <td className="strong">{inv.number}</td>
                  <td>{client(inv.clientId)?.name}</td>
                  <td><Tag>{inv.company === "mortgage" ? "Mortgage" : "Outsource"}</Tag></td>
                  <td>{inv.issueDate}</td><td>{inv.dueDate}</td>
                  <td className="r strong">{fmt2(total)}</td>
                  <td><InvStatus status={inv.status} /></td>
                  <td className="row-actions">
                    <button onClick={() => setPreview(inv)} title="View / Email template"><Mail size={15}/></button>
                    {canEdit && inv.status !== "paid" && <button onClick={() => setStatus(inv.id, "paid")} title="Mark paid"><CheckCircle2 size={15}/></button>}
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={8} className="empty">No invoices</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <InvoiceModal db={db} onSave={save} onClose={() => setOpen(false)} />}
      {preview && <InvoicePreview inv={preview} client={client(preview.clientId)} onClose={() => setPreview(null)} />}
    </div>
  );
}

function InvStatus({ status }: { status: string }) {
  const map: Record<string, [string, string, React.ComponentType<any>]> = { paid: ["Paid", "green", CheckCircle2], sent: ["Sent", "amber", Send], overdue: ["Overdue", "red", AlertTriangle], draft: ["Draft", "slate", Clock] };
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
        <button className="btn primary" disabled={!sub} onClick={() => onSave({ ...f, items: f.items.map((it: any) => ({ ...it, qty: Number(it.qty), price: Number(it.price) })) })}><Send size={15}/> Create & Send</button>
      </div>
    </Modal>
  );
}

function InvoicePreview({ inv, client, onClose }: { inv: any; client: any; onClose: () => void }) {
  const sub = invTotal(inv); const gst = gstOf(sub); const total = sub + gst;
  const entity = COMPANIES[inv.company as keyof typeof COMPANIES];
  return (
    <Modal title={`Email Template · ${inv.number}`} onClose={onClose} wide>
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
  if (!canEdit) return <div className="locked"><Lock size={28}/><p>Only the CEO can manage users.</p></div>;
  const save = (u: any) => { commit({ ...db, users: [...db.users, { ...u, id: uid() }] }); setOpen(false); };
  const remove = (id: string) => commit({ ...db, users: db.users.filter((u: any) => u.id !== id) });

  return (
    <div className="stack">
      <Toolbar action={<button className="btn primary" onClick={() => setOpen(true)}><Plus size={16}/> Create User</button>} />
      <div className="user-grid">
        {db.users.map((u: any) => (
          <div className="user-card" key={u.id}>
            <div className="user-head">
              <div className="avatar">{u.name.split(" ").map((w: string)=>w[0]).slice(0,2).join("")}</div>
              <div><div className="strong">{u.name}</div><div className="muted-sm">{u.email}</div></div>
              <span className={`role-pill ${u.role.toLowerCase()}`}>{u.role}</span>
            </div>
            <div className="perm-list">
              {SECTIONS.map((s) => (
                <div className="perm-row" key={s}>
                  <span>{NAV.find((n)=>n.key===s)?.label}</span>
                  <span className={`perm-badge ${u.perms[s]}`}>{u.perms[s] === "edit" ? "Edit & Input" : u.perms[s] === "view" ? "View only" : "Hidden"}</span>
                </div>
              ))}
            </div>
            {u.role !== "CEO" && <button className="btn ghost sm full" onClick={() => remove(u.id)}><Trash2 size={14}/> Remove</button>}
          </div>
        ))}
      </div>
      {open && <UserModal onSave={save} onClose={() => setOpen(false)} />}
    </div>
  );
}

function UserModal({ onSave, onClose }: { onSave: (u: any) => void; onClose: () => void }) {
  const [f, setF] = useState<any>({ name: "", email: "", role: "Staff", perms: { overview: "view", clients: "view", income: "view", expense: "view", invoices: "view", users: "none" } });
  const setPerm = (s: string, v: string) => setF({ ...f, perms: { ...f.perms, [s]: v } });
  return (
    <Modal title="Create User & Set Permissions" onClose={onClose} wide>
      <div className="form-grid">
        <Field label="Full Name"><input value={f.name} onChange={(e) => setF({...f, name: e.target.value})} /></Field>
        <Field label="Email"><input value={f.email} onChange={(e) => setF({...f, email: e.target.value})} /></Field>
        <Field label="Role">
          <select value={f.role} onChange={(e) => {
            const role = e.target.value;
            setF({ ...f, role, perms: role === "CEO" ? fullPerms() : f.perms });
          }}>
            <option>CEO</option><option>Manager</option><option>Staff</option>
          </select>
        </Field>
      </div>
      <div className="perm-editor">
        <div className="perm-editor-head">Section access</div>
        {SECTIONS.map((s) => (
          <div className="perm-edit-row" key={s}>
            <span>{NAV.find((n)=>n.key===s)?.label}</span>
            <div className="seg">
              {["none","view","edit"].map((opt) => (
                <button key={opt} className={f.perms[s] === opt ? "on" : ""} disabled={f.role === "CEO"} onClick={() => setPerm(s, opt)}>
                  {opt === "none" ? "Hidden" : opt === "view" ? "View" : "Edit"}
                </button>
              ))}
            </div>
          </div>
        ))}
        {f.role === "CEO" && <p className="muted-sm" style={{padding:"6px 14px"}}>CEO automatically has full access to everything.</p>}
      </div>
      <div className="modal-foot">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!f.name} onClick={() => onSave(f)}>Create User</button>
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

  /* sidebar */
  .sidebar { width: 248px; background:#11161c; color:#cdd3da; display:flex; flex-direction:column; padding:22px 16px; position:sticky; top:0; height:100vh; }
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
  .row-actions { display:flex; gap:6px; justify-content:flex-end; }
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
  .modal.wide { width:680px; }
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
  .inv-table { margin:8px 0; } .inv-table th { background:#faf8f4; font-size:11px; }
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
  .avatar { width:44px; height:44px; border-radius:12px; background:#11161c; color:#fff; display:grid; place-items:center; font-weight:600; font-size:15px; }
  .role-pill { margin-left:auto; font-size:11.5px; font-weight:700; padding:4px 11px; border-radius:20px; text-transform:uppercase; letter-spacing:.4px; }
  .role-pill.ceo { background:#1f7a52; color:#fff; } .role-pill.manager { background:#eef6ff; color:#1f4e79; } .role-pill.staff { background:#f3f1ec; color:#6b7280; }
  .perm-list { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
  .perm-row { display:flex; justify-content:space-between; font-size:13px; color:#516170; }
  .perm-badge { font-size:11.5px; font-weight:600; padding:2px 9px; border-radius:6px; }
  .perm-badge.edit { background:#dcf3e8; color:#1f7a52; } .perm-badge.view { background:#eef6ff; color:#1f4e79; } .perm-badge.none { background:#f3f1ec; color:#a3acb6; }
  .perm-editor { margin-top:18px; border:1px solid #eee; border-radius:12px; overflow:hidden; }
  .perm-editor-head { background:#faf8f4; padding:11px 14px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#9aa4af; }
  .perm-edit-row { display:flex; justify-content:space-between; align-items:center; padding:11px 14px; border-top:1px solid #f2efe9; font-size:14px; }
  .seg { display:flex; background:#f1efe9; border-radius:8px; padding:2px; }
  .seg button { border:none; background:none; padding:6px 13px; border-radius:6px; font-family:inherit; font-size:12.5px; color:#6b7280; cursor:pointer; }
  .seg button.on { background:#fff; color:#11161c; font-weight:600; box-shadow:0 1px 2px rgba(0,0,0,.1); }
  .seg button:disabled { opacity:.4; cursor:not-allowed; }
  .locked { text-align:center; padding:70px 0; color:#a3acb6; } .locked p { margin-top:10px; }
  @media (max-width:640px){ .sidebar{ display:none; } .form-grid{ grid-template-columns:1fr; } .field.wide{ grid-column:auto; } }
  `}</style>;
}
