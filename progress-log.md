# Progress Log: Ruangguru Claim Audit App

Owned by Thread 02 (Build). Updated in the same commit that finishes a stage.
Entry format: Date/time | Stage | % complete | Blocker | Hours left to Wed demo, then what changed, decisions, discrepancies vs. master-plan.md.

---

## 2026-09-28 07:37 UTC (14:37 WIB) | S0 | 100% of S0 (about 13% of the 15h plan by estimate, S0 = 2h) | No blocker | Hours left to Wed

**Hours left:** about 33h of wall clock to Wed 00:00 WIB. Demo time on Wed is still unknown (OQ-01), so the true cutoff can't be computed. Build budget left per plan: about 13h of the 15h (S1 to S7). Actual time spent on S0 by Farrel is not measurable from the code.

**What changed and why**
- Next.js 15 (App Router) + TypeScript + Tailwind v4 scaffold. shadcn/ui style set up (`components.json`, `cn` util, `Table` and `Badge` components). Why: the stack in master-plan section 5.
- SQLite via better-sqlite3. Schema in `src/lib/db.ts`: departments, employees, claims (with optional `transaction_time` per A-04, nullable `receipt_path`).
- `scripts/seed.ts`: 80 claims, 3 MOCK departments, 12 MOCK employees. Deterministic (fixed random seed), so the same IDs come out every run.
- Planted problems, each claim carries exactly one problem so S1 tests have clear answers: 4 over limit, 3 duplicate pairs (6 claims, merchant names differ only in case/punctuation/spacing, different employees), 5 weekend, 3 off-hours (22:30, 02:40, 05:45), 2 missing receipt. 60 clean claims.
- Answer key written to `tests/fixtures/seed-expected.json` (claim IDs per problem). S1 tests will assert against it.
- Limits, near-limit %, working hours and weekend days live in `config/rules.config.draft.json`, labeled MOCK. The seed reads from it; nothing hardcoded. S1 formalizes it as `rules.config.json`.
- Clean claims are kept between 20% and 70% of their limit, so none fall into the 80% near-limit band by accident.
- 6 static placeholder receipts in `public/mock-receipts` (SVG, visibly marked MOCK).
- `/` page: raw claim table read straight from the DB, day of week shown next to the date so weekend claims are easy to spot. MOCK banner, MOCK limits legend, MOCK badge on manager status. No flagging.
- `npm run dev` re-seeds first, so the DB always matches the answer key.

**Verified**
- `tsc --noEmit` and `eslint` pass.
- `npm run dev` served `/` with 80 rows; receipt images return 200.
- Independent throwaway check (not committed, not the S1 engine) against the seeded DB found exactly the planted IDs per problem and zero hits on the 60 clean claims, including near-limit.

**Decisions**
- Config file named `rules.config.draft.json` for now, to be renamed/formalized in S1 (per instruction not to start S1).
- Removed Google Fonts (`next/font/google`) from the scaffold: it needs internet at dev time, and the demo runs locally (venue Wi-Fi risk, section 5).
- Working hours placeholder: 07:00 to 21:00. Invented, MOCK.

**Discrepancies vs. master-plan.md / instructions**
- The S0 brief said the repo was empty with 0 commits. It was not: `master-plan.md` v1.1 and a `progress-log.md` stub were already committed (commits c4fab7e, 6e5ca7a). Step 0 was therefore skipped, and master-plan.md was left untouched. Also, the brief referenced master-plan content that was not actually included in the message; the committed v1.1 was used as the source of truth.
- The shadcn CLI could not reach its registry from the build environment, so the two shadcn components were added by hand following shadcn's source. On a normal machine, `npx shadcn add ...` will work for later stages.
- Seed dates are all in Sep 2026 (1 to 25). Real claims will span months; not relevant for the demo.

