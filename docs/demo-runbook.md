# Demo runbook (S7 prep), Wednesday 30 Sep 2026

Everything below is MOCK data. Say so in the first minute.

## Tonight (Tue): must do before Wednesday

0. **Login setup (once).** Copy `.env.example` to `.env.local` and put the demo password (from Claude's message; not in git) after `DEMO_PASSWORD=`. With login on, **the laptop needs internet for the whole demo** (every page checks the session with Supabase), so the phone hotspot must have mobile data, not just Wi-Fi between the two devices.
1. Phone hotspot ON (with mobile data). Laptop joins the phone's hotspot.
2. On the laptop: `npm install` (once), then `npm run seed` then `npm run demo`. Note the laptop's IP (`ipconfig` / `ifconfig`, e.g. 172.20.10.2).
3. On the phone browser: `http://<laptop-ip>:3000`. You land on **Sign in**. Tap **Finance** (quick demo sign-in). Check: queue loads, a claim opens. Sign out, tap **Employee**, check a photo upload works. This is the first time login is tested against the real Supabase project: if it fails, see "If something breaks".
3b. Optional: on the phone, Share > Add to Home Screen. It opens full-screen with its own icon.
4. Mirror the phone to the laptop (method depends on phone, OQ-23) and check it is readable on the projector / screen share.
5. Record a backup screen video from the phone of the script below.
6. Settings > Reset demo data before closing.

## Script (under 10 minutes)

0. **Sign in (20 s).** "Each person has their own login; Finance and employees see different screens." Tap Finance.
1. **Finance, queue (1 min).** "80 claims this month. The engine sorted them: 10 High, 10 Medium, 60 Low." Tap High.
2. **Why flagged (2 min).** Open the duplicate pair (#5 and #11: same amount, date, Gramedia vs gramedia, different employees). Open an over-limit claim (#8, hotel Rp 2.100.000 vs Rp 1.500.000 limit). Tap the receipt to zoom. Say: duplicates are data matches, not image recognition (A-05).
3. **Decide (1 min).** Reject #8 with "Over category limit". It records who decided and when. Back to queue, it moved down with a Rejected chip.
4. **Batch (1 min).** "60 claims have no flags." Approve all 60. Export CSV (61 or so rows).
5. **Tune the rules (1.5 min).** Rules tab: Meals limit Rp 300.000 to Rp 100.000, Save. Queue: High jumps from 10 to 26. "Your real policy goes here." Reset to defaults.
6. **Live submit (2 min).** Sign out, tap Employee. Submit: Meals, "Sate Senayan", Rp 450.000, date last Saturday, take a photo of any paper. Result: High, 2 reasons. Sign out, tap Finance: it is the top card.
7. **Close (1 min).** What is real (engine, queue, decisions, rules, export, login and roles) vs mock (people, limits, manager approval, payout). Ask OQ-01/02/07/12/13/14.

## If something breaks

- **"Cannot reach the login service", or you keep landing on Sign in:** the hotspot has no mobile data or Supabase is down. Stop the server (Ctrl+C) and restart with login off: `AUTH_DISABLED=1 npm run demo` (Windows PowerShell: `$env:AUTH_DISABLED=1; npm run demo`). The Employee / Finance switcher comes back. Everything else works the same. Say "login is switched off for the demo network".

- Phone cannot reach laptop: use Chrome on the laptop in phone view (DevTools device mode, iPhone 14), same URL on localhost.
- App error or wrong data: Rules tab > Reset demo data, or stop the server and run `npm run seed && npm run demo`.
- Everything fails: play the backup video.
- "Could not reach the server": connection dropped; nothing was saved. Reconnect and tap again.

## Backup video

A 62-second phone-size recording of this script (with on-screen captions) was produced by Claude as `claim-audit-backup-demo.webm`. It was recorded against a local stand-in for Supabase, not the real project, so it shows the real screens but not a real login. Record your own from the phone tonight if you can; keep this one as the fallback.
