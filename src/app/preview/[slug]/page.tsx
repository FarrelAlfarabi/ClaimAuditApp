import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PREVIEWS } from "@/lib/previews";
import { getSessionUser } from "@/lib/role";
import { FakeButton, PreviewBanner } from "@/components/preview-banner";

export const dynamic = "force-dynamic";

const Card = ({ children }: { children: React.ReactNode }) => <div className="rounded-xl border bg-background p-4">{children}</div>;
const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-2 text-sm"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>
);
const Pill = ({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "red" | "amber" | "green" }) => {
  const t = { gray: "bg-muted text-foreground", red: "bg-red-100 text-red-900", amber: "bg-amber-100 text-amber-900", green: "bg-emerald-100 text-emerald-900" }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
};

function ManagerApproval() {
  const items = [["Dewi Contoh", "Transport · Gojek", "Rp 85.000", "Low"], ["Fajar Contoh", "Meals · Solaria", "Rp 280.000", "Medium"], ["Gita Contoh", "Accommodation · Ibis", "Rp 1.800.000", "High"]];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Rina Mock (manager, MOCK) · 3 claims waiting for you</p>
      {items.map(([n, what, amt, r]) => (
        <Card key={n}>
          <div className="flex justify-between"><span className="font-medium">{n}</span><span className="font-semibold">{amt}</span></div>
          <div className="text-sm text-muted-foreground">{what}</div>
          <div className="mt-1"><Pill tone={r === "High" ? "red" : r === "Medium" ? "amber" : "green"}>Engine: {r}</Pill></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><FakeButton>Reject</FakeButton><FakeButton primary>Approve</FakeButton></div>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground">Also by email: a one-tap approve link that works without opening the app.</p>
    </div>
  );
}

function Escalation() {
  return (
    <div className="space-y-3">
      <Card>
        <div className="text-sm font-semibold">Rule (MOCK)</div>
        <Row k="Claims above" v="Rp 5.000.000" /><Row k="Second approver" v="Head of Finance (MOCK)" /><Row k="If no answer in" v="2 working days → reminder" />
      </Card>
      <Card>
        <div className="flex justify-between"><span className="font-medium">Claim #1042 · Client Entertainment</span><Pill tone="red">Escalated</Pill></div>
        <ol className="mt-3 space-y-2 border-l-2 pl-4 text-sm">
          <li>✓ Manager approved · Budi Mock</li><li className="font-medium">● Waiting: Head of Finance</li><li className="text-muted-foreground">○ Finance audit</li>
        </ol>
      </Card>
      <FakeButton>Change threshold</FakeButton>
    </div>
  );
}

function StatusTracker() {
  const steps = [["Submitted", "29 Sep, 09:12", true], ["Manager approved", "29 Sep, 10:40", true], ["Finance audit", "In progress", true], ["Paid (Dicairkan)", "Expected 5 Oct", false]] as const;
  return (
    <Card>
      <div className="flex justify-between"><span className="font-medium">Claim #81 · Meals</span><span className="font-semibold">Rp 450.000</span></div>
      <ol className="mt-4 space-y-4">
        {steps.map(([s, when, done], i) => (
          <li key={s} className="flex gap-3">
            <span aria-hidden className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${done ? (i === 2 ? "border-amber-500 bg-amber-100" : "border-emerald-600 bg-emerald-600") : "border-muted-foreground/40"}`} />
            <div><div className="text-sm font-medium">{s}</div><div className="text-xs text-muted-foreground">{when}</div></div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function BudgetWarning() {
  return (
    <div className="space-y-3">
      <Card>
        <Row k="Category" v="Meals" />
        <Row k="Amount" v="Rp 450.000" />
        <div className="mt-2 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">
          <b>Over the Meals limit (Rp 300.000).</b> You can still submit, but add a reason. Finance will review it.
        </div>
        <div className="mt-3 rounded-lg border p-3 text-sm text-muted-foreground">Reason for going over the limit…</div>
      </Card>
      <FakeButton primary>Submit anyway</FakeButton>
    </div>
  );
}

function Notifications() {
  const n = [["Claim needs your approval", "Fajar Contoh · Rp 280.000", "2 min ago"], ["Claim approved", "Your Meals claim #81", "1 h ago"], ["Claim rejected", "Transport #77: receipt unreadable", "Yesterday"], ["Paid (Dicairkan)", "Rp 1.250.000 to your account", "Mon"]];
  return (
    <div className="space-y-3">
      {n.map(([t, d, w]) => (
        <Card key={t}><div className="flex justify-between gap-2"><span className="text-sm font-medium">{t}</span><span className="text-xs text-muted-foreground">{w}</span></div><div className="text-sm text-muted-foreground">{d}</div></Card>
      ))}
      <Card><div className="text-sm font-semibold">Send me</div><Row k="Email" v="On" /><Row k="Phone notifications" v="Off" /></Card>
    </div>
  );
}

function AuditTrail() {
  const rows = [["29 Sep 14:02", "finance.demo", "Rejected claim #8", "Over category limit"], ["29 Sep 13:55", "finance.demo", "Changed Meals limit", "300.000 → 350.000"], ["29 Sep 13:40", "finance.demo", "Batch approved", "60 Low-risk claims"], ["29 Sep 11:20", "admin.demo", "Added user", "Intan Contoh"]];
  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-background p-3 text-sm text-muted-foreground">🔍 Search who, what, claim #…</div>
      {rows.map(([t, u, a, d]) => (
        <Card key={t + a}><div className="flex justify-between gap-2 text-sm"><span className="font-medium">{a}</span><span className="text-xs text-muted-foreground">{t}</span></div><div className="text-sm text-muted-foreground">{d} · by {u}</div></Card>
      ))}
      <p className="text-xs text-muted-foreground">Entries cannot be edited or deleted. Export for external auditors.</p>
      <FakeButton>Export audit trail</FakeButton>
    </div>
  );
}

function UsersAdmin() {
  const u = [["Andi Contoh", "Employee", "Rina Mock"], ["Rina Mock", "Manager", "Head of Ops"], ["Finance Demo", "Finance", "-"]];
  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-background p-3 text-sm text-muted-foreground">🔍 Search people…</div>
      {u.map(([n, r, m]) => (
        <Card key={n}><div className="flex justify-between"><span className="font-medium">{n}</span><Pill>{r}</Pill></div><div className="text-sm text-muted-foreground">Manager: {m}</div></Card>
      ))}
      <div className="grid grid-cols-2 gap-2"><FakeButton>Import CSV</FakeButton><FakeButton primary>Add person</FakeButton></div>
    </div>
  );
}

function Ocr() {
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">[ receipt photo ]</div>
        <div className="mt-3 text-sm font-semibold">Read from the receipt</div>
        <Row k="Merchant" v={<>Sate Khas Senayan <Pill tone="green">98%</Pill></>} />
        <Row k="Amount" v={<>Rp 450.000 <Pill tone="green">99%</Pill></>} />
        <Row k="Date" v={<>26 Sep 2026 <Pill tone="green">97%</Pill></>} />
        <Row k="Time" v={<>21:47 <Pill tone="amber">71%, please check</Pill></>} />
      </Card>
      <FakeButton primary>Use these values</FakeButton>
      <p className="text-xs text-muted-foreground">With the time read from the receipt, the off-hours check works on every claim (today it only works if the employee types the time).</p>
    </div>
  );
}

function HrisSync() {
  return (
    <div className="space-y-3">
      <Card><div className="text-sm font-semibold">Connected system (MOCK)</div><Row k="HRIS" v="Not chosen yet (depends on Ruangguru)" /><Row k="Last sync" v="-" /></Card>
      <Card>
        <div className="text-sm font-semibold">What would sync</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm"><li>In: employees, departments, managers</li><li>Out: approved claims to payroll / accounting</li></ul>
      </Card>
      <FakeButton primary>Connect</FakeButton>
    </div>
  );
}

function Analytics() {
  // Single series, one hue; values labeled on every bar so color is never the only cue. MOCK numbers.
  const data = [["Accommodation", 18.4], ["Client Entertainment", 11.2], ["Meals", 7.9], ["Transport", 5.1], ["Office Supplies", 2.6]] as const;
  const max = Math.max(...data.map((d) => d[1]));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[["Rp 45,2 jt", "Spend (Sep)"], ["2,1 days", "Avg audit time"], ["12%", "Flagged"]].map(([v, l]) => (
          <div key={l} className="rounded-xl border bg-background p-3 text-center"><div className="text-lg font-bold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
        ))}
      </div>
      <Card>
        <div className="text-sm font-semibold">Spend by category, Sep 2026 (Rp juta, MOCK)</div>
        <ul className="mt-3 space-y-2" aria-label="Spend by category">
          {data.map(([c, v]) => (
            <li key={c} className="text-sm">
              <div className="flex justify-between"><span>{c}</span><span className="tabular-nums text-muted-foreground">{v.toLocaleString("id-ID")}</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-[#3b5bdb]" style={{ width: `${(v / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </Card>
      <FakeButton>Download report</FakeButton>
    </div>
  );
}

const BODIES: Record<string, () => React.ReactNode> = {
  "manager-approval": ManagerApproval, escalation: Escalation, "status-tracker": StatusTracker, "budget-warning": BudgetWarning,
  notifications: Notifications, "audit-trail": AuditTrail, "users-admin": UsersAdmin, ocr: Ocr, "hris-sync": HrisSync, analytics: Analytics,
};

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSessionUser())) redirect("/login");
  const { slug } = await params;
  const p = PREVIEWS.find((x) => x.slug === slug);
  const Body = BODIES[slug];
  if (!p || !Body) notFound();
  return (
    <div className="space-y-4">
      <Link href="/preview" className="-ml-2 inline-flex h-11 items-center px-2 text-sm text-muted-foreground">← Coming next</Link>
      <div>
        <h1 className="text-xl font-semibold">{p.title}</h1>
        <p className="text-sm text-muted-foreground">{p.blurb} For: {p.who}.</p>
      </div>
      <PreviewBanner phase={p.phase} />
      <div aria-label="Preview mock-up" className="select-none"><Body /></div>
    </div>
  );
}
