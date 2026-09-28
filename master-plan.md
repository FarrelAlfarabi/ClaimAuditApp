# Master Plan: Ruangguru Claim Audit App

**Version:** 1.1
**Date:** 28 Sep 2026 (Mon)
**Owner:** Farrel
**Demo:** Wed 30 Sep 2026, time TBC (see OQ-01)
**Status of this document:** source of truth for scope, milestones and decisions. Every change bumps the version and adds a decision log row in the same commit.

Related: PRD v0.1 (Claude Doc, 28 Sep 2026, Indonesian, stakeholder-facing). Written before the deadline and scope decision. Where it differs from this plan, this plan wins until the PRD is revised (see section 9).

---

## 1. Goals

### 1.1 Goal for Wednesday (what the demo must prove)

One sentence: **"Give it a pile of claims and it tells Finance which ones to look at first, and why."**

The financial lead should leave the room believing three things:

1. The system catches the claims a human auditor would want to catch (over the category limit, duplicate receipt, weekend or off-hours spend), automatically, with a plain reason attached to each flag.
2. A Finance auditor can work a risk-sorted queue faster than today's one-by-one manual check.
3. The rules are adjustable by Finance (limits, working hours), so the tool can be tuned to Ruangguru's real policy instead of Farrel's guesses.

The demo must NOT imply the whole Phase 1 system works. Everything mocked is labeled as such on screen.

### 1.2 Longer-term goal

Replace Ruangguru's manual reimbursement audit with a system where employees submit, managers approve in one click, and Finance audits by exception (only the risky claims get human attention).

### 1.3 Success metrics (Phase 1 go-live, targets set after baselines are known)

| Metric | How measured | Baseline |
|---|---|---|
| Finance audit time per claim | minutes, before vs. after | Unknown, OQ-07 |
| Share of claims cleared as Low risk without manual review | % of monthly claims | New |
| Flagged claims confirmed as real issues (precision) | % of High/Medium flags Finance agrees with | New |
| Submission to payout time | days | Unknown, OQ-07 |
| Employee status queries to Finance | count per month | Unknown, OQ-07 |

No target numbers are set until Ruangguru gives baselines. Do not quote targets to stakeholders before then.

---

## 2. Scope

### 2.1 Wednesday demo: real vs. mocked

**Real (built end-to-end, real logic):**

- **Module A: Rules and audit engine.** Runs on every claim, produces rule hits with plain-language reasons and a Low/Medium/High risk label. Config-driven (limits and hours in one config file / settings screen), not hardcoded.
  - Category limit check (over limit, and near limit at 80% or more)
  - Duplicate detection by data match: same amount + same transaction date + same normalized merchant, across all employees; plus exact file-hash match if a receipt file is attached
  - Weekend transaction flag (date only)
  - Off-hours flag (only when a transaction time is entered, see A-04)
  - Missing receipt flag
  - Risk score from the rule hits (scoring table in 5.3)
- **Module B: Finance audit dashboard (thin, but real).**
  - Risk-sorted central queue with filters (risk level, category, department, status)
  - Claim detail: employee input next to the receipt image (split view), plus the list of rule hits and reasons
  - Approve / reject with standard rejection reasons
  - Batch approve all Low-risk claims (stretch, see cut order in 4.3)
  - Export verified claims to CSV (opens in Excel)

**Demo harness (real code, but not the Phase 1 product):**

- Minimal "submit a claim" form that writes a claim and runs the engine live, so the audience can see a bad claim land as High risk in real time. No login, no mobile app, no real file storage policy.
- Role switcher (Employee / Finance Auditor) instead of login.
- "Reset demo data" button.

**Mocked (seed data only, labeled "MOCK" in UI and code):**

- Employees, departments, org hierarchy (fictional names, fictional structure)
- Category limits and working hours (placeholder values, labeled "contoh, bukan kebijakan Ruangguru")
- Manager approval: seed claims arrive with a fake "approved by manager" status. No manager screens, no routing, no escalation, no notifications
- Payout status ("Dicairkan")
- Everything in Phase 2

**Explicitly out for Wednesday:** authentication, mobile app, manager approval flow, hierarchy routing, high-value escalation, notifications, budget warning during submission, employee status tracker, OCR, HRIS/ERP sync, analytics, deployment to Ruangguru infrastructure.

### 2.2 Full Phase 1 (after Wednesday, sized after feedback)

From PRD v0.1, section 2:

1. Employee submission, web and mobile: receipt upload, claim form, instant budget warning, visual status tracker
2. Rules and audit engine: productionize Module A with Ruangguru's real policy
3. Manager approval: 1-click approve, automatic hierarchy routing, high-value escalation, standard rejection reasons
4. Finance audit dashboard: productionize Module B
5. Added by this plan (not in PRD v0.1): authentication and roles, Admin settings for rules and users, audit trail of who changed what

