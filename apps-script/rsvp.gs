/**
 * nicemice RSVP & ucapan: ONE script for every couple's invitation.
 *
 * It lives in the control spreadsheet ("nicemice RSVP – Pusat"), whose "Pasangan" tab lists
 * each couple's slug and the link to their own RSVP spreadsheet. Deployed as a web app, it:
 *   - POST: saves a guest's RSVP as a row in that couple's spreadsheet (tab "RSVP");
 *   - GET ?slug=…: returns the couple's wishes (name, message, time) for the invitation page.
 *     Attendance is never sent back: only the couple sees who is coming.
 *
 * The menu "nicemice → Pasangan baru…" makes a couple's spreadsheet, shares it view-only with
 * the couple and adds it to "Pasangan". Setup steps: apps-script/SETUP.md.
 *
 * After changing this file: Deploy → Manage deployments → edit (pencil) → Version: New
 * version → Deploy. Never "New deployment": that makes a new URL and every form stops working.
 */

const CONTROL_TAB = 'Pasangan';
const CONTROL_HEADERS = ['Slug', 'RSVP spreadsheet', 'Active', 'Created', 'Shared with'];
const RSVP_TAB = 'RSVP';
const RSVP_HEADERS = ['Time', 'Name', 'Attendance', 'Message', 'Hide'];
const SUMMARY_TAB = 'Ringkasan';
const FOLDER_NAME = 'nicemice RSVP';

/** What the invitation sends → what the couple reads in the spreadsheet. */
const ATTENDANCE = { hadir: 'Hadir', tidak: 'Tidak hadir', mungkin: 'Belum pasti' };

const MAX_NAME = 60;
const MAX_MESSAGE = 500;
const MAX_WISHES = 200; // newest first; older ones stay in the spreadsheet
const WINDOW_S = 600; // 10 minutes
const MAX_PER_WINDOW = 60; // per couple: more than this in 10 minutes is a flood, not guests
const CACHE_S = 60;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ───────────────────────────── web app ─────────────────────────────

function doGet(e) {
  const slug = String((e && e.parameter && e.parameter.slug) || '');
  const sheet = coupleSheet_(slug);
  if (!sheet) return json_({ ok: false, error: 'unknown' });
  return json_({ ok: true, wishes: wishes_(slug, sheet) });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid' });
  }
  // A field guests never see: only bots fill it in. Pretend it worked.
  if (data.website) return json_({ ok: true });

  const slug = String(data.slug || '');
  const name = clean_(data.name, MAX_NAME, false);
  const message = clean_(data.message, MAX_MESSAGE, true);
  const attendance = ATTENDANCE[data.attendance];
  if (!name || !attendance) return json_({ ok: false, error: 'invalid' });

  const sheet = coupleSheet_(slug);
  if (!sheet) return json_({ ok: false, error: 'unknown' });

  const cache = CacheService.getScriptCache();
  // The same RSVP sent twice (a double tap, a resend after a slow connection) is saved once.
  const dupKey = 'dup:' + slug + ':' + digest_([name, attendance, message].join('|'));
  if (cache.get(dupKey)) return json_({ ok: true });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'busy' });
  try {
    const rateKey = 'rate:' + slug + ':' + Math.floor(Date.now() / 1000 / WINDOW_S);
    const count = Number(cache.get(rateKey) || 0);
    if (count >= MAX_PER_WINDOW) return json_({ ok: false, error: 'busy' });
    cache.put(rateKey, String(count + 1), WINDOW_S);

    sheet.appendRow([new Date(), asText_(name), attendance, asText_(message), false]);
    const row = sheet.getLastRow();
    sheet.getRange(row, 1).setNumberFormat('dd/mm/yyyy hh:mm');
    sheet.getRange(row, 5).insertCheckboxes();

    cache.put(dupKey, '1', WINDOW_S);
    cache.remove('wishes:' + slug);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// ───────────────────────────── data ─────────────────────────────

/** The couple's "RSVP" tab, or null when the slug isn't an active couple. */
function coupleSheet_(slug) {
  if (!SLUG.test(slug)) return null;
  const id = couples_()[slug];
  if (!id) return null;
  try {
    return SpreadsheetApp.openById(id).getSheetByName(RSVP_TAB);
  } catch (err) {
    console.error('Cannot open the RSVP spreadsheet of ' + slug + ': ' + err);
    return null;
  }
}

/** { slug: spreadsheet id } for every active row of "Pasangan" (cached for a minute). */
function couples_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('couples');
  if (cached) return JSON.parse(cached);
  const tab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONTROL_TAB);
  const map = {};
  if (tab && tab.getLastRow() > 1) {
    for (const [slug, link, active] of tab.getRange(2, 1, tab.getLastRow() - 1, 3).getValues()) {
      const id = spreadsheetId_(String(link));
      if (slug && id && active === true) map[String(slug).trim()] = id;
    }
  }
  cache.put('couples', JSON.stringify(map), CACHE_S);
  return map;
}

/** The wishes to show on the invitation: newest first, without hidden rows or empty messages. */
function wishes_(slug, sheet) {
  const cache = CacheService.getScriptCache();
  const key = 'wishes:' + slug;
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues() : [];
  const wishes = rows
    .filter(([time, name, , message, hide]) => name && message && hide !== true)
    .map(([time, name, , message]) => ({
      name: String(name),
      message: String(message),
      time: time instanceof Date ? time.toISOString() : null,
    }))
    .reverse()
    .slice(0, MAX_WISHES);
  try {
    cache.put(key, JSON.stringify(wishes), CACHE_S);
  } catch (err) {
    // Over the cache's 100 KB limit: just read the spreadsheet every time.
  }
  return wishes;
}

// ───────────────────────────── helpers ─────────────────────────────

