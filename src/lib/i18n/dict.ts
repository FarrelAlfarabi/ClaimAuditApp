/**
 * UI strings in English and Bahasa Indonesia. Data the user typed (merchant, description) and MOCK names are not translated.
 * Indonesian strings run ~20-30% longer: layouts wrap instead of truncating.
 */
import type { RiskLevel, RuleId } from "../rules/engine";

export type Lang = "en" | "id";
export const LANGS: Lang[] = ["en", "id"];
export const LANG_COOKIE = "lang";
export const isLang = (v: unknown): v is Lang => v === "en" || v === "id";

type Status = "pending" | "approved" | "rejected";
type Who = "Finance" | "Employee" | "Manager" | "Admin";
type Sort = "risk" | "newest" | "oldest" | "amount_desc" | "amount_asc";

const en = {
  langName: "English",
  app: { name: "Claim Audit", mockTag: "DEMO · MOCK DATA", mock: "MOCK" },
  nav: { main: "Main", queue: "Queue", allClaims: "All claims", rules: "Rules", coming: "Coming", submit: "Submit", myClaims: "My claims" },
  menu: {
    open: "Account and display settings", signedInAs: "Signed in as", demoRole: "Demo role", language: "Language", theme: "Theme",
    system: "System", light: "Light", dark: "Dark", signOut: "Sign out", close: "Close",
  },
  role: { finance: "Finance", employee: "Employee" },
  risk: { High: "High", Medium: "Medium", Low: "Low" } as Record<RiskLevel, string>,
  riskFull: { High: "High risk", Medium: "Medium risk", Low: "Low risk" } as Record<RiskLevel, string>,
  status: { pending: "Pending", approved: "Approved", rejected: "Rejected" } as Record<Status, string>,
  who: { Finance: "Finance", Employee: "Employee", Manager: "Manager", Admin: "Admin" } as Record<Who, string>,
  category: {} as Record<string, string>, // English category names are the stored values
  rejectReason: {} as Record<string, string>,
  flag: {
    over_limit: "Over limit", near_limit: "Near limit", duplicate: "Duplicate", weekend: "Weekend", off_hours: "Off-hours", missing_receipt: "No receipt",
  } as Record<RuleId, string>,
  sort: { risk: "Riskiest first", newest: "Newest date", oldest: "Oldest date", amount_desc: "Highest amount", amount_asc: "Lowest amount" } as Record<Sort, string>,
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  daysLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  search: {
    label: "Search", clear: "Clear search",
    finance: "Search claim #, employee, merchant, reason…", mine: "Search merchant, category, claim #…",
  },
  filters: {
    button: "Filters", buttonAria: (n: number) => (n ? `Filters, ${n} active` : "Filters"), title: "Filter and sort",
    sortBy: "Sort by", risk: "Risk", flag: "Flag", status: "Audit status", category: "Category", dept: "Department (MOCK)",
    receipt: "Receipt", hasReceipt: "Has receipt", noReceipt: "No receipt", all: "All", date: "Transaction date",
    from: "From", to: "To", amount: "Amount (Rp)", min: "Min", max: "Max", clear: "Clear", show: "Show results",
    errMinMax: "Minimum amount is higher than maximum.", errDates: "Start date is after end date.",
    active: "Active filters", remove: (l: string) => `Remove filter ${l}`, clearAll: "Clear all",
    riskChip: (r: string) => `Risk: ${r}`, flagChip: (f: string) => `Flag: ${f}`, sortChip: (s: string) => `Sort: ${s}`,
    range: (a: string, b: string) => `${a} to ${b}`, any: "any",
  },
  queue: {
    title: "Audit queue", sub: "Riskiest first. Flags mean review, not reject.",
    count: (n: number, total: number) => `${n} of ${total} claims`, pending: (n: number) => `${n} pending`,
    tileAria: (r: string, n: number, on: boolean) => `${r}: ${n} claims${on ? ", filter on" : ""}`,
    export: "Export CSV", exportAria: (n: number) => `Export CSV of ${n} approved claims`,
    more: (n: number) => `+${n} more`, empty: "No claims match", emptyHint: "Try another word, or clear search and filters.",
    clear: "Clear search and filters",
  },
  batch: {
    noFlags: (n: number) => `${n} Low-risk claims have no flags`, approveAll: (n: number) => `Approve all ${n}`,
    approving: "Approving…", done: (n: number) => `Approved ${n} Low-risk claims.`,
    confirm: (n: number) => `Approve all ${n} pending Low-risk claims?`,
  },
  all: {
    title: "All claims", sub: "Every claim with its engine result. Tap a claim to open it.",
    mockLimits: "MOCK limits", hours: (s: string, e: string) => `Working hours: ${s} to ${e}`,
    col: { claim: "Claim", risk: "Risk", amount: "Amount", employee: "Employee (MOCK)", category: "Category", merchant: "Merchant", date: "Date", time: "Time", flags: "Flags", status: "Status" },
  },
  detail: {
    back: "Back to queue", claim: (n: number) => `Claim #${n}`,
    f: { employee: "Employee (MOCK)", dept: "Department (MOCK)", category: "Category", merchant: "Merchant", date: "Date", time: "Time", description: "Description", manager: "Manager status (MOCK)" },
    timeNone: "not entered", why: (s: number) => `Why it was flagged (score ${s})`, noHits: "No rule hits. Low risk.",
    flagNote: "A flag means “look closer”, not “reject”.",
  },
  decision: {
    approve: "Approve", reject: "Reject", saving: "Saving…", approved: "Approved", rejected: "Rejected",
    reason: "Reason", note: "Note", by: (x: string) => `By ${x}`, decided: "Decided",
    payout: "Payout queued for disbursement (Dicairkan). No money moves in this demo.",
    undo: "Undo", next: "Next pending claim", rejectTitle: "Reject: pick a standard reason", mockList: "MOCK list",
    legend: "Rejection reason", noteLabel: "Note to employee", optional: "(optional)", cancel: "Cancel", confirmReject: "Confirm reject",
  },
  receipt: {
    none: "No receipt attached", open: "Open receipt full screen", loading: "Loading receipt…", failed: "Receipt could not be loaded",
    zoom: "Tap to zoom", mock: "MOCK placeholder receipt", uploaded: "uploaded in demo", altMock: "Receipt (MOCK placeholder)",
    altUpload: "Uploaded receipt", altFull: "Receipt full size", close: "Close receipt",
  },
  rules: {
    title: "Audit rules", sub: "Saving re-scores every claim right away.", mockNote: "Placeholder values, not company policy.",
    limits: "Category limits per claim", near: "Near-limit warning", nearLabel: "Flag claims at or above this % of the limit",
    nearHint: "Between 50 and 100.", hours: "Working hours", start: "Start", end: "End",
    hoursHint: "Claims with a time outside these hours are flagged (WIB).",
    save: "Save rules", saving: "Saving…", saved: "Saved. The audit queue now uses these rules.",
    notSaved: "Not saved. Fix the fields marked in red.", reset: "Reset to defaults",
    confirmReset: "Reset all rules to the default example values?",
  },
  demo: {
    title: "Demo tools", body: "Restores the 80 seed claims, clears decisions, submitted claims, uploads and rule changes.",
    reset: "Reset demo data", resetting: "Resetting…", done: "Reset done", confirm: "Reset all demo data? This cannot be undone.",
  },
  submit: {
    title: "Submit a claim", sub: "Demo form. The audit engine checks it the moment you submit.",
    as: "Submitting as", linked: "MOCK employee linked to your login", asPick: "Submitting as (MOCK employee)",
    category: "Category", choose: "Choose…", merchant: "Merchant", amount: "Amount", date: "Date", time: "Time",
    optional: "(optional)", timeHint: "Needed for the off-hours check", description: "Description",
    limit: (x: string) => `Limit ${x} per claim`,
    photo: "Receipt photo", noPhoto: "No photo yet. Claims without a receipt are flagged.", photoAdded: "Photo added",
    selectedAlt: "Selected receipt", preparing: "Preparing…", change: "Change photo", take: "Take or choose photo", remove: "Remove",
    fix: "Please fix the fields marked below.", submitting: "Submitting…", button: "Submit claim",
    after: "You will see the rule check right after you submit.",
  },
  done: {
    submitted: (n: number) => `Claim #${n} submitted`, engine: "Audit engine result",
    reasons: (n: number) => `${n} reason${n > 1 ? "s" : ""} Finance will see`, noFlags: "No flags. Goes to the Low-risk pile.",
    flagNote: "Finance will look closer. A flag is not a rejection.", another: "Submit another",
  },
  my: {
    title: "My claims", sub: "Submitted in this demo. Status updates when Finance approves or rejects.",
    nothing: "Nothing submitted yet.", rejected: (r: string) => `Rejected: ${r}`, note: (n: string) => `Finance note: ${n}`,
    payout: "Payout queued (MOCK) · no money moves in this demo", waiting: "Waiting for Finance review",
  },
  login: {
    title: "Sign in", tagline: "Check expense claims faster. Riskiest first.", sub: "Demo accounts only. All data in this app is MOCK.",
    quick: "Quick demo sign-in", financeDesc: "Review, approve, export", employeeDesc: "Submit a claim with a receipt",
    orEmail: "or sign in with email", email: "Email", password: "Password", signingIn: "Signing in…",
    footer: "Demo only. Every person, merchant and amount is made up.",
  },
  coming: {
    title: "Coming next", sub: "Pictures of planned features, so you can see where this is going.",
    none: "Nothing on this tab works yet. Everything outside it is the working demo.",
    phase: { "Phase 1": "Phase 1 (after contract)", "Phase 2": "Phase 2 (later, separate contract)" } as Record<string, string>,
    phaseShort: { "Phase 1": "Phase 1", "Phase 2": "Phase 2" } as Record<string, string>,
    preview: "PREVIEW", forWho: (w: string) => `For: ${w}`, banner: "DEMO PREVIEW · NOT WORKING YET",
    bannerBody: (p: string) => `Picture of a planned feature (${p}). Buttons do nothing and all data is MOCK. Nothing here is saved.`,
    previewOnly: "Preview only: not working yet", srPreview: "(preview only, not working)", mockup: "Preview mock-up",
  },
  error: {
    title: "Something went wrong", body: "Usually a dropped connection. Your last action may not have been saved.",
    retry: "Try again", start: "Go to start",
    notFound: "Not found", notFoundBody: "This claim or page does not exist. It may have been removed by a demo reset.",
  },
  // Server-side messages (actions, validation)
  err: {
    network: "Could not save. Check the connection and try again; if it keeps failing, sign in again. Nothing was saved.",
    already: "This claim was already decided (maybe on another screen). Showing the saved decision.",
    pickReason: "Pick one of the listed reasons.",
    employee: "Choose who is submitting", category: "Choose a category",
    merchant: "Enter the shop or vendor name (2 to 80 characters)",
    amount: "Enter an amount between Rp 1.000 and Rp 1.000.000.000",
    date: "Choose the transaction date", future: "Date cannot be in the future",
    time: "Use HH:MM (24-hour), or leave empty", description: "Keep it under 200 characters",
    photoType: "Receipt must be a photo (JPG, PNG, WebP or GIF). On iPhone, use Most Compatible camera format.",
    photoSize: "Photo is larger than 8 MB. Take it again at a lower resolution.",
    unknownCategory: "Unknown category", limit: "Enter a whole amount between Rp 1.000 and Rp 1.000.000.000",
    pct: "Enter a percentage between 50 and 100", hhmm: "Use HH:MM (24-hour)", endAfter: "End must be after start",
    wrongLogin: "Email or password is wrong.", loginFailed: "Sign-in failed. Try again.",
    noRole: "This account has no role in the app. Ask Finance to set it up.",
    unreachable: "Cannot reach the login service. Check the internet connection. (Demo fallback: restart the server with AUTH_DISABLED=1.)",
    enterLogin: "Enter your email and password.", quickOff: "Quick sign-in is off.",
  },
  reason: {
    over: (amt: string, cat: string, lim: string, by: string) => `${amt} is over the ${cat} limit of ${lim} (by ${by}).`,
    near: (amt: string, pct: number, cat: string, lim: string) => `${amt} is ${pct}% of the ${cat} limit of ${lim}.`,
    dupData: (ids: string) => `same amount, date and merchant as claim ${ids}`,
    dupHash: (ids: string) => `identical receipt file as claim ${ids}`,
    dup: (parts: string) => `Possible duplicate: ${parts}.`,
    weekend: (day: string, date: string) => `Transaction on a ${day} (${date}).`,
    offHours: (t: string, s: string, e: string) => `Transaction at ${t}, outside working hours ${s} to ${e}.`,
    missing: "No receipt attached.",
  },
};