## 2026-09-28 ~07:50 UTC (14:50 WIB) | S1 | 100% of S1 (S0+S1 about 30% of the 15h plan by estimate) | No blocker | about 32h wall clock to Wed 00:00 WIB; demo time still unknown (OQ-01)

**What changed and why**
- `config/rules.config.draft.json` renamed to `config/rules.config.json` and extended with score weights and risk bands (master-plan 5.3). All values MOCK.
- `src/lib/rules/engine.ts`: pure TypeScript engine. Rules: over limit, near limit (80%+, only if not over), duplicate (same amount + date + normalized merchant, across all employees; plus exact file-hash match when a hash exists), weekend, off-hours (only when a time is entered), missing receipt. Each hit carries points and a plain-language reason. Score to Low / Medium / High via config bands.
- `tests/engine.test.ts` (16 tests, `npm test`): every planted problem is caught by ID from the S0 answer key, nothing extra is flagged, all 60 clean claims stay Low with zero hits, duplicates name their partner, risk levels match the scoring table, plus boundary tests (80% near limit, at-limit, 07:00/21:00 hours, no time), file-hash duplicate, and "change config, result changes". Also covers the S5 demo case (weekend + over limit = High with 2 reasons).
- Vercel demo build prep: `npm run build` now seeds the DB first, and `next.config.ts` bundles `data/claims.db` with the server so the page can read it on Vercel.

**Verified:** 16/16 tests pass, `tsc` and `eslint` clean, `npm run build` succeeds locally.

**Decisions**
- Test runner: Node's built-in runner via tsx instead of Vitest (Vitest's latest version conflicts with the project's Node types; not worth the time).
- File-hash duplicate check only uses a `receipt_hash` field, which seed claims do not have. The 6 placeholder images are shared across 80 claims, so hashing them would mark nearly every claim as a duplicate. Real hashing arrives with the S5 submit form.
- Engine is not yet wired into the UI; that is S2 (queue). The raw list page is unchanged.
- Vercel demo build added on Farrel's request.

**Discrepancies / risks vs. master-plan.md**
- Master plan section 5 says SQLite does not persist on Vercel and the demo runs locally. Still true. The Vercel build works for reading (list, queue, detail), but approve/reject/submit (S3, S5) will NOT persist there: Vercel's file system is read-only and resets. Treat the Vercel URL as a shareable preview, not the demo machine. If a working hosted demo is required, that is a scope change (e.g. move to Supabase Postgres) and needs a decision log row.

## 2026-09-29 | S2 | 100% of S2 (S0 to S2 about 7.5h of the 14h build plan by estimate) | No blocker | Wed demo time still unknown (OQ-01); feature freeze Tue 23:00

**Plan check before this stage:** master-plan.md on `main` had moved to v2.2 (v2.0 full deal, v2.1 mobile-first for all roles + phone-only demo, v2.2 Finance on phone and desktop). The build branch was still on v1.1. Merged `main` into the build branch (no conflicts) and built S2 against v2.2.

**What changed and why**
- Phone app shell (sticky top bar with "DEMO · MOCK DATA", bottom tabs Queue / All claims). v2.1 moved this into S0; it was missing, so it was added here.
- `/` is now the audit queue: claims run through the S1 engine, riskiest first, shown as cards (risk badge, amount, employee, category, merchant, day and date, first reason). High / Medium / Low count tiles also act as one-tap filters.
- Filters in a bottom sheet (scrolls on short screens): risk, category, department (MOCK), manager status (MOCK). Filters live in the URL so the server does the filtering.
- `/claims/[id]` claim detail: receipt on top with tap-to-zoom full screen (or a red "No receipt attached" box), then "Why it was flagged" with points and plain reasons, then claim fields. On a laptop, receipt and data sit side by side.
- The old raw list moved to `/claims` (All claims tab); the ID links to the detail.
- `npm run dev` now listens on all network addresses (`-H 0.0.0.0`) so a phone on the same hotspot can open it (S5 still has to test the hotspot link itself).
- Next.js dev badge hidden so it does not show on the demo phone.