/** One line (or, for messages, a few lines) of plain text, at most `max` characters. */
function clean_(value, max, multiline) {
  let s = String(value == null ? '' : value).replace(/\r\n?/g, '\n');
  s = multiline
    ? s.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
    : s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ');
  s = s.trim();
  const chars = Array.from(s);
  return chars.length > max ? chars.slice(0, max).join('').trim() : s;
}

/**
 * Text that starts like a formula (= + - @) is stored as plain text, so a guest can't put a
 * formula in the couple's spreadsheet (or in its Excel download). The ' doesn't show.
 */
function asText_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function digest_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8));
}

function spreadsheetId_(link) {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m) return m[1];
  return /^[a-zA-Z0-9_-]{20,}$/.test(link.trim()) ? link.trim() : null;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

// ───────────────────────────── menu ─────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi().createMenu('nicemice').addItem('Pasangan baru…', 'newCouple').addToUi();
}

/** Menu: make a couple's RSVP spreadsheet, share it with them, and switch it on. */
function newCouple() {
  const ui = SpreadsheetApp.getUi();
  const control = controlTab_();

  const slugAnswer = ui.prompt('Pasangan baru', 'Slug (sama dengan nama file di src/couples/, mis. radit-ratu):', ui.ButtonSet.OK_CANCEL);
  if (slugAnswer.getSelectedButton() !== ui.Button.OK) return;
  const slug = slugAnswer.getResponseText().trim().toLowerCase();
  if (!SLUG.test(slug)) return ui.alert('Slug hanya boleh huruf kecil, angka, dan tanda minus (mis. radit-ratu).');
  const existing = control.getLastRow() > 1 ? control.getRange(2, 1, control.getLastRow() - 1, 1).getValues().flat().map(String) : [];
  if (existing.includes(slug)) return ui.alert('Slug "' + slug + '" sudah ada di tab Pasangan.');

  const emailAnswer = ui.prompt(
    'Pasangan baru',
    'Email Google pasangan, dipisah koma (boleh dikosongkan dan dibagikan nanti):',
    ui.ButtonSet.OK_CANCEL,
  );
  if (emailAnswer.getSelectedButton() !== ui.Button.OK) return;
  const emails = emailAnswer
    .getResponseText()
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const badEmail = emails.find((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  if (badEmail) return ui.alert('Email tidak valid: ' + badEmail);

  const ss = SpreadsheetApp.create('RSVP – ' + slug);
  setUpCoupleSpreadsheet_(ss);
  DriveApp.getFileById(ss.getId()).moveTo(folder_());
  if (emails.length) ss.addViewers(emails);

  control.appendRow([slug, ss.getUrl(), true, new Date(), emails.join(', ')]);
  control.getRange(control.getLastRow(), 3).insertCheckboxes().check();
  CacheService.getScriptCache().remove('couples');

  ui.alert(
    'Selesai',
    'Spreadsheet RSVP untuk "' + slug + '" sudah dibuat' + (emails.length ? ' dan dibagikan (lihat saja) ke ' + emails.join(', ') : '') + '.\n\n' + ss.getUrl(),
    ui.ButtonSet.OK,
  );
}

function setUpCoupleSpreadsheet_(ss) {
  ss.setSpreadsheetTimeZone('Asia/Jakarta');
  const rsvp = ss.getSheets()[0].setName(RSVP_TAB);
  rsvp.getRange(1, 1, 1, RSVP_HEADERS.length).setValues([RSVP_HEADERS]).setFontWeight('bold').setBackground('#f3eef7');
  rsvp.setFrozenRows(1);
  rsvp.setColumnWidth(1, 130).setColumnWidth(2, 180).setColumnWidth(3, 110).setColumnWidth(4, 420).setColumnWidth(5, 60);
  rsvp.getRange('D:D').setWrap(true);
  rsvp.getRange('A:E').setVerticalAlignment('top');
  rsvp.getRange('E1').setNote('Centang untuk menyembunyikan ucapan ini dari undangan (dan dari hitungan di Ringkasan).');

  const summary = ss.insertSheet(SUMMARY_TAB);
  summary.getRange('A1:B1').setValues([['Kehadiran', 'Jumlah']]).setFontWeight('bold').setBackground('#f3eef7');
  const statuses = [ATTENDANCE.hadir, ATTENDANCE.tidak, ATTENDANCE.mungkin];
  statuses.forEach((status, i) => {
    summary.getRange(i + 2, 1).setValue(status);
    summary.getRange(i + 2, 2).setFormula('=COUNTIFS(' + RSVP_TAB + '!C:C,"' + status + '",' + RSVP_TAB + '!E:E,FALSE)');
  });
  summary.getRange(statuses.length + 2, 1, 1, 2).setValues([['Total', '=SUM(B2:B' + (statuses.length + 1) + ')']]).setFontWeight('bold');
  summary.setColumnWidth(1, 140);
  summary.getRange('A' + (statuses.length + 4)).setValue('Satu baris = satu kiriman RSVP. Unduh sebagai Excel: File → Download → Microsoft Excel (.xlsx).');
}

/** The "Pasangan" tab, made with its headers the first time. */
function controlTab_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let tab = ss.getSheetByName(CONTROL_TAB);
  if (!tab) {
    tab = ss.insertSheet(CONTROL_TAB, 0);
    tab.getRange(1, 1, 1, CONTROL_HEADERS.length).setValues([CONTROL_HEADERS]).setFontWeight('bold');
    tab.setFrozenRows(1);
    tab.setColumnWidth(1, 160).setColumnWidth(2, 420).setColumnWidth(5, 260);
  }
  return tab;
}

function folder_() {
  const found = DriveApp.getFoldersByName(FOLDER_NAME);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
}
