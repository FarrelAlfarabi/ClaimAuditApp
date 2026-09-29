import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PREVIEWS } from "@/lib/previews";
import { getSessionUser } from "@/lib/role";
import { getDict, getLang } from "@/lib/i18n/server";
import type { Dict, Lang } from "@/lib/i18n/dict";
import { FakeButton, PreviewBanner } from "@/components/preview-banner";
import { RiskBadge } from "@/components/risk-badge";
import { IconChevronLeft, IconSearch } from "@/components/icons";
import type { RiskLevel } from "@/lib/rules/engine";

export const dynamic = "force-dynamic";

/** Mock copy lives next to its screen: L(english, indonesian). */
type Ctx = { t: Dict; L: (en: string, id: string) => string };

const Card = ({ children }: { children: React.ReactNode }) => <div className="card p-4">{children}</div>;
const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-2 text-sm"><span className="text-muted-foreground">{k}</span><span className="text-right font-semibold">{v}</span></div>
);
const Pill = ({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "warn" | "ok" }) => {
  const c = { gray: "bg-card-2 text-ink-2", warn: "bg-[var(--risk-med-bg)] text-[var(--risk-med)]", ok: "bg-[var(--st-approved-bg)] text-[var(--st-approved)]" }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c}`}>{children}</span>;
};
const FakeSearch = ({ text }: { text: string }) => (
  <div className="input flex items-center gap-2 text-muted-foreground"><IconSearch />{text}</div>
);

function ManagerApproval({ t, L }: Ctx) {
  const items: [string, string, string, RiskLevel][] = [["Dewi Contoh", L("Transport · Gojek", "Transportasi · Gojek"), "Rp 85.000", "Low"], ["Fajar Contoh", L("Meals · Solaria", "Makan · Solaria"), "Rp 280.000", "Medium"], ["Gita Contoh", L("Accommodation · Ibis", "Akomodasi · Ibis"), "Rp 1.800.000", "High"]];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{L("Rina Mock (manager, MOCK) · 3 claims waiting for you", "Rina Mock (manajer, MOCK) · 3 klaim menunggu Anda")}</p>
      <FakeButton t={t}>{L("Approve all 3", "Setujui semua 3")}</FakeButton>
      {items.map(([n, what, amt, r]) => (
        <Card key={n}>
          <div className="flex items-center justify-between"><RiskBadge risk={r} /><span className="amount text-xl">{amt}</span></div>
          <div className="mt-2 font-bold">{n}</div>
          <div className="text-sm text-muted-foreground">{what}</div>
          <div className="mt-3 grid grid-cols-2 gap-2"><FakeButton t={t}>{t.decision.reject}</FakeButton><FakeButton t={t}>{t.decision.approve}</FakeButton></div>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground">{L("Also by email: a one-tap approve link that works without opening the app.", "Juga lewat email: tautan setujui sekali ketuk tanpa membuka aplikasi.")}</p>
    </div>
  );
}

function Escalation({ t, L }: Ctx) {
  return (
    <div className="space-y-3">
      <Card>
        <div className="text-sm font-extrabold">{L("Rule (MOCK)", "Aturan (MOCK)")}</div>
        <Row k={L("Claims above", "Klaim di atas")} v="Rp 5.000.000" />
        <Row k={L("Second approver", "Penyetuju kedua")} v={L("Head of Finance (MOCK)", "Kepala Keuangan (MOCK)")} />
        <Row k={L("If no answer in", "Jika tidak dijawab dalam")} v={L("2 working days → reminder", "2 hari kerja → pengingat")} />
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-2"><span className="font-bold">{L("Claim #1042 · Client Entertainment", "Klaim #1042 · Jamuan klien")}</span><Pill tone="warn">{L("Escalated", "Dieskalasi")}</Pill></div>
        <ol className="mt-3 space-y-2 border-l-2 pl-4 text-sm">
          <li>✓ {L("Manager approved · Budi Mock", "Disetujui manajer · Budi Mock")}</li>
          <li className="font-bold">● {L("Waiting: Head of Finance", "Menunggu: Kepala Keuangan")}</li>
          <li className="text-muted-foreground">○ {L("Finance audit", "Audit Keuangan")}</li>
        </ol>
      </Card>
      <FakeButton t={t}>{L("Change threshold", "Ubah ambang batas")}</FakeButton>
    </div>
  );
}

function StatusTracker({ L }: Ctx) {
  const steps = [[L("Submitted", "Diajukan"), "29 Sep, 09:12", true], [L("Manager approved", "Disetujui manajer"), "29 Sep, 10:40", true], [L("Finance audit", "Audit Keuangan"), L("In progress", "Sedang berjalan"), true], [L("Paid (Dicairkan)", "Dibayar (Dicairkan)"), L("Expected 5 Oct", "Perkiraan 5 Okt"), false]] as const;
  return (
    <Card>
      <div className="flex justify-between"><span className="font-bold">{L("Claim #81 · Meals", "Klaim #81 · Makan")}</span><span className="amount">Rp 450.000</span></div>
      <ol className="mt-4 space-y-4">
        {steps.map(([s, when, done], i) => (
          <li key={s} className="flex gap-3">
            <span aria-hidden className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${done ? (i === 2 ? "border-[var(--risk-med)] bg-[var(--risk-med-bg)]" : "border-[var(--st-approved)] bg-[var(--st-approved)]") : "border-border-strong"}`} />
            <div><div className="text-sm font-bold">{s}</div><div className="text-xs text-muted-foreground">{when}</div></div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function BudgetWarning({ t, L }: Ctx) {
  return (
    <div className="space-y-3">
      <Card>
        <Row k={t.submit.category} v={L("Meals", "Makan")} />
        <Row k={t.submit.amount} v="Rp 450.000" />
        <div className="banner mt-2 border border-[var(--risk-med-bd)] bg-[var(--risk-med-bg)] text-[var(--risk-med)]">
          <span><b>{L("Over the Meals limit (Rp 300.000).", "Melebihi batas Makan (Rp 300.000).")}</b> {L("You can still submit, but add a reason. Finance will review it.", "Anda tetap bisa mengajukan, tetapi tambahkan alasan. Keuangan akan memeriksanya.")}</span>
        </div>
        <div className="input mt-3 flex items-center text-sm text-muted-foreground">{L("Reason for going over the limit…", "Alasan melebihi batas…")}</div>
      </Card>
      <FakeButton t={t}>{L("Submit anyway", "Tetap ajukan")}</FakeButton>
    </div>
  );
}

