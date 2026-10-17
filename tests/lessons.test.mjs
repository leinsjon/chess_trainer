// Checks every lesson level is solvable. Run: node tests/lessons.test.mjs
import assert from 'node:assert/strict';

globalThis.window = { addEventListener() {} };
globalThis.document = { visibilityState: 'hidden' };
globalThis.localStorage = { getItem: () => null, setItem() {} };

const { LESSONS } = await import('../js/lessons.js');
const { canStillWin } = await import('../js/lessonPlayer.js');
const { lessonMoves, attackedSquares } = await import('../js/lessonMoves.js');
const { Chess } = await import('../vendor/chess.js');

for (const lesson of LESSONS) {
  lesson.levels.forEach((lv, i) => {
    const name = `${lesson.id} ${i + 1}`;
    if (lv.type === 'safe') {
      const pieces = new Map([[lv.from, { color: 'w', type: lv.piece }]]);
      for (const f of lv.foes || []) pieces.set(f.sq, { color: 'b', type: f.type });
      const others = new Map(pieces);
      others.delete(lv.from);
      const danger = attackedSquares('b', others);
      const reach = lessonMoves(lv.from, pieces);
      const cands = lv.apples || reach;
      for (const a of cands) assert.ok(reach.includes(a), `${name} ${a} reachable`);
      assert.ok(cands.some((a) => !danger.has(a)), `${name} has a safe square`);
      assert.ok(cands.some((a) => danger.has(a)), `${name} has a guarded square`);
      return;
    }
    if (['mate', 'free', 'castle', 'best', 'tie'].includes(lv.type)) {
      const g = new Chess(lv.fen);
      const moves = g.moves({ verbose: true });
      const ok = {
        mate: () => moves.some((m) => m.san.endsWith('#')),
        free: () => moves.some((m) => { if (!m.captured) return false; g.move(m); const r = !g.isAttacked(m.to, 'b'); g.undo(); return r; }),
        castle: () => moves.some((m) => m.isKingsideCastle() || m.isQueensideCastle()),
        best: () => new Set(moves.filter((m) => m.captured).map((m) => m.captured)).size >= 2,
        tie: () => g.isStalemate(),
      }[lv.type]();
      assert.ok(ok, `${name} has an answer`);
      if (lv.type === 'free') assert.ok(moves.some((m) => { if (!m.captured) return false; g.move(m); const r = g.isAttacked(m.to, 'b'); g.undo(); return r; }) || name === 'free 1', `${name} has a guarded trap`);
      return;
    }
    if (lv.type === 'collect' || lv.type === 'find') {
      const pieces = new Map([[lv.from, { color: 'w', type: lv.piece }]]);
      for (const f of lv.friends || []) pieces.set(f.sq, { color: 'w', type: f.type });
      for (const f of lv.walls || []) pieces.set(f.sq, { color: 'b', type: f.type });
      for (const f of lv.foes || []) pieces.set(f.sq, { color: 'b', type: f.type });
      if (lv.type === 'collect') {
        assert.ok(canStillWin(pieces, lv.from, new Set(lv.apples || []), new Set((lv.foes || []).map((f) => f.sq))), `${name} solvable`);
      } else {
        assert.ok(lessonMoves(lv.from, pieces).length > 0, `${name} has squares`);
      }
    } else {
      const g = new Chess(lv.fen);
      if (lv.type === 'escape') {
        assert.ok(g.inCheck() && !g.isCheckmate(), `${name} is check, not mate`);
      } else {
        assert.ok(!g.inCheck(), `${name} not in check`);
        const p = g.get(lv.answer);
        assert.ok(p && p.color === 'w', `${name} answer is white`);
        assert.equal(g.moves({ square: lv.answer }).length, 0, `${name} answer can't move`);
        // Without the king, the pinned piece could move: it's stuck, not blocked.
        const k = g.findPiece({ type: 'k', color: 'w' })[0];
        const map = new Map();
        for (const row of g.board()) for (const q of row) if (q) map.set(q.square, q);
        assert.ok(lessonMoves(lv.answer, map).length > 0, `${name} answer is pinned, not blocked`);
        // Every other white piece except the king can move.
        for (const row of g.board()) for (const q of row) {
          if (q && q.color === 'w' && q.square !== lv.answer && q.type !== 'k' && q.type !== 'p')
            assert.ok(g.moves({ square: q.square }).length > 0, `${name} ${q.square} can move`);
        }
        assert.equal(lv.line.at(-1), k, `${name} line ends at king`);
      }
    }
  });
}
console.log('all lesson levels ok');
process.exit(0); // progress.js keeps a timer running
