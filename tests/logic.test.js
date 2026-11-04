/* Node unit tests for library-borrow-bd logic. Run: node tests/logic.test.js */
'use strict';
const assert = require('node:assert');
const L = require('../logic.js');

let n = 0;
function check(name, fn) { n++; fn(); console.log('ok ' + n + ' - ' + name); }

const TODAY = '2026-11-04';
const books = [{ id: 'b1', title: 'Hajar Bochor Dhore', author: 'Zahir Raihan' },
               { id: 'b2', title: 'Padma Nadir Majhi', author: 'Manik Bandopadhyay' }];

check('valid book passes', () => {
  assert.deepStrictEqual(L.validateBook({ title: 'X' }), []);
});
check('empty title rejected; over-long author rejected', () => {
  assert.ok(L.validateBook({ title: '   ' }).includes('title'));
  assert.ok(L.validateBook({ title: 'X', author: 'a'.repeat(101) }).includes('author'));
});

check('valid loan passes', () => {
  assert.deepStrictEqual(L.validateLoan(
    { bookId: 'b1', borrower: 'Rahim', lendDate: '2026-11-01', dueDate: '2026-11-10' }, books, []), []);
});
check('unknown book rejected', () => {
  assert.ok(L.validateLoan({ bookId: 'zz', borrower: 'R', lendDate: '2026-11-01', dueDate: '2026-11-10' }, books, []).includes('bookId'));
});
check('already-out book rejected', () => {
  const loans = [{ bookId: 'b1', borrower: 'R', lendDate: '2026-11-01', dueDate: '2026-11-10', returnDate: null }];
  assert.ok(L.validateLoan({ bookId: 'b1', borrower: 'K', lendDate: '2026-11-02', dueDate: '2026-11-12' }, books, loans).includes('alreadyOut'));
});
check('returned book can be lent again', () => {
  const loans = [{ bookId: 'b1', borrower: 'R', lendDate: '2026-11-01', dueDate: '2026-11-10', returnDate: '2026-11-05' }];
  assert.deepStrictEqual(L.validateLoan({ bookId: 'b1', borrower: 'K', lendDate: '2026-11-06', dueDate: '2026-11-12' }, books, loans), []);
});
check('due before lend rejected; bad dates rejected', () => {
  assert.ok(L.validateLoan({ bookId: 'b1', borrower: 'R', lendDate: '2026-11-10', dueDate: '2026-11-01' }, books, []).includes('dueBeforeLend'));
  assert.ok(L.validateLoan({ bookId: 'b1', borrower: 'R', lendDate: '2026-02-30', dueDate: '2026-11-01' }, books, []).includes('lendDate'));
  assert.ok(L.validateLoan({ bookId: 'b1', borrower: '', lendDate: '2026-11-01', dueDate: '2026-11-10' }, books, []).includes('borrower'));
});

check('loanStatus: overdue / dueToday / dueSoon / out / returned', () => {
  assert.strictEqual(L.loanStatus({ dueDate: '2026-11-01', returnDate: null }, TODAY), 'overdue');
  assert.strictEqual(L.loanStatus({ dueDate: '2026-11-04', returnDate: null }, TODAY), 'dueToday');
  assert.strictEqual(L.loanStatus({ dueDate: '2026-11-07', returnDate: null }, TODAY), 'dueSoon');
  assert.strictEqual(L.loanStatus({ dueDate: '2026-11-20', returnDate: null }, TODAY), 'out');
  assert.strictEqual(L.loanStatus({ dueDate: '2026-11-01', returnDate: '2026-11-02' }, TODAY), 'returned');
});
check('daysOverdue counts only past-due open loans', () => {
  assert.strictEqual(L.daysOverdue({ dueDate: '2026-11-01', returnDate: null }, TODAY), 3);
  assert.strictEqual(L.daysOverdue({ dueDate: '2026-11-04', returnDate: null }, TODAY), 0);
  assert.strictEqual(L.daysOverdue({ dueDate: '2026-11-01', returnDate: '2026-11-02' }, TODAY), 0);
});

check('stats: 2 books, 1 out, 1 overdue, 1 returned', () => {
  const loans = [
    { bookId: 'b1', borrower: 'R', lendDate: '2026-10-20', dueDate: '2026-11-01', returnDate: null },
    { bookId: 'b2', borrower: 'K', lendDate: '2026-10-20', dueDate: '2026-11-01', returnDate: '2026-11-02' },
  ];
  assert.deepStrictEqual(L.stats(books, loans, TODAY),
    { totalBooks: 2, outNow: 1, overdue: 1, returned: 1 });
});

check('validateReturn: return before lend rejected; double return rejected', () => {
  const loan = { lendDate: '2026-11-01', dueDate: '2026-11-10', returnDate: null };
  assert.ok(L.validateReturn(loan, '2026-10-31').includes('returnBeforeLend'));
  assert.deepStrictEqual(L.validateReturn(loan, '2026-11-05'), []);
  assert.ok(L.validateReturn({ ...loan, returnDate: '2026-11-05' }, '2026-11-06').includes('alreadyReturned'));
});

check('valid import passes; bad imports rejected', () => {
  const good = { books, loans: [{ id: 'l1', bookId: 'b1', borrower: 'R', lendDate: '2026-11-01', dueDate: '2026-11-10', returnDate: null }] };
  assert.deepStrictEqual(L.validateImport(good), []);
  assert.ok(L.validateImport({ books, loans: [{ id: 'l1', bookId: 'zz', borrower: 'R', lendDate: '2026-11-01', dueDate: '2026-11-10', returnDate: null }] }).length);
  assert.ok(L.validateImport({ books, loans: [
    { id: 'l1', bookId: 'b1', borrower: 'R', lendDate: '2026-11-01', dueDate: '2026-11-10', returnDate: null },
    { id: 'l2', bookId: 'b1', borrower: 'K', lendDate: '2026-11-02', dueDate: '2026-11-12', returnDate: null },
  ] }).includes('loan.alreadyOut'));
  assert.ok(L.validateImport({ books: 'nope', loans: [] }).length);
  assert.ok(L.validateImport(null).length);
});

check('Bengali digits convert 0-9', () => {
  assert.strictEqual(L.toBnDigits('2026-11-04'), '২০২৬-১১-০৪');
  assert.strictEqual(L.toBnDigits('3 days'), '৩ days');
});
check('daysBetween across month boundary', () => {
  assert.strictEqual(L.daysBetween('2026-10-30', '2026-11-04'), 5);
  assert.strictEqual(L.daysBetween('2026-11-04', '2026-11-04'), 0);
});

console.log('ALL ' + n + ' UNIT TESTS PASSED');
