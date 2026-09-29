# Master Plan: Ruangguru Claim Audit App

**Version:** 2.4
**Date:** 29 Sep 2026 (Tue)
**Owner:** Farrel
**Demo:** Wed 30 Sep 2026, time TBC (see OQ-01)
**Status of this document:** source of truth for scope, stages, money, decisions and open questions for the Ruangguru deal. Every change bumps the version and adds a decision log row in the same commit.

**What changed in v2.4:** scope change on Tue 29 Sep, before the Tue 23:00 freeze: real login (Supabase Auth, email + password, two MOCK demo accounts) is now part of the Wednesday demo, replacing the role switcher; roles are enforced on the server; decisions record who made them; MOCK payout status and a home-screen icon were added; S7 prep done (backup video recorded, runbook updated). Claims data stays in local SQLite for Wednesday. Changed: 2.1, 3, 4.4, 5.1, 6.2 (OQ-09, OQ-26), 7, 8.

**What changed in v2.3:** corrections after S0 to S6 were built (all merged to `main` at commit 999dfeb, Tue 29 Sep). (1) The v2.1 claim "no stage had started by Mon 14:53" was wrong: S0 and S1 were already committed on a build branch that had not been merged to `main`, so the log on `main` looked empty. 4.1 is corrected. (2) 5.1 said no Vercel deploy; a Vercel preview and production project now exist, for read-only viewing. (3) 4.3 cut order updated: S4 and everything above it were built, so nothing was cut; OQ-24 is moot. Added: 4.4 build status. Changed: 4.1, 4.3, 4.4 (new), 5.1, 6.2 (OQ-24), 7, 8. No change to scope, effort, price or the Wednesday goal.

**What changed in v2.2:** Finance uses both phone and desktop, so the Finance screens get a full desktop layout as well as the phone layout (OQ-25 closed). Changed: 2.2, 3, 4.2 (S6), 5.4, 6.2, 7, 8. Effort and price unchanged: v2.1 already counted both layouts.

**What changed in v2.1:** the app is mobile-first for every role, Finance included, and Wednesday's demo runs entirely on a phone. Changed: 2.1, 2.2, 3, 4 (re-timed, build had not started by Mon 14:53), 5.1, 5.4, 6, 7, 8, 9, 12.1, 12.2, 12.5, 12.7.

**What changed in v2.0:** the plan now covers the whole Ruangguru deal, not only Wednesday. Added: the deal at a glance (10), business stages with exit criteria and payment points (10), production tech stack (5.4), commercial terms and change control (11), financials (12), growth within Ruangguru (13), dependencies on Ruangguru (14), review cadence (15), sources (16). Sections 1 to 9 keep their old numbers so links from Notion, Drive and other threads still work. The Wednesday sprint plan (section 4) is unchanged.

Related: PRD v0.1 (Claude Doc, 28 Sep 2026, Indonesian, stakeholder-facing). Written before the deadline and scope decision. Where it differs from this plan, this plan wins until the PRD is revised (see section 9).

**Contents:** 1 Goals · 2 Scope · 3 Users and roles · 4 Wednesday milestones · 5 Tech decisions · 6 Assumptions and open questions · 7 Risks · 8 Decision log · 9 PRD discrepancies · 10 Deal and stages · 11 Commercial terms and change control · 12 Financials · 13 Growth within Ruangguru · 14 Dependencies on Ruangguru · 15 Review cadence · 16 Sources

---

## 1. Goals

### 1.1 Goal for Wednesday (what the demo must prove)

One sentence: **"Give it a pile of claims and it tells Finance which ones to look at first, and why."**

The financial lead should leave the room believing three things:

1. The system catches the claims a human auditor would want to catch (over the category limit, duplicate receipt, weekend or off-hours spend), automatically, with a plain reason attached to each flag.
2. A Finance auditor can work a risk-sorted queue faster than today's one-by-one manual check.
3. The rules are adjustable by Finance (limits, working hours), so the tool can be tuned to Ruangguru's real policy instead of Farrel's guesses.

Farrel should leave the room with: the answers to OQ-01, OQ-02, OQ-12, OQ-13 and OQ-14, and an agreed next step (Stage 1 discovery, section 10). **No price is quoted on Wednesday** (see D-row 2026-09-28 in section 8): the numbers that drive the price are still unknown.

The demo must NOT imply the whole Phase 1 system works. Everything mocked is labeled as such on screen.

### 1.2 Longer-term goals

- **Product:** replace Ruangguru's manual reimbursement audit with a system where employees submit, managers approve in one click, and Finance audits by exception (only the risky claims get human attention).
- **Deal:** a signed, paid Phase 1 with Ruangguru, delivered on the agreed dates, followed by a paid maintenance retainer and a separate Phase 2 contract. The deal only counts as good if Farrel's effective hourly rate (money received divided by hours actually spent) stays at or above the rate he priced at (section 12).

### 1.3 Success metrics

**Product (Phase 1 go-live, targets set after baselines are known):**

| Metric | How measured | Baseline |
|---|---|---|
| Finance audit time per claim | minutes, before vs. after | Unknown, OQ-07 |
| Share of claims cleared as Low risk without manual review | % of monthly claims | New |
| Flagged claims confirmed as real issues (precision) | % of High/Medium flags Finance agrees with | New |
| Submission to payout time | days | Unknown, OQ-07 |
| Employee status queries to Finance | count per month | Unknown, OQ-07 |

No target numbers are set until Ruangguru gives baselines. Do not quote targets to stakeholders before then.

