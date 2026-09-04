import { describe, expect, it } from 'vitest';

import { parseSaveData } from './persistence';

describe('save migration', () => {
  it('adds colors to boards and pieces from single-color saves', () => {
    const board = Array.from({ length: 10 }, (_, row) => (
      Array.from({ length: 10 }, (_, column) => row === 0 && column === 0 ? 1 : 0)
    ));
    const parsed = parseSaveData({
      version: 1,
      highScore: 12,
      highScoreBlocks: 8,
      history: [],
      session: {
        game: {
          board,
          score: 4,
          placedBlocks: 4,
          highScore: 12,
          beatHighScore: false,
          pieces: ['single', 'line-2-h', 'line-2-v'],
          randomSeed: 123,
          multiplier: 1,
          previousMultiplier: 1,
        },
        previousStates: [],
        undoTimes: 0,
      },
    });

    expect(parsed?.session?.game.board[0]?.[0]).toBe('purple');
    expect(parsed?.session?.game.board[0]?.[1]).toBeNull();
    expect(parsed?.session?.game.pieces).toEqual([
      { id: 'single', color: 'purple' },
      { id: 'line-2-h', color: 'blue' },
      { id: 'line-2-v', color: 'green' },
    ]);
  });
});
