// Saved progress (which levels are done) and daily usage counts, kept in
// this device's localStorage.

const KEY = 'chessTrainer.v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

const state = Object.assign({ done: {}, days: {} }, load());

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function day() {
  const k = today();
  state.days[k] ||= { seconds: 0, moves: 0, levels: [], lessons: [], games: 0, wins: 0 };
  return state.days[k];
}

export function isDone(lessonId, i) {
  return !!state.done[`${lessonId}:${i}`];
}

export function doneCount(lesson) {
  return lesson.levels.filter((_, i) => isDone(lesson.id, i)).length;
}

export function markLevelDone(lesson, i) {
  state.done[`${lesson.id}:${i}`] = true;
  day().levels.push(`${lesson.title} ${i + 1}`);
  save();
}

export function markLessonDone(lesson) {
  const d = day();
  if (!d.lessons.includes(lesson.title)) d.lessons.push(lesson.title);
  save();
}

export function countMove() {
  day().moves++;
  save();
}

export function countGame(won) {
  const d = day();
  d.games++;
  if (won) d.wins++;
  save();
}

export function usage() {
  return state.days;
}

// Count play time only while the page is visible and Zoe touched it recently.
let lastTouch = Date.now();
const IDLE_MS = 60_000;
window.addEventListener('pointerdown', () => { lastTouch = Date.now(); }, true);
setInterval(() => {
  if (document.visibilityState === 'visible' && Date.now() - lastTouch < IDLE_MS) {
    day().seconds += 5;
    save();
  }
}, 5000);
