import { describe, expect, it } from 'vitest';

import { canUndo, createEmptyBoard, createNewSession, isPiecePlaceable, placePiece, undo } from './game';
import { getPiece } from './pieces';
import type { Board, Cell, GameState, PieceId, PlayingSession } from './types';

function boardWith(filled: ReadonlyArray<readonly [number, number]>): Board {
  const board = createEmptyBoard().map((row) => [...row]);
  for (const [row, column] of filled) {
    const target = board[row];
    if (target) target[column] = 1;
  }
  return board;
}

function makeSession({
  board = createEmptyBoard(),
  piece = 'single',
  score = 0,
  highScore = 0,
  multiplier = 1,
  previousMultiplier = 1,
}: {
  board?: Board;
  piece?: PieceId;
  score?: number;
  highScore?: number;
  multiplier?: number;
  previousMultiplier?: number;
} = {}): PlayingSession {
  return {
    game: {
      board,
      score,
      placedBlocks: 0,
      highScore,
      beatHighScore: false,
      pieces: [piece, 'line-2-h', 'line-2-v'],
      randomSeed: 42,
      multiplier,
      previousMultiplier,
    },
    previousStates: [],
    undoTimes: 0,
  };
}

describe('piece placement', () => {
  it('rejects occupied and out-of-bounds placements', () => {
    const board = boardWith([[0, 0]]);
    expect(isPiecePlaceable(board, getPiece('line-2-h'), 0, 0)).toBe(false);
    expect(isPiecePlaceable(board, getPiece('line-2-h'), 0, 9)).toBe(false);
  });

  it('adds one point for every placed block', () => {
    const result = placePiece(makeSession({ piece: 'corner-2-tl' }), 0, 3, 4);
    expect(result.kind).toBe('placed');
    if (result.kind !== 'placed') return;
    expect(result.pieceScore).toBe(3);
    expect(result.session.game.score).toBe(3);
    expect(result.session.game.placedBlocks).toBe(3);
    expect(result.session.game.board[3]?.[4]).toBe(1);
    expect(result.session.game.board[4]?.[4]).toBe(1);
    expect(result.session.game.board[4]?.[5]).toBe(1);
  });

  it('clears a completed line for ten additional points', () => {
    const filled = Array.from({ length: 9 }, (_, column) => [0, column] as const);
    const result = placePiece(makeSession({ board: boardWith(filled) }), 0, 0, 9);
    expect(result.kind).toBe('placed');
    if (result.kind !== 'placed') return;
    expect(result.pieceScore).toBe(1);
    expect(result.lineScores).toEqual([{ kind: 'row', index: 0, score: 10, multiplier: 1 }]);
    expect(result.session.game.score).toBe(11);
    expect(result.session.game.board[0]?.every((cell) => cell === 0)).toBe(true);
  });

  it('uses increasing multipliers when a row and column clear together', () => {
    const filled: Array<readonly [number, number]> = [];
    for (let column = 0; column < 9; column += 1) filled.push([0, column]);
    for (let row = 1; row < 10; row += 1) filled.push([row, 9]);
    const result = placePiece(makeSession({ board: boardWith(filled) }), 0, 0, 9);
    expect(result.kind).toBe('placed');
    if (result.kind !== 'placed') return;
    expect(result.lineScores).toEqual([
      { kind: 'row', index: 0, score: 10, multiplier: 1 },
      { kind: 'column', index: 9, score: 18, multiplier: 2 },
    ]);
    expect(result.session.game.score).toBe(29);
    expect(result.session.game.multiplier).toBe(3);
    expect(result.session.game.previousMultiplier).toBe(3);
  });

  it('applies a combo to the next piece and then resets it', () => {
    const result = placePiece(makeSession({ multiplier: 3, previousMultiplier: 3 }), 0, 5, 5);
    expect(result.kind).toBe('placed');
    if (result.kind !== 'placed') return;
    expect(result.pieceScore).toBe(3);
    expect(result.session.game.multiplier).toBe(1);
    expect(result.session.game.previousMultiplier).toBe(1);
  });
});

describe('undo', () => {
  it('allows one undo until another piece is placed', () => {
    const initial = makeSession();
    const placed = placePiece(initial, 0, 4, 4);
    expect(placed.kind).toBe('placed');
    if (placed.kind !== 'placed') return;
    expect(canUndo(placed.session)).toBe(true);
    const restored = undo(placed.session);
    expect(restored.game).toEqual(initial.game);
    expect(canUndo(restored)).toBe(false);
  });

  it('creates three distinct pieces for a new game', () => {
    const ids = createNewSession(0, 123).game.pieces;
    expect(new Set(ids).size).toBe(3);
  });
});
