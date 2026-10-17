// Simple move rules for lesson boards, which have no kings and so can't use the
// full rules engine. pieces: Map of square -> { color, type }.

import { squareXY, xySquare } from './board.js';

const STRAIGHT = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const SLANT = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

export function lessonMoves(sq, pieces) {
  const me = pieces.get(sq);
  if (!me) return [];
  const { x, y } = squareXY(sq);
  const out = [];
  const canLand = (to) => {
    const p = pieces.get(to);
    return !p || p.color !== me.color;
  };

  const slide = (dirs, far) => {
    for (const [dx, dy] of dirs) {
      for (let i = 1; i <= (far ? 7 : 1); i++) {
        const to = xySquare(x + dx * i, y + dy * i);
        if (!to) break;
        if (canLand(to)) out.push(to);
        if (pieces.get(to)) break;
      }
    }
  };

  switch (me.type) {
    case 'r': slide(STRAIGHT, true); break;
    case 'b': slide(SLANT, true); break;
    case 'q': slide([...STRAIGHT, ...SLANT], true); break;
    case 'k': slide([...STRAIGHT, ...SLANT], false); break;
    case 'n':
      for (const [dx, dy] of KNIGHT) {
        const to = xySquare(x + dx, y + dy);
        if (to && canLand(to)) out.push(to);
      }
      break;
    case 'p': {
      const dir = me.color === 'w' ? 1 : -1;
      const one = xySquare(x, y + dir);
      if (one && !pieces.get(one)) {
        out.push(one);
        const start = me.color === 'w' ? 1 : 6;
        const two = xySquare(x, y + 2 * dir);
        if (y === start && two && !pieces.get(two)) out.push(two);
      }
      for (const dx of [-1, 1]) {
        const to = xySquare(x + dx, y + dir);
        const p = to && pieces.get(to);
        if (p && p.color !== me.color) out.push(to);
      }
      break;
    }
  }
  return out;
}
