// Plays the bot against a simple "grab what you can" player to check it's
// beatable and never crashes. Run: node tests/bot.test.mjs
import assert from 'node:assert/strict';

globalThis.window = { addEventListener() {} };
globalThis.document = { visibilityState: 'hidden' };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const { Chess } = await import('../vendor/chess.js');
const { botMove } = await import('../js/game.js');

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
function kid(game) {
  const moves = game.moves({ verbose: true });
  const mate = moves.find((m) => m.san.endsWith('#'));
  if (mate) return mate;
  moves.sort((a, b) => (VAL[b.captured] || 0) - (VAL[a.captured] || 0) || Math.random() - 0.5);
  return moves[0];
}

const results = { win: 0, lose: 0, draw: 0 };
for (let i = 0; i < 30; i++) {
  const g = new Chess();
  for (let ply = 0; ply < 300 && !g.isGameOver(); ply++) {
    const m = g.turn() === 'w' ? kid(g) : botMove(g);
    g.move({ from: m.from, to: m.to, promotion: m.promotion ? 'q' : undefined });
  }
  if (g.isCheckmate()) results[g.turn() === 'b' ? 'win' : 'lose']++;
  else results.draw++;
}
console.log(results);
assert.ok(results.win > results.lose * 5, 'a greedy beginner should beat the bot easily');
process.exit(0);
