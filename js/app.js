import { Board, pieceImg } from './board.js';
import { LESSONS } from './lessons.js';
import { playLevel } from './lessonPlayer.js';
import { say, sfx, isMuted, setMuted, stopSpeaking } from './sound.js';
import { isDone, doneCount, markLevelDone, markLessonDone } from './progress.js';
import { GameScreen, endMessage } from './game.js';
import { mood, confetti } from './mascot.js';
import { startReporting } from './report.js';
import { TinyScreen } from './tiny.js';

const $ = (id) => document.getElementById(id);
const board = new Board($('board'));
const playBoard = new Board($('play-board'));

let current = null; // { lesson, index, ctl }
let lastTalk = '';

function show(screen) {
  stopSpeaking();
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === screen));
  if (screen === 'lessons') renderLessons();
  if (screen === 'play') gameScreen.start(false);
  if (screen === 'tiny') tinyScreen.open();
  else gameScreen.stop();
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) show(go.dataset.go);
});

function talk(text, speak, el = $('talk')) {
  lastTalk = text;
  el.textContent = text;
  el.classList.remove('pop');
  el.getBoundingClientRect();
  el.classList.add('pop');
  if (speak) say(text);
}

document.querySelectorAll('.repeat-btn').forEach((b) => b.addEventListener('click', () => say(lastTalk)));
function syncSoundBtn() {
  document.querySelectorAll('.sound-btn').forEach((b) => { b.textContent = isMuted() ? '🔇' : '🔊'; });
}
document.querySelectorAll('.sound-btn').forEach((b) => b.addEventListener('click', () => { setMuted(!isMuted()); syncSoundBtn(); }));
syncSoundBtn();

const gameScreen = new GameScreen({
  board: playBoard,
  talk: (text, speak) => talk(text, speak, $('play-talk')),
  onEnd: (result, game) => overlay({
    text: endMessage(result, game),
    stars: result === 'win' ? 3 : 0,
    party: result === 'win',
    button: 'Play again 🔄',
    speak: true,
    then: () => gameScreen.start(true),
  }),
});
const tinyScreen = new TinyScreen({
  stage: $('tiny-stage'),
  menu: $('tiny-menu'),
  talk: (text, speak) => talk(text, speak, $('tiny-talk')),
});
$('tiny-games-btn').addEventListener('click', () => tinyScreen.open());
$('undo-btn').addEventListener('click', () => gameScreen.undo());
$('new-game-btn').addEventListener('click', () => gameScreen.start(true));
$('help-btn').addEventListener('click', () => current?.ctl.help());

function renderLessons() {
  const list = $('lesson-list');
  list.innerHTML = '';
  // Everything stays open, but the first unfinished lesson glows as the suggestion.
  const next = LESSONS.find((l) => doneCount(l) < l.levels.length);
  for (const lesson of LESSONS) {
    const n = doneCount(lesson);
    const all = n === lesson.levels.length;
    const b = document.createElement('button');
    b.className = 'lesson-card' + (all ? ' complete' : '') + (lesson === next ? ' next' : '');
    b.innerHTML = `${lesson === next ? '<span class="next-badge">Next ⭐</span>' : ''}
      ${lesson.emoji ? `<span class="lesson-emoji">${lesson.emoji}</span>` : `<img src="assets/pieces/${lesson.icon}.svg" alt="">`}
      <span class="lesson-name">${lesson.title}</span>
      <span class="lesson-stars">${'⭐'.repeat(n)}${'☆'.repeat(lesson.levels.length - n)}</span>`;
    b.addEventListener('click', () => {
      const level = lesson.levels.findIndex((_, i) => !isDone(lesson.id, i));
      startLesson(lesson, level < 0 ? 0 : level);
    });
    list.appendChild(b);
  }
}

function startLesson(lesson, index) {
  show('level');
  if (index === 0) {
    overlay({
      text: lesson.intro,
      img: lesson.emoji || pieceImg('w', lesson.icon[1]),
      button: "Let's go! ➡️",
      speak: true,
      then: () => startLevel(lesson, 0),
    });
  } else {
    startLevel(lesson, index);
  }
}

function startLevel(lesson, index) {
  current = { lesson, index, ctl: null };
  $('level-title').textContent = lesson.title;
  const dots = $('level-dots');
  dots.innerHTML = '';
  lesson.levels.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'level-dot' + (isDone(lesson.id, i) ? ' done' : '') + (i === index ? ' current' : '');
    d.textContent = isDone(lesson.id, i) ? '⭐' : i + 1;
    d.addEventListener('click', () => startLevel(lesson, i));
    dots.appendChild(d);
  });
  board.clear();
  current.ctl = playLevel({
    board,
    level: lesson.levels[index],
    lesson,
    talk,
    setHelp: (on) => { $('help-btn').style.visibility = on ? 'visible' : 'hidden'; },
    onWin: () => levelWon(lesson, index),
  });
}

function levelWon(lesson, index) {
  if (current?.lesson !== lesson || current.index !== index) return;
  markLevelDone(lesson, index);
  const last = index === lesson.levels.length - 1;
  if (last) {
    markLessonDone(lesson);
    overlay({
      text: `You learned the ${lesson.title}!`,
      stars: lesson.levels.length,
      party: true,
      button: 'Yay! 🎉',
      speak: true,
      then: () => show('lessons'),
    });
  } else {
    overlay({
      text: ['Great job!', 'Super!', 'Well done!', 'Brilliant!', 'Hooray!'][index % 5],
      stars: 1,
      button: 'Next ➡️',
      speak: true,
      then: () => startLevel(lesson, index + 1),
    });
  }
}

function overlay({ text, stars = 0, img, button, speak, then, party }) {
  sfx.oink();
  if (party) confetti();
  $('overlay-text').textContent = text;
  $('overlay-stars').innerHTML = !img ? '⭐'.repeat(stars)
    : img.endsWith('.svg') ? `<img class="intro-piece" src="${img}" alt="">`
    : `<span class="intro-emoji">${img}</span>`;
  const btn = $('overlay-btn');
  btn.textContent = button;
  btn.onclick = () => {
    $('overlay').classList.add('hidden');
    stopSpeaking();
    then();
  };
  $('overlay').classList.remove('hidden');
  mood(stars || img ? 'happy' : 'sad');
  if (speak) say(text);
}

document.querySelector('#home .mascot').addEventListener('click', () => { sfx.oink(); mood('happy'); });

// Keep iPad Safari from zooming or scrolling the page on double-tap and drag.
document.addEventListener('dblclick', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
  if (!e.target.closest('.lesson-list')) e.preventDefault();
}, { passive: false });

startReporting();
window.piggyReady = true;
