import type { LineScore, PieceDefinition } from './types';

export type BoardAnchor = Readonly<{ row: number; column: number }>;

export function scoreFeedbackAnchor({
  row,
  column,
  piece,
  lines,
}: {
  row: number;
  column: number;
  piece: PieceDefinition;
  lines: ReadonlyArray<LineScore>;
}): BoardAnchor {
  const pieceCenter = {
    row: row + piece.rows / 2,
    column: column + piece.columns / 2,
  };
  if (lines.length === 0) return pieceCenter;

  const total = lines.reduce((anchor, line) => line.kind === 'row'
    ? { row: anchor.row + line.index + 0.5, column: anchor.column + pieceCenter.column }
    : { row: anchor.row + pieceCenter.row, column: anchor.column + line.index + 0.5 },
  { row: 0, column: 0 });

  return {
    row: total.row / lines.length,
    column: total.column / lines.length,
  };
}