function Notifications({ L }: Ctx) {
  const n = [[L("Claim needs your approval", "Klaim perlu persetujuan Anda"), "Fajar Contoh · Rp 280.000", L("2 min ago", "2 menit lalu")], [L("Claim approved", "Klaim disetujui"), L("Your Meals claim #81", "Klaim Makan Anda #81"), L("1 h ago", "1 jam lalu")], [L("Claim rejected", "Klaim ditolak"), L("Transport #77: receipt unreadable", "Transportasi #77: struk tidak terbaca"), L("Yesterday", "Kemarin")], [L("Paid (Dicairkan)", "Dibayar (Dicairkan)"), L("Rp 1.250.000 to your account", "Rp 1.250.000 ke rekening Anda"), L("Mon", "Sen")]];
  return (
    <div className="space-y-3">
      {n.map(([title, d, w]) => (
        <Card key={title}><div className="flex justify-between gap-2"><span className="text-sm font-bold">{title}</span><span className="text-xs text-muted-foreground">{w}</span></div><div className="text-sm text-muted-foreground">{d}</div></Card>
      ))}
      <Card><div className="text-sm font-extrabold">{L("Send me", "Kirimi saya")}</div><Row k="Email" v={L("On", "Aktif")} /><Row k={L("Phone notifications", "Notifikasi ponsel")} v={L("Off", "Nonaktif")} /></Card>
    </div>
  );
}

