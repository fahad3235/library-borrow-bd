# Library Borrow BD

An offline, bilingual (English / বাংলা) personal book-lending tracker for Bangladesh.
Lend books to friends, set a return date, and see at a glance who has what — and
what is overdue. Everything stays in your browser; there is no account and no server.

## Problem

Books lent to friends disappear into memory. A notebook entry is easy to lose, and
there is no reminder when a book is weeks overdue. This app is the notebook, with
due-date math done for you.

## Features

1. **Book catalogue** — add books with title, author, optional ISBN and note;
   search by title or author; delete a book that is not currently out.
2. **Lending flow** — pick an available book, enter the borrower, lend date and
   due date. Validation rejects an empty borrower, an invalid date, a due date
   before the lend date, and lending a book that is already out.
3. **Return + overdue tracking** — one-tap return; badges show Available, Out to
   someone, Due today, Due in N days, Overdue by N days, and Returned.
4. **Dashboard + filters** — total books, out now, overdue, and returned counts;
   loan filters for All / Out now / Overdue / Returned plus borrower search.
5. **Data portability** — JSON export, strict import validation (rejects unknown
   books, bad dates, or two open loans for one book), and a typed-DELETE erase-all.
6. **Bilingual UI** — English / বাংলা toggle persisted in localStorage, with
   Bengali digits in Bengali mode; responsive down to 390px mobile width.
7. **Fully offline** — zero network requests; state lives in localStorage only.

## Stack

Plain HTML, CSS, and JavaScript — no build step, no dependencies, no framework.
`logic.js` holds the pure, testable rules (validation, status, stats, import
checks); `app.js` holds the DOM and i18n; `style.css` holds the layout.

## Prerequisites

Any modern browser. For tests: Node.js 18+ and a headless Chromium
(the smoke test uses the Playwright `headless_shell` binary if present).

## Install / run

```bash
# No install step. Open the file:
open index.html
# or serve it locally:
npx serve .
```

## Dev commands

```bash
node tests/logic.test.js   # unit tests for logic.js
node tests/smoke.mjs       # headless-Chrome UI smoke test (needs headless_shell)
```

## Environment

None. No keys, no secrets, no backend. Data is stored under the localStorage keys
`library-borrow-bd-v1` (data) and `library-borrow-bd-lang` (language choice).

## Testing

- `tests/logic.test.js`: 14 unit tests — book/loan validation, already-out
  rejection, re-lending after return, status bands (overdue / due today / due
  soon / out / returned), overdue day counts, dashboard stats, return validation,
  strict import validation, Bengali digits, date arithmetic. All pass.
- `tests/smoke.mjs`: 15 headless-Chrome checks — add book, empty-title error,
  loan recording, re-lend rejection, overdue stat + filter, return flow, EN↔বাংলা
  toggle with Bengali digits, reload persistence, 390px no-overflow, zero console
  errors and zero page exceptions. All pass.

## Deployment

Static site: publish the repo root with GitHub Pages (main branch, root).
Live site: https://fahad3235.github.io/library-borrow-bd/

## Limitations

- Single-device: data lives in one browser's localStorage; there is no sync and
  no multi-user support.
- No reminders: the app shows overdue counts when you open it, but sends no
  notifications or messages to borrowers.
- A deleted book or loan cannot be recovered except from an exported backup.
- This is a personal lending log, not a library management system: no fines,
  no reservations, no catalogue import, no barcode scanning.

## Status

Complete MVP, tested as above. Ships empty — no books, borrowers, or dates are
pre-filled, and no prices or fees are assumed anywhere.
