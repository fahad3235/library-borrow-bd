/* Headless-Chrome smoke test for library-borrow-bd via raw CDP.
 * Run: node tests/smoke.mjs */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell';
const PORT = 9337;
const DIR = path.dirname(fileURLToPath(import.meta.url));
const URL = 'file://' + path.resolve(DIR, '..', 'index.html');

let n = 0, failures = [];
function check(name, cond, extra = '') {
  n++;
  if (cond) console.log('ok ' + n + ' - ' + name);
  else { console.log('FAIL ' + n + ' - ' + name + ' ' + extra); failures.push(name); }
}

const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
  '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/library-smoke-profile', 'about:blank'],
  { stdio: 'ignore' });

async function waitForList() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/list'); if (r.ok) return; } catch (e) {}
    await sleep(500);
  }
  throw new Error('chrome debug port never came up');
}

let ws, msgId = 0;
const pending = new Map();
const consoleErrors = [], pageExceptions = [];
function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
function evalJs(expression) {
  return send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    .then((m) => m.result.result);
}

try {
  await waitForList();
  const tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/new?' + encodeURIComponent(URL), { method: 'PUT' })).json();
  ws = new WebSocket(tabs.webSocketDebuggerUrl);
  await new Promise((res) => { ws.onopen = res; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      consoleErrors.push(JSON.stringify(m.params.args));
    if (m.method === 'Runtime.exceptionThrown') pageExceptions.push(m.params.exceptionDetails.exception?.description || 'exception');
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await sleep(1200);
  // start from a clean slate
  await evalJs(`localStorage.clear()`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(1200);

  const r = await evalJs(`(() => {
    const out = {};
    const $ = (id) => document.getElementById(id);
    const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const submit = (form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    // 1. add book 1
    $('bookTitle').value = 'Hajar Bochor Dhore'; $('bookAuthor').value = 'Zahir Raihan';
    submit($('bookForm'));
    out.books1 = $('bookList').querySelectorAll('li').length;
    out.statBooks1 = $('statBooks').textContent;
    // 2. empty title -> error, count unchanged
    $('bookTitle').value = '   ';
    submit($('bookForm'));
    out.errBook = $('bookMsg').style.display === 'block' && $('bookMsg').className.includes('err');
    out.books2 = $('bookList').querySelectorAll('li').length;
    // 3. lend book 1 to Rahim, due 2026-11-10
    document.getElementById('tabLoans').click();
    const st = JSON.parse(localStorage.getItem('library-borrow-bd-v1'));
    $('loanBook').value = st.books[0].id;
    $('loanBorrower').value = 'Rahim'; $('loanLendDate').value = '2026-11-01'; $('loanDueDate').value = '2026-11-10';
    submit($('loanForm'));
    out.loans1 = $('loanList').querySelectorAll('li').length;
    out.statOut1 = $('statOut').textContent;
    // 4. same book now unavailable -> select shows no-available option; submitting errors
    $('loanBorrower').value = 'Karim'; $('loanLendDate').value = '2026-11-02'; $('loanDueDate').value = '2026-11-12';
    submit($('loanForm'));
    out.errLoan = $('loanMsg').style.display === 'block' && $('loanMsg').className.includes('err');
    out.loans2 = $('loanList').querySelectorAll('li').length;
    // 5. add book 2, lend overdue (due 2026-11-01 < today 2026-11-04)
    document.getElementById('tabBooks').click();
    $('bookTitle').value = 'Padma Nadir Majhi'; $('bookAuthor').value = 'Manik Bandopadhyay';
    submit($('bookForm'));
    document.getElementById('tabLoans').click();
    const st2 = JSON.parse(localStorage.getItem('library-borrow-bd-v1'));
    $('loanBook').value = st2.books[1].id;
    $('loanBorrower').value = 'Karim'; $('loanLendDate').value = '2026-10-20'; $('loanDueDate').value = '2026-11-01';
    submit($('loanForm'));
    out.statOverdue = $('statOverdue').textContent;
    out.loans3 = $('loanList').querySelectorAll('li').length;
    // 6. overdue filter shows exactly 1 row
    click($('fOverdue'));
    out.overdueRows = $('loanList').querySelectorAll('li').length;
    click($('fAll'));
    // 7. return first loan (Rahim row): find Return button in the Rahim row
    const rows = [...$('loanList').querySelectorAll('li')];
    const rahimRow = rows.find((li) => li.textContent.includes('Rahim'));
    [...rahimRow.querySelectorAll('button')].find((b) => b.textContent.includes('Return')).click();
    out.statReturned = $('statReturned').textContent;
    out.statOut2 = $('statOut').textContent;
    // 8. BN toggle: title + Bengali digits
    click($('langBtn'));
    out.bnTitle = $('appTitle').textContent;
    out.bnStat = $('statBooks').textContent;
    click($('langBtn'));
    out.enTitle = $('appTitle').textContent;
    out.persistKey = !!localStorage.getItem('library-borrow-bd-v1');
    return out;
  })()`);
  if (r.subtype === 'error') throw new Error('page eval error: ' + r.description);
  const o = r.value;
  check('book 1 added: 1 row, stat 1', o.books1 === 1 && o.statBooks1 === '1', JSON.stringify(o));
  check('empty title shows error, count stays 1', o.errBook && o.books2 === 1, JSON.stringify(o));
  check('loan recorded: 1 loan, out=1', o.loans1 === 1 && o.statOut1 === '1', JSON.stringify(o));
  check('re-lending out book errors, loans stay 1', o.errLoan && o.loans2 === 1, JSON.stringify(o));
  check('overdue loan: overdue stat 1, loans 2', o.statOverdue === '1' && o.loans3 === 2, JSON.stringify(o));
  check('overdue filter shows exactly 1 row', o.overdueRows === 1, JSON.stringify(o));
  check('return: returned=1, out back to 1', o.statReturned === '1' && o.statOut2 === '1', JSON.stringify(o));
  check('BN toggle renders Bengali title', o.bnTitle && o.bnTitle !== 'Library Borrow BD', 'got ' + o.bnTitle);
  check('BN toggle renders Bengali digits (2 books)', o.bnStat === '২', 'got ' + o.bnStat);
  check('EN toggle restores title', o.enTitle === 'Library Borrow BD', 'got ' + o.enTitle);
  check('state persisted to localStorage', o.persistKey === true);

  // Reload persistence check
  await send('Page.reload', { ignoreCache: true });
  await sleep(1200);
  const r2 = await evalJs(`document.getElementById('statBooks').textContent`);
  check('books survive reload (2)', r2.value === '2', 'got ' + r2.value);

  // 390px mobile: no horizontal overflow
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(500);
  const r3 = await evalJs(`Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)`);
  check('390px viewport: no horizontal overflow', r3.value <= 390, 'scrollWidth=' + r3.value);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('zero page exceptions', pageExceptions.length === 0, pageExceptions.join(' | '));
} catch (e) {
  console.log('SMOKE ERROR: ' + e.message);
  failures.push('harness: ' + e.message);
} finally {
  try { ws?.close(); } catch (e) {}
  chrome.kill('SIGKILL');
}
console.log(failures.length === 0 ? 'ALL ' + n + ' SMOKE CHECKS PASSED' : failures.length + ' SMOKE FAILURES');
process.exit(failures.length === 0 ? 0 : 1);