**Verified (Playwright at 390x844, phone size)**
- Queue shows 80 cards, counts 10 High / 10 Medium / 60 Low, matching the S0 answer key (4 over-limit + 6 duplicates = 10 High; 5 weekend + 3 off-hours + 2 missing receipt = 10 Medium).
- Filter sheet, choosing Medium, gives exactly 10 cards.
- Tapping the first card opens its detail: 1 tap from the queue, 2 with a filter. Meets "find and open any flagged claim in 2 taps".
- `tsc`, `eslint` clean; 16/16 engine tests still pass.
- Not verified: a real phone (only emulated size); tap-to-zoom was not clicked in the automated run.

**Decisions**
- Status filter only has "approved" today, because audit decisions (approve/reject) arrive in S3. Kept so S3 needs no filter rework.
- Claim detail follows the plan's order (receipt, then reasons). Worth reconsidering in S6: for an auditor, reasons first may be faster.

**Discrepancies vs. master-plan.md v2.2**
- v2.1 says "as of Mon 14:53 no stage had started (progress-log.md is empty)". Not true: S0 and S1 were committed on `claude/kind-pasteur-c39hp2`, just not merged to `main`, so the log on `main` looked empty. The re-timing in 4.1 is pessimistic by about 4.5h. Suggest correcting it in the next plan revision.
- 5.1 still says the demo does not deploy to Vercel. A Vercel preview exists (on request); it works for read-only screens only, and S3/S5 writes will not persist there.
- S0's v2.2 "done when" (raw list shown on a phone over the laptop's address) is not confirmed on a real phone yet. Move it to the S5 hotspot test.

## 2026-09-29 | S3 | 100% of S3 (S0 to S3 about 9.5h of the 14h build plan by estimate) | No blocker | Wed demo time still unknown (OQ-01); feature freeze Tue 23:00

**Plan check:** master-plan.md on `main` unchanged since v2.2. Built against v2.2 section 4.2 S3.

**What changed and why**
- Claims now carry a Finance decision: `audit_status` (pending / approved / rejected), `audit_reason`, `audit_note`, `audited_at`.
- Claim detail: Approve and Reject buttons right under the amount (reachable without scrolling). Reject opens a list of standard reasons (MOCK list, kept in `rules.config.json`) plus an optional note. After a decision: result shown, Undo, and "Next pending claim →" to keep the audit flow moving.
- Queue: "Approve all N" bar for pending Low-risk claims, with a confirm step. The list of Low claims is worked out on the server by the engine, never trusted from the phone.
- Queue: decided claims show an Approved / Rejected chip and drop below pending ones. The status filter now filters on audit status (the old manager-status filter only ever had "approved").
- CSV export of verified (approved) claims at `/api/export`, downloaded from the queue. UTF-8 with BOM and Windows line endings so Excel shows Indonesian text and columns correctly; fields with commas or quotes are escaped.
- Vercel: the bundled DB is copied to `/tmp` at first use so approve/reject work there too, but only for the life of one server instance (see risks).