### 2.3 Phase 2 (well after Phase 1 is stable)

- AI OCR extraction from receipts
- Two-way HRIS / ERP sync (org data in, approved claims out to payroll/accounting)
- Analytics: spend trends, audit turnaround time

---

## 3. Users and roles

| Role | Wednesday demo | Phase 1 |
|---|---|---|
| Employee | Demo harness form only | Submits claims, tracks status |
| Manager | Mocked (status in seed data) | Approves/rejects own team, escalation above threshold |
| Finance Auditor | **Real** (Module B) | Works the risk queue, approves/rejects, exports |
| Admin | Rules config file / simple settings screen, no user management | Manages rules, categories, limits, users, org sync |

Note: PRD v0.1 lists only three users and has no Admin. See discrepancy D-01.

---

## 4. Milestones (Mon 28 Sep to Wed 30 Sep)

### 4.1 Time budget: the real constraint

OQ-00 answered: day job is low effort, projects are infrequent. Daytime hours Mon and Tue are usable, not just evenings. Revised budget:

- Mon: 6h (daytime + evening)
- Tue: 7h (daytime + evening)
- Wed early morning before the demo: about 2h, for rehearsal and fixes only
- **Total: about 15h.** More slack than the original 11h estimate. Stretch items (batch approve, settings screen) are back in the base plan, not just the cut-order fallback. Still no new features after Tue 23:00 — extra hours buy safety margin and polish, not scope creep.

### 4.2 Stage plan (one commit per stage, review between stages)

| # | When | Stage | Est. | Done when |
|---|---|---|---|---|
| S0 | Mon AM | Scaffold (Next.js, SQLite), data model, seed script: ~80 claims, 3 departments, planted problems (4 over-limit, 3 duplicate pairs, 5 weekend, 3 off-hours, 2 missing receipt), placeholder receipt images | 2h | `npm run dev` shows raw claim list from DB |
| S1 | Mon midday to PM | Module A: rules engine + `rules.config` + tests that assert every planted problem is caught and clean claims stay Low | 2.5h | Tests pass on seed data |
| S2 | Mon PM to evening | Module B part 1: risk-sorted queue, filters, claim detail split view with rule reasons | 2.5h | Auditor can find and open any flagged claim in 2 clicks |
| S3 | Tue AM | Module B part 2: approve/reject with standard reasons, CSV export, batch approve Low | 2h | Exported CSV opens cleanly in Excel, batch approve works |
| S4 | Tue midday | Settings screen for rules config (limits, hours) instead of raw JSON edit | 1.5h | Finance-facing user can change a limit and see it apply without touching code |
| S5 | Tue PM | Demo harness: submit form (engine runs live), role switcher, MOCK labels everywhere, reset button | 1.5h | A weekend over-limit claim submitted live shows as High with 2 reasons |
| S6 | Tue evening | Buffer for slippage from S0 to S5; if no slippage, polish (loading states, empty states, error messages) | 1.5h | No open bugs from earlier stages |
| S7 | Wed early | Demo script, 2 rehearsals, fix only demo-breaking bugs, record a backup screen video | 2h | Full run in under 10 min, backup video saved |

### 4.3 Cut order if behind (cut from the top)

1. Polish (S6)
2. Settings screen (S4) — fall back to editable config file shown in the code editor
3. Batch approve Low risk
4. Split view with receipt image (show text fields only)
5. CSV export
6. Live submit form (fall back to seed data only)

Never cut: engine + reasons + risk-sorted queue + claim detail. That is the demo.

**Hard stop:** no new features after Tue 23:00. Wednesday morning is rehearsal only.

---

## 5. Tech decisions

Picked for speed with Farrel's existing React/Vercel experience. Revisit after the demo.

| Area | Decision | Trade-off |
|---|---|---|
| App | Next.js (App Router) + TypeScript | One codebase for UI and API routes. Heavier than a pure SPA but no separate backend. |
| UI | Tailwind + shadcn/ui | Fast, clean tables and dialogs. Generic look, fine for a demo. |
| Data | SQLite via better-sqlite3, seed script | Zero setup. Does not persist on Vercel, so no shareable hosted link for Wednesday. Move to Postgres (e.g. Supabase) in Phase 1. |
| Receipts | Static placeholder images in `/public/mock-receipts` | No upload storage. Real storage is a Phase 1 decision. |
| Engine | Pure TypeScript functions, input = claim + config, output = rule hits + score | Easy to unit test and to move server-side later. |
| Config | `rules.config.json` (limits per category, near-limit %, working hours, score weights) | Editable without code change. No audit trail of config changes yet. |
| Demo delivery | Run locally on Farrel's laptop | No dependency on venue Wi-Fi or a deploy. Backup: recorded video. |
| Auth | None, role switcher | Acceptable only because it is labeled as demo. |