export type Dict = typeof en;

const id: Dict = {
  langName: "Bahasa Indonesia",
  app: { name: "Claim Audit", mockTag: "DEMO · DATA MOCK", mock: "MOCK" },
  nav: { main: "Utama", queue: "Antrean", allClaims: "Semua klaim", rules: "Aturan", coming: "Segera", submit: "Ajukan", myClaims: "Klaim saya" },
  menu: {
    open: "Pengaturan akun dan tampilan", signedInAs: "Masuk sebagai", demoRole: "Peran demo", language: "Bahasa", theme: "Tema",
    system: "Sistem", light: "Terang", dark: "Gelap", signOut: "Keluar", close: "Tutup",
  },
  role: { finance: "Keuangan", employee: "Karyawan" },
  risk: { High: "Tinggi", Medium: "Sedang", Low: "Rendah" },
  riskFull: { High: "Risiko tinggi", Medium: "Risiko sedang", Low: "Risiko rendah" },
  status: { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" },
  who: { Finance: "Keuangan", Employee: "Karyawan", Manager: "Manajer", Admin: "Admin" },
  category: {
    Meals: "Makan", Transport: "Transportasi", Accommodation: "Akomodasi", "Office Supplies": "Alat kantor", "Client Entertainment": "Jamuan klien",
  },
  rejectReason: {
    "Over category limit": "Melebihi batas kategori",
    "Duplicate claim": "Klaim duplikat",
    "Receipt missing or unreadable": "Struk tidak ada atau tidak terbaca",
    "Not a business expense": "Bukan biaya kerja",
    "Weekend or off-hours without justification": "Akhir pekan atau di luar jam kerja tanpa alasan",
    "Other (see note)": "Lainnya (lihat catatan)",
  },
  flag: {
    over_limit: "Lewat batas", near_limit: "Mendekati batas", duplicate: "Duplikat", weekend: "Akhir pekan", off_hours: "Di luar jam kerja", missing_receipt: "Tanpa struk",
  },
  sort: { risk: "Risiko tertinggi dulu", newest: "Tanggal terbaru", oldest: "Tanggal terlama", amount_desc: "Nominal tertinggi", amount_asc: "Nominal terendah" },
  days: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
  daysLong: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
  months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  search: {
    label: "Cari", clear: "Hapus pencarian",
    finance: "Cari klaim #, karyawan, merchant, alasan…", mine: "Cari merchant, kategori, klaim #…",
  },
  filters: {
    button: "Filter", buttonAria: (n) => (n ? `Filter, ${n} aktif` : "Filter"), title: "Filter dan urutan",
    sortBy: "Urutkan", risk: "Risiko", flag: "Tanda", status: "Status audit", category: "Kategori", dept: "Departemen (MOCK)",
    receipt: "Struk", hasReceipt: "Ada struk", noReceipt: "Tanpa struk", all: "Semua", date: "Tanggal transaksi",
    from: "Dari", to: "Sampai", amount: "Nominal (Rp)", min: "Min", max: "Maks", clear: "Hapus", show: "Tampilkan hasil",
    errMinMax: "Nominal minimum lebih besar dari maksimum.", errDates: "Tanggal mulai setelah tanggal akhir.",
    active: "Filter aktif", remove: (l) => `Hapus filter ${l}`, clearAll: "Hapus semua",
    riskChip: (r) => `Risiko: ${r}`, flagChip: (f) => `Tanda: ${f}`, sortChip: (s) => `Urutan: ${s}`,
    range: (a, b) => `${a} s/d ${b}`, any: "berapa pun",
  },
  queue: {
    title: "Antrean audit", sub: "Risiko tertinggi dulu. Tanda berarti perlu dicek, bukan ditolak.",
    count: (n, total) => `${n} dari ${total} klaim`, pending: (n) => `${n} menunggu`,
    tileAria: (r, n, on) => `${r}: ${n} klaim${on ? ", filter aktif" : ""}`,
    export: "Ekspor CSV", exportAria: (n) => `Ekspor CSV ${n} klaim yang disetujui`,
    more: (n) => `+${n} lagi`, empty: "Tidak ada klaim yang cocok", emptyHint: "Coba kata lain, atau hapus pencarian dan filter.",
    clear: "Hapus pencarian dan filter",
  },
  batch: {
    noFlags: (n) => `${n} klaim risiko rendah tanpa tanda`, approveAll: (n) => `Setujui semua ${n}`,
    approving: "Menyetujui…", done: (n) => `${n} klaim risiko rendah disetujui.`,
    confirm: (n) => `Setujui semua ${n} klaim risiko rendah yang menunggu?`,
  },
  all: {
    title: "Semua klaim", sub: "Semua klaim dengan hasil mesin audit. Ketuk klaim untuk membukanya.",
    mockLimits: "Batas MOCK", hours: (s, e) => `Jam kerja: ${s} sampai ${e}`,
    col: { claim: "Klaim", risk: "Risiko", amount: "Nominal", employee: "Karyawan (MOCK)", category: "Kategori", merchant: "Merchant", date: "Tanggal", time: "Waktu", flags: "Tanda", status: "Status" },
  },
  detail: {
    back: "Kembali ke antrean", claim: (n) => `Klaim #${n}`,
    f: { employee: "Karyawan (MOCK)", dept: "Departemen (MOCK)", category: "Kategori", merchant: "Merchant", date: "Tanggal", time: "Waktu", description: "Deskripsi", manager: "Status manajer (MOCK)" },
    timeNone: "tidak diisi", why: (s) => `Mengapa ditandai (skor ${s})`, noHits: "Tidak ada aturan yang terpicu. Risiko rendah.",
    flagNote: "Tanda berarti “cek lebih teliti”, bukan “tolak”.",
  },
  decision: {
    approve: "Setujui", reject: "Tolak", saving: "Menyimpan…", approved: "Disetujui", rejected: "Ditolak",
    reason: "Alasan", note: "Catatan", by: (x) => `Oleh ${x}`, decided: "Diputuskan",
    payout: "Pembayaran masuk antrean pencairan (Dicairkan). Tidak ada uang yang berpindah di demo ini.",
    undo: "Batalkan", next: "Klaim berikutnya", rejectTitle: "Tolak: pilih alasan standar", mockList: "Daftar MOCK",
    legend: "Alasan penolakan", noteLabel: "Catatan untuk karyawan", optional: "(opsional)", cancel: "Batal", confirmReject: "Konfirmasi tolak",
  },
  receipt: {
    none: "Tidak ada struk", open: "Buka struk layar penuh", loading: "Memuat struk…", failed: "Struk tidak bisa dimuat",
    zoom: "Ketuk untuk memperbesar", mock: "struk contoh MOCK", uploaded: "diunggah di demo", altMock: "Struk (contoh MOCK)",
    altUpload: "Struk yang diunggah", altFull: "Struk ukuran penuh", close: "Tutup struk",
  },
  rules: {
    title: "Aturan audit", sub: "Menyimpan langsung menghitung ulang skor semua klaim.", mockNote: "Nilai contoh, bukan kebijakan perusahaan.",
    limits: "Batas per klaim tiap kategori", near: "Peringatan mendekati batas", nearLabel: "Tandai klaim pada atau di atas % batas ini",
    nearHint: "Antara 50 dan 100.", hours: "Jam kerja", start: "Mulai", end: "Selesai",
    hoursHint: "Klaim dengan waktu di luar jam ini akan ditandai (WIB).",
    save: "Simpan aturan", saving: "Menyimpan…", saved: "Tersimpan. Antrean audit sekarang memakai aturan ini.",
    notSaved: "Belum tersimpan. Perbaiki kolom yang ditandai merah.", reset: "Kembalikan ke bawaan",
    confirmReset: "Kembalikan semua aturan ke nilai contoh bawaan?",
  },
  demo: {
    title: "Alat demo", body: "Mengembalikan 80 klaim awal, menghapus keputusan, klaim yang diajukan, unggahan, dan perubahan aturan.",
    reset: "Atur ulang data demo", resetting: "Mengatur ulang…", done: "Selesai diatur ulang", confirm: "Atur ulang semua data demo? Ini tidak bisa dibatalkan.",
  },
  submit: {
    title: "Ajukan klaim", sub: "Formulir demo. Mesin audit memeriksanya begitu Anda mengirim.",
    as: "Diajukan sebagai", linked: "karyawan MOCK yang terhubung ke akun Anda", asPick: "Diajukan sebagai (karyawan MOCK)",
    category: "Kategori", choose: "Pilih…", merchant: "Merchant", amount: "Nominal", date: "Tanggal", time: "Waktu",
    optional: "(opsional)", timeHint: "Diperlukan untuk cek di luar jam kerja", description: "Deskripsi",
    limit: (x) => `Batas ${x} per klaim`,
    photo: "Foto struk", noPhoto: "Belum ada foto. Klaim tanpa struk akan ditandai.", photoAdded: "Foto ditambahkan",
    selectedAlt: "Struk yang dipilih", preparing: "Menyiapkan…", change: "Ganti foto", take: "Ambil atau pilih foto", remove: "Hapus",
    fix: "Perbaiki kolom yang ditandai di bawah.", submitting: "Mengirim…", button: "Kirim klaim",
    after: "Hasil cek aturan langsung muncul setelah Anda mengirim.",
  },
  done: {
    submitted: (n) => `Klaim #${n} terkirim`, engine: "Hasil mesin audit",
    reasons: (n) => `${n} alasan yang akan dilihat Keuangan`, noFlags: "Tanpa tanda. Masuk kelompok risiko rendah.",
    flagNote: "Keuangan akan mengecek lebih teliti. Tanda bukan penolakan.", another: "Ajukan lagi",
  },
  my: {
    title: "Klaim saya", sub: "Diajukan di demo ini. Status berubah saat Keuangan menyetujui atau menolak.",
    nothing: "Belum ada yang diajukan.", rejected: (r) => `Ditolak: ${r}`, note: (n) => `Catatan Keuangan: ${n}`,
    payout: "Pembayaran diantrekan (MOCK) · tidak ada uang yang berpindah di demo ini", waiting: "Menunggu pemeriksaan Keuangan",
  },
  login: {
    title: "Masuk", tagline: "Periksa klaim biaya lebih cepat. Risiko tertinggi dulu.", sub: "Hanya akun demo. Semua data di aplikasi ini MOCK.",
    quick: "Masuk cepat demo", financeDesc: "Periksa, setujui, ekspor", employeeDesc: "Ajukan klaim dengan struk",
    orEmail: "atau masuk dengan email", email: "Email", password: "Kata sandi", signingIn: "Sedang masuk…",
    footer: "Khusus demo. Semua orang, merchant, dan nominal adalah rekaan.",
  },
  coming: {
    title: "Segera hadir", sub: "Gambaran fitur yang direncanakan, agar terlihat arah pengembangannya.",
    none: "Belum ada yang berfungsi di tab ini. Semua di luar tab ini adalah demo yang berfungsi.",
    phase: { "Phase 1": "Fase 1 (setelah kontrak)", "Phase 2": "Fase 2 (nanti, kontrak terpisah)" },
    phaseShort: { "Phase 1": "Fase 1", "Phase 2": "Fase 2" },
    preview: "PRATINJAU", forWho: (w) => `Untuk: ${w}`, banner: "PRATINJAU DEMO · BELUM BERFUNGSI",
    bannerBody: (p) => `Gambaran fitur yang direncanakan (${p}). Tombol tidak berfungsi dan semua data MOCK. Tidak ada yang disimpan.`,
    previewOnly: "Hanya pratinjau: belum berfungsi", srPreview: "(hanya pratinjau, belum berfungsi)", mockup: "Contoh tampilan pratinjau",
  },
  error: {
    title: "Terjadi kesalahan", body: "Biasanya karena koneksi terputus. Tindakan terakhir Anda mungkin belum tersimpan.",
    retry: "Coba lagi", start: "Ke halaman awal",
    notFound: "Tidak ditemukan", notFoundBody: "Klaim atau halaman ini tidak ada. Mungkin terhapus oleh atur ulang demo.",
  },
  err: {
    network: "Gagal menyimpan. Periksa koneksi lalu coba lagi; jika terus gagal, masuk ulang. Tidak ada yang tersimpan.",
    already: "Klaim ini sudah diputuskan (mungkin di layar lain). Menampilkan keputusan yang tersimpan.",
    pickReason: "Pilih salah satu alasan yang tersedia.",
    employee: "Pilih siapa yang mengajukan", category: "Pilih kategori",
    merchant: "Isi nama toko atau vendor (2 sampai 80 karakter)",
    amount: "Isi nominal antara Rp 1.000 dan Rp 1.000.000.000",
    date: "Pilih tanggal transaksi", future: "Tanggal tidak boleh di masa depan",
    time: "Gunakan JJ:MM (24 jam), atau kosongkan", description: "Maksimal 200 karakter",
    photoType: "Struk harus berupa foto (JPG, PNG, WebP, atau GIF). Di iPhone, pakai format kamera Paling Kompatibel.",
    photoSize: "Foto lebih dari 8 MB. Ambil ulang dengan resolusi lebih rendah.",
    unknownCategory: "Kategori tidak dikenal", limit: "Isi nominal bulat antara Rp 1.000 dan Rp 1.000.000.000",
    pct: "Isi persentase antara 50 dan 100", hhmm: "Gunakan JJ:MM (24 jam)", endAfter: "Jam selesai harus setelah jam mulai",
    wrongLogin: "Email atau kata sandi salah.", loginFailed: "Gagal masuk. Coba lagi.",
    noRole: "Akun ini belum punya peran di aplikasi. Minta Keuangan untuk mengaturnya.",
    unreachable: "Layanan masuk tidak bisa dihubungi. Periksa koneksi internet. (Cadangan demo: jalankan ulang server dengan AUTH_DISABLED=1.)",
    enterLogin: "Isi email dan kata sandi Anda.", quickOff: "Masuk cepat tidak aktif.",
  },
  reason: {
    over: (amt, cat, lim, by) => `${amt} melebihi batas ${cat} sebesar ${lim} (lebih ${by}).`,
    near: (amt, pct, cat, lim) => `${amt} adalah ${pct}% dari batas ${cat} sebesar ${lim}.`,
    dupData: (ids) => `nominal, tanggal, dan merchant sama dengan klaim ${ids}`,
    dupHash: (ids) => `file struk sama persis dengan klaim ${ids}`,
    dup: (parts) => `Kemungkinan duplikat: ${parts}.`,
    weekend: (day, date) => `Transaksi pada hari ${day} (${date}).`,
    offHours: (t, s, e) => `Transaksi pukul ${t}, di luar jam kerja ${s} sampai ${e}.`,
    missing: "Tidak ada struk.",
  },
};

export const DICTS: Record<Lang, Dict> = { en, id };
export const dictFor = (lang: Lang) => DICTS[lang];

/** Stored English category → label in the current language. */
export const catLabel = (t: Dict, c: string) => t.category[c] ?? c;
export const reasonLabel = (t: Dict, r: string) => t.rejectReason[r] ?? r;