**Verified (Playwright, 390x844)**
- Reject claim #8 with "Over category limit" and a note containing quotes and a comma, saved and shown.
- Approve claim #14, then Undo, back to pending.
- Batch approve: exactly 60 Low claims approved (matches the 60 clean seed claims).
- CSV: 61 data rows (60 Low + #14), 13 columns on every row, BOM present, parses cleanly.
- Rejected filter shows exactly 1 claim.
- `tsc`, `eslint` clean; 16/16 engine tests pass.
- Not verified: opening the CSV in real Excel (no Excel here), and a real phone download.

**Decisions**
- Undo added (not in plan): a mis-tap on a phone during the demo would otherwise be permanent. Very small cost.
- Export = approved claims only ("verified claims" in plan 2.1). Rejected claims are not exported.
- `npm run dev` still re-seeds on every start, which wipes decisions. Good for the demo (clean start), but restarting the server mid-demo loses progress. The S5 reset button will make this explicit.

**Risks / discrepancies vs. master-plan.md v2.2**
- Vercel writes are temporary: approvals live in `/tmp` of one server instance and vanish when it sleeps (roughly minutes idle) or when a different instance answers. Someone clicking around the Vercel link may see decisions "disappear". Fine as a preview; not a demo machine. Plan 5.1 still says no Vercel deploy; the plan should record the preview.

## 2026-09-29 | S4 | 100% of S4 (S0 to S4 about 11h of the 14h build plan by estimate) | No blocker | Wed demo time still unknown (OQ-01)

**What changed and why**
- New "Rules" tab (`/settings`): Finance edits category limits, the near-limit %, and working hours on the phone. Amounts show with Indonesian thousand separators and a number keypad; hours use the phone's time picker.
- Saved changes go into a `settings` table in the DB and are laid over `config/rules.config.json`. The engine reads the combined rules on every page load, so a change hits the queue at once, with no restart and no code change. "Reset to defaults" removes the override.
- Validation runs on the server (source of truth): limits Rp 1.000 to Rp 1.000.000.000 whole numbers, near-limit 50 to 100%, HH:MM times, end after start. Errors show under each field and are linked for screen readers.
- The All claims page now shows the rules actually in force (was: file values only).

**Verified (Playwright, 390x844)**
- Empty Meals limit + end 06:00 is refused with two field errors; nothing saved.
- Meals limit Rp 100.000: queue goes from 10 High / 10 Medium / 60 Low to 26 / 11 / 43. Meets "a limit changed on the phone changes a claim's risk without touching code".
- Reset returns to 10 / 10 / 60. 16/16 engine tests still pass.

**Decisions**
- Score weights and risk bands are not editable on screen (plan S4 lists limits and hours only). They stay in the file.
- Re-seeding (`npm run dev`) clears Settings changes along with everything else.

## 2026-09-29 | S5 | Code 100%; hotspot + mirroring test 0% (needs Farrel's phone) | Blocker for full S5: OQ-23 (which phone, how mirrored) | Wed demo time still unknown (OQ-01)

**What changed and why**
- Role switcher (Employee / Finance) in the top bar instead of login. Stored in a cookie; each role gets its own bottom tabs (Employee: Submit, My claims. Finance: Queue, All claims, Rules).
- Submit form (`/submit`): MOCK employee picker, category, merchant, amount (grouped, number keypad), date (defaults to today in Jakarta time, no future dates), optional time (hint: needed for the off-hours check), optional description, receipt photo from camera or gallery with preview, change and remove.
- Photos are shrunk on the phone to max 1600px JPEG before upload (a 650 KB 3000x4000 test photo became 75 KB). Keeps uploads fast over a phone hotspot.
- Server checks every field (source of truth) and returns errors per field. Files: images only, max 8 MB, saved under their SHA-256 name so an identical photo triggers the engine's file-hash duplicate rule (S1 rule, now live).
- After submitting: a result screen with the engine's risk and every reason (the demo's "live" moment), then Submit another / My claims.
- "Reset demo data" (Rules tab, with confirm): restores the 80 seed claims, clears decisions, demo submissions, uploads and rule changes, without restarting the server.
- Uploaded receipts are served by `/api/receipts/[name]`, which only accepts our own generated file names (no path tricks).
- MOCK labels: top bar "DEMO · MOCK DATA" on every screen, "(MOCK employee)" on the picker, placeholder receipts labeled, uploaded ones labeled "uploaded in demo".

**Bugs found and fixed in this stage**
- Vercel bundle only included the DB for the `/` route (`outputFileTracingIncludes` key `/`). Detail, export and other routes would likely have crashed on Vercel. Now `/**`.
- Receipt viewer showed an empty box while an image loaded slowly, and could stay hidden if the image loaded before the page became interactive. Now: loading text, error text, and a check on mount.

