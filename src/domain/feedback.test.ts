import { describe, expect, it } from 'vitest';

import { scoreFeedbackAnchor } from './feedback';
import { getPiece } from './pieces';
import type { LineScore } from './types';

const line = (kind: LineScore['kind'], index: number): LineScore => ({
  kind,
  index,
  score: 10,
  multiplier: 1,
});

describe('score feedback anchor', () => {
  it('uses the center of a placement when no line clears', () => {
    expect(scoreFeedbackAnchor({
      row: 3,
      column: 4,
      piece: getPiece('corner-3-tr'),
      lines: [],
    })).toEqual({ row: 4.5, column: 5.5 });
  });

  it('anchors a row clear where the placed piece meets that row', () => {
    expect(scoreFeedbackAnchor({
      row: 6,
      column: 7,
      piece: getPiece('square-2'),
      lines: [line('row', 7)],
    })).toEqual({ row: 7.5, column: 8 });
  });

  it('anchors a column clear where the placed piece meets that column', () => {
    expect(scoreFeedbackAnchor({
      row: 7,
      column: 3,
      piece: getPiece('line-2-v'),
      lines: [line('column', 3)],
    })).toEqual({ row: 8, column: 3.5 });
  });

  it('uses the intersection when a row and column clear together', () => {
    expect(scoreFeedbackAnchor({
      row: 0,
      column: 9,
      piece: getPiece('single'),
      lines: [line('row', 0), line('column', 9)],
    })).toEqual({ row: 0.5, column: 9.5 });
  });
});
