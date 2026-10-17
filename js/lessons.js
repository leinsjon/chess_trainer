// Lesson content. Level types:
//   collect: move one piece to eat every apple and take every foe.
//            dots: show where the piece can go. friends/walls: pieces in the way.
//   find:    tap every square the piece could move to.
//   escape:  a real position where your king is in check; make any safe move.
//   stuck:   a real position; tap the piece that can't move because of a pin.

export const LESSONS = [
  {
    id: 'rook',
    title: 'Rook',
    icon: 'wR',
    tip: 'The rook goes straight!',
    intro: 'The rook goes straight. Up, down, and side to side.',
    levels: [
      { type: 'collect', piece: 'r', from: 'd4', apples: ['d7'], dots: true, say: 'Eat the apple!' },
      { type: 'collect', piece: 'r', from: 'a1', apples: ['a6', 'f6'], dots: true, say: 'Eat both apples!' },
      { type: 'collect', piece: 'r', from: 'a1', apples: ['h1', 'h8', 'a8'], say: 'Go to every corner!' },
      { type: 'collect', piece: 'r', from: 'a1', apples: ['a8'], friends: [{ sq: 'a4', type: 'p' }], say: 'A pawn is in the way. Go around!' },
      { type: 'find', piece: 'r', from: 'd4', friends: [{ sq: 'd6', type: 'p' }, { sq: 'f4', type: 'n' }], say: 'Tap every square the rook can go to.' },
    ],
  },
  {
    id: 'bishop',
    title: 'Bishop',
    icon: 'wB',
    tip: 'The bishop goes on a slant!',
    intro: 'The bishop goes on a slant. It stays on its own color.',
    levels: [
      { type: 'collect', piece: 'b', from: 'c1', apples: ['f4'], dots: true, say: 'Eat the apple!' },
      { type: 'collect', piece: 'b', from: 'c1', apples: ['a3', 'e7'], dots: true, say: 'Eat both apples!' },
      { type: 'collect', piece: 'b', from: 'f1', apples: ['b5', 'e8', 'h5'], say: 'Eat all the apples!' },
      { type: 'find', piece: 'b', from: 'e4', friends: [{ sq: 'g6', type: 'p' }], say: 'Tap every square the bishop can go to.' },
    ],
  },
  {
    id: 'queen',
    title: 'Queen',
    icon: 'wQ',
    tip: 'The queen goes straight or on a slant!',
    intro: 'The queen is strong! She goes straight AND on a slant.',
    levels: [
      { type: 'collect', piece: 'q', from: 'd1', apples: ['d5', 'h1'], dots: true, say: 'Eat both apples!' },
      { type: 'collect', piece: 'q', from: 'd1', apples: ['h5', 'a8', 'a5'], say: 'Eat all the apples!' },
      { type: 'find', piece: 'q', from: 'd4', friends: [{ sq: 'b6', type: 'p' }, { sq: 'f4', type: 'p' }], say: 'Tap every square the queen can go to.' },
    ],
  },
  {
    id: 'king',
    title: 'King',
    icon: 'wK',
    tip: 'The king takes just one step!',
    intro: 'The king takes one step. Any way he likes.',
    levels: [
      { type: 'collect', piece: 'k', from: 'e1', apples: ['d2', 'd3', 'e4'], dots: true, say: 'One step at a time. Eat the apples!' },
      { type: 'collect', piece: 'k', from: 'a1', apples: ['c3', 'a4'], say: 'Eat both apples!' },
      { type: 'find', piece: 'k', from: 'e4', say: 'Tap every square the king can go to.' },
    ],
  },
  {
    id: 'knight',
    title: 'Knight',
    icon: 'wN',
    tip: 'The knight jumps in an L. Two steps, then one to the side!',
    intro: 'The knight jumps in an L shape. Two steps one way, then one step to the side. It can jump over pieces!',
    levels: [
      { type: 'collect', piece: 'n', from: 'g1', apples: ['f3'], dots: true, say: 'Jump to the apple!' },
      { type: 'collect', piece: 'n', from: 'g1', apples: ['f3', 'h3'], friends: [{ sq: 'f2', type: 'p' }, { sq: 'g2', type: 'p' }, { sq: 'h2', type: 'p' }], dots: true, say: 'The knight can jump over pawns!' },
      { type: 'collect', piece: 'n', from: 'd4', apples: ['e6', 'f4', 'd5'], dots: true, say: 'Eat all the apples!' },
      { type: 'find', piece: 'n', from: 'd4', say: 'Find all 8 squares the knight can jump to!' },
      { type: 'find', piece: 'n', from: 'b1', say: 'Where can the knight jump from the corner?' },
      { type: 'collect', piece: 'n', from: 'b1', apples: ['d2', 'b3'], say: 'Eat both apples!' },
      { type: 'find', piece: 'n', from: 'f5', friends: [{ sq: 'g7', type: 'p' }], say: 'Tap every square the knight can jump to.' },
      { type: 'collect', piece: 'n', from: 'a1', apples: ['a2'], say: 'Tricky! How do you get to the apple next door?' },
    ],
  },
  {
    id: 'pawn',
    title: 'Pawn',
    icon: 'wP',
    tip: 'Pawns walk forward. They take on a slant!',
    intro: 'The pawn walks forward one step. On its first move it can take two steps! Pawns take other pieces on a slant.',
    levels: [
      { type: 'collect', piece: 'p', from: 'e2', apples: ['e4'], dots: true, say: 'Take two steps on the first move!' },
      { type: 'collect', piece: 'p', from: 'd2', apples: ['d3', 'd5'], dots: true, say: 'Walk forward and eat the apples!' },
      { type: 'collect', piece: 'p', from: 'd4', foes: [{ sq: 'e5', type: 'p' }], walls: [{ sq: 'd5', type: 'p' }], dots: true, say: 'Pawns take on a slant. Take the black pawn!' },
      { type: 'collect', piece: 'p', from: 'c3', foes: [{ sq: 'b4', type: 'n' }, { sq: 'c5', type: 'b' }], say: 'Take both black pieces!' },
      { type: 'collect', piece: 'p', from: 'b6', apples: ['b8'], dots: true, say: 'Get to the end and become a queen!' },
    ],
  },
  {
    id: 'check',
    title: 'Check',
    icon: 'wK',
    tip: 'Keep your king safe!',
    intro: 'Check means the king is in danger! You must keep him safe. Move him, take the bad piece, or put a piece in the way.',
    levels: [
      { type: 'escape', fen: '4r2k/8/8/8/8/8/8/4K3 w - - 0 1', say: 'Your king is in danger! Move him to a safe square.' },
      { type: 'escape', fen: 'k7/3R4/8/8/8/8/5PPP/3r2K1 w - - 0 1', say: 'The king is stuck! Can your rook take the bad rook?' },
      { type: 'escape', fen: '7k/8/8/3R4/8/8/6PP/r6K w - - 0 1', say: 'Put your rook in the way to save the king!' },
    ],
  },
  {
    id: 'pin',
    title: 'Stuck!',
    icon: 'wN',
    tip: 'A piece is stuck if moving it puts its king in danger.',
    intro: 'Sometimes a piece is stuck! If it moves, the king is in danger. So it must stay. This is called a pin.',
    levels: [
      { type: 'stuck', fen: '4r2k/8/8/8/8/8/P3N3/2B1K3 w - - 0 1', answer: 'e2', line: ['e8', 'e7', 'e6', 'e5', 'e4', 'e3', 'e2', 'e1'], say: 'One piece is stuck. Tap it!' },
      { type: 'stuck', fen: '1k6/8/1b6/8/8/8/5R1P/1N4K1 w - - 0 1', answer: 'f2', line: ['b6', 'c5', 'd4', 'e3', 'f2', 'g1'], say: 'Which piece is stuck? Tap it!' },
      { type: 'stuck', fen: '4k3/8/8/q7/8/2N5/6P1/4KB1R w - - 0 1', answer: 'c3', line: ['a5', 'b4', 'c3', 'd2', 'e1'], say: 'The queen is watching your king. Which piece is stuck?' },
    ],
  },
];