**Verified (Playwright, 390x844)**
- Empty submit: 3 field errors (category, merchant, amount), nothing saved.
- Meals, Rp 450.000, Sat 26 Sep, with photo: result High with exactly 2 reasons (over limit, Saturday). Meets S5 "done when" on emulated phone size.
- Same photo on a second, different claim: flagged "identical receipt file as claim #81".
- Switch to Finance: the new claim is the top card in the queue; its receipt loads and zooms.
- Reset: back to 80 claims, uploads folder emptied. 16/16 engine tests pass.

**Not verified / open**
- Real phone over the phone's hotspot, and mirroring to the laptop (plan S5). Cannot be done from here. Farrel must test: laptop joins phone hotspot, run `npm run dev`, open `http://<laptop-ip>:3000` on the phone.
- iPhone HEIC photos: Safari normally converts to JPEG when uploading; if not, the server rejects with a clear message. Untested on a real iPhone.
- One 500 error ("Unexpected end of JSON input") appeared once on the result page during a dev-server recompile; the same page then loaded fine 4 times. To be re-checked on a production build in S6.
- My claims shows all demo submissions (no login), labeled "Submitted in this demo".

## 2026-09-29 | S6 | 100% of S6 (S0 to S6 about 13.5h of the 14h build plan by estimate; actual hours not measurable from the repo) | Blocker for demo readiness: real phone + hotspot + mirroring untested (OQ-23) | Feature freeze Tue 23:00

**What happened:** S6 was used for a full QA and UX audit (asked for by Farrel) instead of open-ended polish. Report: `docs/qa-audit.md`. Demo runbook for S7: `docs/demo-runbook.md`.

**Fixed (details and re-tests in docs/qa-audit.md)**
- Critical: a dropped connection during any save crashed the whole app. Now an inline "Could not reach the server… Nothing was saved." with values kept, plus an app-level error screen.
- High: triple tap on Submit created 3 claims (now 1). Two screens deciding the same claim overwrote each other silently (now the second is told and refreshed).
- Medium: filter sheet is now a proper dialog (focus, Escape, scroll lock); touch targets raised to 44 px; styled Not found page.
- Low: detail page heading for screen readers; Escape closes receipt zoom; focus moves to the error summary on a failed submit.
- New `npm run demo`: production build reachable from the phone. Use it on Wednesday instead of `npm run dev` (faster first loads, no dev recompiles).

**Verified:** production build with Vercel `/tmp` storage simulated. No sideways scrolling at 320 to 1280 px; axe 0 violations after fixes; offline, double-tap, conflict, bad-input, wrong-file and not-found cases all behave; 8/8 production submits OK; 16/16 engine tests pass. Laptop width (1280) checked for Finance queue and detail (receipt beside data).

**Not verified:** real phone, hotspot, mirroring, iPhone photo format, CSV on iPhone, real Excel, screen readers.

**Decisions**
- Kept native `confirm()` for batch approve and resets (works on phones; replacing it is Phase 1 polish).
- `npm run demo` does not re-seed; run `npm run seed` once before the demo.

## 2026-09-29 13:30 WIB | S7 prep + login (scope change, master-plan v2.4) | S7 prep 100%, rehearsals 0% (need Farrel's phone) | Blocker: first real Supabase sign-in cannot be done from the build environment (no network to supabase.co) | ~9.5h to the Tue 23:00 freeze

**Asked by Farrel:** proceed to S7, add user login with Supabase, add anything else missing.

