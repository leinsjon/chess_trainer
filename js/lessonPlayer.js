// Runs one lesson level on the board and calls onWin when it's solved.

import { Chess } from '../vendor/chess.js';
import { lessonMoves } from './lessonMoves.js';
import { say, sfx } from './sound.js';
import { countMove } from './progress.js';

const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

export function playLevel({ board, level, lesson, talk, setHelp, onWin }) {
  const ctl = { stop() {}, help() {} };
  const finish = (msg) => {
    board.onTap = null;
    setHelp(false);
    sfx.win();
    talk(msg, true);
    setTimeout(onWin, 1400);
  };
  const oops = (sq, msg) => {
    sfx.oops();
    board.flash(sq, 'bad');
    talk(msg, true);
  };

  if (level.type === 'collect') runCollect();
  else if (level.type === 'find') runFind();
  else if (level.type === 'escape') runEscape();
  else if (level.type === 'stuck') runStuck();
  talk(level.say, true);
  return ctl;

  function runCollect() {
    let pieces, apples, foes, showDots, wrong, id;
    const reset = () => {
      pieces = new Map();
      let n = 0;
      pieces.set(level.from, { color: 'w', type: level.piece, id: 'me' });
      for (const f of level.friends || []) pieces.set(f.sq, { color: 'w', type: f.type, id: 'f' + n++ });
      for (const f of level.walls || []) pieces.set(f.sq, { color: 'b', type: f.type, id: 'w' + n++ });
      for (const f of level.foes || []) pieces.set(f.sq, { color: 'b', type: f.type, id: 'x' + n++ });
      apples = new Set(level.apples || []);
      foes = new Set((level.foes || []).map((f) => f.sq));
      showDots = !!level.dots;
      wrong = 0;
      id = level.from;
      draw();
    };
    const draw = () => {
      board.setPieces([...pieces].map(([sq, p]) => ({ ...p, sq })));
      const marks = {};
      for (const a of apples) marks[a] = 'apple';
      if (showDots) for (const m of lessonMoves(id, pieces)) marks[m] = apples.has(m) ? 'apple ring' : pieces.get(m) ? 'ring' : 'dot';
      board.setMarks(marks);
      board.setHighlights({ [id]: 'selected' });
      setHelp(!showDots);
    };
    ctl.help = () => { showDots = true; draw(); };
    board.onTap = (sq) => {
      if (sq === id) return;
      if (!lessonMoves(id, pieces).includes(sq)) {
        oops(sq, lesson.tip);
        if (++wrong >= 2) { showDots = true; draw(); }
        return;
      }
      const me = pieces.get(id);
      pieces.delete(id);
      pieces.set(sq, me);
      id = sq;
      countMove();
      let ate = false;
      if (apples.delete(sq)) ate = true;
      if (foes.delete(sq)) ate = true;
      if (me.type === 'p' && sq[1] === '8') {
        me.type = 'q';
        say('Hooray! The pawn became a queen!');
      }
      ate ? sfx.eat() : sfx.move();
      draw();
      if (!apples.size && !foes.size) {
        finish(me.type === 'q' && level.piece === 'p' ? 'The pawn became a queen!' : 'Yummy! You did it!');
      } else if (!canStillWin(pieces, id, apples, foes)) {
        board.onTap = null;
        sfx.oops();
        talk("Oh no, that apple can't be reached now. Let's try again!", true);
        setTimeout(() => {
          reset();
          board.onTap = ctl.tap;
          talk(level.say, false);
        }, 2200);
      }
    };
    ctl.tap = board.onTap;
    reset();
  }

  function runFind() {
    const pieces = new Map([[level.from, { color: 'w', type: level.piece, id: 'me' }]]);
    let n = 0;
    for (const f of level.friends || []) pieces.set(f.sq, { color: 'w', type: f.type, id: 'f' + n++ });
    const targets = new Set(lessonMoves(level.from, pieces));
    const found = new Set();
    let wrong = 0;
    const draw = (hint) => {
      board.setPieces([...pieces].map(([sq, p]) => ({ ...p, sq })));
      const marks = {};
      for (const f of found) marks[f] = 'star';
      if (hint) for (const t of targets) if (!found.has(t)) marks[t] = 'dot';
      board.setMarks(marks);
      board.setHighlights({ [level.from]: 'selected' });
    };
    const flashHint = () => {
      draw(true);
      setTimeout(() => draw(false), 1500);
    };
    ctl.help = flashHint;
    setHelp(true);
    board.onTap = (sq) => {
      if (sq === level.from || found.has(sq)) return;
      if (!targets.has(sq)) {
        oops(sq, lesson.tip);
        if (++wrong % 3 === 0) flashHint();
        return;
      }
      found.add(sq);
      sfx.eat();
      draw(false);
      const left = targets.size - found.size;
      if (!left) finish(`You found them all! ${targets.size} squares!`);
      else talk(left === 1 ? 'One more!' : `${left} more!`, false);
    };
    draw(false);
  }

  function runEscape() {
    const game = new Chess(level.fen);
    let selected = null;
    let showDots = false;
    let wrongCount = 0;
    const king = () => game.findPiece({ type: 'k', color: 'w' })[0];
    const attackers = () => game.attackers(king(), 'b');
    const draw = () => {
      board.setPieces(piecesFromChess(game));
      const hl = { [king()]: 'danger' };
      for (const a of attackers()) hl[a] = 'danger';
      const marks = {};
      if (selected) {
        hl[selected] = 'selected';
        if (showDots) for (const m of game.moves({ square: selected, verbose: true })) marks[m.to] = m.captured ? 'ring' : 'dot';
      }
      board.setHighlights(hl);
      board.setMarks(marks);
    };
    ctl.help = () => {
      showDots = true;
      if (!selected) selected = game.moves({ verbose: true })[0].from;
      draw();
    };
    setHelp(true);
    board.onTap = (sq) => {
      const p = game.get(sq);
      if (p && p.color === 'w') {
        selected = sq;
        sfx.move();
        draw();
        return;
      }
      if (!selected) return;
      const move = game.moves({ square: selected, verbose: true }).find((m) => m.to === sq);
      if (move) {
        game.move(move);
        countMove();
        selected = null;
        draw();
        board.setHighlights({ [move.to]: 'good' });
        finish('Phew! The king is safe!');
        return;
      }
      if (lessonMoves(selected, boardMap(game)).includes(sq)) {
        oops(sq, game.get(selected).type === 'k' ? "Not safe there! The king would still be in danger." : "That doesn't save the king!");
        if (++wrongCount >= 2) { showDots = true; draw(); }
      } else {
        oops(sq, `The ${NAMES[game.get(selected).type]} can't go there.`);
      }
    };
    draw();
  }

  function runStuck() {
    const game = new Chess(level.fen);
    const draw = (hl = {}) => {
      board.setPieces(piecesFromChess(game));
      board.setMarks({});
      board.setHighlights(hl);
    };
    setHelp(false);
    board.onTap = (sq) => {
      const p = game.get(sq);
      if (!p || p.color !== 'w') return;
      if (sq === level.answer) {
        const hl = {};
        for (const s of level.line) hl[s] = 'path';
        hl[sq] = 'selected path';
        draw(hl);
        const attacker = game.get(level.line[0]);
        finish(`Yes! The ${NAMES[p.type]} is stuck. If it moves, the ${NAMES[attacker.type]} can get the king!`);
        return;
      }
      sfx.oops();
      const marks = {};
      for (const m of game.moves({ square: sq, verbose: true })) marks[m.to] = 'dot';
      board.setMarks(marks);
      board.flash(sq, 'bad');
      talk(Object.keys(marks).length ? `The ${NAMES[p.type]} can move. Look for a piece that is stuck!` : `The ${NAMES[p.type]} is blocked, not stuck. Try another one!`, true);
      setTimeout(() => board.setMarks({}), 1500);
    };
    draw();
  }
}

