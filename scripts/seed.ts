/**
 * Seeds data/claims.db with ~80 claims. Deterministic (fixed PRNG seed), so reruns give identical data.
 *
 * MOCK: every department, employee, manager, merchant and amount here is invented placeholder data,
 * not Ruangguru's real org or policy. Limits and working hours come from config/rules.config.draft.json,
 * never hardcoded here.
 *
 * Planted problems (each planted claim carries exactly ONE problem, so S1 tests have unambiguous answers):
 *   4 over category limit, 3 duplicate pairs, 5 weekend, 3 off-hours, 2 missing receipt.
 * Clean claims: weekday, under the near-limit threshold, in working hours or no time, receipt attached,
 * unique amount+date+merchant. The expected answers are written to tests/fixtures/seed-expected.json.
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { DB_PATH, SCHEMA } from "../src/lib/db";
import config from "../config/rules.config.draft.json";

type Category = keyof typeof config.categoryLimits;
const limits = config.categoryLimits as Record<Category, number>;
const categories = Object.keys(limits) as Category[];

// Simple seeded PRNG (mulberry32) so seed data is stable across runs.
let s = 20260930;
function rand() {
  s |= 0; s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T,>(a: readonly T[]) => a[Math.floor(rand() * a.length)];

// MOCK org structure
const departments = ["Product & Engineering (MOCK)", "Sales & Partnerships (MOCK)", "Operations (MOCK)"];
const managers = ["Rina Mock", "Budi Mock", "Sari Mock"];
const employeesByDept = [
  ["Andi Contoh", "Dewi Contoh", "Fajar Contoh", "Gita Contoh"],
  ["Hendra Contoh", "Intan Contoh", "Joko Contoh", "Kartika Contoh"],
  ["Lukman Contoh", "Maya Contoh", "Nanda Contoh", "Oki Contoh"],
];

// MOCK merchants per category
const merchants: Record<Category, string[]> = {
  Meals: ["Warung Makan Sederhana", "Kopi Kenangan", "Solaria", "Bakmi GM", "Sate Khas Senayan"],
  Transport: ["Gojek", "Grab", "Bluebird Taxi", "KRL Commuter", "Pertamina SPBU"],
  Accommodation: ["Hotel Santika", "Ibis Budget", "Favehotel", "Aston Inn"],
  "Office Supplies": ["Gramedia", "Informa", "Ace Hardware", "Toko Buku Kharisma"],
  "Client Entertainment": ["Plataran Menteng", "Union Brasserie", "Social House", "Kembang Goela"],
};

const RECEIPT_COUNT = 6;
const receipt = (i: number) => `/mock-receipts/receipt-${(i % RECEIPT_COUNT) + 1}.svg`;

// Sep 2026 dates. Sep 1 2026 is a Tuesday.
const dayOfWeek = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay();
const isWeekend = (d: string) => config.weekendDays.includes(dayOfWeek(d));
const allDates = Array.from({ length: 25 }, (_, i) => `2026-09-${String(i + 1).padStart(2, "0")}`);
const weekdays = allDates.filter((d) => !isWeekend(d));
const weekends = allDates.filter(isWeekend);

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const workStart = toMin(config.workingHours.start);
const workEnd = toMin(config.workingHours.end);
const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const inHoursTime = () => fmt(workStart + 60 + Math.floor(rand() * (workEnd - workStart - 120) / 5) * 5);

// Clean amount: 20% to 70% of the limit, rounded to 500 rupiah. Stays under the near-limit threshold.
const cleanAmount = (c: Category) => {
  const max = Math.min(0.7, config.nearLimitPct - 0.1);
  return Math.round((limits[c] * (0.2 + rand() * (max - 0.2))) / 500) * 500;
};

type Claim = {
  employee_id: number; category: Category; merchant: string; amount: number;
  transaction_date: string; transaction_time: string | null; description: string; receipt_path: string | null;
  planted: string | null;
};

const employeeIds = employeesByDept.flat().map((_, i) => i + 1);
let n = 0;
function base(category: Category, overrides: Partial<Claim> = {}): Claim {
  n++;
  return {
    employee_id: pick(employeeIds),
    category,
    merchant: pick(merchants[category]),
    amount: cleanAmount(category),
    transaction_date: pick(weekdays),
    transaction_time: rand() < 0.5 ? inHoursTime() : null,
    description: `${category} expense (MOCK)`,
    receipt_path: receipt(n),
    planted: null,
    ...overrides,
  };
}

const claims: Claim[] = [];

// 4 over category limit (110% to 160% of limit)
(["Meals", "Transport", "Accommodation", "Client Entertainment"] as Category[]).forEach((c, i) => {
  claims.push(base(c, { amount: Math.round((limits[c] * (1.1 + i * 0.15)) / 1000) * 1000, planted: "over_limit" }));
});

// 3 duplicate pairs: same amount + date + merchant after normalization (case/punctuation/spacing differ),
// submitted by different employees.
const dupSpecs: [Category, string, string, number, string][] = [
  ["Meals", "Kopi Kenangan", "KOPI KENANGAN.", 0.5, "2026-09-08"],
  ["Transport", "Bluebird Taxi", "Blue Bird  Taxi", 0.45, "2026-09-15"],
  ["Office Supplies", "Gramedia", "gramedia", 0.6, "2026-09-22"],
];
dupSpecs.forEach(([c, m1, m2, pct, date], i) => {
  const amount = Math.round((limits[c] * pct) / 500) * 500 + 1500; // odd-looking amount, unique vs clean claims
  const pair = `dup_pair_${i + 1}`;
  claims.push(base(c, { merchant: m1, amount, transaction_date: date, transaction_time: null, employee_id: 1 + i, planted: pair }));
  claims.push(base(c, { merchant: m2, amount, transaction_date: date, transaction_time: null, employee_id: 5 + i, planted: pair }));
});

// 5 weekend transactions
weekends.slice(0, 5).forEach((d, i) => {
  claims.push(base(categories[i % categories.length], { transaction_date: d, transaction_time: null, planted: "weekend" }));
});

// 3 off-hours transactions (weekday, time set, outside working hours)
[fmt((workEnd + 90) % 1440), fmt(toMin("02:40")), fmt(Math.max(0, workStart - 75))].forEach((t, i) => {
  claims.push(base(categories[(i + 1) % categories.length], { transaction_time: t, planted: "off_hours" }));
});

// 2 missing receipt
claims.push(base("Meals", { receipt_path: null, planted: "missing_receipt" }));
claims.push(base("Office Supplies", { receipt_path: null, planted: "missing_receipt" }));

// Clean claims to reach 80, avoiding accidental duplicates of any existing amount+date+merchant.
const key = (c: Claim) => `${c.amount}|${c.transaction_date}|${c.merchant.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
const seen = new Set(claims.map(key));
while (claims.length < 80) {
  const c = base(pick(categories));
  if (seen.has(key(c))) continue;
  seen.add(key(c));
  claims.push(c);
}

// Shuffle so planted problems are not bunched at the top of the list.
for (let i = claims.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [claims[i], claims[j]] = [claims[j], claims[i]];
}

// Write DB
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
for (const f of [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) fs.rmSync(f, { force: true });
const db = new Database(DB_PATH);
db.exec(SCHEMA);
const insDept = db.prepare("INSERT INTO departments (id, name) VALUES (?, ?)");
const insEmp = db.prepare("INSERT INTO employees (id, name, department_id, manager_name) VALUES (?, ?, ?, ?)");
const insClaim = db.prepare(`INSERT INTO claims
  (id, employee_id, category, merchant, amount, transaction_date, transaction_time, description, receipt_path, manager_status, submitted_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)`);

const expected: Record<string, number[]> = {};
db.transaction(() => {
  departments.forEach((d, i) => insDept.run(i + 1, d));
  let eid = 0;
  employeesByDept.forEach((names, di) => names.forEach((nm) => insEmp.run(++eid, nm, di + 1, managers[di])));
  claims.forEach((c, i) => {
    const id = i + 1;
    insClaim.run(id, c.employee_id, c.category, c.merchant, c.amount, c.transaction_date, c.transaction_time,
      c.description, c.receipt_path, `${c.transaction_date}T${c.transaction_time ?? "12:00"}:00+07:00`);
    const tag = c.planted ?? "clean";
    (expected[tag] ??= []).push(id);
  });
})();
db.close();

fs.mkdirSync("tests/fixtures", { recursive: true });
fs.writeFileSync("tests/fixtures/seed-expected.json", JSON.stringify(expected, null, 2) + "\n");

const summary = Object.fromEntries(Object.entries(expected).map(([k, v]) => [k, v.length]));
console.log(`Seeded ${claims.length} claims into ${DB_PATH}`, summary);
