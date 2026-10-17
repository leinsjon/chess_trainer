// Touch-friendly chess board. Squares are a CSS grid; pieces sit in a layer
// above and slide between squares with a CSS transition.

const FILES = 'abcdefgh';

export function squareXY(sq) {
  return { x: FILES.indexOf(sq[0]), y: Number(sq[1]) - 1 };
}

export function xySquare(x, y) {
  if (x < 0 || x > 7 || y < 0 || y > 7) return null;
  return FILES[x] + (y + 1);
}

export function pieceImg(color, type) {
  return `assets/pieces/${color}${type.toUpperCase()}.svg`;
}

export class Board {
  constructor(el) {
    this.el = el;
    this.el.classList.add('board');
    this.el.innerHTML = '';
    this.squares = {};
    this.pieceEls = new Map();
    this.onTap = null;

    const grid = document.createElement('div');
    grid.className = 'board-grid';
    for (let row = 7; row >= 0; row--) {
      for (let col = 0; col < 8; col++) {
        const sq = xySquare(col, row);
        const d = document.createElement('div');
        d.className = 'sq ' + ((row + col) % 2 ? 'light' : 'dark');
        d.dataset.sq = sq;
        if (col === 0) d.insertAdjacentHTML('beforeend', `<span class="coord rank">${row + 1}</span>`);
        if (row === 0) d.insertAdjacentHTML('beforeend', `<span class="coord file">${FILES[col]}</span>`);
        d.insertAdjacentHTML('beforeend', '<span class="mark"></span>');
        grid.appendChild(d);
        this.squares[sq] = d;
      }
    }
    this.layer = document.createElement('div');
    this.layer.className = 'piece-layer';
    this.el.append(grid, this.layer);

    // pointerdown feels instant on iPad; ignore extra fingers.
    this.el.addEventListener('pointerdown', (e) => {
      if (!e.isPrimary) return;
      const rect = grid.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
      const y = 7 - Math.floor(((e.clientY - rect.top) / rect.height) * 8);
      const sq = xySquare(x, y);
      if (sq && this.onTap) {
        e.preventDefault();
        this.onTap(sq);
      }
    });
  }

  // pieces: [{ id, sq, color, type }]. Pieces whose id is kept slide to the new square.
  setPieces(pieces) {
    const seen = new Set();
    for (const p of pieces) {
      seen.add(p.id);
      let img = this.pieceEls.get(p.id);
      if (!img) {
        img = document.createElement('img');
        img.className = 'piece';
        img.draggable = false;
        img.alt = '';
        this.layer.appendChild(img);
        this.pieceEls.set(p.id, img);
        this.place(img, p.sq, true);
      }
      const src = pieceImg(p.color, p.type);
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      this.place(img, p.sq, false);
    }
    for (const [id, img] of this.pieceEls) {
      if (!seen.has(id)) {
        img.classList.add('gone');
        setTimeout(() => img.remove(), 300);
        this.pieceEls.delete(id);
      }
    }
  }

  clear() {
    this.layer.innerHTML = '';
    this.pieceEls.clear();
    this.setMarks();
    this.setHighlights();
  }

  place(img, sq, instant) {
    const { x, y } = squareXY(sq);
    if (instant) img.style.transition = 'none';
    img.style.transform = `translate(${x * 100}%, ${(7 - y) * 100}%)`;
    if (instant) {
      img.getBoundingClientRect();
      img.style.transition = '';
    }
  }

  // marks: { sq: 'dot' | 'ring' | 'apple' | 'star' | ... } shown inside each square.
  setMarks(marks = {}) {
    for (const sq in this.squares) {
      const m = this.squares[sq].querySelector('.mark');
      const kind = marks[sq] || '';
      m.className = 'mark ' + kind;
      if (kind === 'pig') m.innerHTML = '<img src="assets/pig.svg" alt="">';
      else m.textContent = kind.includes('apple') ? '🍎' : kind === 'star' ? '⭐' : '';
    }
  }

  // highlights: { sq: 'selected' | 'last' | 'danger' | 'good' | 'bad' } as square backgrounds.
  setHighlights(hl = {}) {
    for (const sq in this.squares) {
      const d = this.squares[sq];
      d.classList.remove('selected', 'last', 'danger', 'good', 'bad', 'path');
      if (hl[sq]) d.classList.add(...hl[sq].split(' '));
    }
  }

  // Draw the knight's L: two squares one way, then one to the side.
  trace(from, to) {
    const a = squareXY(from);
    const b = squareXY(to);
    const corner = Math.abs(b.x - a.x) === 2 ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
    const pt = (p) => `${p.x * 100 + 50},${(7 - p.y) * 100 + 50}`;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 800');
    svg.setAttribute('class', 'trace');
    svg.innerHTML = `<polyline points="${pt(a)} ${pt(corner)} ${pt(b)}" pathLength="1"/>
      <circle cx="${a.x * 100 + 50}" cy="${(7 - a.y) * 100 + 50}" r="12"/>`;
    this.layer.prepend(svg);
    setTimeout(() => svg.remove(), 1800);
  }

  flash(sq, cls = 'bad') {
    const d = this.squares[sq];
    d.classList.remove(cls);
    d.getBoundingClientRect();
    d.classList.add(cls);
    setTimeout(() => d.classList.remove(cls), 600);
  }

  shake() {
    this.el.classList.remove('shake');
    this.el.getBoundingClientRect();
    this.el.classList.add('shake');
  }
}
