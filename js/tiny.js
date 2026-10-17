// "Little Piggy": picture-and-voice games for a three-year-old. No reading,
// no wrong-answer penalties, just naming and finding the pieces.

import { Board, pieceImg } from './board.js';
import { sfx } from './sound.js';
import { mood, confetti } from './mascot.js';
import { countTiny } from './progress.js';

const NAMES = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
const LINES = {
  k: 'This is the king! He has a cross on his crown.',
  q: 'This is the queen! She has a big pointy crown.',
  r: 'This is the rook! It looks like a castle tower.',
  b: 'This is the bishop! He has a pointy hat.',
  n: 'This is the knight! It looks like a horsey. Neigh!',
  p: 'This is the pawn! Small and round.',
};
const TYPES = ['k', 'q', 'r', 'b', 'n', 'p'];
const START = {
  r: ['a1', 'h1'], n: ['b1', 'g1'], b: ['c1', 'f1'], q: ['d1'], k: ['e1'],
  p: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
};
const CHEERS = ['Yay!', 'Well done!', 'Hooray!', 'You found it!', 'Super!', 'Oink oink, yes!'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

export class TinyScreen {
  constructor({ stage, menu, talk }) {
    this.stage = stage;
    this.menu = menu;
    this.talk = talk;
    this.streak = 0;
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('[data-game]');
      if (b) this.start(b.dataset.game);
    });
  }

  open() {
    this.gen = (this.gen || 0) + 1;
    this.menu.hidden = false;
    this.stage.innerHTML = '';
    this.talk('Hello! What shall we play?', true);
  }

  start(game) {
    this.gen = (this.gen || 0) + 1;
    this.menu.hidden = true;
    this.streak = 0;
    this.game = game;
    this[game]();
  }

  right(next) {
    const gen = this.gen;
    const later = (ms) => setTimeout(() => { if (gen === this.gen) next(); }, ms);
    sfx.eat();
    mood('happy');
    countTiny();
    this.streak++;
    if (this.streak % 5 === 0) {
      confetti();
      sfx.win();
      this.talk(`${this.streak} in a row! You are a chess star!`, true);
      later(2600);
    } else {
      this.talk(pick(CHEERS), true);
      later(1300);
    }
  }

  // A row of big tappable piece pictures.
  cards(items, onTap) {
    this.stage.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'tiny-cards';
    for (const it of items) {
      const b = document.createElement('button');
      b.className = 'tiny-card';
      b.innerHTML = `<img src="${pieceImg(it.color, it.type)}" alt="${NAMES[it.type]}">`;
      b.addEventListener('click', () => onTap(it, b));
      row.appendChild(b);
    }
    this.stage.appendChild(row);
  }

  wiggle(el) {
    el.classList.remove('nope');
    el.getBoundingClientRect();
    el.classList.add('nope');
  }

  // Tap any piece to hear its name.
  meet() {
    this.talk('Tap a piece to meet it!', true);
    this.cards(TYPES.map((type) => ({ color: 'w', type })), (it, el) => {
      sfx.oink();
      this.wiggle(el);
      this.talk(LINES[it.type], true);
      countTiny();
    });
  }

  // "Find the knight!" with three pictures to choose from.
  find() {
    const target = pick(TYPES);
    const others = shuffle(TYPES.filter((t) => t !== target)).slice(0, 2);
    const ask = `Can you find the ${NAMES[target]}?`;
    this.talk(ask, true);
    this.cards(shuffle([target, ...others]).map((type) => ({ color: 'w', type })), (it, el) => {
      if (it.type === target) {
        el.classList.add('yes');
        this.right(() => this.find());
      } else {
        sfx.oops();
        this.wiggle(el);
        this.talk(`That's the ${NAMES[it.type]}! ${ask}`, true);
      }
    });
  }

  // "Find the black rook!" among both colors.
  colors() {
    const type = pick(TYPES);
    const color = pick(['w', 'b']);
    const other = pick(TYPES.filter((t) => t !== type));
    const word = color === 'w' ? 'white' : 'black';
    const ask = `Find the ${word} ${NAMES[type]}!`;
    this.talk(ask, true);
    const items = shuffle([
      { color, type },
      { color: color === 'w' ? 'b' : 'w', type },
      { color, type: other },
    ]);
    this.cards(items, (it, el) => {
      if (it.color === color && it.type === type) {
        el.classList.add('yes');
        this.right(() => this.colors());
      } else {
        sfx.oops();
        this.wiggle(el);
        this.talk(`That's the ${it.color === 'w' ? 'white' : 'black'} ${NAMES[it.type]}. ${ask}`, true);
      }
    });
  }

  // Put a missing piece back where it starts. Its home squares sparkle.
  home() {
    this.stage.innerHTML = '<div class="tiny-home"><img class="tiny-missing" alt=""><div class="tiny-board"></div></div>';
    const board = new Board(this.stage.querySelector('.tiny-board'));
    const pieces = [];
    for (const [type, squares] of Object.entries(START)) {
      for (const sq of squares) {
        pieces.push({ id: sq, sq, color: 'w', type });
        const top = sq[0] + (sq[1] === '1' ? '8' : '7');
        pieces.push({ id: top, sq: top, color: 'b', type });
      }
    }
    const round = () => {
      const type = pick(['r', 'n', 'b', 'q', 'k', 'p']);
      const homes = START[type];
      const missing = pick(homes);
      board.setPieces(pieces.filter((p) => p.sq !== missing));
      const hl = {};
      hl[missing] = 'sparkle';
      board.setHighlights(hl);
      board.setMarks({});
      this.stage.querySelector('.tiny-missing').src = pieceImg('w', type);
      const ask = `The ${NAMES[type]} wants to go home! Tap the sparkly square.`;
      this.talk(ask, true);
      board.onTap = (sq) => {
        if (sq === missing) {
          board.onTap = null;
          board.setPieces(pieces);
          board.setHighlights({ [sq]: 'good' });
          this.right(round);
        } else {
          sfx.oops();
          board.flash(sq, 'bad');
          this.talk('Look for the sparkly square!', true);
        }
      };
    };
    round();
  }
}
