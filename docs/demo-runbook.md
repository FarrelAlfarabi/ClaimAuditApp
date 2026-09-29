# Demo runbook (S7 prep), Wednesday 30 Sep 2026

Everything below is MOCK data. Say so in the first minute.

## Tonight (Tue): must do before Wednesday

1. Phone hotspot ON. Laptop joins the phone's hotspot.
2. On the laptop: `npm install` (once), then `npm run seed` then `npm run demo`. Note the laptop's IP (`ipconfig` / `ifconfig`, e.g. 172.20.10.2).
3. On the phone browser: `http://<laptop-ip>:3000`. Check: queue loads, a claim opens, a photo upload works.
4. Mirror the phone to the laptop (method depends on phone, OQ-23) and check it is readable on the projector / screen share.
5. Record a backup screen video from the phone of the script below.
6. Settings > Reset demo data before closing.

## Script (under 10 minutes)

1. **Finance, queue (1 min).** "80 claims this month. The engine sorted them: 10 High, 10 Medium, 60 Low." Tap High.
2. **Why flagged (2 min).** Open the duplicate pair (#5 and #11: same amount, date, Gramedia vs gramedia, different employees). Open an over-limit claim (#8, hotel Rp 2.100.000 vs Rp 1.500.000 limit). Tap the receipt to zoom. Say: duplicates are data matches, not image recognition (A-05).
3. **Decide (1 min).** Reject #8 with "Over category limit". Back to queue, it moved down with a Rejected chip.
4. **Batch (1 min).** "60 claims have no flags." Approve all 60. Export CSV (61 or so rows).
5. **Tune the rules (1.5 min).** Rules tab: Meals limit Rp 300.000 to Rp 100.000, Save. Queue: High jumps from 10 to 26. "Your real policy goes here." Reset to defaults.
6. **Live submit (2 min).** Switch to Employee. Submit: Meals, "Sate Senayan", Rp 450.000, date last Saturday, take a photo of any paper. Result: High, 2 reasons. Switch to Finance: it is the top card.
7. **Close (1 min).** What is real (engine, queue, decisions, rules, export) vs mock (people, limits, manager approval). Ask OQ-01/02/07/12/13/14.

## If something breaks

- Phone cannot reach laptop: use Chrome on the laptop in phone view (DevTools device mode, iPhone 14), same URL on localhost.
- App error or wrong data: Rules tab > Reset demo data, or stop the server and run `npm run seed && npm run demo`.
- Everything fails: play the backup video.
- "Could not reach the server": connection dropped; nothing was saved. Reconnect and tap again.
