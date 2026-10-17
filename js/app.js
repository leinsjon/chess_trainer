import { Board, pieceImg } from './board.js';
import { LESSONS } from './lessons.js';
import { playLevel } from './lessonPlayer.js';
import { say, sfx, isMuted, setMuted, stopSpeaking } from './sound.js';
import { isDone, doneCount, markLevelDone, markLessonDone } from './progress.js';

const $ = (id) => document.getElementById(id);
const board = new Board($('board'));

let current = null; // { lesson, index, ctl }
let lastTalk = '';

function show(screen) {
  stopSpeaking();
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === screen));
  if (screen === 'lessons') renderLessons();
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) show(go.dataset.go);
});

function talk(text, speak) {
  lastTalk = text;
  const el = $('talk');
  el.textContent = text;
  el.classList.remove('pop');
  el.getBoundingClientRect();
  el.classList.add('pop');
  if (speak) say(text);
}

$('repeat-btn').addEventListener('click', () => say(lastTalk));
function syncSoundBtn() { $('sound-btn').textContent = isMuted() ? '🔇' : '🔊'; }
$('sound-btn').addEventListener('click', () => { setMuted(!isMuted()); syncSoundBtn(); });
syncSoundBtn();
$('help-btn').addEventListener('click', () => current?.ctl.help());

function renderLessons() {
  const list = $('lesson-list');
  list.innerHTML = '';
  for (const lesson of LESSONS) {
    const n = doneCount(lesson);
    const all = n === lesson.levels.length;
    const b = document.createElement('button');
    b.className = 'lesson-card' + (all ? ' complete' : '');
    b.innerHTML = `
      <img src="assets/pieces/${lesson.icon}.svg" alt="">
      <span class="lesson-name">${lesson.title}</span>
      <span class="lesson-stars">${'⭐'.repeat(n)}${'☆'.repeat(lesson.levels.length - n)}</span>`;
    b.addEventListener('click', () => {
      const next = lesson.levels.findIndex((_, i) => !isDone(lesson.id, i));
      startLesson(lesson, next < 0 ? 0 : next);
    });
    list.appendChild(b);
  }
}

function startLesson(lesson, index) {
  show('level');
  if (index === 0) {
    overlay({
      text: lesson.intro,
      img: pieceImg('w', lesson.icon[1]),
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

function overlay({ text, stars = 0, img, button, speak, then }) {
  sfx.oink();
  $('overlay-text').textContent = text;
  $('overlay-stars').innerHTML = img ? `<img class="intro-piece" src="${img}" alt="">` : '⭐'.repeat(stars);
  const btn = $('overlay-btn');
  btn.textContent = button;
  btn.onclick = () => {
    $('overlay').classList.add('hidden');
    stopSpeaking();
    then();
  };
  $('overlay').classList.remove('hidden');
  if (speak) say(text);
}

// Keep iPad Safari from zooming or scrolling the page on double-tap and drag.
document.addEventListener('dblclick', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
  if (!e.target.closest('.lesson-list')) e.preventDefault();
}, { passive: false });
