import Database from "better-sqlite3";
import path from "node:path";

export const DB_PATH = path.join(process.cwd(), "data", "claims.db");

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
  manager_status TEXT NOT NULL,       -- MOCK: always 'approved' in seed data
  submitted_at TEXT NOT NULL
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
  manager_status: string;
};

let db: Database.Database | null = null;

export function getDb() {
  if (!db) db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return db;
}

export function listClaims(): ClaimRow[] {
  return getDb()
    .prepare(
      `SELECT c.id, e.name AS employee_name, d.name AS department_name, c.category, c.merchant,
              c.amount, c.transaction_date, c.transaction_time, c.description, c.receipt_path, c.manager_status
       FROM claims c
       JOIN employees e ON e.id = c.employee_id
       JOIN departments d ON d.id = e.department_id
       ORDER BY c.id`
    )
    .all() as ClaimRow[];
}
