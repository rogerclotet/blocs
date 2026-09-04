import { PIECES, getPiece } from './pieces';
import {
  BOARD_SIZE,
  PIECE_SLOT_COUNT,
  type Board,
  type Cell,
  type GameState,
  type LineScore,
  type PieceDefinition,
  type PieceId,
  type PieceSlots,
  type PlaceResult,
  type PlayingSession,
  type SaveData,
} from './types';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(0));
}

function nextRandom(seed: number): readonly [number, number] {
  let nextSeed = seed >>> 0;
  nextSeed ^= nextSeed << 13;
  nextSeed ^= nextSeed >>> 17;
  nextSeed ^= nextSeed << 5;
  const normalizedSeed = nextSeed >>> 0 || 0x6d2b79f5;
  return [normalizedSeed / 0x100000000, normalizedSeed];
}

function randomPieces(seed: number): readonly [PieceSlots, number] {
  let nextSeed = seed;
  const ranked = PIECES.map((piece) => {
    const [rank, updatedSeed] = nextRandom(nextSeed);
    nextSeed = updatedSeed;
    return { id: piece.id, rank };
  }).sort((left, right) => left.rank - right.rank);

  const first = ranked[0]?.id ?? 'single';
  const second = ranked[1]?.id ?? 'line-2-h';
  const third = ranked[2]?.id ?? 'line-2-v';
  return [[first, second, third], nextSeed];
}

function randomPlaceablePieces(board: Board, seed: number): readonly [PieceSlots, number] {
  let nextSeed = seed;
  for (let attempt = 0; attempt < 1_000; attempt += 1) {
    const [pieces, updatedSeed] = randomPieces(nextSeed);
    nextSeed = updatedSeed;
    if (hasPossibleMove(board, pieces)) {
      return [pieces, nextSeed];
    }
  }

  return [['single', null, null], nextSeed];
}

export function createNewSession(highScore: number, seed: number): PlayingSession {
  const normalizedSeed = seed >>> 0 || 0x6d2b79f5;
  const [pieces, randomSeed] = randomPieces(normalizedSeed);
  return {
    game: {
      board: createEmptyBoard(),
      score: 0,
      placedBlocks: 0,
      highScore,
      beatHighScore: false,
      pieces,
      randomSeed,
      multiplier: 1,
      previousMultiplier: 1,
    },
    previousStates: [],
    undoTimes: 0,
  };
}

export function isPiecePlaceable(
  board: Board,
  piece: PieceDefinition,
  row: number,
  column: number,
): boolean {
  if (row < 0 || column < 0 || row + piece.rows > BOARD_SIZE || column + piece.columns > BOARD_SIZE) {
    return false;
  }

  return piece.blocks.every((block) => board[row + block.row]?.[column + block.column] === 0);
}

export function canPlaceAnywhere(board: Board, piece: PieceDefinition): boolean {
  for (let row = 0; row <= BOARD_SIZE - piece.rows; row += 1) {
    for (let column = 0; column <= BOARD_SIZE - piece.columns; column += 1) {
      if (isPiecePlaceable(board, piece, row, column)) {
        return true;
      }
    }
  }
  return false;
}

export function hasPossibleMove(board: Board, pieces: PieceSlots): boolean {
  return pieces.some((id) => id !== null && canPlaceAnywhere(board, getPiece(id)));
}

function mutableBoard(board: Board): Cell[][] {
  return board.map((row) => row.map((cell) => cell));
}

function completeLines(board: Board): Readonly<{
  rows: ReadonlyArray<boolean>;
  columns: ReadonlyArray<boolean>;
}> {
  const rows = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, column) => board[row]?.[column] === 1).every(Boolean),
  );
  const columns = Array.from({ length: BOARD_SIZE }, (_, column) =>
    Array.from({ length: BOARD_SIZE }, (_, row) => board[row]?.[column] === 1).every(Boolean),
  );
  return { rows, columns };
}