**What changed and why**
- Login with Supabase Auth: new project `ruangguru-claim-audit-demo` (Singapore, free plan), two MOCK accounts (finance.demo@example.com, employee.demo@example.com), password set by Claude and shared in chat only. Role lives in `app_metadata` (users cannot change it).
- Middleware keeps the session fresh and sends signed-out visitors to Sign in (the page they wanted is reopened after). Every page, server action, the CSV export and the receipt route check the role on the server.
- Login page: email + password, plus a demo-only one-tap Finance / Employee sign-in on the laptop (`DEMO_QUICK_LOGIN=1`; password stays on the server). Off on Vercel.
- A signed-in employee always submits as their own MOCK employee; "My claims" shows only their claims.
- Decisions record who and when ("By finance.demo@example.com · time WIB"); CSV has "Audited by".
- Kill switch `AUTH_DISABLED=1`: login off, role switcher back. For a hotspot without mobile data.
- Missing vs plan 2.1: MOCK payout status ("Dicairkan") on approved claims; home-screen icon + web app manifest.
- S7 prep: 62-second phone-size backup video with captions; runbook updated for login, internet need and kill switch.
- Vercel: Supabase URL and publishable key set for production, preview and development.

**Bugs found and fixed**
- Sign-out left a stale "Could not save" error on the next screen (found in the backup video). Fixed.
- "Sign-in failed" when Supabase is unreachable told you nothing useful; now it names the fallback.

**Verified:** 13 login checks + unreachable-service + kill-switch against a local stand-in for Supabase, production build, 390 px (docs/qa-audit.md, Login section). 16/16 engine tests. tsc and eslint clean.

**Not verified:** real sign-in against the Supabase project; login on a real phone; login on Vercel.

**Decisions / discrepancies:** login was "out for Wednesday" in the plan (v2.4 records the reversal). Data stays in SQLite; moving it to Supabase is Phase 1. Login is demo scaffolding, not the Phase 1 login item.

## 2026-09-29 ~14:30 WIB | Search/filters + Coming previews + design brief (master-plan v2.5) | 100% | No blocker | ~8.5h to the Tue 23:00 freeze

**What changed and why**
- One shared search and filter engine (`src/lib/claim-filters.ts`) used by the Finance queue, All claims and My claims. Free-text search across claim #, employee, merchant, category, department, description, amount, date and flag reasons ("#8" means claim 8 exactly). Filters: risk, flag type, audit status, category, department, receipt, date range, amount range. Five sort orders. Everything is in the link.
- Search box updates as you type; removable chips show every active filter plus "Clear all"; empty states offer a way back; the filter sheet refuses min > max and from > to.
- All claims page rewritten: it still said "no rules engine yet". It now shows risk, flags and status with the same search and filters.
- "Coming" tab with 10 static preview screens of planned features, each with a "DEMO PREVIEW · NOT WORKING YET" banner and disabled buttons.
- `docs/design-prompt.md`: brief for Claude Design (Ruangguru-like look, no Ruangguru logos or names).

**Verified (production build, 390 px):** "gramedia" 6 results; "#8" exactly 1; reason text "weekend" 5; flag Duplicate + highest amount 6, sorted; 5 to 6 Sep 2 claims; no receipt 2; High + Meals 3, removing the Meals chip gives 10; min > max gives 0; All claims "kopi" 9 rows; empty state shown. axe 0 violations on queue, All claims, Coming, and two preview screens; no sideways scroll; 16/16 engine tests.

**Not verified:** on a real phone; with login on (tested with AUTH_DISABLED=1; the new pages use the same role checks already tested).

## 2026-09-29 ~15:00 WIB | More filters (people and others) | 100% | No blocker

- Finance (queue and All claims): filter by submitting employee, manager (MOCK), and the Finance user who decided (or "decided without login"); plus number of flags, weekday/weekend, time entered or not, sample vs demo-submitted. New sorts: recently submitted, recently decided. Search also matches manager and decider.
- Employee My claims: search and filters now always visible (were hidden until the first claim); added risk, flag, number of flags, weekday/weekend, time entered. Employees never see other people's claims or the people filters.
- Verified (production build, 390 px): Andi 4, Rina's team 30, no flags 60, weekend 5, time entered 42, decided without login 1; filter sheet with dropdowns works; axe 0 on queue and open sheet; employee search and category filter correct; 0 JS errors.

