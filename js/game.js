// A full game against a very easy bot. Zoe plays white.

import { Chess } from '../vendor/chess.js';
import { lessonMoves } from './lessonMoves.js';
import { sfx } from './sound.js';
import { countMove, countGame } from './progress.js';

const NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const SAVE_KEY = 'chessTrainer.game';

// Mostly random moves. Sometimes grabs a free piece so captures feel real,
// and only finishes the game half the time it could.
export function botMove(game, rand = Math.random) {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  const mates = moves.filter((m) => m.san.endsWith('#'));
  if (mates.length && rand() < 0.5) return mates[0];
  const safe = moves.filter((m) => !m.san.endsWith('#'));
  const pool = safe.length ? safe : moves;
  const captures = pool.filter((m) => m.captured);
  if (captures.length && rand() < 0.3) return captures[Math.floor(rand() * captures.length)];
  return pool[Math.floor(rand() * pool.length)];
}

export class GameScreen {
  constructor({ board, talk, onEnd }) {
    this.board = board;
    this.talk = talk;
    this.onEnd = onEnd;
    this.game = new Chess();
    this.ids = new Map();
    this.selected = null;
    this.last = null;
    this.busy = false;
    this.gen = 0; // bumps on restart so a pending bot move is dropped
  }

  start(fresh) {
    this.gen++;
    this.game = new Chess();
    if (!fresh) {
      try {
        const pgn = localStorage.getItem(SAVE_KEY);
        if (pgn) this.game.loadPgn(pgn);
      } catch {
        this.game = new Chess();
      }
    }
    if (this.game.isGameOver()) this.game = new Chess();
    this.resetIds();
    this.selected = null;
    const hist = this.game.history({ verbose: true });
    this.last = hist.length ? hist[hist.length - 1] : null;
    this.busy = false;
    this.board.clear();
    this.board.onTap = (sq) => this.tap(sq);
    this.draw();
    if (this.game.turn() === 'b') this.botTurn();
    else this.talk(hist.length ? "Your turn! Let's keep playing." : 'You are white. You go first! Tap a piece.', true);
  }

  resetIds() {
    this.ids = new Map();
    let n = 0;
    for (const row of this.game.board()) for (const p of row) if (p) this.ids.set(p.square, 'p' + n++);
  }

  save() {
    try { localStorage.setItem(SAVE_KEY, this.game.pgn()); } catch {}
  }

  draw() {
    const pieces = [];
    for (const row of this.game.board()) {
      for (const p of row) if (p) pieces.push({ id: this.ids.get(p.square), sq: p.square, color: p.color, type: p.type });
    }
    this.board.setPieces(pieces);
    const hl = {};
    if (this.last) {
      hl[this.last.from] = 'last';
      hl[this.last.to] = 'last';
    }
    if (this.game.inCheck()) hl[this.game.findPiece({ type: 'k', color: this.game.turn() })[0]] = 'danger';
    const marks = {};
    if (this.selected) {
      hl[this.selected] = 'selected';
      for (const m of this.game.moves({ square: this.selected, verbose: true })) marks[m.to] = m.captured ? 'ring' : 'dot';
    }
    this.board.setHighlights(hl);
    this.board.setMarks(marks);
  }

  // Keep each piece's id as it moves so it slides instead of popping.
  trackIds(move) {
    const id = this.ids.get(move.from);
    this.ids.delete(move.from);
    if (move.isEnPassant()) this.ids.delete(move.to[0] + move.from[1]);
    this.ids.set(move.to, id);
    if (move.isKingsideCastle() || move.isQueensideCastle()) {
      const rank = move.from[1];
      const [rf, rt] = move.isKingsideCastle() ? ['h', 'f'] : ['a', 'd'];
      this.ids.set(rt + rank, this.ids.get(rf + rank));
      this.ids.delete(rf + rank);
    }
  }

  tap(sq) {
    if (this.busy || this.game.isGameOver()) return;
    const p = this.game.get(sq);
    if (p && p.color === 'w') {
      if (!this.game.moves({ square: sq }).length) {
        sfx.oops();
        this.board.flash(sq, 'bad');
        this.talk(this.game.inCheck() ? 'Check! Keep your king safe first!' : `The ${NAMES[p.type]} can't move right now.`, true);
        this.selected = null;
      } else {
        this.selected = sq;
        sfx.move();
      }
      this.draw();
      return;
    }
    if (!this.selected) return;
    const move = this.game.moves({ square: this.selected, verbose: true }).find((m) => m.to === sq);
    if (!move) {
      const mine = this.game.get(this.selected);
      const pseudo = new Map();
      for (const row of this.game.board()) for (const q of row) if (q) pseudo.set(q.square, q);
      sfx.oops();
      this.board.flash(sq, 'bad');
      if (lessonMoves(this.selected, pseudo).includes(sq)) {
        this.talk(this.game.inCheck() ? 'Your king is in check! Keep him safe.' : 'Not that one! Your king would be in danger.', true);
      } else {
        this.talk(`The ${NAMES[mine.type]} can't go there.`, true);
      }
      return;
    }
    this.play(move.promotion ? { ...move, promotion: 'q' } : move);
    countMove();
    if (!this.finished()) this.botTurn();
  }

  play(m) {
    const move = this.game.move({ from: m.from, to: m.to, promotion: m.promotion });
    this.trackIds(move);
    this.last = move;
    this.selected = null;
    move.captured ? sfx.eat() : sfx.move();
    this.draw();
    this.save();
    return move;
  }

  botTurn() {
    this.busy = true;
    this.talk('Hmm, let me think…', false);
    const gen = this.gen;
    setTimeout(() => {
      if (gen !== this.gen) return;
      const move = this.play(botMove(this.game));
      this.busy = false;
      if (this.finished()) return;
      if (this.game.inCheck()) this.talk('Check! Your king is in danger. Keep him safe!', true);
      else if (move.captured) this.talk(`Oh! I took your ${NAMES[move.captured]}.`, true);
      else if (move.promotion) this.talk('My pawn became a queen!', true);
      else this.talk('Your turn!', false);
    }, 900);
  }

  finished() {
    const g = this.game;
    if (!g.isGameOver()) return false;
    this.board.onTap = null;
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    let result;
    if (g.isCheckmate()) result = g.turn() === 'b' ? 'win' : 'lose';
    else result = 'draw';
    countGame(result === 'win');
    if (result === 'win') sfx.win();
    else sfx.oops();
    setTimeout(() => this.onEnd(result, g), 900);
    return true;
  }

  undo() {
    if (this.busy || !this.game.history().length) return;
    this.game.undo();
    if (this.game.turn() === 'b') this.game.undo();
    this.resetIds();
    this.board.clear();
    const hist = this.game.history({ verbose: true });
    this.last = hist.length ? hist[hist.length - 1] : null;
    this.selected = null;
    this.draw();
    this.save();
    this.talk("Let's try that again!", true);
  }

  stop() {
    this.gen++;
    this.busy = false;
    this.board.onTap = null;
  }
}

export function endMessage(result, game) {
  if (result === 'win') return 'Checkmate! You won! 🎉';
  if (result === 'lose') return 'Checkmate! I won this time. Good try!';
  if (game.isStalemate()) return "Stalemate! It's a tie. The king can't move but isn't in check.";
  return "It's a tie!";
}