function clearCompletedLines(
  source: Board,
  startingMultiplier: number,
): Readonly<{ board: Board; lineScores: ReadonlyArray<LineScore>; multiplier: number }> {
  const board = mutableBoard(source);
  const completed = completeLines(board);
  const lineScores: LineScore[] = [];
  let multiplier = startingMultiplier;

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (completed.rows[index]) {
      let cleared = 0;
      const rowToClear = board[index];
      if (!rowToClear) continue;
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        if (rowToClear[column] === 1) {
          rowToClear[column] = 0;
          cleared += 1;
        }
      }
      lineScores.push({ kind: 'row', index, score: cleared * multiplier, multiplier });
      multiplier += 1;
    }

    if (completed.columns[index]) {
      let cleared = 0;
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        const rowToClear = board[row];
        if (rowToClear?.[index] === 1) {
          rowToClear[index] = 0;
          cleared += 1;
        }
      }
      lineScores.push({ kind: 'column', index, score: cleared * multiplier, multiplier });
      multiplier += 1;
    }
  }

  return { board, lineScores, multiplier };
}

function replaceSlot(pieces: PieceSlots, slot: number, value: PieceId | null): PieceSlots {
  if (slot === 0) return [value, pieces[1], pieces[2]];
  if (slot === 1) return [pieces[0], value, pieces[2]];
  return [pieces[0], pieces[1], value];
}

export function placePiece(
  session: PlayingSession,
  slot: number,
  row: number,
  column: number,
): PlaceResult {
  if (slot < 0 || slot >= PIECE_SLOT_COUNT) return { kind: 'invalid' };
  const pieceId = session.game.pieces[slot];
  if (pieceId === null || pieceId === undefined) return { kind: 'invalid' };
  const piece = getPiece(pieceId);
  if (!isPiecePlaceable(session.game.board, piece, row, column)) return { kind: 'invalid' };

  const placedBoard = mutableBoard(session.game.board);
  for (const block of piece.blocks) {
    const targetRow = placedBoard[row + block.row];
    if (targetRow) targetRow[column + block.column] = 1;
  }

  const pieceScore = piece.blocks.length * session.game.previousMultiplier;
  const cleared = clearCompletedLines(placedBoard, session.game.multiplier);
  const clearedScore = cleared.lineScores.reduce((total, line) => total + line.score, 0);
  const score = session.game.score + pieceScore + clearedScore;
  const highScore = Math.max(session.game.highScore, score);
  let multiplier = cleared.multiplier;
  if (session.game.previousMultiplier === multiplier) multiplier = 1;
  const previousMultiplier = multiplier;

  let pieces = replaceSlot(session.game.pieces, slot, null);
  let randomSeed = session.game.randomSeed;
  if (pieces.every((candidate) => candidate === null)) {
    [pieces, randomSeed] = randomPlaceablePieces(cleared.board, randomSeed);
  }

  const game: GameState = {
    board: cleared.board,
    score,
    placedBlocks: session.game.placedBlocks + piece.blocks.length,
    highScore,
    beatHighScore: session.game.beatHighScore || score > session.game.highScore,
    pieces,
    randomSeed,
    multiplier,
    previousMultiplier,
  };

  if (!hasPossibleMove(game.board, game.pieces)) {
    return { kind: 'game-over', game, pieceScore, lineScores: cleared.lineScores };
  }

  const previousStates = [...session.previousStates, session.game].slice(-3);
  return {
    kind: 'placed',
    session: {
      game,
      previousStates,
      undoTimes: Math.max(0, session.undoTimes - 1),
    },
    pieceScore,
    lineScores: cleared.lineScores,
  };
}

export function canUndo(session: PlayingSession): boolean {
  return session.undoTimes < 1 && session.previousStates.length > 0;
}

export function undo(session: PlayingSession): PlayingSession {
  if (!canUndo(session)) return session;
  const game = session.previousStates[session.previousStates.length - 1];
  if (!game) return session;
  return {
    game,
    previousStates: session.previousStates.slice(0, -1),
    undoTimes: session.undoTimes + 1,
  };
}

export const EMPTY_SAVE: SaveData = {
  version: 1,
  highScore: 0,
  highScoreBlocks: 0,
  history: [],
  session: null,
};

export function savePlaying(save: SaveData, session: PlayingSession): SaveData {
  return { ...save, highScore: session.game.highScore, session };
}

export function finishGame(save: SaveData, game: GameState): SaveData {
  return {
    ...save,
    highScore: game.highScore,
    highScoreBlocks: game.beatHighScore ? game.placedBlocks : save.highScoreBlocks,
    history: [...save.history, { score: game.score, blocks: game.placedBlocks }].slice(-10),
    session: null,
  };
}
