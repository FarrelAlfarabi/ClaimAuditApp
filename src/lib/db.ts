import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const DB_PATH = path.join(process.cwd(), "data", "claims.db");
/** Pristine copy written by the seed script; "Reset demo data" restores from it. */
export const SEED_DB_PATH = path.join(process.cwd(), "data", "claims.seed.db");

// Vercel's bundle is read-only. There we copy the build-time seeded DB to /tmp and write to the copy.
// Writes then last only as long as that server instance (minutes), and are not shared between instances.
// The real demo runs locally (master-plan 5.1), where writes persist in data/claims.db.
const RUNTIME_DB_PATH = process.env.VERCEL ? "/tmp/claims.db" : DB_PATH;
/** Uploaded receipts (demo only; no retention policy). Served by /api/receipts/[name]. */
export const UPLOAD_DIR = process.env.VERCEL ? "/tmp/uploads" : path.join(process.cwd(), "data", "uploads");

export const SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  manager_name TEXT NOT NULL
);
CREATE TABLE claims (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  category TEXT NOT NULL,
  merchant TEXT NOT NULL,
  amount INTEGER NOT NULL,            -- IDR, whole rupiah
  transaction_date TEXT NOT NULL,     -- YYYY-MM-DD
  transaction_time TEXT,              -- HH:MM, optional (A-04)
  description TEXT NOT NULL,
  receipt_path TEXT,                  -- NULL = no receipt attached
  receipt_hash TEXT,                  -- sha256 of an uploaded file; NULL for seed placeholders
  manager_status TEXT NOT NULL,       -- MOCK: always 'approved' in seed data
  submitted_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'seed',            -- seed | demo (submitted through the demo form)
  audit_status TEXT NOT NULL DEFAULT 'pending',  -- Finance decision: pending | approved | rejected
  audit_reason TEXT,                             -- standard rejection reason (rules.config.json)
  audit_note TEXT,
  audited_at TEXT
);
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL                 -- JSON
);
`;

export type ClaimRow = {
  id: number;
  employee_name: string;
  department_name: string;
  category: string;
  merchant: string;
  amount: number;
  transaction_date: string;
  transaction_time: string | null;
  description: string;
  receipt_path: string | null;
  receipt_hash: string | null;
  manager_status: string;
  source: "seed" | "demo";
  audit_status: AuditStatus;
  audit_reason: string | null;
  audit_note: string | null;
  audited_at: string | null;
};

export type AuditStatus = "pending" | "approved" | "rejected";

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    if (RUNTIME_DB_PATH !== DB_PATH && !fs.existsSync(RUNTIME_DB_PATH)) fs.copyFileSync(DB_PATH, RUNTIME_DB_PATH);
    db = new Database(RUNTIME_DB_PATH, { fileMustExist: true });
  }
  return db;
}

export function listClaims(): ClaimRow[] {
  return getDb()
    .prepare(
      `SELECT c.id, e.name AS employee_name, d.name AS department_name, c.category, c.merchant,
              c.amount, c.transaction_date, c.transaction_time, c.description, c.receipt_path, c.receipt_hash, c.manager_status, c.source,
              c.audit_status, c.audit_reason, c.audit_note, c.audited_at
       FROM claims c
       JOIN employees e ON e.id = c.employee_id
       JOIN departments d ON d.id = e.department_id
       ORDER BY c.id`
    )
    .all() as ClaimRow[];
}

const now = () => new Date().toISOString();

export function setAuditDecision(id: number, status: Exclude<AuditStatus, "pending">, reason: string | null, note: string | null) {
  return getDb()
    // Only a pending claim can be decided: a second auditor (or a stale screen) cannot silently overwrite a decision.
    .prepare("UPDATE claims SET audit_status = ?, audit_reason = ?, audit_note = ?, audited_at = ? WHERE id = ? AND audit_status = 'pending'")
    .run(status, reason, note, now(), id).changes;
}

export function undoAuditDecision(id: number) {
  return getDb()
    .prepare("UPDATE claims SET audit_status = 'pending', audit_reason = NULL, audit_note = NULL, audited_at = NULL WHERE id = ?")
    .run(id).changes;
}

export function approveMany(ids: number[]) {
  const db = getDb();
  const stmt = db.prepare("UPDATE claims SET audit_status = 'approved', audited_at = ? WHERE id = ? AND audit_status = 'pending'");
  return db.transaction(() => ids.reduce((n, id) => n + stmt.run(now(), id).changes, 0))();
}

export function getSetting<T>(key: string): T | undefined {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? (JSON.parse(row.value) as T) : undefined;
}

export function putSetting(key: string, value: unknown) {
  getDb().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, JSON.stringify(value));
}

export function deleteSetting(key: string) {
  getDb().prepare("DELETE FROM settings WHERE key = ?").run(key);
}

export type Employee = { id: number; name: string; department_name: string };

export function listEmployees(): Employee[] {
  return getDb()
    .prepare("SELECT e.id, e.name, d.name AS department_name FROM employees e JOIN departments d ON d.id = e.department_id ORDER BY e.name")
    .all() as Employee[];
}

export type NewClaim = {
  employee_id: number; category: string; merchant: string; amount: number; transaction_date: string;
  transaction_time: string | null; description: string; receipt_path: string | null; receipt_hash: string | null;
};

export function insertClaim(c: NewClaim): number {
  const r = getDb()
    .prepare(`INSERT INTO claims (employee_id, category, merchant, amount, transaction_date, transaction_time, description,
        receipt_path, receipt_hash, manager_status, submitted_at, source)
      VALUES (@employee_id, @category, @merchant, @amount, @transaction_date, @transaction_time, @description,
        @receipt_path, @receipt_hash, 'approved', @submitted_at, 'demo')`)
    .run({ ...c, submitted_at: now() });
  return Number(r.lastInsertRowid);
}

/** Restores seed claims and clears Settings changes and uploads. Keeps the open connection (no file swap). */
export function resetDemoData() {
  const db = getDb();
  db.prepare("ATTACH DATABASE ? AS seed").run(SEED_DB_PATH);
  try {
    db.transaction(() => {
      db.exec("DELETE FROM claims; INSERT INTO claims SELECT * FROM seed.claims; DELETE FROM settings;");
    })();
  } finally {
    db.exec("DETACH DATABASE seed");
  }
  fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
}
