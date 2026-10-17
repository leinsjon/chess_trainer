// Runs one lesson level on the board and calls onWin when it's solved.

import { Chess } from '../vendor/chess.js';
import { lessonMoves, attackedSquares } from './lessonMoves.js';
import { say, sfx } from './sound.js';
import { countMove } from './progress.js';
import { mood } from './mascot.js';

const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 };

// How each real-position level judges a legal move she made.
// Returns { win: message } or { oops: message, show?: { sq: highlight } }.
const JUDGES = {
  escape: () => ({ win: 'Phew! The king is safe!' }),
  mate(move, game) {
    if (game.isCheckmate()) return { win: 'Checkmate! The king has nowhere to go. You win!' };
    if (game.isStalemate()) return { oops: "Oh no, that's a tie! The king can't move, but he isn't in check." };
    if (game.inCheck()) {
      const show = {};
      for (const m of game.moves({ verbose: true })) show[m.to] = 'good';
      return { oops: 'Check! But the king can still get away. Look at the green squares.', show };
    }
    return { oops: "That's not checkmate. Try again!" };
  },
  free(move, game) {
    if (!move.captured) return { oops: 'Look for a black piece you can take!' };
    if (game.isAttacked(move.to, 'b')) {
      const show = { [move.to]: 'danger' };
      for (const a of game.attackers(move.to, 'b')) show[a] = 'danger';
      return { oops: `Careful! Black can take your ${NAMES[move.piece]} back.`, show };
    }
    return { win: `Yummy! That ${NAMES[move.captured]} was free!` };
  },
  castle(move) {
    if (move.isKingsideCastle() || move.isQueensideCastle()) return { win: 'Castled! The king is safe behind his wall.' };
    return { oops: 'Try the special king move! Jump him two steps toward the rook.' };
  },
  best(move, game) {
    if (!move.captured) return { oops: 'Take a piece!' };
    game.undo();
    const best = Math.max(...game.moves({ verbose: true }).map((m) => VALUES[m.captured] || 0));
    game.move(move);
    const v = VALUES[move.captured];
    if (v < best) return { oops: `A ${NAMES[move.captured]} is worth ${v}. There's a bigger one!` };
    return { win: `Great choice! A ${NAMES[move.captured]} is worth ${v}!` };
  },
};

