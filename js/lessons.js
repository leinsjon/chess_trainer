// Lesson content. Level types:
//   collect: move one piece to eat every apple and take every foe.
//            dots: show where the piece can go. friends/walls: pieces in the way.
//   find:    tap every square the piece could move to.
//   escape:  a real position where your king is in check; make any safe move.
//   stuck:   a real position; tap the piece that can't move because of a pin.
//   safe:    tap the squares (or apples) the piece can reach without being taken.
//   mate / free / castle / best: a real position; make the move the level asks
//            for (checkmate, a free capture, castling, the most valuable capture).
//   tie:     a stalemate; tap the king to see why it's a draw.

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
      { type: 'safe', piece: 'k', from: 'e4', foes: [{ sq: 'a5', type: 'r' }], say: "Don't step into danger! The black rook guards its row. Tap the safe squares." },
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
    id: 'mix',
    title: 'Mix it up!',
    emoji: '🔀',
    tip: 'Remember how this piece moves!',
    intro: 'Now every level has a different piece. Look closely and remember how it moves!',
    levels: [
      { type: 'collect', piece: 'n', from: 'c3', apples: ['e4', 'g5'], tip: 'The knight jumps in an L!', say: 'Which piece is this? A knight! Eat the apples.' },
      { type: 'find', piece: 'b', from: 'd5', tip: 'The bishop goes on a slant!', say: 'A bishop! Tap every square it can go to.' },
      { type: 'collect', piece: 'r', from: 'h1', apples: ['h6', 'c6'], tip: 'The rook goes straight!', say: 'A rook! Eat the apples.' },
      { type: 'find', piece: 'n', from: 'e5', tip: 'The knight jumps in an L!', say: 'A knight again! Tap every square it can jump to.' },
      { type: 'collect', piece: 'q', from: 'a1', apples: ['a6', 'f1', 'h8'], tip: 'The queen goes straight or on a slant!', say: 'The queen! Eat all the apples.' },
      { type: 'collect', piece: 'k', from: 'd1', apples: ['e3', 'f4'], tip: 'The king takes just one step!', say: 'The king! One step at a time.' },
      { type: 'collect', piece: 'p', from: 'g2', apples: ['g4'], foes: [{ sq: 'h5', type: 'n' }], tip: 'Pawns walk forward and take on a slant!', say: 'A pawn! Eat the apple, then take the knight.' },
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
    id: 'mate',
    title: 'Checkmate',
    emoji: '🏆',
    tip: 'Checkmate is check where the king has no way out!',
    intro: 'Checkmate means the king is in check and has no way out. He cannot move, block, or take. That wins the game!',
    levels: [
      { type: 'mate', fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', say: "The black king is stuck behind his pawns. Find checkmate with your rook!" },
      { type: 'mate', fen: 'k7/7R/8/8/8/8/8/6RK w - - 0 1', say: 'One rook guards a row. Use the other rook for checkmate!' },
      { type: 'mate', fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', say: 'Your king can help the queen. Find checkmate!' },
      { type: 'mate', fen: 'k7/2Q5/1K6/8/8/8/8/8 w - - 0 1', say: 'The king is in the corner. Find a checkmate with your queen!' },
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
  {
    id: 'safe',
    title: 'Safe or not?',
    emoji: '🛡️',
    tip: 'Look at the black pieces. Could one of them take you there?',
    intro: 'Before you move, look! Is a black piece watching that square? If it is, you might get taken.',
    levels: [
      { type: 'safe', piece: 'r', from: 'a1', apples: ['a5', 'e1'], foes: [{ sq: 'c7', type: 'b' }], say: 'Tap the apple the rook can eat safely.' },
      { type: 'safe', piece: 'b', from: 'c1', apples: ['g5', 'a3', 'e3'], foes: [{ sq: 'f7', type: 'n' }], say: 'Which apples are safe for the bishop? Tap them.' },
      { type: 'safe', piece: 'q', from: 'd1', apples: ['d6', 'h5', 'a4'], foes: [{ sq: 'e7', type: 'p' }, { sq: 'f6', type: 'n' }], say: 'Only one apple is safe for the queen. Which one?' },
      { type: 'safe', piece: 'n', from: 'd4', apples: ['b5', 'c6', 'e6', 'f5'], foes: [{ sq: 'd7', type: 'p' }, { sq: 'b8', type: 'r' }], say: 'Which apple can the knight eat safely?' },
    ],
  },
  {
    id: 'free',
    title: 'Free pieces',
    emoji: '🎁',
    tip: 'A free piece is one nobody can take back.',
    intro: 'If a black piece has no friends guarding it, you can take it for free!',
    levels: [
      { type: 'free', fen: '6k1/8/8/4n3/8/5N2/8/6K1 w - - 0 1', say: 'The black knight is all alone. Take it!' },
      { type: 'free', fen: '6k1/8/4p3/3b4/n7/8/8/3Q2K1 w - - 0 1', say: 'One black piece is guarded and one is free. Take the free one!' },
      { type: 'free', fen: '6k1/2p5/3p4/8/8/8/8/n2R2K1 w - - 0 1', say: 'Find the piece your rook can take for free.' },
    ],
  },
  {
    id: 'values',
    title: 'Piece values',
    emoji: '💰',
    tip: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.',
    intro: 'Some pieces are worth more. A pawn is 1. A knight or bishop is 3. A rook is 5. The queen is 9!',
    levels: [
      { type: 'best', fen: '6k1/8/8/1r3p2/3N4/8/8/6K1 w - - 0 1', say: 'Your knight can take two pieces. Take the one worth more!' },
      { type: 'best', fen: '6k1/8/8/3b1r2/4P3/8/8/6K1 w - - 0 1', say: 'Your pawn can take a bishop or a rook. Which is worth more?' },
      { type: 'best', fen: '6k1/8/8/3n4/q7/8/8/3Q2K1 w - - 0 1', say: 'Queen or knight? Take the bigger one!' },
    ],
  },
  {
    id: 'castle',
    title: 'Castling',
    emoji: '🏰',
    tip: 'Tap the king, then jump him two steps toward the rook.',
    intro: 'Castling is a special move. The king jumps two steps toward his rook, and the rook hops over to stand next to him. Now the king is safe!',
    levels: [
      { type: 'castle', fen: '4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1', dots: true, say: 'Tap the king and jump him two steps toward the rook!' },
      { type: 'castle', fen: '4k3/8/8/8/8/8/PPP5/R3K3 w Q - 0 1', dots: true, say: 'You can castle the other way too. Try it!' },
      { type: 'castle', fen: 'r3k2r/pppq1ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPPQ1PPP/R3K2R w KQkq - 0 1', say: 'A real game! Castle your king to safety.' },
    ],
  },
  {
    id: 'draws',
    title: 'Draws',
    emoji: '🤝',
    tip: "If the king can't move but isn't in check, it's a tie.",
    intro: "Sometimes nobody wins. If it's your turn, you're not in check, but you can't move at all, the game is a tie. That's called stalemate.",
    levels: [
      { type: 'tie', fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1', say: "It's black's turn. Tap the black king. Can he move?" },
      { type: 'mate', fen: '7k/8/6K1/8/8/8/8/5Q2 w - - 0 1', say: "Checkmate the king, but don't make it a tie!" },
      { type: 'mate', fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', say: 'Careful! Checkmate him without trapping him in a tie.' },
    ],
  },
];
