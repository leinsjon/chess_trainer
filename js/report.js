// Sends the last week's daily usage totals to the Google Sheet so the evening
// email can report them. Totals are re-sent whole, so a lost request is
// simply covered by the next one.

import { REPORT_URL } from './config.js';
import { usage } from './progress.js';

let lastSent = '';

function payload() {
  const days = usage();
  const recent = Object.keys(days).sort().slice(-7);
  return JSON.stringify({
    days: recent.map((date) => {
      const d = days[date];
      return {
        date,
        minutes: Math.round(d.seconds / 60),
        moves: d.moves,
        levels: d.levels.length,
        lessons: d.lessons.join(', '),
        games: d.games,
        wins: d.wins,
        tiny: d.tiny || 0,
      };
    }),
  });
}

function send(useBeacon) {
  if (!REPORT_URL) return;
  const body = payload();
  if (body === lastSent) return;
  lastSent = body;
  // text/plain keeps this a "simple" request, which Apps Script accepts.
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(REPORT_URL, new Blob([body], { type: 'text/plain' }));
  } else {
    fetch(REPORT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body }).catch(() => {
      lastSent = '';
    });
  }
}

export function startReporting() {
  setInterval(() => send(false), 60_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') send(true);
  });
  send(false);
}