function piecesFromChess(game) {
  const out = [];
  for (const row of game.board()) for (const p of row) if (p) out.push({ id: p.square, sq: p.square, color: p.color, type: p.type });
  return out;
}

function boardMap(game) {
  const m = new Map();
  for (const row of game.board()) for (const p of row) if (p) m.set(p.square, p);
  return m;
}

// Is there still a way for the piece to collect the remaining goals? Pawns
// can't go back, so an early wrong step can make a level impossible.
function canStillWin(pieces, from, apples, foes) {
  const goals = [...apples, ...foes];
  const start = { sq: from, type: pieces.get(from).type, left: (1 << goals.length) - 1 };
  const statics = new Map(pieces);
  statics.delete(from);
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const s = queue.shift();
    if (!s.left) return true;
    const key = `${s.sq}${s.type}${s.left}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const map = new Map();
    for (const [sq, p] of statics) {
      const gi = goals.indexOf(sq);
      if (gi >= 0 && !(s.left & (1 << gi))) continue; // already taken
      map.set(sq, p);
    }
    map.set(s.sq, { color: 'w', type: s.type });
    for (const to of lessonMoves(s.sq, map)) {
      const gi = goals.indexOf(to);
      const left = gi >= 0 ? s.left & ~(1 << gi) : s.left;
      const type = s.type === 'p' && to[1] === '8' ? 'q' : s.type;
      queue.push({ sq: to, type, left });
    }
  }
  return false;
}

export { canStillWin };
