# Library Borrow BD — Test Results (run 2026-11-04 17:00 slot)

## Unit tests — 14/14 pass
`node tests/logic.test.js` — book validation, loan validation (unknown book,
already-out, returned-book re-lend, due-before-lend, bad dates, empty borrower),
loanStatus bands (overdue / dueToday / dueSoon / out / returned), daysOverdue,
dashboard stats (2 books / 1 out / 1 overdue / 1 returned), return validation,
strict import validation (unknown bookId, duplicate open loan, bad root),
Bengali digits, daysBetween across a month boundary. 0 app bugs.

## Headless-Chrome smoke — 15/15 pass
`node tests/smoke.mjs` (Playwright headless_shell-1187 via raw CDP, file:// page) —
book add (1 row, stat 1), empty-title inline error with count unchanged, loan
recorded (1 loan, out=1), re-lending an out book rejected with loans unchanged,
overdue loan (stat 1, 2 loans), overdue filter exactly 1 row, return flow
(returned=1, out back to 1), BN toggle renders Bengali title + Bengali digit
"২" for 2 books, EN toggle restores title, localStorage persistence, books
survive reload (2), 390px viewport no horizontal overflow, 0 console errors,
0 page exceptions. 0 app bugs; no harness fixes needed.

## Manual verification
Scenario hand-checked in the smoke flow: Hajar Bochor Dhore lent to Rahim
(2026-11-01 → 2026-11-10), Padma Nadir Majhi lent to Karim (2026-10-20 →
2026-11-01, overdue by 3 days on 2026-11-04), Rahim return updates stats.
