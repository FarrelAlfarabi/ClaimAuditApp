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
