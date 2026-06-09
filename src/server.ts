/**
 * EZY Group — Backend Server
 *
 * Responsibilities:
 *  1. Monthly invoice auto-generation (1st of every month @ 09:00 AEST)
 *     - Reads all clients from Firestore
 *     - Clones each client's most recent invoice as a new draft
 *     - Emails the invoice HTML to the client via Gmail SMTP
 *
 *  2. 14-day unpaid reminder (daily @ 09:00 AEST)
 *     - Finds invoices with status != "paid" and emailSentAt >= 14 days ago
 *       that have not yet had a reminder sent
 *     - Sends a reminder email to the client
 *     - Updates Firestore reminderSentAt / reminderSentCount
 *
 * Setup:
 *   1. Copy .env.example to .env and fill in SMTP credentials
 *   2. npm install  (node-cron & nodemailer already installed)
 *   3. Run: npx tsx src/server.ts
 */

import express from "express";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

/* ================================================================
   Firebase Admin initialisation
   Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account
   JSON key file path, OR set FIREBASE_SERVICE_ACCOUNT_JSON env var
   to the raw JSON string.
   ================================================================ */
if (!getApps().length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Falls back to Application Default Credentials (gcloud auth)
    initializeApp();
  }
}

const db = getFirestore();

/* ================================================================
   Gmail SMTP transporter (App Password, not account password)
   ================================================================ */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || `EZY Mortgage Australia <${process.env.SMTP_USER}>`;

const COMPANIES: Record<string, string> = {
  mortgage: "EZY MORTGAGE AUSTRALIA PTY LTD",
  outsource: "EZY OUTSOURCE PTY LTD",
};

const BANK_ACCOUNTS = [
  { label: "Account 1 — NAB", bsb: "083-004", acc: "12 345 6789", name: "EZY Mortgage Australia Pty Ltd" },
  { label: "Account 2 — CBA", bsb: "062-001", acc: "98 765 4321", name: "EZY Outsource Pty Ltd" },
];

const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n || 0);

function invTotal(items: Array<{ qty: number; price: number }>) {
  return items.reduce((s, it) => s + it.qty * it.price, 0);
}
function gstOf(sub: number) { return Math.round(sub * 0.1 * 100) / 100; }

function uid() { return Math.random().toString(36).slice(2, 9); }

/* ================================================================
   Build HTML invoice email body
   ================================================================ */
