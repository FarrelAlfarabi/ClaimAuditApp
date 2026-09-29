/** Features that are planned but NOT built. Shown as static mock screens, clearly labeled. Source: master-plan.md 2.2 and 2.3. */
export type Preview = {
  slug: string; title: string; titleId: string; who: "Finance" | "Employee" | "Manager" | "Admin"; phase: "Phase 1" | "Phase 2";
  blurb: string; blurbId: string;
};

export const PREVIEWS: Preview[] = [
  { slug: "manager-approval", title: "Manager approval inbox", titleId: "Kotak persetujuan manajer", who: "Manager", phase: "Phase 1",
    blurb: "Managers approve their team's claims in one tap before Finance sees them.", blurbId: "Manajer menyetujui klaim timnya dengan sekali ketuk sebelum sampai ke Keuangan." },
  { slug: "escalation", title: "High-value escalation", titleId: "Eskalasi nominal besar", who: "Manager", phase: "Phase 1",
    blurb: "Claims above a set amount go to a second approver automatically.", blurbId: "Klaim di atas nominal tertentu otomatis diteruskan ke penyetuju kedua." },
  { slug: "status-tracker", title: "Claim status tracker", titleId: "Pelacak status klaim", who: "Employee", phase: "Phase 1",
    blurb: "Employees see where each claim is, from submitted to paid.", blurbId: "Karyawan melihat posisi setiap klaim, dari diajukan sampai dibayar." },
  { slug: "budget-warning", title: "Budget warning while submitting", titleId: "Peringatan anggaran saat mengajukan", who: "Employee", phase: "Phase 1",
    blurb: "The form warns before an employee submits a claim over the limit.", blurbId: "Formulir memberi peringatan sebelum karyawan mengajukan klaim di atas batas." },
  { slug: "notifications", title: "Notifications", titleId: "Notifikasi", who: "Employee", phase: "Phase 1",
    blurb: "Email alerts when a claim needs approval, is approved, rejected or paid.", blurbId: "Email saat klaim perlu disetujui, disetujui, ditolak, atau dibayar." },
  { slug: "audit-trail", title: "Audit trail", titleId: "Jejak audit", who: "Finance", phase: "Phase 1",
    blurb: "Every decision and rule change, with who and when, that nobody can edit.", blurbId: "Setiap keputusan dan perubahan aturan, dengan siapa dan kapan, yang tidak bisa diubah siapa pun." },
  { slug: "users-admin", title: "Users and org import", titleId: "Pengguna dan impor struktur organisasi", who: "Admin", phase: "Phase 1",
    blurb: "Add people, set roles and managers, import the org chart from a spreadsheet.", blurbId: "Tambah orang, atur peran dan manajer, impor bagan organisasi dari spreadsheet." },
  { slug: "hris-sync", title: "HRIS / payroll sync", titleId: "Sinkronisasi HRIS / penggajian", who: "Admin", phase: "Phase 2",
    blurb: "Org data comes in, approved claims go out to payroll automatically.", blurbId: "Data organisasi masuk, klaim yang disetujui otomatis dikirim ke penggajian." },
  { slug: "analytics", title: "Spend analytics", titleId: "Analitik pengeluaran", who: "Finance", phase: "Phase 2",
    blurb: "Spend by category and department, trends, and audit turnaround time.", blurbId: "Pengeluaran per kategori dan departemen, tren, dan waktu proses audit." },
];