export function playLevel({ board, level, lesson, talk, setHelp, onWin }) {
  const ctl = { stop() {}, help() {} };
  const finish = (msg) => {
    board.onTap = null;
    setHelp(false);
    sfx.win();
    mood('happy');
    talk(msg, true);
    setTimeout(onWin, 1400);
  };
  const oops = (sq, msg) => {
    sfx.oops();
    mood('sad');
    board.flash(sq, 'bad');
    talk(msg, true);
  };

  if (level.type === 'collect') runCollect();
  else if (level.type === 'find') runFind();
  else if (level.type === 'safe') runSafe();
  else if (level.type === 'stuck') runStuck();
  else if (level.type === 'tie') runTie();
  else runPosition(JUDGES[level.type]);
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
        oops(sq, level.tip || lesson.tip);
        if (++wrong >= 2) { showDots = true; draw(); }
        return;
      }
      const me = pieces.get(id);
      if (me.type === 'n') board.trace(id, sq);
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
      for (const f of found) marks[f] = 'pig';
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
        oops(sq, level.tip || lesson.tip);
        if (++wrong % 3 === 0) flashHint();
        return;
      }
      found.add(sq);
      sfx.eat();
      if (level.piece === 'n') board.trace(level.from, sq);
      draw(false);
      const left = targets.size - found.size;
      if (!left) finish(`You found them all! ${targets.size} squares!`);
      else talk(left === 1 ? 'One more!' : `${left} more!`, false);
    };
    draw(false);
  }

  // A real position: pick a piece, make a move, and the level's judge decides.
  function runPosition(judge) {
    const game = new Chess(level.fen);
    let selected = null;
    let showDots = !!level.dots;
    let wrongCount = 0;
    let waiting = false;
    const king = () => game.findPiece({ type: 'k', color: 'w' })[0];
    const draw = (extra = {}) => {
      board.setPieces(piecesFromChess(game));
      const hl = {};
      if (game.inCheck()) {
        hl[king()] = 'danger';
        for (const a of game.attackers(king(), 'b')) hl[a] = 'danger';
      }
      const marks = {};
      if (selected) {
        hl[selected] = 'selected';
        if (showDots) for (const m of game.moves({ square: selected, verbose: true })) marks[m.to] = m.captured ? 'ring' : 'dot';
      }
      Object.assign(hl, extra);
      board.setHighlights(hl);
      board.setMarks(marks);
    };
    const tryAgain = () => {
      if (++wrongCount >= 2) showDots = true;
    };
    ctl.help = () => {
      showDots = true;
      if (!selected) selected = game.moves({ verbose: true })[0].from;
      draw();
    };
    setHelp(!showDots);
    board.onTap = (sq) => {
      if (waiting) return;
      const p = game.get(sq);
      if (p && p.color === 'w') {
        selected = sq;
        sfx.move();
        draw();
        return;
      }
      if (!selected) return;
      const legal = game.moves({ square: selected, verbose: true }).find((m) => m.to === sq);
      if (!legal) {
        if (lessonMoves(selected, boardMap(game)).includes(sq)) {
          oops(sq, game.get(selected).type === 'k' ? 'Not safe there! The king would be in danger.' : "You can't, your king would be in danger!");
        } else {
          oops(sq, `The ${NAMES[game.get(selected).type]} can't go there.`);
        }
        tryAgain();
        if (showDots) draw();
        return;
      }
      const move = game.move({ from: legal.from, to: legal.to, promotion: legal.promotion ? 'q' : undefined });
      countMove();
      if (move.piece === 'n') board.trace(move.from, move.to);
      selected = null;
      const verdict = judge(move, game);
      draw({ [move.from]: 'last', [move.to]: verdict.win ? 'good' : 'last', ...(verdict.show || {}) });
      if (verdict.win) {
        move.captured ? sfx.eat() : sfx.move();
        finish(verdict.win);
        return;
      }
      sfx.oops();
      mood('sad');
      talk(verdict.oops, true);
      tryAgain();
      waiting = true;
      setTimeout(() => {
        game.undo();
        waiting = false;
        draw();
      }, 2200);
    };
    draw();
  }

  // Tap every square (or apple) the piece can safely go to.
  function runSafe() {
    const pieces = new Map([[level.from, { color: 'w', type: level.piece, id: 'me' }]]);
    let n = 0;
    for (const f of level.friends || []) pieces.set(f.sq, { color: 'w', type: f.type, id: 'f' + n++ });
    for (const f of level.foes || []) pieces.set(f.sq, { color: 'b', type: f.type, id: 'x' + n++ });
    const others = new Map(pieces);
    others.delete(level.from);
    const danger = attackedSquares('b', others);
    const reach = lessonMoves(level.from, pieces);
    const apples = level.apples ? new Set(level.apples) : null;
    const targets = new Set(reach.filter((sq) => !danger.has(sq) && (!apples || apples.has(sq))));
    const found = new Set();
    const draw = (hl = {}) => {
      board.setPieces([...pieces].map(([sq, p]) => ({ ...p, sq })));
      const marks = {};
      if (apples) for (const a of apples) marks[a] = 'apple';
      for (const f of found) marks[f] = 'pig';
      board.setMarks(marks);
      board.setHighlights({ [level.from]: 'selected', ...hl });
    };
    // Which black pieces guard a square, each checked on its own.
    const guards = (sq) => {
      const hl = { [sq]: 'danger' };
      for (const [s, p] of others) {
        if (p.color !== 'b') continue;
        const solo = new Map([...others].filter(([k, q]) => k === s || q.color === 'w'));
        if (attackedSquares('b', solo).has(sq)) hl[s] = 'danger';
      }
      return hl;
    };
    ctl.help = () => {
      const hl = {};
      for (const sq of reach) hl[sq] = danger.has(sq) ? 'danger' : 'good';
      draw(hl);
      setTimeout(() => draw(), 1800);
    };
    setHelp(true);
    board.onTap = (sq) => {
      if (sq === level.from || found.has(sq) || pieces.has(sq)) return;
      if (apples && !apples.has(sq)) return;
      if (!reach.includes(sq)) {
        oops(sq, `The ${NAMES[level.piece]} can't get there.`);
        return;
      }
      if (danger.has(sq)) {
        sfx.oops();
        mood('sad');
        const hl = guards(sq);
        const who = Object.keys(hl).find((s) => s !== sq);
        draw(hl);
        talk(`Danger! The ${NAMES[others.get(who)?.type] || 'enemy'} could get you there.`, true);
        setTimeout(() => draw(), 1500);
        return;
      }
      found.add(sq);
      sfx.eat();
      draw();
      const left = targets.size - found.size;
      if (!left) finish(apples ? 'Yes! Those apples are safe to eat.' : 'You found all the safe squares!');
      else talk(left === 1 ? 'One more safe one!' : `${left} more safe ones!`, false);
    };
    draw();
  }

  // A stalemate: tap the king that can't move to see why it's a tie.
  function runTie() {
    const game = new Chess(level.fen);
    const k = game.findPiece({ type: 'k', color: 'b' })[0];
    board.setPieces(piecesFromChess(game));
    board.setMarks({});
    board.setHighlights({});
    setHelp(false);
    board.onTap = (sq) => {
      if (sq !== k) {
        if (game.get(sq)) oops(sq, 'Tap the black king. Can he move?');
        return;
      }
      const hl = { [k]: 'selected' };
      const map = boardMap(game);
      for (const to of lessonMoves(k, map)) hl[to] = 'danger';
      board.setHighlights(hl);
      finish("He can't move anywhere, but he's not in check. That's a tie, called stalemate!");
    };
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
