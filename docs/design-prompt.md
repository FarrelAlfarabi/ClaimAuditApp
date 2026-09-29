# Prompt for Claude Design: UI refresh for the claim audit app

Paste everything below the line into Claude Design.

---

Design a simple, attractive, mobile-first UI for a web app called **Claim Audit**. It is a working demo that Finance at a large Indonesian education-technology company will see on a phone. The look should feel at home next to that company's consumer learning apps. Target a **Ruangguru-like** feel: bright, friendly, optimistic and clean, with confident rounded shapes, lots of white space, and one saturated primary blue with a warm yellow or orange accent.

**Hard rule:** do not use any Ruangguru logo, wordmark, mascot, product name, illustration or trademark, and do not copy their exact brand assets. Use only a generic app name ("Claim Audit") and a simple neutral icon (a receipt with a check mark). Choose your own hex values in that spirit, and list them so we can compare them with the real brand guidelines later.

## What the app does (for context)
Employees submit expense claims with a photo of the receipt. A rules engine checks each claim (over the spending limit, duplicate, weekend, outside working hours, missing receipt) and gives it a risk level: **High, Medium or Low**, with plain-language reasons. The Finance team works a queue sorted riskiest first, approves or rejects, approves all the Low ones in one tap, and exports to Excel. Finance can change the rules (limits, working hours). All data in the demo is made up and must say so.

## Users and screens to design (phone first, 390 px wide; also show a 1280 px laptop version of the Finance queue and claim detail)
1. **Sign in:** email and password, plus two big "Quick demo sign-in" buttons (Finance, Employee).
2. **Finance · Audit queue:**
   - Title and three count tiles (High / Medium / Low) that also act as filters.
   - A banner: "60 Low-risk claims have no flags · Approve all 60".
   - A search box ("Search claim #, employee, merchant, reason…"), a Filters button with an active-count badge, and an Export CSV button.
   - Removable filter chips under the search.
   - A list of claim cards: risk badge, amount (large), claim #, employee · category, merchant · day and date, and the first reason plus "+N more".
3. **Filter bottom sheet:** a grab handle and the title "Filter and sort". Chip groups for sort, risk, flag type, audit status, category, department and receipt (has / none). Date range (from / to) and amount range (min / max) fields. Sticky "Clear" and "Show results" buttons.
4. **Finance · Claim detail:**
   - Amount as the headline, with the risk badge.
   - Reject / Approve buttons near the top.
   - The receipt image (tap to zoom full screen).
   - "Why it was flagged (score N)", a list of reasons each with its points (+3, +1).
   - Claim fields as label/value rows.
   - After a decision: a green (approved) or red (rejected) state showing the reason, "By finance.demo@… · time WIB", "Payout queued (MOCK)", and Undo / Next pending claim.
5. **Reject flow:** a list of 6 standard reasons as large selectable rows, an optional note, and Cancel / Confirm reject (destructive).
6. **Finance · All claims:** the same search and filters, as a compact table on laptop and cards on phone.
7. **Finance · Rules:** category limit fields with an "Rp" prefix and thousand separators, the near-limit percentage, working hours (start / end), Save and Reset to defaults, and a "Demo tools · Reset demo data" danger zone.
8. **Employee · Submit a claim:**
   - "Submitting as" line, then category, merchant, amount (Rp), date, optional time (hint: "needed for off-hours check") and optional description.
   - A receipt photo area: take or choose a photo, preview, Change / Remove.
   - A large Submit button.
9. **Employee · Result:** a big risk badge, "N reasons Finance will see" with points, then Submit another / My claims.
10. **Employee · My claims:** search, filters, and cards with risk, status chip, amount, merchant and date, plus the rejection reason or "payout queued".
11. **"Coming" tab:** a catalogue of 9 planned features grouped Phase 1 / Phase 2 (manager approval inbox, high-value escalation, claim status tracker, budget warning while submitting, notifications, audit trail, users and org import, HRIS/payroll sync, spend analytics). Each has a card and a mock screen. **Every preview screen must carry an unmistakable "DEMO PREVIEW · NOT WORKING YET" banner** (for example a dashed amber border with diagonal stripes). Its buttons must look clearly inactive, not just faded.

## App frame
- A top bar with the app name, a small "DEMO · MOCK DATA" tag, and the signed-in user (name + role) with Sign out.
- Bottom tabs:
  - Finance: Queue, All claims, Rules, Coming.
  - Employee: Submit, My claims, Coming.
- Respect the iPhone safe areas.

## Design system to deliver
- Colour tokens, light mode required (dark mode optional): primary, accent, surface, card, border, text primary / secondary / muted, and danger.
- **Reserved status colours:** risk High / Medium / Low, plus audit status Pending / Approved / Rejected. Never reuse these for decoration. Always pair them with a text label, never colour alone.
- **Type scale:** one friendly rounded sans (a free Google Font such as Plus Jakarta Sans, Nunito or Poppins). Rupiah amounts use tabular figures and Indonesian formatting ("Rp 2.100.000").
- **Spacing and shape:** the spacing scale, corner radius (large and friendly: 12–16 px cards, fully rounded chips) and elevation. Keep shadows subtle.
- **Components:** button (primary, secondary, destructive, disabled/preview), chip / filter chip, risk badge, status chip, claim card, search field, bottom sheet, count tile, form field with inline error, banner (info, MOCK, preview, error), empty state, and toast / inline error.
- **States:** loading, empty ("No claims match. Clear search and filters"), error ("Could not save. Check the connection… Nothing was saved."), and offline.

## Constraints
- **Accessibility:** WCAG 2.1 AA, meaning text contrast at least 4.5:1 and touch targets at least 44 × 44 px. Keep a visible focus ring, and show every form error as text next to its field.
- **Phone form fields:** 16 px minimum font size so iOS doesn't zoom.
- **Keep what works:** the layout and flows in the current app, and the names of the screens and fields. Refresh the look without redesigning the flow, because the underlying app is already built and tested.
- **Visible labels:** the "MOCK" labels and the preview banners must stay clearly visible; they are part of the honesty of the demo.
- **Language:** English UI is fine for now; leave room for Indonesian strings, which are about 20–30% longer.

## Output
Give me:
- the design tokens (CSS variables or Tailwind v4 theme values),
- the component specs,
- mock-ups of every screen above at 390 px, plus the two laptop screens,
- a short note on how each choice supports the Ruangguru-like feel without using their brand assets.
