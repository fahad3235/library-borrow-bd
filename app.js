/* Library Borrow BD — UI. State in localStorage; logic in logic.js. */
'use strict';
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var DATA_KEY = 'library-borrow-bd-v1';
  var LANG_KEY = 'library-borrow-bd-lang';

  var T = {
    en: {
      appTitle: 'Library Borrow BD', tagline: 'Lend books to friends — and remember who has what.',
      langBtn: 'বাংলা', lblBooks: 'Books', lblOut: 'Out now', lblOverdue: 'Overdue', lblReturned: 'Returned',
      tabBooks: 'Books', tabLoans: 'Loans', tabData: 'Data',
      hAddBook: 'Add a book', lblTitle: 'Title *', lblAuthor: 'Author', lblIsbn: 'ISBN (optional)',
      lblNote: 'Note (optional)', addBookBtn: 'Add book',
      hBookList: 'My books', bookSearchPh: 'Search title or author…', bookEmpty: 'No books yet. Add your first book above.',
      hLend: 'Lend a book', lblBook: 'Book *', lblBorrower: 'Borrower *', lblLendDate: 'Lend date *',
      lblDueDate: 'Due date *', addLoanBtn: 'Record loan',
      hLoanList: 'Loans', fAll: 'All', fOut: 'Out now', fOverdue: 'Overdue', fReturned: 'Returned',
      loanSearchPh: 'Search borrower…', loanEmpty: 'No loans yet. Lend a book to see it here.',
      hData: 'Your data', dataIntro: 'Everything stays in this browser (localStorage). Export a backup, or import one made by this app.',
      exportBtn: 'Export JSON', importLbl: 'Import JSON',
      hErase: 'Erase everything', eraseIntro: 'Type DELETE below to permanently erase all books and loans.',
      eraseBtn: 'Erase all',
      footerNote: 'Personal lending log — not a library system. Dates use your device\u2019s calendar; overdue counts are computed from the due date you entered.',
      available: 'Available', outTo: 'Out to ', returned: 'Returned', dueToday: 'Due today',
      dueIn: 'Due in ', days: ' days', overdueBy: 'Overdue by ', dayWord: ' day', daysWord: ' days',
      lendBtn: 'Lend', returnBtn: 'Return', deleteBtn: 'Delete', noAvailable: 'No available books — add a book first.',
      errTitle: 'Please enter a book title.', errBook: 'Please fix the book details.',
      errLoan: 'Please fix the loan details (borrower, dates, or the book is already out).',
      errDueBefore: 'Due date must be on or after the lend date.',
      bookAdded: 'Book added.', loanAdded: 'Loan recorded.', loanReturned: 'Book returned.',
      deleted: 'Deleted.', exported: 'Backup downloaded.', imported: 'Import successful.',
      importBad: 'That file is not a valid Library Borrow BD backup.',
      eraseNeed: 'Type DELETE exactly to erase.', erased: 'All data erased.',
      confirmDelete: 'Delete this entry?'
    },
    bn: {
      appTitle: 'লাইব্রেরি বরো বিডি', tagline: 'বন্ধুদের বই ধার দিন — আর মনে রাখুন কার কাছে কী আছে।',
      langBtn: 'English', lblBooks: 'বই', lblOut: 'বাইরে আছে', lblOverdue: 'মেয়াদোত্তীর্ণ', lblReturned: 'ফেরত এসেছে',
      tabBooks: 'বই', tabLoans: 'ধার', tabData: 'ডেটা',
      hAddBook: 'বই যোগ করুন', lblTitle: 'শিরোনাম *', lblAuthor: 'লেখক', lblIsbn: 'ISBN (ঐচ্ছিক)',
      lblNote: 'নোট (ঐচ্ছিক)', addBookBtn: 'বই যোগ করুন',
      hBookList: 'আমার বই', bookSearchPh: 'শিরোনাম বা লেখক খুঁজুন…', bookEmpty: 'এখনো কোনো বই নেই। উপরে প্রথম বইটি যোগ করুন।',
      hLend: 'বই ধার দিন', lblBook: 'বই *', lblBorrower: 'ধারগ্রহীতা *', lblLendDate: 'ধারের তারিখ *',
      lblDueDate: 'ফেরতের তারিখ *', addLoanBtn: 'ধার রেকর্ড করুন',
      hLoanList: 'ধার', fAll: 'সব', fOut: 'বাইরে আছে', fOverdue: 'মেয়াদোত্তীর্ণ', fReturned: 'ফেরত এসেছে',
      loanSearchPh: 'ধারগ্রহীতা খুঁজুন…', loanEmpty: 'এখনো কোনো ধার নেই। একটি বই ধার দিলে এখানে দেখা যাবে।',
      hData: 'আপনার ডেটা', dataIntro: 'সবকিছু এই ব্রাউজারেই থাকে (localStorage)। ব্যাকআপ এক্সপোর্ট করুন, অথবা এই অ্যাপের তৈরি ব্যাকআপ ইমপোর্ট করুন।',
      exportBtn: 'JSON এক্সপোর্ট', importLbl: 'JSON ইমপোর্ট',
      hErase: 'সব মুছে ফেলুন', eraseIntro: 'সব বই ও ধার স্থায়ীভাবে মুছতে নিচে DELETE লিখুন।',
      eraseBtn: 'সব মুছুন',
      footerNote: 'ব্যক্তিগত ধার রেকর্ড — এটি কোনো লাইব্রেরি সিস্টেম নয়। তারিখ আপনার ডিভাইসের ক্যালেন্ডার অনুযায়ী; মেয়াদোত্তীর্ণ হিসাব আপনার দেওয়া ফেরতের তারিখ থেকে করা হয়।',
      available: 'উপলব্ধ', outTo: 'এর কাছে আছে: ', returned: 'ফেরত এসেছে', dueToday: 'আজই ফেরতের তারিখ',
      dueIn: 'ফেরত বাকি ', days: ' দিন', overdueBy: 'মেয়াদ পেরিয়েছে ', dayWord: ' দিন', daysWord: ' দিন',
      lendBtn: 'ধার দিন', returnBtn: 'ফেরত নিন', deleteBtn: 'মুছুন', noAvailable: 'কোনো উপলব্ধ বই নেই — আগে একটি বই যোগ করুন।',
      errTitle: 'বইয়ের শিরোনাম দিন।', errBook: 'বইয়ের তথ্য ঠিক করুন।',
      errLoan: 'ধারের তথ্য ঠিক করুন (ধারগ্রহীতা, তারিখ, অথবা বইটি ইতিমধ্যে বাইরে আছে)।',
      errDueBefore: 'ফেরতের তারিখ ধারের তারিখের আগে হতে পারবে না।',
      bookAdded: 'বই যোগ হয়েছে।', loanAdded: 'ধার রেকর্ড হয়েছে।', loanReturned: 'বই ফেরত এসেছে।',
      deleted: 'মোছা হয়েছে।', exported: 'ব্যাকআপ ডাউনলোড হয়েছে।', imported: 'ইমপোর্ট সফল হয়েছে।',
      importBad: 'এই ফাইলটি Library Borrow BD-এর বৈধ ব্যাকআপ নয়।',
      eraseNeed: 'মুছতে হলে ঠিক DELETE লিখুন।', erased: 'সব ডেটা মোছা হয়েছে।',
      confirmDelete: 'এই এন্ট্রিটি মুছবেন?'
    }
  };

  var lang = localStorage.getItem(LANG_KEY) || 'en';
  if (lang !== 'en' && lang !== 'bn') lang = 'en';
  var state = load();
  var loanFilter = 'all';

  function load() {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      if (!raw) return { books: [], loans: [] };
      var d = JSON.parse(raw);
      if (validateImport(d).length) return { books: [], loans: [] };
      return d;
    } catch (e) { return { books: [], loans: [] }; }
  }
  function save() { localStorage.setItem(DATA_KEY, JSON.stringify(state)); }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fmt(s) { return lang === 'bn' ? toBnDigits(s) : s; }
  function t(k) { return T[lang][k]; }

  function showMsg(el, text, ok) {
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'err');
    el.style.display = 'block';
  }

  function applyLang() {
    var map = { appTitle: 'appTitle', tagline: 'tagline', langBtn: 'langBtn', lblBooks: 'lblBooks',
      lblOut: 'lblOut', lblOverdue: 'lblOverdue', lblReturned: 'lblReturned', tabBooks: 'tabBooks',
      tabLoans: 'tabLoans', tabData: 'tabData', hAddBook: 'hAddBook', lblTitle: 'lblTitle',
      lblAuthor: 'lblAuthor', lblIsbn: 'lblIsbn', lblNote: 'lblNote', addBookBtn: 'addBookBtn',
      hBookList: 'hBookList', bookEmpty: 'bookEmpty', hLend: 'hLend', lblBook: 'lblBook',
      lblBorrower: 'lblBorrower', lblLendDate: 'lblLendDate', lblDueDate: 'lblDueDate',
      addLoanBtn: 'addLoanBtn', hLoanList: 'hLoanList', fAll: 'fAll', fOut: 'fOut',
      fOverdue: 'fOverdue', fReturned: 'fReturned', loanEmpty: 'loanEmpty', hData: 'hData',
      dataIntro: 'dataIntro', exportBtn: 'exportBtn', importLbl: 'importLbl', hErase: 'hErase',
      eraseIntro: 'eraseIntro', eraseBtn: 'eraseBtn', footerNote: 'footerNote' };
    Object.keys(map).forEach(function (id) { $(id).textContent = t(map[id]); });
    $('bookSearch').placeholder = t('bookSearchPh');
    $('loanSearch').placeholder = t('loanSearchPh');
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }

  function bookById(id) { return state.books.find(function (b) { return b.id === id; }); }

  function render() {
    var today = todayStr();
    var st = stats(state.books, state.loans, today);
    $('statBooks').textContent = fmt(st.totalBooks);
    $('statOut').textContent = fmt(st.outNow);
    $('statOverdue').textContent = fmt(st.overdue);
    $('statReturned').textContent = fmt(st.returned);
    renderBooks();
    renderLoans(today);
    renderLoanBookSelect();
  }

  function renderLoanBookSelect() {
    var sel = $('loanBook');
    var cur = sel.value;
    var avail = state.books.filter(function (b) { return !outLoanForBook(state.loans, b.id); });
    sel.innerHTML = '';
    if (!avail.length) {
      var o = document.createElement('option'); o.value = ''; o.textContent = t('noAvailable'); sel.appendChild(o);
    } else {
      avail.forEach(function (b) {
        var o = document.createElement('option'); o.value = b.id;
        o.textContent = b.title + (b.author ? ' — ' + b.author : ''); sel.appendChild(o);
      });
    }
    if (cur) sel.value = cur;
  }

  function renderBooks() {
    var q = $('bookSearch').value.trim().toLowerCase();
    var list = $('bookList');
    list.innerHTML = '';
    var shown = state.books.filter(function (b) {
      return !q || b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q);
    });
    $('bookEmpty').style.display = shown.length ? 'none' : 'block';
    shown.slice().reverse().forEach(function (b) {
      var loan = outLoanForBook(state.loans, b.id);
      var li = document.createElement('li'); li.className = 'item';
      var left = document.createElement('div');
      var ttl = document.createElement('b'); ttl.textContent = b.title; left.appendChild(ttl);
      var meta = document.createElement('div'); meta.className = 'meta';
      meta.textContent = [b.author, b.isbn ? 'ISBN ' + b.isbn : '', b.note].filter(Boolean).join(' · ');
      left.appendChild(meta);
      var badge = document.createElement('span'); badge.className = 'badge' + (loan ? ' dueSoon' : '');
      badge.textContent = loan ? t('outTo') + loan.borrower : t('available');
      left.appendChild(badge);
      var right = document.createElement('div');
      if (!loan) {
        var lend = document.createElement('button'); lend.className = 'btn small'; lend.type = 'button';
        lend.textContent = t('lendBtn');
        lend.onclick = function () { switchTab('loans'); $('loanBook').value = b.id; $('loanBorrower').focus(); };
        right.appendChild(lend);
      }
      var del = document.createElement('button'); del.className = 'btn small secondary'; del.type = 'button';
      del.textContent = t('deleteBtn');
      del.onclick = function () {
        if (loan) return; // cannot delete a book that is out
        if (!window.confirm(t('confirmDelete'))) return;
        state.books = state.books.filter(function (x) { return x.id !== b.id; });
        save(); render();
      };
      if (loan) del.disabled = true;
      right.appendChild(del);
      li.appendChild(left); li.appendChild(right); list.appendChild(li);
    });
  }

  function renderLoans(today) {
    var q = $('loanSearch').value.trim().toLowerCase();
    var list = $('loanList');
    list.innerHTML = '';
    var shown = state.loans.filter(function (l) {
      var st = loanStatus(l, today);
      if (loanFilter === 'out' && l.returnDate) return false;
      if (loanFilter === 'overdue' && st !== 'overdue') return false;
      if (loanFilter === 'returned' && !l.returnDate) return false;
      return !q || l.borrower.toLowerCase().includes(q);
    });
    $('loanEmpty').style.display = shown.length ? 'none' : 'block';
    shown.slice().reverse().forEach(function (l) {
      var b = bookById(l.bookId);
      var st = loanStatus(l, today);
      var li = document.createElement('li'); li.className = 'item';
      var left = document.createElement('div');
      var ttl = document.createElement('b'); ttl.textContent = (b ? b.title : '?') + ' — ' + l.borrower; left.appendChild(ttl);
      var meta = document.createElement('div'); meta.className = 'meta';
      meta.textContent = fmt(l.lendDate) + ' → ' + fmt(l.dueDate) + (l.returnDate ? ' · ' + t('returned') + ' ' + fmt(l.returnDate) : '');
      left.appendChild(meta);
      var badge = document.createElement('span');
      var cls = st === 'overdue' ? 'overdue' : (st === 'dueToday' || st === 'dueSoon' ? 'dueSoon' : (st === 'returned' ? 'returned' : ''));
      badge.className = 'badge ' + cls;
      if (st === 'returned') badge.textContent = t('returned');
      else if (st === 'overdue') badge.textContent = t('overdueBy') + fmt(daysOverdue(l, today)) + (daysOverdue(l, today) === 1 ? t('dayWord') : t('daysWord'));
      else if (st === 'dueToday') badge.textContent = t('dueToday');
      else if (st === 'dueSoon') badge.textContent = t('dueIn') + fmt(daysBetween(today, l.dueDate)) + t('days');
      else badge.textContent = t('outTo') + l.borrower;
      left.appendChild(badge);
      var right = document.createElement('div');
      if (!l.returnDate) {
        var ret = document.createElement('button'); ret.className = 'btn small'; ret.type = 'button';
        ret.textContent = t('returnBtn');
        ret.onclick = function () {
          l.returnDate = todayStr(); save(); render();
          showMsg($('loanMsg'), t('loanReturned'), true);
        };
        right.appendChild(ret);
      }
      var del = document.createElement('button'); del.className = 'btn small secondary'; del.type = 'button';
      del.textContent = t('deleteBtn');
      del.onclick = function () {
        if (!window.confirm(t('confirmDelete'))) return;
        state.loans = state.loans.filter(function (x) { return x.id !== l.id; });
        save(); render(); showMsg($('loanMsg'), t('deleted'), true);
      };
      right.appendChild(del);
      li.appendChild(left); li.appendChild(right); list.appendChild(li);
    });
  }

  function switchTab(name) {
    ['books', 'loans', 'data'].forEach(function (n) {
      $('pane' + n[0].toUpperCase() + n.slice(1)).style.display = n === name ? 'block' : 'none';
      $('tab' + n[0].toUpperCase() + n.slice(1)).classList.toggle('active', n === name);
    });
  }

  $('langBtn').onclick = function () {
    lang = lang === 'en' ? 'bn' : 'en';
    localStorage.setItem(LANG_KEY, lang);
    applyLang(); render();
  };
  $('tabBooks').onclick = function () { switchTab('books'); };
  $('tabLoans').onclick = function () { switchTab('loans'); };
  $('tabData').onclick = function () { switchTab('data'); };
  ['fAll', 'fOut', 'fOverdue', 'fReturned'].forEach(function (id, i) {
    $(id).onclick = function () {
      loanFilter = ['all', 'out', 'overdue', 'returned'][i];
      ['fAll', 'fOut', 'fOverdue', 'fReturned'].forEach(function (x) { $(x).classList.remove('active'); });
      $(id).classList.add('active');
      render();
    };
  });
  $('bookSearch').oninput = renderBooks;
  $('loanSearch').oninput = function () { renderLoans(todayStr()); };

  $('bookForm').onsubmit = function (e) {
    e.preventDefault();
    var b = { id: newId(), title: $('bookTitle').value.trim(), author: $('bookAuthor').value.trim(),
      isbn: $('bookIsbn').value.trim(), note: $('bookNote').value.trim() };
    var errs = validateBook(b);
    if (errs.length) { showMsg($('bookMsg'), errs.includes('title') ? t('errTitle') : t('errBook'), false); return; }
    state.books.push(b); save();
    $('bookForm').reset();
    render(); showMsg($('bookMsg'), t('bookAdded'), true);
  };

  $('loanForm').onsubmit = function (e) {
    e.preventDefault();
    var l = { id: newId(), bookId: $('loanBook').value, borrower: $('loanBorrower').value.trim(),
      lendDate: $('loanLendDate').value, dueDate: $('loanDueDate').value, returnDate: null };
    var errs = validateLoan(l, state.books, state.loans);
    if (errs.length) {
      showMsg($('loanMsg'), errs.includes('dueBeforeLend') ? t('errDueBefore') : t('errLoan'), false);
      return;
    }
    state.loans.push(l); save();
    $('loanForm').reset();
    $('loanLendDate').value = todayStr();
    render(); showMsg($('loanMsg'), t('loanAdded'), true);
  };

  $('exportBtn').onclick = function () {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'library-borrow-bd-backup.json';
    a.click();
    showMsg($('dataMsg'), t('exported'), true);
  };
  $('importFile').onchange = function () {
    var f = $('importFile').files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (validateImport(d).length) throw new Error('bad');
        state = d; save(); applyLang(); render();
        showMsg($('dataMsg'), t('imported'), true);
      } catch (e) { showMsg($('dataMsg'), t('importBad'), false); }
    };
    r.readAsText(f);
    $('importFile').value = '';
  };
  $('eraseBtn').onclick = function () {
    if ($('eraseInput').value !== 'DELETE') { showMsg($('eraseMsg'), t('eraseNeed'), false); return; }
    state = { books: [], loans: [] }; save();
    $('eraseInput').value = '';
    render(); showMsg($('eraseMsg'), t('erased'), true);
  };

  $('loanLendDate').value = todayStr();
  applyLang();
  render();
})();
