# QA and UX audit (S6), 29 Sep 2026

Scope: every screen of the demo build, at 320 / 390 / 768 / 1280 px, production build (`next build && next start`) with Vercel's `/tmp` storage simulated (`VERCEL=1`). Tools: Playwright (Chromium, phone emulation with touch), axe-core 4 (WCAG 2.0/2.1 A and AA + best practice), scripted edge cases. Not tested: real iPhone/Android, real hotspot, screen mirroring, real Excel, screen readers (VoiceOver/TalkBack).

## Fixed in S6

| # | Severity | Finding | Fix | Re-test |
|---|---|---|---|---|
| F1 | Critical | Any dropped connection during Approve, Reject, Submit, Save rules, Reset or role switch crashed the whole app to Next's blank "Application error" screen. On a phone hotspot this is the most likely live-demo failure. | Every server call goes through `safe()`; failures show "Could not reach the server… Nothing was saved." inline. Form values are kept. App-level error screen with Try again as a last resort. | Offline approve and offline submit show the message; retry after reconnect succeeds; 0 page errors. |
| F2 | High | Fast double/triple tap on "Submit claim" created 3 identical claims (the guard read React state, which updates too late). | Synchronous lock (`useRef`) on submit. | 3 submits in one tick create 1 claim. |
| F3 | High | Two screens deciding the same claim: the last one silently overwrote the first. | Decisions only apply to pending claims; the losing screen gets "already decided… showing the saved decision" and refreshes. | Approve in tab 1 then Reject in tab 2: tab 2 shows the message and "Approved". |
| F4 | High (found in S5) | Vercel bundle only included the DB for `/`; other routes would likely crash on Vercel. | Trace includes for all routes. | Build output; Vercel runtime not directly checkable (preview needs Vercel login). |
| F5 | Medium | Filter bottom sheet was not a dialog for assistive tech: no `role="dialog"`, focus stayed behind it, Escape did nothing, page scrolled underneath. | Dialog role + label, focus moves in and is kept inside, Escape closes, focus returns to Filters, background scroll locked. Chips announce pressed state. | role=dialog present, Escape closes. |
| F6 | Medium | Touch targets under 44 px: role switch, Filters, Export (40 px), Back link (40 px), filter chips (~36 px), All-claims table links (9×16 px). | Raised to 44 px minimum (table links get a padded hit area). | Re-measured. |
| F7 | Medium | Unknown claim IDs showed Next's default unstyled 404 without navigation. | Own Not found screen with a way back. | `/claims/9999`, `/claims/abc`, `/submit/done/9999` all 404 with the app shell. |
| F8 | Low | Claim detail had no main heading (axe `page-has-heading-one`). | Amount is the `h1`, with "Claim N" for screen readers. | axe clean. |
| F9 | Low | Receipt zoom could not be closed with the keyboard. | Escape closes; close button gets focus. | Manual code check. |
| F10 | Low | Submit errors were announced but focus stayed on the button. | Focus moves to the error summary. | Focus lands on `#form-errors`. |
| F11 | Medium (ops) | Running the demo on the dev server means slow first loads of each screen and a one-off 500 seen during a dev recompile. | `npm run demo` = production build + start, reachable from the phone. | 8/8 production submits OK, 0 server errors in log. |

## Passed without changes

- No horizontal page scroll at 320, 390, 768, 1280 px on any screen.
- axe: 0 violations on queue, all claims, settings, submit, my claims after F8 (colour contrast passes, labels present, inputs 16 px so iOS does not zoom).
- Server validation holds when the phone's checks are bypassed: future date, 1-character merchant, Rp 999 all refused; HEIC/non-image refused with a clear message; unknown rejection reason refused.
- Receipt file route refuses anything that is not our own generated file name (path traversal returns 404).
- Page load (production, local): 120 to 185 ms per screen; first-load JS 103 to 108 KB per screen.
- Keyboard focus is visible (browser default outline kept).

## Open: known, not fixed (with reason)

| # | Severity | Issue | Why not fixed now / recommendation |
|---|---|---|---|
| O1 | High (demo) | Real phone + hotspot + mirroring never tested. | Needs Farrel's phone (OQ-23). Test tonight, not Wednesday morning. |
| O2 | Medium | Vercel preview: decisions and uploads live in `/tmp` of one server instance; they vanish when it sleeps or another instance answers. | By design for a preview (plan 5.1: demo runs locally). Phase 1 moves to Postgres + storage (plan 5.4). |
| O3 | Medium | Role is not enforced: an "employee" can open Finance URLs directly. | Demo has no login by design (plan 2.1). Phase 1 login and roles. |
| O4 | Medium | `npm run dev` / `npm run seed` wipe all demo data on every start. If the laptop server restarts mid-demo, submitted claims are gone. | Keeps the demo clean. Do not restart mid-demo; `npm run demo` does not re-seed (run `npm run seed` once before). |
| O5 | Low | All claims page is a wide table; on a phone it scrolls sideways inside its box. | Secondary screen for spot-checks. Phase 1 desktop table (plan 2.2 item 4). |
| O6 | Low | Every page recomputes the audit for all claims. | Fine at 80 to a few thousand claims. Phase 1: store results, paginate. |
| O7 | Low | CSV download on iPhone Safari opens a preview instead of saving. | Untested on device. Show export from the laptop view if it misbehaves. |
| O8 | Low | No PWA manifest / home-screen icon. | Phase 1 item (plan 2.2). Not needed Wednesday. |
| O9 | Low | Claim detail shows receipt above reasons (plan order). | Consider reasons first for auditors; product call. |

## Prioritized refactoring recommendations (Phase 1)

1. Replace SQLite with Postgres and add a real storage bucket for receipts (fixes O2, O6 path).
2. Login and roles enforced on the server for every action and page (O3); audit trail table for every decision and rule change.
3. One shared client helper for "call server, show error, lock while pending" (today repeated in 6 components after F1/F2).
4. Store engine results per claim when the claim or rules change, instead of recomputing on every request (O6); add paging to the queue.
5. Replace native `confirm()` dialogs with an in-app dialog that matches the sheet (consistent, testable, localisable).
6. Indonesian UI copy (all text is English today) with a string table.
7. End-to-end tests (the Playwright scripts used in this audit) in CI, run before every deploy.