**Deal (Farrel's own numbers, tracked in progress-log.md from Stage 1):**

| Metric | Target |
|---|---|
| Signed SOW and down payment received | Before any Phase 1 code (Stage 1 exit) |
| Effective hourly rate | At or above the priced rate (section 12.2) |
| Hours spent vs. estimate | Within the estimate range; over the high end triggers a change request review |
| Invoices paid on time | Every milestone invoice paid within the agreed term (OQ-15) |
| Milestones delivered on the agreed date | All, or slipped only with a written change |

---

## 2. Scope

### 2.1 Wednesday demo: real vs. mocked

**The whole demo runs on a phone** (decision log, 28 Sep). Every screen is designed for a phone first (about 390px wide) and still works on a laptop. On a phone, "split view" means the receipt and the claim data stacked on one screen, with tap-to-zoom on the receipt.

**Real (built end-to-end, real logic):**

- **Module A: Rules and audit engine.** Runs on every claim, produces rule hits with plain-language reasons and a Low/Medium/High risk label. Config-driven (limits and hours in one config file / settings screen), not hardcoded.
  - Category limit check (over limit, and near limit at 80% or more)
  - Duplicate detection by data match: same amount + same transaction date + same normalized merchant, across all employees; plus exact file-hash match if a receipt file is attached
  - Weekend transaction flag (date only)
  - Off-hours flag (only when a transaction time is entered, see A-04)
  - Missing receipt flag
  - Risk score from the rule hits (scoring table in 5.3)
- **Module B: Finance audit dashboard (thin, but real).**
  - Risk-sorted central queue as a list of cards (one claim per card, risk badge first), with filters (risk level, category, department, status)
  - Claim detail: receipt image and employee input on one screen (stacked on phone, side by side on laptop), plus the list of rule hits and reasons
  - Approve / reject with standard rejection reasons
  - Batch approve all Low-risk claims
  - Export verified claims to CSV (opens in Excel)

**Demo harness (real code, but not the Phase 1 product):**

- Minimal "submit a claim" form that writes a claim and runs the engine live, so the audience can see a bad claim land as High risk in real time. No login, no mobile app, no real file storage policy.
- Login (v2.4): Supabase Auth, email + password, two MOCK demo accounts (Finance, Employee) with a demo-only one-tap sign-in on the laptop. Role comes from the account and is checked on the server for every page and action. Kill switch `AUTH_DISABLED=1` falls back to the old Employee / Finance switcher if there is no internet.
- Decisions record the Finance user and time; CSV export has an "Audited by" column.
- "Reset demo data" button.

**Mocked (seed data only, labeled "MOCK" in UI and code):**

- Employees, departments, org hierarchy (fictional names, fictional structure)
- Category limits and working hours (placeholder values, labeled "contoh, bukan kebijakan Ruangguru")
- Manager approval: seed claims arrive with a fake "approved by manager" status. No manager screens, no routing, no escalation, no notifications
- Payout status ("Dicairkan")
- Everything in Phase 2

**Explicitly out for Wednesday:** real user management (sign-up, password reset, SSO, admin screens for users), mobile app, manager approval flow, hierarchy routing, high-value escalation, notifications, budget warning during submission, employee status tracker, OCR, HRIS/ERP sync, analytics, deployment to Ruangguru infrastructure.

### 2.2 Full Phase 1 (after Wednesday, sized in Stage 1)

From PRD v0.1, section 2, plus what production needs:

1. Employee submission: receipt upload (phone camera), claim form, instant budget warning, visual status tracker.
   **The whole app, for every role (employee, manager, Finance, admin), is a mobile-first web app:** designed for the phone first, opens in the phone browser, can be pinned to the home screen (PWA), and still works on a laptop. Not a native store app (D-08, section 5.4).
2. Rules and audit engine: productionize Module A with Ruangguru's real policy (OQ-04, OQ-05).
3. Manager approval: 1-click approve, automatic hierarchy routing, high-value escalation, standard rejection reasons (OQ-06).
4. Finance audit dashboard: productionize Module B with two equal layouts. **Desktop:** table queue, receipt side by side with claim data, batch approve, export. **Phone:** card queue, stacked claim detail with tap-to-zoom, batch approve and export from the phone. Finance uses both (OQ-25).
5. Added by this plan (not in PRD v0.1): login and roles, Admin settings for rules and users, audit trail of who changed what, org data import by CSV (since HRIS sync is Phase 2), backups.

Effort estimate per item: section 12.1.

### 2.3 Phase 2 (separate contract, after Phase 1 is stable)

- AI OCR extraction from receipts
- Two-way HRIS / ERP sync (org data in, approved claims out to payroll/accounting). Effort cannot be sized until the system is known (OQ-08).
- Analytics: spend trends, audit turnaround time

### 2.4 Out of scope for this deal (unless a change request adds it)

- Paying employees (the app records "paid" status; money moves in Ruangguru's existing process)
- Corporate cards, cash advances, business travel booking, procurement
- Native iOS / Android apps
- Running the system on Ruangguru's own servers (priced separately if OQ-09 requires it)

---

## 3. Users and roles

| Role | Wednesday demo | Phase 1 |
|---|---|---|
| Employee | Demo login (MOCK account linked to one MOCK employee), submit form, own claims list | Submits claims, tracks status |
| Manager | Mocked (status in seed data) | Approves/rejects own team, escalation above threshold |
| Finance Auditor | **Real** (Module B), demo login | Works the risk queue, approves/rejects, exports |
| Admin | Rules config file / simple settings screen, no user management | Manages rules, categories, limits, users, org data import |

Note: PRD v0.1 lists only three users and has no Admin. See discrepancy D-01.

Employees and managers use the app on the phone first; laptop works but is not the main target. Finance uses both phone and desktop, so Finance screens are designed for both, with desktop as the main place for heavy audit work.

Commercial roles (who Farrel deals with) are in section 10.1.

---

## 4. Milestones for Wednesday (Mon 28 Sep to Wed 30 Sep)

Stages after Wednesday are in section 10.

### 4.1 Time budget: the real constraint

OQ-00 answered: day job is low effort, projects are infrequent. Daytime hours Mon and Tue are usable, not just evenings. Revised budget:

v2.1 re-timing (corrected in v2.3): v2.1 said that as of Mon 14:53 no stage had started because progress-log.md on `main` was empty. That was wrong: S0 and S1 were already committed on a build branch (not yet merged to `main`), so the plan under-counted progress by about 4.5 hours of stage time. The phone-only demo adds about 1.5 hours (card layouts, stacked detail, phone-to-laptop connection and screen mirroring). The hours below are the plan's budget; hours actually spent are not recorded anywhere and cannot be read from the repo.

- Mon: 6h (from about 15:00)
- Tue: **8h** (was 7h; the extra hour pays for the phone-only demo; pending Farrel's confirmation, OQ-24)
- Wed early morning before the demo: about 2h, for rehearsal and fixes only
- **Total: about 16h** (14h build + 2h rehearsal). Buffer was 1h. As of v2.3, S0 to S6 are built (4.4), so the Tuesday-hours risk behind OQ-24 has passed. No new features after Tue 23:00.

### 4.2 Stage plan (one commit per stage, review between stages)

Every screen is built at phone width (about 390px) first, then checked on a laptop.

| # | When | Stage | Est. | Done when |
|---|---|---|---|---|
| S0 | Mon 15:00 to 17:00 | Scaffold (Next.js, SQLite), data model, seed script: ~80 claims, 3 departments, planted problems (4 over-limit, 3 duplicate pairs, 5 weekend, 3 off-hours, 2 missing receipt), placeholder receipt images; phone layout shell (top bar, bottom tabs) | 2h | Raw claim list shows on a phone opening the laptop's address |
| S1 | Mon 17:00 to 20:00 (with break) | Module A: rules engine + `rules.config` + tests that assert every planted problem is caught and clean claims stay Low | 2.5h | Tests pass on seed data |
| S2 | Mon evening (1.5h) + Tue AM (1.5h) | Module B part 1: risk-sorted queue as phone cards, filters in a bottom sheet, claim detail with receipt stacked above rule reasons and tap-to-zoom | 3h | On a phone, auditor finds and opens any flagged claim in 2 taps |
| S3 | Tue late morning | Module B part 2: approve/reject with standard reasons, batch approve Low, CSV export (downloads on the phone) | 2h | Batch approve works on phone; exported CSV opens cleanly in Excel |
| S4 | Tue early afternoon | Settings screen for rules config (limits, hours), usable on a phone | 1.5h | A limit changed on the phone changes a claim's risk without touching code |
| S5 | Tue afternoon | Demo harness: submit form with camera or gallery upload (engine runs live), role switcher, MOCK labels everywhere, reset button; phone connects to the laptop over the phone's own hotspot; screen mirroring to laptop tested | 2h | A weekend over-limit claim submitted from the phone shows as High with 2 reasons, visible on the mirrored screen |
| S6 | Tue evening | Buffer for slippage from S0 to S5; if none, polish (loading and empty states, tap targets, error messages), then check the Finance queue and claim detail at laptop width | 1h | No open bugs from earlier stages |
| S7 | Wed early | Demo script, 2 full rehearsals on the phone, fix only demo-breaking bugs, record a backup screen video from the phone | 2h | Full run in under 10 min on the phone, backup video saved |

### 4.3 Cut order if behind (cut from the top)

Status at v2.3: nothing on this list was cut. It now applies only to **demo-day fallbacks** (a feature that breaks on the day is hidden, not fixed live), in the same order.

1. Polish (S6)
2. Settings screen (S4): fall back to showing the config file on the laptop and saying so
3. Batch approve Low risk
4. Receipt image in claim detail (show text fields only)
5. CSV export
6. Live submit form (fall back to seed data only)

Never cut: engine + reasons + risk-sorted queue + claim detail, on the phone. That is the demo.

**Hard stop:** no new features after Tue 23:00. Wednesday morning is rehearsal only.

### 4.4 Build status (v2.3, Tue 29 Sep)

Source of truth for each stage's detail is progress-log.md; QA findings are in docs/qa-audit.md; the demo script is docs/demo-runbook.md.

| Stage | Status | Note |
|---|---|---|
| S0 | Built, merged to `main` | "Done when" (raw list on a phone via the laptop's address) checked only in a phone-size desktop browser, not on a real phone |
| S1 | Built, merged | 16 engine tests pass; every planted problem caught, no false flags on the 60 clean claims |
| S2 | Built, merged | Card queue, bottom-sheet filters, stacked detail |
| S3 | Built, merged | Approve, reject with standard reasons, undo, batch approve Low, CSV export |
| S4 | Built, merged | Settings screen (limits, near-limit %, hours) applied live |
| S5 | Built, merged | Submit form with photo, role switcher, reset. **Phone hotspot and mirroring not yet tested on a real phone (OQ-23)** |
| S6 | Built (used for a QA and UX audit), merged | Offline-safe actions, double-submit lock, decision conflicts, dialog accessibility, 44 px touch targets |
| S7 | Prep done (v2.4); rehearsals not done | Backup video (62 s, phone size, captions) recorded by Claude against a local login stand-in; runbook updated for login. Still needs Farrel's phone: hotspot test, first real sign-in, 2 rehearsals |
| Login (v2.4) | Built, **not yet on `main`** until Farrel says so | Tested against a local stand-in for Supabase; first real sign-in against the Supabase project not yet done |

Open risks that can still break Wednesday: first real Supabase sign-in untested; login needs internet for the whole demo; real-phone hotspot and mirroring (OQ-23), OQ-01 (demo time and format), OQ-02 (what Wednesday must decide). CSV download and photo upload on a real iPhone are untested.

**Showing a phone to a room (fallbacks, in order):** mirror the phone to the laptop and share or project the laptop screen (method depends on the phone, OQ-23) → if mirroring fails, the laptop browser in phone-size view (Chrome device mode) → if the app fails, the backup video.

---

## 5. Tech decisions

### 5.1 to 5.2 Demo stack (Wednesday)

Picked for speed with Farrel's existing React/Vercel experience.

| Area | Decision | Trade-off |
|---|---|---|
| App | Next.js (App Router) + TypeScript | One codebase for UI and API routes. Heavier than a pure SPA but no separate backend. |
| UI | Tailwind + shadcn/ui, phone-first layouts (cards, bottom sheets, bottom tabs) | Fast, clean components. Tables become cards on phones; more layout work than a desktop table. |
| Data | SQLite via better-sqlite3, seed script | Zero setup. Vercel's file system is read-only, so on Vercel the app copies the database to a temporary folder: approvals, uploads and rule changes there vanish within minutes and are not shared between server instances. A Vercel preview and production project exist (v2.3) for looking at the screens only; they are not the demo machine. Replaced by Postgres in Phase 1 (5.4). |
| Receipts | Static placeholder images in `/public/mock-receipts` for seed claims; photos uploaded through the demo submit form are saved on the laptop's disk (`data/uploads`), named by their SHA-256 hash so an identical file triggers the file-hash duplicate rule | Demo only: no retention policy, no access control. Real storage is a Phase 1 decision (5.4). |
| Engine | Pure TypeScript functions, input = claim + config, output = rule hits + score | Easy to unit test; carries into Phase 1 unchanged. |
| Config | `rules.config.json` (limits per category, near-limit %, working hours, score weights) | Editable without code change. No audit trail of config changes yet. |
| Demo delivery | App runs on Farrel's laptop; the phone opens it over the phone's own hotspot (laptop joins the hotspot); phone screen mirrored to the laptop for the audience | No venue Wi-Fi and no deploy needed. Run with `npm run demo` (production build; `npm run dev` recompiles pages on first visit and is slower). Run `npm run seed` once beforehand; restarting `npm run dev` or re-seeding wipes all demo data. Adds a phone-to-laptop link that has still not been tested on a real phone (OQ-23). Backups: Chrome phone-size view, then recorded video. |
| Auth | Supabase Auth (project `ruangguru-claim-audit-demo`, Singapore region, free plan), email + password, roles in `app_metadata`; kill switch back to the role switcher | Needs internet for every page load while login is on. Only login lives in Supabase; claims data stays in local SQLite. Two MOCK accounts, no real people. Region choice is not a decision for Phase 1 (OQ-09). |

### 5.3 Risk scoring (placeholder, config-driven)

| Rule hit | Points |
|---|---|
| Over category limit | 3 |
| Duplicate (data match or file hash) | 3 |
| Near limit (80% or more) | 1 |
| Weekend transaction | 1 |
| Off-hours transaction | 1 |
| Missing receipt | 2 |

Total 0 = Low, 1 to 2 = Medium, 3 or more = High. Flags mark a claim for review; the engine never auto-rejects in the demo (see A-03). Real weights are set with Finance in Stage 1.

### 5.4 Production stack (Phase 1), proposed, pending Farrel review

Principle: keep the demo's code (Next.js + TypeScript + engine) and swap only what the demo faked. One developer has to maintain this, so fewer moving parts beats "best" parts.

| Area | Decision | Trade-off |
|---|---|---|
| App | Same Next.js + TypeScript codebase as the demo | No rewrite. Ties Ruangguru to a JavaScript stack; fine unless their IT has a stack rule (OQ-09). |
| Mobile | Web app (PWA) for all roles: phone-first for employees and managers, phone and desktop both first-class for Finance; installable on the home screen, camera upload for receipts | Confirmed by Farrel (28 Sep). No store accounts or store reviews. No offline mode; push notifications on iPhone only work after the app is added to the home screen, so email notices stay the main channel. |
| Database | Postgres, via Supabase Pro | Managed backups, auth and file storage in one service. Region matters for data law (OQ-09, section 7). Swap-out path: plain Postgres on any cloud; the engine does not depend on Supabase. |
| Data access | Typed query layer (Drizzle or Prisma) with migrations in the repo | Schema changes are tracked and repeatable. Small learning cost. |
| Login | Supabase Auth with email magic link; company SSO (Google or Microsoft) if Ruangguru uses one | SSO removes password support work but needs Ruangguru IT to set it up (OQ-16). |
| Receipt files | Supabase Storage, private bucket, signed links that expire | Receipts are personal data; never public URLs. |
| Hosting | Vercel Pro ($20 per developer seat per month) | Vercel's free plan forbids commercial use, so a paid client project must be on Pro. If Ruangguru requires its own cloud (OQ-09), move to a container on their provider; priced as a change request. |
| Email | Transactional email service (e.g. Resend or Postmark) for approval requests and status updates | 1-click approve works through signed, single-use links in email. Small monthly cost at low volume. |
| Errors and uptime | Sentry (free tier to start) + a simple uptime check | Farrel learns about failures before Finance does. |
| Tests and deploy | Engine unit tests + a few end-to-end tests of the approve flow; GitHub Actions runs them before every deploy | Slows each release by minutes; prevents breaking payroll-adjacent data. |
| Audit trail | Append-only log table: who did what to which claim or rule, and when | Needed for any finance tool; cheap if built in from day one, expensive later. |

### 5.5 Phase 2 additions (not priced in Phase 1)

- OCR: Google Document AI Expense Parser, about $0.01 per single-page receipt (section 12.4). Alternative providers compared in Phase 2 discovery.
- HRIS/ERP sync: depends entirely on the system Ruangguru uses (OQ-08). No stack choice until known.
- Analytics: built on the same Postgres data; no new service expected.

---

## 6. Assumptions and open questions

### 6.1 Assumptions (used in the build and the plan, to be confirmed)

| ID | Assumption | Why it matters |
|---|---|---|
| A-01 | Audience on Wednesday is the financial lead, possibly with Finance staff. Not engineers. | Demo script is business-first, no code walkthrough. |
| A-02 | A laptop + screen share or projector is available, and the phone screen can be mirrored to the laptop. | The phone-only demo is invisible to a room or a call without it (OQ-23). |
| A-03 | Flags mean "review", not "reject". Auto-reject is Ruangguru's policy call. | PRD says the system "menolak/menandai". Demo only marks. See D-03. |
| A-04 | Employees enter only a transaction date today; time is optional. | Off-hours detection only works when time is entered. Without OCR, most real claims will have no time. |
| A-05 | Duplicate means same amount + date + merchant. No image recognition. | This is what we can honestly claim without OCR. Must be said out loud in the demo. |
| A-06 | All limits, hours, departments and names in the demo are invented. | Must be labeled on screen. |
| A-07 | Farrel builds Phase 1 alone, part-time, at 15 to 20 hours a week. | Sets the Phase 1 duration (section 12.5). If Farrel brings in help, estimates and margin change. |
| A-08 | Phase 1 is priced as a fixed fee per stage, not hourly (section 11.1). | Farrel carries overrun risk; change control (11.4) is what protects the margin. |
| A-09 | Ruangguru pays hosting and service costs directly or reimburses them at cost. | If Farrel pays them, they become his monthly cost (section 12.4). |

### 6.2 Open questions

"Blocks" = the milestone that cannot finish without the answer. "Ask Wed" = ask in the demo meeting.

| ID | Question | Owner | Blocks |
|---|---|---|---|
| ~~OQ-00~~ | ~~How many hours can Farrel actually build Mon and Tue?~~ **Answered:** day job is low effort, projects infrequent; daytime hours usable both days, ~15h total to Wed AM. | Farrel | Closed |
| OQ-01 | Demo time, format (in person or online), and who attends | Farrel to ask financial lead | **Wednesday** (sets the last build cutoff) |
| OQ-02 | What exactly was agreed for Wednesday: a look-and-feel check, or a go/no-go on Phase 1? | Farrel to confirm with financial lead | **Wednesday** (sets what "success" means in the room) |
| OQ-03 | Can Ruangguru share 1 to 2 real reimbursement policy points (e.g. meal limit) before Wed, to make the config feel real? | Financial lead | Nothing. Nice to have. |
| OQ-04 | Real expense categories and per-category limits | Financial lead | Stage 1 exit |
| OQ-05 | Working hours and whether weekend work is normal for some teams (events, sales, tutors) | Financial lead / HR | Stage 1 exit. Weekend flag may be noisy for Ruangguru; mention in demo. |
| OQ-06 | Approval hierarchy and the high-value escalation threshold (PRD has an open comment on this) | Financial lead / HR | Stage 1 exit |
| OQ-07 | Baselines: claims per month, auditors, audit time per claim, days to payout | Financial lead | Stage 1 exit (metrics); ask Wed |
| OQ-08 | Current HRIS / ERP / accounting system and export format | Financial lead / IT | Phase 2 pricing |
| OQ-09 | Hosting and data rules: must it run on Ruangguru infrastructure or in an Indonesian region? Where can receipts be stored (UU PDP, cross-border transfer rules)? Does IT have a required stack? | Ruangguru IT / legal | **Stage 1 exit** (changes the stack and the price) |
| OQ-10 | Can Ruangguru give an anonymized export of past claims to test the engine on real data? | Financial lead | Stage 1 exit (strongest follow-up ask) |
| OQ-11 | Commercial terms after Wednesday: is Phase 1 already agreed, or does it depend on the demo? Scope, price, timeline in writing? | Farrel | **Stage 1 exit**; no Phase 1 code before it |
| OQ-12 | Is a price or budget already agreed or set aside for this? Roughly what range, and which budget year does it come from? | Farrel to ask financial lead | Proposal (Stage 1); ask Wed |
| OQ-13 | Why custom instead of buying a tool like Mekari Expense (section 12.3)? What have they tried, what did they dislike? | Farrel to ask financial lead | Proposal positioning; ask Wed |
| OQ-14 | How many employees would submit claims, and how many claims a month? | Financial lead | Proposal (sizing, buy-vs-build comparison, OCR cost); ask Wed |
| OQ-15 | Vendor onboarding: can Ruangguru contract an individual, or only a company (PT/CV)? Required documents (NPWP, NIB, PKP status)? Standard payment term (e.g. 30 days after invoice)? | Financial lead / procurement | **SOW signing** |
| OQ-16 | Does Ruangguru use company login (Google Workspace or Microsoft) that the app can use? | Ruangguru IT | Phase 1 build start |
| OQ-17 | Does Farrel's employment contract at his current employer restrict paid outside work, or require notice/approval? | Farrel | **SOW signing** |
| OQ-18 | Which entity invoices: Farrel personally, Lumenify, or the planned PT? | Farrel | **SOW signing** (depends on OQ-15 and OQ-17) |
| OQ-19 | Who pays running costs (hosting, email, OCR): Ruangguru directly, or Farrel re-bills them? | Financial lead | Proposal |
| OQ-20 | Can Farrel keep and reuse the generic parts (rules engine, audit queue) for other clients, and cite Ruangguru as a reference? | Financial lead / legal | SOW signing (IP clause); does not block build |
| OQ-21 | Support expectations after go-live: working hours only or 24/7, response time for "can't submit claims" vs. small bugs | Financial lead | Proposal (retainer size) |
| OQ-22 | Is the Wednesday demo work paid, or part of the sales effort? | Farrel | Nothing; record the answer for the effective rate |
| OQ-23 | Which phone runs the demo (Android or iPhone), and how will it be mirrored to the laptop? Test it before S5. | Farrel | **Wednesday** (S5) |
| ~~OQ-24~~ | ~~Can Farrel give Tuesday 8 hours instead of 7? If not, the settings screen (S4) is cut.~~ **Moot (v2.3):** S4 was built. Hours actually spent are not recorded; Farrel to note them in progress-log.md if he wants the effective rate (1.3) tracked. | Farrel | Closed |
| ~~OQ-25~~ | ~~Does Finance audit on phones, or was "mobile" meant for employees?~~ **Answered (Farrel, 28 Sep):** Finance uses both phone and desktop. Both Finance layouts are in Phase 1 (12.1). | Farrel | Closed |
| OQ-26 | Does the demo phone's hotspot have reliable mobile data at the venue? Login needs internet for the whole demo. | Farrel | **Wednesday** (else run with `AUTH_DISABLED=1`) |

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Not enough build hours before Wednesday | Low (after OQ-00) | High | 15h plan with buffer stage S6, strict cut order, feature freeze Tue 23:00 |
| Scope creep during the build ("just add manager approval") | Medium | High | Any addition goes through this plan as a decision log row first. Default answer before Wed: no. After Wed: change request (11.4). |
| Demo breaks live | Medium | High | Run locally, reset button, rehearse twice on the phone, backup video |
| **Phone-only demo fails to show** (hotspot link drops, mirroring fails, small screen hard to read for a room) | Medium | High | **Still untested on a real phone as of v2.3:** run the hotspot + mirroring test tonight (Tue), not Wednesday morning; large text and big risk badges; fallbacks in 4.3 (Chrome phone-size view, then video) |
| **Vercel link mistaken for the demo** (approvals, uploads and rule changes on Vercel vanish within minutes; preview links also need a Vercel login) | Medium | Medium | Demo runs on the laptop (5.1). Share the Vercel link only for looking at screens; turn off deployment protection if an outside person must open it |
| **Login fails live** (no mobile data, Supabase down, first real sign-in never tested) | Medium | High | Test the real sign-in tonight; the runbook's kill switch `AUTH_DISABLED=1` restores the no-login demo in about 30 seconds; backup video |
| **Login added one day before the demo** (new code path on every page) | Medium | Medium | Tested locally (13 login checks + failure modes); decision made knowingly by Farrel; freeze at Tue 23:00 still holds |
| ~~Wednesday plan has almost no slack~~ **Reduced (v2.3):** S0 to S6 are built; what is left is S7 (rehearsal, backup video) | Low | High | Feature freeze Tue 23:00; do the real-phone hotspot and mirroring test tonight, not Wednesday morning |
| Auditing on a phone is slower for Finance at volume (small receipt images, one claim per screen) | Low (Finance also has desktop) | Medium | Desktop layout for heavy audit work; on phone, tap-to-zoom receipts and batch approve for Low risk |
| Audience thinks the whole system is done | Medium | High | MOCK labels on screen, one opening sentence on "what is real today", Thread 01 handout |
| Placeholder rules look wrong to a finance expert ("our meal limit isn't 300k") | High | Low | Say upfront they are examples; show that changing the config changes results live |
| Duplicate / off-hours detection oversold | Medium | Medium | Explain A-04 and A-05 plainly; position OCR as the Phase 2 answer |
| Weekend flag creates many false positives at Ruangguru | Medium | Medium | Frame as "review" not "fraud"; ask OQ-05 |
| **Ruangguru buys an off-the-shelf tool instead** (Mekari Expense lists reimbursement, approval workflow, custom policy and OCR at Rp30,000 per employee per month, min. 50 employees) | Medium | High | Ask OQ-13 on Wednesday. Pitch the audit layer (risk queue, reasons, cross-employee duplicates) and one-time cost vs. a yearly subscription (12.3). Do not claim Mekari lacks audit features: not checked. |
| **Working without a signed contract** (the demo is already unpaid effort; Phase 1 is 200+ hours) | Unknown | High | No Phase 1 code before signed SOW and down payment (Stage 1 exit). |
| **Underpricing / overrun on a fixed fee** | Medium | High | Price from the high end of the estimate (12.1), written acceptance criteria, change request process (11.4), track hours weekly from Stage 1 |
| **Late payment** (large-company invoice cycles, vendor onboarding) | Medium | Medium | Down payment before work, milestone invoices, confirm payment term and vendor documents early (OQ-15) |
| **Farrel is the only developer** (illness, day-job crunch, lost laptop) | Medium | High | Code in Ruangguru-accessible GitHub repo from the start, written setup and admin guide, handover clause in SOW |
| **Day-job conflict** (employment contract terms, time) | Unknown | High | OQ-17 answered before signing; build hours outside working hours only |
| **Personal data rules** (receipts and employee data stored in a Singapore region = cross-border transfer; UU PDP transfer rules; a 2026 regulation, PP 33/2026, reportedly adds transfer obligations; the data protection authority is reportedly not yet set up) | Medium | High | Ruangguru IT/legal decides the region (OQ-09) before build; offer an Indonesian-region option priced separately; do not give legal advice, get Ruangguru's DPO/legal sign-off in writing |
| **Stakeholder change** (financial lead leaves or loses budget) | Low | High | Get a second contact (procurement or Finance manager) involved in Stage 1; everything agreed in writing |
| Tax surprise (withholding reduces cash received; final tax higher than withholding) | High | Low | Price excluding tax; confirm entity and treatment with a tax consultant before the first invoice (12.6) |

---

## 8. Decision log

| Date | Decision | Reason | Who decided |
|---|---|---|---|
| 2026-09-28 | Demo scope: working prototype, narrow. Real logic for 1 to 2 modules, rest mocked and labeled. | 2 days to demo | Farrel (pre-plan) |
| 2026-09-28 | Build budget revised from ~11h to ~15h; settings screen and batch approve moved from stretch into base plan; feature freeze moved to Tue 23:00 | OQ-00 answered: day job is low effort, projects infrequent, daytime hours usable | Farrel |
| 2026-09-28 | Real modules: A (rules and audit engine) + B (thin Finance audit dashboard). | The audience is Finance. The engine is the value; the queue is how Finance sees it. Either alone does not demo: the engine has no screen, the dashboard with no engine is a pretty table. | Thread 00, pending Farrel review |
| 2026-09-28 | Manager approval, employee app, notifications, auth fully mocked for Wed. | They show workflow, not audit value, and each costs hours we do not have. | Thread 00, pending Farrel review |
| 2026-09-28 | Stack: Next.js + TS + Tailwind + shadcn/ui + SQLite, run locally. | Fastest path on familiar tools, no infra risk on demo day. | Thread 00, pending Farrel review |
| 2026-09-28 | Engine flags only, never auto-rejects, in the demo. | Auto-reject is a policy decision Ruangguru has not made. | Thread 00, pending Farrel review |
| 2026-09-28 | Duplicate detection = data match + file hash, no image recognition. | Honest without OCR. | Thread 00, pending Farrel review |
| 2026-09-28 | v2.0: plan extended from the Wednesday demo to the full Ruangguru deal (stages, commercial, financials, production stack, dependencies, review cadence), kept inside master-plan.md. The business is this one deal, not a SaaS product or the planned PT. Research normally owned by Thread 03 was done here. | Farrel asked for it, in this file, now, alongside the build | Farrel |
| 2026-09-28 | No price quoted on Wednesday. Proposal sent after Stage 1 discovery. | Price depends on headcount, policy, hosting rules and entity (OQ-09, OQ-14, OQ-15, OQ-18), all unknown today. | Thread 00, pending Farrel review |
| 2026-09-28 | Phase 1 priced as a fixed fee with milestone payments (30/30/30/10), plus a monthly retainer after warranty. | Finance buyers want cost certainty; milestones keep cash flowing and cap Farrel's exposure. | Thread 00, pending Farrel review |
| 2026-09-28 | Phase 1 "mobile" delivered as a PWA, not a native app. | Saves a second codebase and app store releases for a solo developer. | Thread 00, pending Farrel review |
| 2026-09-28 | Phase 1 production stack: same Next.js codebase + Supabase Postgres/Auth/Storage + Vercel Pro, region subject to OQ-09. | No rewrite; one managed service; Vercel's free plan forbids commercial use. | Thread 00, pending Farrel review |
| 2026-09-28 | No Phase 1 code before signed SOW and down payment received. | Protects 200+ hours of work. | Thread 00, pending Farrel review |
| 2026-09-28 | v2.1: the app is a mobile-first web app (PWA) for every role, Finance included; not a native store app. Laptop layout kept as a secondary view. Replaces the v2.0 wording "mobile-friendly, employee submission only". | Farrel: "this app is for mobile" | Farrel |
| 2026-09-28 | Wednesday demo runs entirely on a phone. Sprint plan re-timed (no stage had started by Mon 14:53); build rises from 13h to 14h; Tue budget 7h to 8h pending OQ-24, else S4 is cut. | Farrel chose a phone-only demo | Farrel (phone demo); Tue hours pending |
| 2026-09-28 | Phase 1 estimate raised from 198 to 262h to 207 to 281h for the phone-first Finance dashboard. | Card queue, stacked detail and phone batch actions are extra layout work | Thread 00, pending Farrel review |
| 2026-09-28 | v2.2: Finance screens get two first-class layouts, desktop and phone. Wednesday stays phone-only; the Finance screens are checked at laptop width in S6 if time allows. Effort unchanged. | Farrel: Finance team uses desktop also (OQ-25 closed) | Farrel |
| 2026-09-29 | v2.3 correction: the v2.1 statement that no stage had started by Mon 14:53 was wrong (S0 and S1 existed on an unmerged build branch). 4.1 corrected; no schedule or scope change. | The plan under-counted progress because `main` had no build commits; found when the build branch was merged with `main` | Thread 02 (Build), pending Farrel review |
| 2026-09-29 | S0 to S6 built and merged to `main` (commit 999dfeb). Nothing on the 4.3 cut list was cut; OQ-24 closed as moot. 4.4 added as build status. | Build ran ahead of the re-timed plan | Thread 02 (Build), pending Farrel review |
| 2026-09-29 | A Vercel project (`claim-audit-app`) exists, deploying `main` and build branches, for viewing screens only. Not the demo machine; writes there are temporary. 5.1 updated. Reverses the 5.1 wording "no deploy". | Farrel asked for a Vercel demo build; SQLite cannot persist there | Farrel (requested); wording by Thread 02 |
| 2026-09-29 | S6 was used for a QA and UX audit (docs/qa-audit.md) instead of open-ended polish; S7 prep is docs/demo-runbook.md. Demo runs with `npm run demo`. | Farrel asked for the audit; production build avoids first-load slowness | Farrel (audit); Thread 02 |
| 2026-09-29 | Real login (Supabase Auth) added to the Wednesday demo; role switcher kept only as a kill switch. Reverses the 2026-09-28 row "auth fully mocked for Wed". | Farrel: "create user login, use supabase" | Farrel |
| 2026-09-29 | Supabase used for login only for Wednesday; claims data stays in local SQLite. Moving data to Supabase Postgres stays a Phase 1 item (5.4). | Moving the data layer one day before the demo is a rewrite that could not be tested from the build environment, and would make every screen depend on the internet | Thread 02 (Build), pending Farrel review |
| 2026-09-29 | New Supabase project `ruangguru-claim-audit-demo` (Singapore, free plan), separate from other clients' projects. Two MOCK accounts: finance.demo@example.com, employee.demo@example.com. | Keep client data apart; demo only, no real people | Thread 02, pending Farrel review |
| 2026-09-29 | Note on the rule "no Phase 1 code before signed SOW": the login is demo scaffolding (two MOCK accounts, no user management), not the Phase 1 login item (2.2 item 5), which is still unbuilt and unpriced. | Keep the no-free-work rule honest | Thread 02, pending Farrel review |

---

## 9. Discrepancies with PRD v0.1 (for Thread 01)

| ID | PRD v0.1 says | This plan says | Action |
|---|---|---|---|
| D-01 | Three users (Karyawan, Manajer, Tim Audit Finance) | Four roles, adds Admin | Add Admin in PRD revision |
| D-02 | No success metrics | Section 1.3 metrics, pending baselines | Add in PRD revision |
| D-03 | Engine "menolak/menandai otomatis" over-limit claims | Flag only; auto-reject is Ruangguru's call | Reword, add as a question for Ruangguru |
| D-04 | Off-hours detection from date/time; form fields list only date | Needs an optional time field until OCR | Add time field in PRD 2.1 |
| D-05 | Duplicate receipt detection, method unspecified | Data match + file hash; image matching needs OCR (Phase 2) | Clarify in PRD 2.2 |
| D-06 | No mention of authentication, audit trail, Admin settings | Added to Phase 1 (2.2 item 5) | Add in PRD revision, affects Phase 1 effort |
| D-07 | Status "Draft untuk Review Stakeholder", nothing on the demo | Wednesday is a narrow prototype | Thread 01: one-page "apa yang sudah jalan vs. contoh" handout |
| D-08 | "Pengajuan Karyawan (Mobile & Web)": mobile only for employee submission, and could be read as a store app | Whole app is mobile-first for every role, as a web app installable on the phone (PWA); native store app out of scope (2.4) | Reword PRD 2.1 and add a line that all modules are phone-first; say plainly it is not a Play Store / App Store app |
| D-10 | Dashboard 2.4 "Tampilan split-screen": data beside receipt | On a phone, receipt and data are stacked on one screen with tap-to-zoom; side by side only on laptop | Reword PRD 2.4 |
| D-09 | No commercial section, no stages, no support after launch | Sections 10 and 11 | Thread 01 turns these into the Indonesian proposal/SOW after Stage 1 |

---

## 10. Deal and stages

### 10.1 The deal at a glance

| Item | Status |
|---|---|
| Client | Ruangguru |
| Buyer and main contact | Ruangguru's financial lead (commissioned the work directly) |
| Second contact | None yet; get one in Stage 1 (section 7) |
| What they buy | Phase 1 build (fixed fee), then a monthly maintenance retainer, then Phase 2 (separate contract) |
| Contract in writing | Not confirmed (OQ-11) |
| Price or budget | Unknown (OQ-12) |
| Invoicing entity | Undecided (OQ-18) |
| Competing option | Buying an off-the-shelf tool (OQ-13, section 12.3) |

### 10.2 Stages with exit criteria and payment points

Dates after Stage 0 are set in the proposal, not here, because they depend on Farrel's weekly hours and Ruangguru's response times.

| Stage | What happens | Exit criteria (all must be true) | Money |
|---|---|---|---|
| **0. Demo** (Wed 30 Sep) | Show the prototype; ask OQ-01, 02, 07, 12, 13, 14, 15 | Financial lead agrees to a discovery session, or says no | None (see OQ-22) |
| **1. Discovery and contract** (about 1 to 2 weeks) | 1 or 2 sessions with Finance: real policy, categories, limits, hierarchy, headcount, claim volume, hosting rules, login, vendor requirements. Farrel writes the proposal; Thread 01 turns it into an Indonesian SOW. | Policy document received · OQ-04, 05, 06, 09, 14, 15, 16, 17, 18 answered · SOW signed · down payment received | **Invoice 1: 30%** on signing |
| **2. Phase 1 build** (about 10 to 19 weeks part-time, section 12.5) | Build in 3 milestones, each demoed to Finance: **M1** login, roles, submission, receipts, engine on real policy · **M2** manager approval, routing, escalation, email notices · **M3** Finance dashboard, batch approve, export, audit trail, admin settings | Each milestone passes its written acceptance checklist in the SOW | **Invoice 2: 30%** at M2 acceptance |
| **3. Test and pilot** (about 2 to 4 weeks) | Ruangguru staff test (UAT); pilot with 1 department; measure the 1.3 baselines before and after | UAT sign-off · pilot runs one full claim cycle · no open High bugs | **Invoice 3: 30%** at UAT sign-off |
| **4. Rollout** (about 1 to 2 weeks) | Import full org data, train Finance and managers, go live company-wide | All intended users can log in and submit · Finance trained | None |
| **5. Warranty** (proposed 1 to 3 months after go-live) | Bugs fixed free; no new features | Warranty period ends | **Invoice 4: 10%** at end of warranty |
| **6. Maintenance retainer** (monthly, ongoing) | Hosting care, updates, small changes within an hour bucket | Renewed or ended by notice | Monthly fee (12.4) |
| **7. Phase 2** (separate SOW) | OCR, HRIS/ERP sync, analytics | Own discovery and contract | Separate fixed fee |

---

## 11. Commercial terms and change control

### 11.1 Pricing model

Recommended (pending Farrel review): **fixed fee per phase with milestone payments, retainer after warranty.**

| Option | Good for Farrel | Bad for Farrel | Fit here |
|---|---|---|---|
| Fixed fee per phase (recommended) | Price set once; can earn more per hour if efficient | Carries overrun risk | Finance buyers want a known number; overrun risk handled by 11.4 |
| Time and materials (hourly) | No overrun risk | Buyers dislike open-ended cost; needs timesheets | Weak fit for a financial lead's budget approval |
| Subscription (monthly fee per user) | Recurring revenue | Farrel carries hosting, support and payment risk for years; long payback on 200+ build hours | Only if Ruangguru refuses any upfront fee |

### 11.2 Payment schedule (proposed)

30% on signing · 30% at M2 acceptance · 30% at UAT sign-off · 10% at end of warranty. Invoices payable within the term confirmed in OQ-15. Prices exclude taxes; withholding handled per 12.6.

### 11.3 SOW checklist (what the contract must say)

- Scope: Phase 1 items in 2.2, the out-of-scope list in 2.4, and the PWA definition of "mobile"
- Acceptance: written checklist per milestone; acceptance deemed given if no written defects within an agreed number of working days
- Change requests: process in 11.4
- Timeline: milestone dates that depend on Ruangguru inputs pause if inputs are late
- Payment: schedule in 11.2, payment term, late-payment handling
- IP: Ruangguru owns the delivered system after full payment; Farrel keeps generic components and know-how, with a license to Ruangguru to use them (OQ-20)
- Data: who is data controller (Ruangguru) and processor (Farrel), hosting region, access rules, deletion at contract end (OQ-09)
- Confidentiality both ways
- Warranty: length and what counts as a defect
- Support: retainer hours, response times (OQ-21)
- Handover: repo access, admin guide, credentials, if the contract ends
- Termination: notice period, payment for work done to date
- Running costs: who pays (OQ-19)

### 11.4 Change control

1. Any request not in the signed scope is written down as a change request (Thread 01 keeps the list).
2. Farrel estimates hours and price, and the effect on dates, within 2 working days.
3. Nothing is built until the financial lead approves it in writing (email is enough).
4. Every approved change lands in this plan as a decision log row and bumps the version.
5. Small fixes during warranty that are real defects are free; anything new is a change request.

---

## 12. Financials

All prices below are **scenarios for Farrel to choose from, not quotes**. Nothing here is a Ruangguru fact. Currency conversions use about Rp18,000 per USD (the rupiah was around Rp17,950 per USD on 25 Sep 2026; re-check before quoting).

### 12.1 Phase 1 effort estimate (Farrel's hours)

| Work item | Low (h) | High (h) |
|---|---|---|
| Login, roles, users, org import (CSV) | 32 | 44 |
| Employee submission (PWA): upload, form, budget warning, status tracker | 32 | 40 |
| Rules engine: real policy, admin config screen, config change log | 16 | 24 |
| Manager approval: hierarchy routing, escalation, email notices, 1-click approve links | 32 | 40 |
| Finance dashboard: harden demo version, paging, audit trail | 16 | 24 |
| Phone-first Finance dashboard: card queue, stacked detail, phone batch actions and export (added v2.1) | 8 | 16 |
| Security, backups, tests, UAT bug fixing | 32 | 40 |
| Deploy, admin guide, training session | 12 | 16 |
| **Build subtotal** | **180** | **244** |
| Meetings, updates, change handling (+15%) | 27 | 37 |
| **Total** | **207** | **281** |

Midpoint: about 244 hours. Employee and manager screens were already phone-sized in v2.0; only the Finance dashboard adds work. Discovery (Stage 1) is extra, about 8 to 12 hours. Price from the high end: first builds for a new client almost always run long.

### 12.2 Phase 1 price scenarios (hours × rate)

Farrel picks the hourly rate; the table shows what each choice means.

| Hours | at Rp250,000/h | at Rp400,000/h | at Rp600,000/h |
|---|---|---|---|
| 207 (low) | Rp51.8M | Rp82.8M | Rp124.2M |
| 244 (mid) | Rp61.0M | Rp97.6M | Rp146.4M |
| 281 (high) | Rp70.2M | Rp112.4M | Rp168.6M |

Example payment split at Rp97.6M: Rp29.3M / Rp29.3M / Rp29.3M / Rp9.8M.

### 12.3 Market anchors (what the buyer will compare against)

- **Custom build market ranges (Indonesia, 2026):** a simple/MVP custom app Rp30M to Rp150M over 2 to 3 months; a mid-level business app Rp150M to Rp400M over 3 to 6 months (Crocodic, Jul 2026). Phase 1 sits around the top of "simple/MVP", so the scenarios above are inside the market range.
- **Buying instead of building:** Mekari Expense "Claims + Travel Suite" is listed at Rp30,000 per employee per month, minimum 50 employees, and includes reimbursement, approval workflow, custom policy and OCR (Mekari pricing page, checked 28 Sep 2026). What that costs per year at different headcounts (illustrative; Ruangguru's headcount is unknown, OQ-14):

| Employees using it | Mekari Claims + Travel per year |
|---|---|
| 100 | Rp36M |
| 300 | Rp108M |
| 500 | Rp180M |
| 1,000 | Rp360M |
| 2,000 | Rp720M |

What this means: at a few hundred users or more, a one-time custom build plus a retainer can cost less than a subscription within 1 to 2 years. Below about 100 users, buying is likely cheaper and Farrel's pitch has to rest on fit and the audit layer, not cost. This is the core of the answer to OQ-13.

### 12.4 Running costs and recurring revenue

**Running costs (monthly, at low volume):**

| Item | Cost | Note |
|---|---|---|
| Vercel Pro | $20 per developer seat | Required for commercial use |
| Supabase Pro | $25 base | Includes 8 GB database; free plan pauses inactive projects, so not usable for production |
| Email service | $0 to $20 | Depends on volume |
| Domain | about Rp500K per year | |
| **Total** | **about $45 to $70 (Rp0.8M to Rp1.3M) per month** | Grows with storage and users; re-check at Stage 1 with real volume |

Phase 2 OCR: about $0.01 per single-page receipt (Google Document AI Expense Parser). 1,000 receipts a month ≈ $10 (Rp0.18M); 10,000 ≈ $100 (Rp1.8M).

**Recurring revenue after warranty (proposed):**

| Item | How it's priced | Example |
|---|---|---|
| Maintenance retainer | Fixed monthly hour bucket (e.g. 8 hours) × Farrel's rate; unused hours do not roll over | 8h × Rp400K = Rp3.2M per month (Rp2.0M at Rp250K, Rp4.8M at Rp600K) |
| Hosting | Ruangguru pays providers directly (preferred), or Farrel re-bills at cost plus a small admin fee | OQ-19 |
| Change requests | Priced per 11.4 at the same hourly rate | |
| Phase 2 | Separate fixed fee after its own discovery | Cannot size until OQ-08 |

### 12.5 Capacity and timeline reality

At 15 to 20 hours a week (A-07), 207 to 281 hours means **about 10 to 19 weeks** for the Phase 1 build alone, before test, pilot and rollout. End-to-end from signing to go-live is realistically **4 to 5 months**. Do not promise a shorter date in the proposal unless Farrel adds hours or help. If Ruangguru needs it faster, the options are fewer Phase 1 features (move items to Phase 2) or more people, not the same scope in less time.

### 12.6 Tax and invoicing entity (confirm with a tax consultant before the first invoice)

- **If Farrel invoices as an individual:** Ruangguru withholds PPh 21 for "bukan pegawai / tenaga ahli": 50% of each gross payment × the progressive income tax rate (5% on the first Rp60M of that base). For payments up to about Rp120M each, that is about 2.5% withheld (e.g. about Rp0.69M on a Rp27.6M invoice). This is only withholding: the final tax is settled in Farrel's annual return together with his salary, so his real tax on this income is likely higher.
- **If a company (PT/CV) invoices:** Ruangguru withholds PPh 23 at 2% of the service fee (4% if no NPWP). The company then pays its own income tax. The planned PT is not registered yet, and Lumenify's legal form is not recorded here (OQ-18).
- **VAT (PPN):** only if the invoicing entity is a registered VAT business (PKP). Confirm status before invoicing (OQ-15).
- **Pricing rule:** quote prices excluding taxes and state it in the SOW.

### 12.7 What Farrel keeps (illustrative, mid case at Rp400K/h)

| Line | Amount |
|---|---|
| Phase 1 fee (244h × Rp400K) | Rp97.6M |
| PPh 21 withheld if invoicing as individual (four payments, ~2.5%) | about Rp2.4M withheld (not the final tax) |
| Running costs during build, if Farrel pays them (~5 months × ~Rp1.3M) | about Rp6.5M, or zero if Ruangguru pays (OQ-19) |
| Cash in hand before final tax | about Rp89M to Rp95M |
| Effective hourly rate if the build takes 281h instead of 244h | Rp97.6M / 281h ≈ Rp347K/h (13% below the priced rate) |

The last row is the main financial risk: every hour over the estimate comes out of Farrel's rate. Track hours weekly from Stage 1.

---

## 13. Growth within Ruangguru

This plan covers one client. Growth means more work from Ruangguru, and making this job reusable later.

| Opportunity | When | Condition |
|---|---|---|
| Maintenance retainer | After warranty | Phase 1 goes live cleanly |
| Change requests during and after Phase 1 | Any time | Handled per 11.4 |
| Phase 2: OCR, HRIS/ERP sync, analytics | 3+ months after go-live | Phase 1 stable; OQ-08 answered |
| Other internal tools for the same Finance team | After Phase 1 | Trust built by delivering on time |
| Other entities or business units using the same app | Unknown | Ask in Stage 1 whether other units run a separate claim process; do not assume the group structure |
| Reference and reuse | After go-live | Only if OQ-20 allows citing Ruangguru and reusing generic components |

Selling the same product to other companies (a SaaS) is out of scope for this plan. Revisit only after Phase 1 is live and OQ-20 is answered.

---

## 14. Dependencies on Ruangguru

What Farrel needs from Ruangguru, and what happens if it is late.

| Needed | By | If late |
|---|---|---|
| Discovery session(s) with Finance | Stage 1 | Stage 1 cannot close |
| Reimbursement policy, categories, limits | Stage 1 exit | Engine stays on placeholder rules |
| Approval hierarchy / org chart (at least as a spreadsheet) | Stage 1 exit | Routing cannot be built; M2 slips |
| Hosting and data decision from IT/legal | Stage 1 exit | Stack and price not final |
| Vendor documents, signed SOW, down payment | Stage 1 exit | No Phase 1 code (decision log) |
| Company login setup (if SSO) | M1 | Fall back to email login |
| Test users and a pilot department | Stage 3 | Pilot cannot start |
| Timely acceptance of each milestone | Each milestone | Dates move by the same number of days (SOW clause) |

---

## 15. Review cadence

- **This plan:** re-read at the start of every stage; updated on every decision, answered question or approved change (version bump + decision log row, same commit).
- **With Ruangguru during the build:** weekly 30-minute check-in with the financial lead (show progress, raise blockers); a written weekly update in Indonesian (Thread 01); a demo and acceptance review at each milestone.
- **Farrel's own check:** weekly, compare hours spent vs. estimate (12.1) and effective rate (12.7) in progress-log.md. Over the high estimate on any milestone = stop and decide: absorb, cut scope, or raise a change request.
- **Mirrors:** the Drive copy, the Claude Doc copy and the Notion tasks are snapshots. Re-sync them after each version bump; the repo file wins if they disagree.

---

## 16. Sources

Checked 28 Sep 2026. Market and tax facts only; nothing here is a Ruangguru fact.

- Mekari Expense pricing: https://expense.mekari.com/en/pricing
- Custom app cost ranges, Indonesia 2026 (Crocodic, Jul 2026): https://crocodic.com/biaya-pembuatan-aplikasi/
- Vercel Hobby plan (non-commercial only) and Pro seat price: https://vercel.com/docs/plans/hobby
- Supabase plans and limits (secondary source): https://makerkit.dev/blog/saas/supabase-pricing
- Google Document AI pricing: https://cloud.google.com/document-ai/pricing
- PPh 21 for tenaga ahli under PMK 168/2023 (Ortax): https://ortax.org/penghitungan-pph-pasal-21-tenaga-ahli
- PPh 23 on services (Ortax): https://ortax.org/pph-pasal-23-atas-jasa-objek-tarif-dan-cara-hitung
- Rupiah rate, 25 Sep 2026 (Pintu): https://pintu.co.id/news/292510-kurs-rupiah-hari-ini-25-september-2026
- Data stored abroad, UU PDP and PP 33/2026 (CNBC Indonesia, 17 Sep 2026): https://www.cnbcindonesia.com/tech/20260917120936-37-768680/data-warga-ri-banyak-disimpan-di-luar-negeri-pakar-ingatkan-soal-ini