function AuditTrail({ t, L }: Ctx) {
  const rows = [["29 Sep 14:02", "finance.demo", L("Rejected claim #8", "Menolak klaim #8"), L("Over category limit", "Melebihi batas kategori")], ["29 Sep 13:55", "finance.demo", L("Changed Meals limit", "Mengubah batas Makan"), "300.000 → 350.000"], ["29 Sep 13:40", "finance.demo", L("Batch approved", "Setujui massal"), L("60 Low-risk claims", "60 klaim risiko rendah")], ["29 Sep 11:20", "admin.demo", L("Added user", "Menambah pengguna"), "Intan Contoh"]];
  return (
    <div className="space-y-3">
      <FakeSearch text={L("Search who, what, claim #…", "Cari siapa, apa, klaim #…")} />
      {rows.map(([when, u, a, d]) => (
        <Card key={when + a}><div className="flex justify-between gap-2 text-sm"><span className="font-bold">{a}</span><span className="text-xs text-muted-foreground">{when}</span></div><div className="text-sm text-muted-foreground">{d} · {L("by", "oleh")} {u}</div></Card>
      ))}
      <p className="text-xs text-muted-foreground">{L("Entries cannot be edited or deleted. Export for external auditors.", "Catatan tidak bisa diubah atau dihapus. Ekspor untuk auditor eksternal.")}</p>
      <FakeButton t={t}>{L("Export audit trail", "Ekspor jejak audit")}</FakeButton>
    </div>
  );
}

function UsersAdmin({ t, L }: Ctx) {
  const u = [["Andi Contoh", t.role.employee, "Rina Mock"], ["Rina Mock", t.who.Manager, L("Head of Ops", "Kepala Operasional")], ["Finance Demo", t.role.finance, "-"]];
  return (
    <div className="space-y-3">
      <FakeSearch text={L("Search people…", "Cari orang…")} />
      {u.map(([n, r, m]) => (
        <Card key={n}><div className="flex justify-between"><span className="font-bold">{n}</span><Pill>{r}</Pill></div><div className="text-sm text-muted-foreground">{L("Manager", "Manajer")}: {m}</div></Card>
      ))}
      <div className="grid grid-cols-2 gap-2"><FakeButton t={t}>{L("Import CSV", "Impor CSV")}</FakeButton><FakeButton t={t}>{L("Add person", "Tambah orang")}</FakeButton></div>
    </div>
  );
}

function Ocr({ t, L }: Ctx) {
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex h-32 items-center justify-center rounded-xl bg-card-2 text-sm text-muted-foreground">[ {L("receipt photo", "foto struk")} ]</div>
        <div className="mt-3 text-sm font-extrabold">{L("Read from the receipt", "Terbaca dari struk")}</div>
        <Row k={t.submit.merchant} v={<>Sate Khas Senayan <Pill tone="ok">98%</Pill></>} />
        <Row k={t.submit.amount} v={<>Rp 450.000 <Pill tone="ok">99%</Pill></>} />
        <Row k={t.submit.date} v={<>26 Sep 2026 <Pill tone="ok">97%</Pill></>} />
        <Row k={t.submit.time} v={<>21:47 <Pill tone="warn">{L("71%, please check", "71%, mohon dicek")}</Pill></>} />
      </Card>
      <FakeButton t={t}>{L("Use these values", "Pakai nilai ini")}</FakeButton>
      <p className="text-xs text-muted-foreground">{L("With the time read from the receipt, the off-hours check works on every claim (today it only works if the employee types the time).", "Dengan waktu terbaca dari struk, cek di luar jam kerja berlaku untuk semua klaim (saat ini hanya jika karyawan mengetik waktunya).")}</p>
    </div>
  );
}