## 2026-09-29 ~18:10 WIB | Repo check + claims saved in Supabase (master-plan v2.6) | 100% built; real-internet test 0% | Blocker: this environment cannot reach supabase.co, so the app has not been run against the real project | ~5h to the Tue 23:00 freeze

**Repo check (asked by Farrel):** `main` = `bda7a41` (OCR preview removed), identical to the build branch before this work. Nobody else has pushed. Everything from S0 to the search/filters and Coming tab is on `main`. Earlier plan status rows saying v2.4/v2.5 were "not on main" were stale; fixed in v2.6.

**Asked:** save claims to a database, applied in Supabase.

**What changed and why**
- Database on the real Supabase project (`ruangguru-claim-audit-demo`): tables `departments`, `employees`, `claims`, `settings`, a pristine copy `claims_seed`, and a private `receipts` bucket. Migrations `0001_claims.sql`, `0002_pin_helper_search_path.sql`; data `supabase/seed.sql` (80 claims, 12 employees, 3 departments, generated from the same seed the tests use).
- Security: row level security on every table. Finance reads all claims; an employee reads only their own. Every write (submit, decide, undo, batch approve, rules, reset) goes through a database function that checks the caller's role again; the API has no direct write access to tables. The duplicate check for an employee sees only amount, date, merchant and receipt fingerprint of other people's claims.
- App: one data layer (`src/lib/store.ts`) with two backends. Supabase when login is on; local SQLite when `AUTH_DISABLED=1`, the offline fallback. Receipt photos go to the private bucket and are served only to signed-in users.
- Bug found and fixed while testing: after "Approve all", the bar disappeared at once, so no confirmation was ever shown (introduced in S6). It now shows "Approved N Low-risk claims."
- Found before applying: Finance could not delete receipt files (reset would leave photos) and re-uploading an identical photo would need an update permission. Fixed in the migration.
- Security advisor on the real project: fixed the two helper functions with a mutable search path. Remaining warnings are intentional (signed-in users may call the role-checked functions; `claims_seed` has no policies on purpose). **Not fixed: "leaked password protection" is off.** That is an Auth setting in the Supabase dashboard (may need a paid plan); it matters for real users, not for two MOCK demo accounts.

**Verified**
- On the real project (SQL run as each role, changes rolled back): Finance sees 80 claims, decides once and a second decision returns 0; an employee sees 4 (their own) and 0 of others', can submit as themselves only; employee cannot decide, reset or change rules; Finance cannot submit; direct table updates, deletes and inserts change 0 rows or are blocked; a user with no role sees 0 claims; anonymous is blocked from claims, the view and the functions.
- The app against a real Postgres built from the committed migration files, behind a local stand-in for the Supabase gateway: 12 of 12 checks (finance queue 80, reject and approve saved with who decided, batch approve 60, rules saved and reset, CSV 61 rows, employee submit with photo shows High with 2 reasons incl. duplicate against another person's claim, employee sees only own, employee blocked from Finance pages, receipt visible to Finance, reset back to 80). No JS errors.
- Offline fallback `AUTH_DISABLED=1`: all filter and people-filter checks still pass. 16/16 engine tests, tsc and eslint clean.

**Not verified:** the app against the real Supabase over the internet (real sign-in, real storage upload); storage permissions on the real bucket (created and policies written, not exercised); Vercel with the new backend.

**Decisions:** claims are stored in Supabase, replacing the v2.4 decision to keep them local (Farrel's request). This is pushed to the build branch only, not `main`, so Farrel can try the Vercel preview first.

**Risks:** every screen now needs internet, not just login. Free Supabase projects pause after a week idle. If the hotspot has no mobile data, use the offline fallback (runbook).
