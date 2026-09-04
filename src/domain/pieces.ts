import type { PieceDefinition, PieceId } from './types';

const p = (row: number, column: number) => ({ row, column });

const SINGLE_PIECE: PieceDefinition = { id: 'single', rows: 1, columns: 1, blocks: [p(0, 0)] };

export const PIECES = [
  SINGLE_PIECE,
  { id: 'line-2-h', rows: 1, columns: 2, blocks: [p(0, 0), p(0, 1)] },
  { id: 'line-2-v', rows: 2, columns: 1, blocks: [p(0, 0), p(1, 0)] },
  { id: 'line-3-h', rows: 1, columns: 3, blocks: [p(0, 0), p(0, 1), p(0, 2)] },
  { id: 'line-3-v', rows: 3, columns: 1, blocks: [p(0, 0), p(1, 0), p(2, 0)] },
  { id: 'line-4-h', rows: 1, columns: 4, blocks: [p(0, 0), p(0, 1), p(0, 2), p(0, 3)] },
  { id: 'line-4-v', rows: 4, columns: 1, blocks: [p(0, 0), p(1, 0), p(2, 0), p(3, 0)] },
  { id: 'line-5-h', rows: 1, columns: 5, blocks: [p(0, 0), p(0, 1), p(0, 2), p(0, 3), p(0, 4)] },
  { id: 'line-5-v', rows: 5, columns: 1, blocks: [p(0, 0), p(1, 0), p(2, 0), p(3, 0), p(4, 0)] },
  { id: 'square-2', rows: 2, columns: 2, blocks: [p(0, 0), p(0, 1), p(1, 0), p(1, 1)] },
  {
    id: 'square-3', rows: 3, columns: 3,
    blocks: [p(0, 0), p(0, 1), p(0, 2), p(1, 0), p(1, 1), p(1, 2), p(2, 0), p(2, 1), p(2, 2)],
  },
  { id: 'corner-2-tl', rows: 2, columns: 2, blocks: [p(0, 0), p(1, 0), p(1, 1)] },
  { id: 'corner-2-tr', rows: 2, columns: 2, blocks: [p(0, 0), p(0, 1), p(1, 1)] },
  { id: 'corner-2-bl', rows: 2, columns: 2, blocks: [p(0, 0), p(0, 1), p(1, 0)] },
  { id: 'corner-2-br', rows: 2, columns: 2, blocks: [p(0, 1), p(1, 0), p(1, 1)] },
  { id: 'corner-3-tl', rows: 3, columns: 3, blocks: [p(0, 0), p(1, 0), p(2, 0), p(2, 1), p(2, 2)] },
  { id: 'corner-3-tr', rows: 3, columns: 3, blocks: [p(0, 2), p(1, 2), p(2, 0), p(2, 1), p(2, 2)] },
  { id: 'corner-3-bl', rows: 3, columns: 3, blocks: [p(0, 0), p(0, 1), p(0, 2), p(1, 0), p(2, 0)] },
  { id: 'corner-3-br', rows: 3, columns: 3, blocks: [p(0, 0), p(0, 1), p(0, 2), p(1, 2), p(2, 2)] },
] satisfies ReadonlyArray<PieceDefinition>;

export function getPiece(id: PieceId): PieceDefinition {
  return PIECES.find((piece) => piece.id === id) ?? SINGLE_PIECE;
}