function HrisSync({ t, L }: Ctx) {
  return (
    <div className="space-y-3">
      <Card><div className="text-sm font-extrabold">{L("Connected system (MOCK)", "Sistem terhubung (MOCK)")}</div><Row k="HRIS" v={L("Not chosen yet (depends on Ruangguru)", "Belum dipilih (tergantung Ruangguru)")} /><Row k={L("Last sync", "Sinkron terakhir")} v="-" /></Card>
      <Card>
        <div className="text-sm font-extrabold">{L("What would sync", "Yang akan disinkronkan")}</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>{L("In: employees, departments, managers", "Masuk: karyawan, departemen, manajer")}</li>
          <li>{L("Out: approved claims to payroll / accounting", "Keluar: klaim yang disetujui ke penggajian / akuntansi")}</li>
        </ul>
      </Card>
      <FakeButton t={t}>{L("Connect", "Hubungkan")}</FakeButton>
    </div>
  );
}

function Analytics({ t, L }: Ctx) {
  // Single series, one hue; values labeled on every bar so color is never the only cue. MOCK numbers.
  const data = [["Accommodation", 18.4], ["Client Entertainment", 11.2], ["Meals", 7.9], ["Transport", 5.1], ["Office Supplies", 2.6]] as const;
  const max = Math.max(...data.map((d) => d[1]));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[["Rp 45,2 jt", L("Spend (Sep)", "Belanja (Sep)")], [L("2,1 days", "2,1 hari"), L("Avg audit time", "Rata-rata waktu audit")], ["12%", L("Flagged", "Ditandai")]].map(([v, l]) => (
          <div key={l} className="card p-3 text-center"><div className="text-lg font-extrabold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
        ))}
      </div>
      <Card>
        <div className="text-sm font-extrabold">{L("Spend by category, Sep 2026 (Rp juta, MOCK)", "Belanja per kategori, Sep 2026 (Rp juta, MOCK)")}</div>
        <ul className="mt-3 space-y-2" aria-label={L("Spend by category", "Belanja per kategori")}>
          {data.map(([c, v]) => (
            <li key={c} className="text-sm">
              <div className="flex justify-between"><span>{t.category[c] ?? c}</span><span className="num text-muted-foreground">{v.toLocaleString("id-ID")}</span></div>
              <div className="mt-1 h-2 rounded-full bg-card-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </Card>
      <FakeButton t={t}>{L("Download report", "Unduh laporan")}</FakeButton>
    </div>
  );
}

const BODIES: Record<string, (c: Ctx) => React.ReactNode> = {
  "manager-approval": ManagerApproval, escalation: Escalation, "status-tracker": StatusTracker, "budget-warning": BudgetWarning,
  notifications: Notifications, "audit-trail": AuditTrail, "users-admin": UsersAdmin, ocr: Ocr, "hris-sync": HrisSync, analytics: Analytics,
};

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSessionUser())) redirect("/login");
  const { slug } = await params;
  const [t, lang] = await Promise.all([getDict(), getLang()]);
  const p = PREVIEWS.find((x) => x.slug === slug);
  const Body = BODIES[slug];
  if (!p || !Body) notFound();
  const L = (en: string, id: string) => ((lang as Lang) === "id" ? id : en);
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/preview" className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-[15px] font-bold text-primary-ink no-underline">
        <IconChevronLeft />{t.coming.title}
      </Link>
      {/* Dashed amber frame around the whole mock screen, banner on top: impossible to mistake for the working app. */}
      <section aria-label={t.coming.mockup} className="overflow-hidden rounded-[20px] border-[3px] border-dashed border-[var(--preview-bd)] bg-card">
        <div className="rounded-none border-0 border-b-[3px] border-dashed border-[var(--preview-bd)]">
          <PreviewBanner phase={p.phase} t={t} />
        </div>
        <div className="space-y-4 p-4">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight">{lang === "id" ? p.titleId : p.title}</h1>
            <p className="text-sm text-muted-foreground">{lang === "id" ? p.blurbId : p.blurb} {t.coming.forWho(t.who[p.who])}.</p>
          </div>
          <div className="select-none"><Body t={t} L={L} /></div>
        </div>
      </section>
    </div>
  );
}
