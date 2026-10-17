// Piggy Chess daily report.
// Paste this into a Google Sheet's Apps Script editor (Extensions > Apps Script).
// See docs/daily-email.md for the full setup.

const REPORT_EMAIL = ''; // leave empty to send to the account that runs the script
const SEND_HOUR = 19;    // 7pm, in the spreadsheet's time zone
const HEADERS = ['Date', 'Minutes', 'Moves', 'Levels', 'Lessons finished', 'Games', 'Wins', 'Updated', 'Little Piggy answers'];

function usageSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Usage');
  if (!sheet) {
    sheet = ss.insertSheet('Usage');
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('@'); // keep dates as plain text
  }
  return sheet;
}

// The game posts its last week of daily totals; each day's row is replaced.
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = usageSheet_();
    const dates = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().map((r) => String(r[0]));
    for (const d of data.days || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) continue;
      const row = [d.date, num_(d.minutes), num_(d.moves), num_(d.levels), String(d.lessons || '').slice(0, 300), num_(d.games), num_(d.wins), new Date(), num_(d.tiny)];
      const i = dates.indexOf(d.date);
      if (i >= 1) {
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
        dates.push(d.date);
      }
    }
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function num_(v) {
  const n = Number(v);
  return isFinite(n) && n >= 0 ? Math.min(Math.round(n), 100000) : 0;
}

function sendDailyReport() {
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const rows = usageSheet_().getDataRange().getValues().slice(1);
  const byDate = {};
  for (const r of rows) byDate[String(r[0])] = r;

  const t = byDate[today];
  let summary;
  if (!t || (!t[1] && !t[2] && !t[8])) {
    summary = '<p>Nobody played Piggy Chess today.</p>';
  } else {
    summary = `
      <ul>
        <li><b>Minutes played:</b> ${t[1]}</li>
        <li><b>Moves made:</b> ${t[2]}</li>
        <li><b>Lesson levels finished:</b> ${t[3]}</li>
        <li><b>Lessons completed:</b> ${t[4] || 'none'}</li>
        <li><b>Games vs the bot:</b> ${t[5]} (won ${t[6]})</li>
        <li><b>Little Piggy answers:</b> ${t[8] || 0}</li>
      </ul>`;
  }

  let week = '<table cellpadding="4" style="border-collapse:collapse"><tr><th align="left">Day</th><th>Min</th><th>Moves</th><th>Levels</th><th>Games</th></tr>';
  for (let i = 6; i >= 0; i--) {
    const d = Utilities.formatDate(new Date(Date.now() - i * 864e5), tz, 'yyyy-MM-dd');
    const r = byDate[d] || [d, 0, 0, 0, '', 0, 0];
    week += `<tr><td>${Utilities.formatDate(new Date(Date.now() - i * 864e5), tz, 'EEE d MMM')}</td><td align="center">${r[1]}</td><td align="center">${r[2]}</td><td align="center">${r[3]}</td><td align="center">${r[5]}</td></tr>`;
  }
  week += '</table>';

  MailApp.sendEmail({
    to: REPORT_EMAIL || Session.getEffectiveUser().getEmail(),
    subject: `Piggy Chess: ${t ? t[1] : 0} min, ${t ? t[2] : 0} moves today`,
    htmlBody: `<h2>🐷 Piggy Chess today</h2>${summary}<h3>Last 7 days</h3>${week}`,
  });
}

// Run once from the editor to schedule the evening email.
function setup() {
  usageSheet_();
  for (const tr of ScriptApp.getProjectTriggers()) {
    if (tr.getHandlerFunction() === 'sendDailyReport') ScriptApp.deleteTrigger(tr);
  }
  ScriptApp.newTrigger('sendDailyReport').timeBased().everyDays(1).atHour(SEND_HOUR).create();
}
