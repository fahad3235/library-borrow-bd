/* Library Borrow BD — pure logic (no DOM). Shared by the page and node tests.
 * Dates are 'YYYY-MM-DD' strings; "today" is always passed in so tests are deterministic. */
'use strict';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBnDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

function isValidDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function daysBetween(a, b) {
  // whole days from a to b (b - a); both valid YYYY-MM-DD
  const ms = Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z');
  return Math.round(ms / 86400000);
}

function newId() {
  return 'id' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

function cleanStr(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function validateBook(b) {
  const errs = [];
  if (!b || !cleanStr(b.title, 200)) errs.push('title');
  if (b && typeof b.author === 'string' && b.author.trim().length > 100) errs.push('author');
  if (b && typeof b.isbn === 'string' && b.isbn.trim().length > 30) errs.push('isbn');
  if (b && typeof b.note === 'string' && b.note.trim().length > 300) errs.push('note');
  return errs;
}

function outLoanForBook(loans, bookId) {
  return (loans || []).find((l) => l.bookId === bookId && !l.returnDate) || null;
}

function validateLoan(l, books, loans) {
  const errs = [];
  if (!l) return ['loan'];
  if (!books || !books.some((b) => b.id === l.bookId)) errs.push('bookId');
  else if (outLoanForBook(loans, l.bookId)) errs.push('alreadyOut');
  if (!cleanStr(l.borrower, 60)) errs.push('borrower');
  if (!isValidDate(l.lendDate)) errs.push('lendDate');
  if (!isValidDate(l.dueDate)) errs.push('dueDate');
  else if (isValidDate(l.lendDate) && daysBetween(l.lendDate, l.dueDate) < 0) errs.push('dueBeforeLend');
  return errs;
}

function validateReturn(loan, returnDate) {
  const errs = [];
  if (!loan) return ['loan'];
  if (loan.returnDate) errs.push('alreadyReturned');
  if (!isValidDate(returnDate)) errs.push('returnDate');
  else if (isValidDate(loan.lendDate) && daysBetween(loan.lendDate, returnDate) < 0) errs.push('returnBeforeLend');
  return errs;
}

/* Status of a loan on a given day:
 * returned | overdue (due < today) | dueToday | dueSoon (1-3 days) | out */
function loanStatus(loan, today) {
  if (loan.returnDate) return 'returned';
  const d = daysBetween(today, loan.dueDate);
  if (d < 0) return 'overdue';
  if (d === 0) return 'dueToday';
  if (d <= 3) return 'dueSoon';
  return 'out';
}

function daysOverdue(loan, today) {
  if (loan.returnDate) return 0;
  const d = daysBetween(loan.dueDate, today);
  return d > 0 ? d : 0;
}

function stats(books, loans, today) {
  const out = loans.filter((l) => !l.returnDate);
  return {
    totalBooks: books.length,
    outNow: out.length,
    overdue: out.filter((l) => loanStatus(l, today) === 'overdue').length,
    returned: loans.filter((l) => l.returnDate).length,
  };
}

function validateImport(data) {
  const errs = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['root'];
  if (!Array.isArray(data.books) || !Array.isArray(data.loans)) return ['arrays'];
  const bookIds = new Set();
  for (const b of data.books) {
    if (!b || typeof b.id !== 'string' || !b.id) { errs.push('book.id'); break; }
    if (bookIds.has(b.id)) { errs.push('book.id.duplicate'); break; }
    bookIds.add(b.id);
    if (validateBook(b).length) { errs.push('book'); break; }
  }
  for (const l of data.loans) {
    if (!l || typeof l.id !== 'string' || !l.id) { errs.push('loan.id'); break; }
    if (!bookIds.has(l.bookId)) { errs.push('loan.bookId'); break; }
    if (!cleanStr(l.borrower, 60)) { errs.push('loan.borrower'); break; }
    if (!isValidDate(l.lendDate) || !isValidDate(l.dueDate)) { errs.push('loan.dates'); break; }
    if (daysBetween(l.lendDate, l.dueDate) < 0) { errs.push('loan.dueBeforeLend'); break; }
    if (l.returnDate !== null && l.returnDate !== undefined && !isValidDate(l.returnDate)) { errs.push('loan.returnDate'); break; }
  }
  // at most one open loan per book
  const open = new Set();
  for (const l of data.loans) {
    if (!l.returnDate) {
      if (open.has(l.bookId)) { errs.push('loan.alreadyOut'); break; }
      open.add(l.bookId);
    }
  }
  return errs;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toBnDigits, isValidDate, daysBetween, newId, cleanStr,
    validateBook, validateLoan, validateReturn, outLoanForBook,
    loanStatus, daysOverdue, stats, validateImport };
}
