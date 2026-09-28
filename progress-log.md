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