### 5.3 Risk scoring (placeholder, config-driven)

| Rule hit | Points |
|---|---|
| Over category limit | 3 |
| Duplicate (data match or file hash) | 3 |
| Near limit (80% or more) | 1 |
| Weekend transaction | 1 |
| Off-hours transaction | 1 |
| Missing receipt | 2 |

Total 0 = Low, 1 to 2 = Medium, 3 or more = High. Flags mark a claim for review; the engine never auto-rejects in the demo (see A-03).

---

## 6. Assumptions and open questions

### 6.1 Assumptions (used in the build, to be confirmed)

| ID | Assumption | Why it matters |
|---|---|---|
| A-01 | Audience on Wednesday is the financial lead, possibly with Finance staff. Not engineers. | Demo script is business-first, no code walkthrough. |
| A-02 | A laptop + screen share or projector is available. | Local demo plan depends on it. |
| A-03 | Flags mean "review", not "reject". Auto-reject is Ruangguru's policy call. | PRD says the system "menolak/menandai". Demo only marks. See D-03. |
| A-04 | Employees enter only a transaction date today; time is optional. | Off-hours detection only works when time is entered. Without OCR, most real claims will have no time. |
| A-05 | Duplicate means same amount + date + merchant. No image recognition. | This is what we can honestly claim without OCR. Must be said out loud in the demo. |
| A-06 | All limits, hours, departments and names in the demo are invented. | Must be labeled on screen. |

### 6.2 Open questions

"Blocks Wed" = if unanswered, the demo plan changes or is at risk. Everything else can wait.

| ID | Question | Owner | Blocks Wed? |
|---|---|---|---|
| ~~OQ-00~~ | ~~How many hours can Farrel actually build Mon and Tue?~~ **Answered:** day job is low effort, projects infrequent — daytime hours usable both days, ~15h total to Wed AM. | Farrel | Closed |
| OQ-01 | Demo time, format (in person or online), and who attends | Farrel to ask financial lead | **Yes**, sets the last build cutoff |
| OQ-02 | What exactly was agreed for Wednesday: a look-and-feel check, or a go/no-go on Phase 1? | Farrel to confirm with financial lead | **Yes**, sets what "success" means in the room |
| OQ-03 | Can Ruangguru share 1 to 2 real reimbursement policy points (e.g. meal limit) before Wed, to make the config feel real? | Financial lead | No, placeholders work. Nice to have. |
| OQ-04 | Real expense categories and per-category limits | Financial lead | No |
| OQ-05 | Working hours and whether weekend work is normal for some teams (events, sales, tutors) | Financial lead / HR | No, but weekend flag may be noisy for Ruangguru. Mention in demo. |
| OQ-06 | Approval hierarchy and the high-value escalation threshold (PRD has an open comment on this) | Financial lead / HR | No |
| OQ-07 | Baselines: claims per month, auditors, audit time per claim, days to payout | Financial lead | No |
| OQ-08 | Current HRIS / ERP / accounting system and export format | Financial lead / IT | No (Phase 2) |
| OQ-09 | Hosting and data rules: must it run on Ruangguru infrastructure? Where can receipts be stored (UU PDP)? | Ruangguru IT | No (Phase 1) |
| OQ-10 | Can Ruangguru give an anonymized export of past claims to test the engine on real data? | Financial lead | No, but it is the strongest follow-up ask after the demo |
| OQ-11 | Commercial terms after Wednesday: is Phase 1 already agreed, or does it depend on the demo? Scope, price, timeline in writing? | Farrel | No for the demo, **yes before any Phase 1 work starts** |

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Not enough build hours | Low (revised down after OQ-00 answered — ~15h available, day job is low effort) | High | Stage plan sized to 15h with buffer stage (S6), strict cut order, feature freeze Tue 23:00 |
| Scope creep during the build ("just add manager approval") | Medium | High | Any addition goes through this plan as a decision log row first. Default answer before Wed: no. |
| Demo breaks live | Medium | High | Run locally, reset button, rehearse twice, backup video |
| Audience thinks the whole system is done | Medium | High | MOCK labels on screen, one opening slide or sentence on "what is real today", Thread 01 handout |
| Placeholder rules look wrong to a finance expert ("our meal limit isn't 300k") | High | Low | Say upfront they are examples; show that changing the config changes results live |
| Duplicate / off-hours detection oversold | Medium | Medium | Explain A-04 and A-05 plainly; position OCR as the Phase 2 answer |
| Weekend flag creates many false positives at Ruangguru | Medium | Medium | Frame as "review" not "fraud"; ask OQ-05 in the demo |
| No written commercial agreement for Phase 1 | Unknown | High | OQ-11. Settle scope and terms in writing before Phase 1 build starts. |

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
