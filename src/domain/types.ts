export const BOARD_SIZE = 10;
export const PIECE_SLOT_COUNT = 3;

export type Cell = 0 | 1;
export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

export type Position = Readonly<{
  row: number;
  column: number;
}>;

export type PieceId =
  | 'single'
  | 'line-2-h'
  | 'line-2-v'
  | 'line-3-h'
  | 'line-3-v'
  | 'line-4-h'
  | 'line-4-v'
  | 'line-5-h'
  | 'line-5-v'
  | 'square-2'
  | 'square-3'
  | 'corner-2-tl'
  | 'corner-2-tr'
  | 'corner-2-bl'
  | 'corner-2-br'
  | 'corner-3-tl'
  | 'corner-3-tr'
  | 'corner-3-bl'
  | 'corner-3-br';

export type PieceDefinition = Readonly<{
  id: PieceId;
  rows: number;
  columns: number;
  blocks: ReadonlyArray<Position>;
}>;

export type PieceSlots = readonly [PieceId | null, PieceId | null, PieceId | null];

export type GameState = Readonly<{
  board: Board;
  score: number;
  placedBlocks: number;
  highScore: number;
  beatHighScore: boolean;
  pieces: PieceSlots;
  randomSeed: number;
  multiplier: number;
  previousMultiplier: number;
}>;

export type PlayingSession = Readonly<{
  game: GameState;
  previousStates: ReadonlyArray<GameState>;
  undoTimes: number;
}>;

export type HistoryEntry = Readonly<{
  score: number;
  blocks: number;
}>;

export type SaveData = Readonly<{
  version: 1;
  highScore: number;
  highScoreBlocks: number;
  history: ReadonlyArray<HistoryEntry>;
  session: PlayingSession | null;
}>;

export type LineScore = Readonly<{
  kind: 'row' | 'column';
  index: number;
  score: number;
  multiplier: number;
}>;

export type PlaceResult =
  | Readonly<{ kind: 'invalid' }>
  | Readonly<{
      kind: 'placed';
      session: PlayingSession;
      pieceScore: number;
      lineScores: ReadonlyArray<LineScore>;
    }>
  | Readonly<{
      kind: 'game-over';
      game: GameState;
      pieceScore: number;
      lineScores: ReadonlyArray<LineScore>;
    }>;