function buildInvoiceHtml(inv: any, client: any, isReminder = false): string {
  const entity = COMPANIES[inv.company] || inv.company;
  const sub = invTotal(inv.items);
  const gst = gstOf(sub);
  const total = sub + gst;

  const itemRows = inv.items.map((it: any) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;">${it.desc}</td>
      <td style="padding:8px 12px;font-size:13px;text-align:right;">${it.qty}</td>
      <td style="padding:8px 12px;font-size:13px;text-align:right;">${fmt2(it.price)}</td>
      <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;">${fmt2(it.qty * it.price)}</td>
    </tr>`).join("");

  const bankRows = BANK_ACCOUNTS.map(b => `
    <div style="flex:1;padding:10px 14px;background:#f9f9f9;border-radius:8px;">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${b.label}</div>
      <div style="font-size:12px;color:#516170;">${b.name}</div>
      <div style="font-size:12px;color:#516170;">BSB: ${b.bsb}</div>
      <div style="font-size:12px;color:#516170;">Acc: ${b.acc}</div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${inv.number}</title></head>
<body style="margin:0;padding:0;background:#f6f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eae6df;">

      ${isReminder ? `
      <tr><td style="background:#fff3e0;padding:12px 24px;font-size:13px;color:#e65100;border-bottom:1px solid #ffcc80;">
        ⚠️ <strong>Payment Reminder:</strong> This invoice is now overdue. Please arrange payment at your earliest convenience.
      </td></tr>` : ""}

      <!-- Header -->
      <tr>
        <td style="padding:28px 28px 18px;border-bottom:1px solid #eae6df;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="width:50px;height:50px;background:linear-gradient(135deg,#1f7a52,#2bb673);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;line-height:50px;text-align:center;">EZY</div>
                <div style="margin-top:8px;font-weight:700;font-size:15px;">${entity}</div>
                <div style="font-size:12px;color:#9aa4af;">ABN 00 000 000 000 · Sydney, Australia</div>
              </td>
              <td align="right">
                <div style="font-size:22px;font-weight:700;color:#1f7a52;">TAX INVOICE</div>
                <div style="font-size:13px;color:#9aa4af;margin-top:4px;">${inv.number}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Bill To / Dates -->
      <tr>
        <td style="padding:20px 28px;border-bottom:1px solid #eae6df;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top;">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;margin-bottom:4px;">Bill To</div>
                <div style="font-weight:700;font-size:14px;">${client?.name || "—"}</div>
                <div style="font-size:12px;color:#516170;margin-top:3px;">${client?.companyName || ""}</div>
                <div style="font-size:12px;color:#516170;">${client?.address || ""}</div>
                ${client?.abn ? `<div style="font-size:12px;color:#516170;">ABN ${client.abn}</div>` : ""}
              </td>
              <td align="right" style="vertical-align:top;">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;margin-bottom:4px;">Issued</div>
                <div style="font-size:13px;">${inv.issueDate}</div>
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;margin-top:10px;margin-bottom:4px;">Due</div>
                <div style="font-size:13px;font-weight:700;color:#dc2626;">${inv.dueDate}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Line Items -->
      <tr>
        <td style="padding:0 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
            <thead>
              <tr style="background:#faf8f4;">
                <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;">Description</th>
                <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;">Qty</th>
                <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;">Unit</th>
                <th style="text-align:right;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </td>
      </tr>

      <!-- Totals -->
      <tr>
        <td style="padding:0 28px 20px;text-align:right;">
          <div style="display:inline-block;min-width:220px;">
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#6b7280;border-top:1px solid #eee;"><span>Subtotal</span><span>${fmt2(sub)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#6b7280;"><span>GST 10%</span><span>${fmt2(gst)}</span></div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:17px;font-weight:700;color:#1a1d21;border-top:2px solid #11161c;margin-top:4px;"><span>Total Due</span><span>${fmt2(total)}</span></div>
          </div>
        </td>
      </tr>

      <!-- Bank Details -->
      <tr>
        <td style="padding:16px 28px;background:#faf8f4;border-top:1px solid #eae6df;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#9aa4af;margin-bottom:10px;">Payment — Direct Deposit</div>
          <div style="display:flex;gap:12px;">${bankRows}</div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:16px 28px;text-align:center;font-size:12px;color:#9aa4af;border-top:1px solid #eae6df;">
          Thank you for your business. Please pay by the due date. — ${entity}
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ================================================================
   Core: generate + email invoices for all clients
   ================================================================ */
async function generateMonthlyInvoices() {
  console.log("[CRON] Starting monthly invoice generation...");

  const clientsSnap = await db.collection("clients").get();
  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

  for (const client of clients) {
    if (!client.email) { console.warn(`[CRON] Client ${client.id} has no email — skipping`); continue; }

    // Find most recent invoice for this client
    const invSnap = await db.collection("invoices")
      .where("clientId", "==", client.id)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (invSnap.empty) {
      console.warn(`[CRON] No prior invoice for client ${client.name} — skipping auto-generation`);
      continue;
    }

    const lastInv = invSnap.docs[0].data() as any;

    // Clone invoice for this month
    const today = new Date();
    const issueDate = today.toISOString().slice(0, 10);
    const dueDate = new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10);
    const invNumber = `INV-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${uid().toUpperCase()}`;

    const newInvoice = {
      number: invNumber,
      clientId: client.id,
      company: lastInv.company || "mortgage",
      issueDate,
      dueDate,
      status: "sent",
      items: lastInv.items || [],
      autoGenerated: true,
      emailSentAt: new Date().toISOString(),
      reminderSentAt: null,
      reminderSentCount: 0,
      lastMailLog: `Auto-generated & emailed on ${today.toLocaleDateString("en-AU")}`,
      createdAt: new Date(),
    };

    const docRef = await db.collection("invoices").add(newInvoice);
    console.log(`[CRON] Created invoice ${invNumber} for client ${client.name}`);

    // Send email
    const html = buildInvoiceHtml({ ...newInvoice, id: docRef.id }, client);
    const entity = COMPANIES[newInvoice.company] || "EZY Group";

    try {
      await transporter.sendMail({
        from: FROM,
        to: client.email,
        subject: `${invNumber} — Tax Invoice from ${entity}`,
        html,
      });
      console.log(`[CRON] Invoice email sent to ${client.email}`);
    } catch (emailErr) {
      console.error(`[CRON] Failed to send email to ${client.email}:`, emailErr);
      await docRef.update({ lastMailLog: `Email failed on ${today.toLocaleDateString("en-AU")} — check SMTP config` });
    }
  }

  console.log("[CRON] Monthly invoice generation complete.");
}

/* ================================================================
   Core: send 14-day reminder for unpaid invoices
   ================================================================ */
async function sendUnpaidReminders() {
  console.log("[CRON] Checking for unpaid invoices needing reminders...");

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const invSnap = await db.collection("invoices")
    .where("status", "in", ["sent", "overdue"])
    .where("reminderSentCount", "==", 0)
    .get();

  const candidates = invSnap.docs
    .map(d => ({ id: d.id, ...d.data() })) as any[];

  const toRemind = candidates.filter(inv => {
    if (!inv.emailSentAt) return false;
    return new Date(inv.emailSentAt) <= cutoff;
  });

  for (const inv of toRemind) {
    const clientSnap = await db.collection("clients").doc(inv.clientId).get();
    if (!clientSnap.exists) { console.warn(`[CRON] Client ${inv.clientId} not found for invoice ${inv.number}`); continue; }
    const client = { id: clientSnap.id, ...clientSnap.data() } as any;
    if (!client.email) { console.warn(`[CRON] Client ${client.id} has no email — skipping reminder`); continue; }

    const html = buildInvoiceHtml(inv, client, true);
    const entity = COMPANIES[inv.company] || "EZY Group";

    try {
      await transporter.sendMail({
        from: FROM,
        to: client.email,
        subject: `REMINDER: ${inv.number} — Payment Due — ${entity}`,
        html,
      });
      const now = new Date().toISOString();
      await db.collection("invoices").doc(inv.id).update({
        reminderSentAt: now,
        reminderSentCount: 1,
        status: "overdue",
        lastMailLog: `Reminder sent ${new Date().toLocaleDateString("en-AU")}`,
      });
      console.log(`[CRON] Reminder sent for ${inv.number} to ${client.email}`);
    } catch (emailErr) {
      console.error(`[CRON] Failed to send reminder to ${client.email}:`, emailErr);
    }
  }

  console.log(`[CRON] Reminder pass complete. Processed: ${toRemind.length} invoice(s).`);
}

/* ================================================================
   Express app — test routes + health check
   ================================================================ */
const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Manual trigger for testing — protected by a simple token
const TRIGGER_TOKEN = process.env.TRIGGER_TOKEN || "ezy-dev-trigger";

app.post("/test/generate-invoices", async (req, res) => {
  if (req.headers["x-trigger-token"] !== TRIGGER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await generateMonthlyInvoices();
    res.json({ success: true, message: "Monthly invoices generated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/test/send-reminders", async (req, res) => {
  if (req.headers["x-trigger-token"] !== TRIGGER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await sendUnpaidReminders();
    res.json({ success: true, message: "Reminder pass complete" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================================================
   CRON SCHEDULES
   Australia/Sydney is UTC+10 (AEST) or UTC+11 (AEDT).
   node-cron runs in server local time — adjust if server is UTC.
   These schedules assume server timezone = AEST (UTC+10).
   ================================================================ */

// 1st of every month at 09:00 AEST — generate & email monthly invoices
cron.schedule("0 9 1 * *", () => {
  generateMonthlyInvoices().catch(err => console.error("[CRON] Monthly generation error:", err));
}, { timezone: "Australia/Sydney" });

// Daily at 09:00 AEST — check for and send 14-day reminders
cron.schedule("0 9 * * *", () => {
  sendUnpaidReminders().catch(err => console.error("[CRON] Reminder error:", err));
}, { timezone: "Australia/Sydney" });

/* ================================================================
   Start server
   ================================================================ */
const PORT = Number(process.env.SERVER_PORT) || 4000;
app.listen(PORT, () => {
  console.log(`[SERVER] EZY backend running on port ${PORT}`);
  console.log(`[SERVER] Monthly invoice cron: 1st of month @ 09:00 Sydney`);
  console.log(`[SERVER] Daily reminder cron:  every day @ 09:00 Sydney`);
  console.log(`[SERVER] Test route: POST /test/generate-invoices (x-trigger-token: ${TRIGGER_TOKEN})`);
  console.log(`[SERVER] Test route: POST /test/send-reminders    (x-trigger-token: ${TRIGGER_TOKEN})`);
});
