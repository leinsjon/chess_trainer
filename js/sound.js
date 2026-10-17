// Spoken instructions and little sound effects. Everything fails quietly when
// the browser doesn't support it.

let muted = false;
try { muted = localStorage.getItem('muted') === '1'; } catch {}

export function isMuted() { return muted; }

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('muted', m ? '1' : '0'); } catch {}
  if (m) stopSpeaking();
}

let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  voice = voices.find((v) => /samantha|karen|moira|female/i.test(v.name)) || voices[0] || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function say(text) {
  if (muted || !('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = 0.9;
  u.pitch = 1.15;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

let ctx = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.15) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  move() { if (!muted) tone(520, 0, 0.12, 'triangle'); },
  eat() { if (!muted) { tone(660, 0, 0.1); tone(880, 0.08, 0.15); } },
  oops() { if (!muted) { tone(300, 0, 0.15, 'square', 0.06); tone(220, 0.12, 0.2, 'square', 0.06); } },
  win() { if (!muted) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25)); },
  // Grunt-ish "oink" for the pig mascot.
  oink() {
    if (muted) return;
    const a = audio();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sawtooth';
    const t = a.currentTime;
    o.frequency.setValueAtTime(180, t);
    o.frequency.linearRampToValueAtTime(260, t + 0.08);
    o.frequency.linearRampToValueAtTime(150, t + 0.22);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 0.3);
  },
};
