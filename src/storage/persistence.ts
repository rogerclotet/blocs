import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_SAVE } from '../domain/game';
import type { Board, Cell, GameState, HistoryEntry, PieceId, PieceSlots, PlayingSession, SaveData } from '../domain/types';
import type { Language } from '../i18n/translations';
import type { ThemeName } from '../theme/themes';

const SAVE_KEY = '@blocs/save/v1';
const SETTINGS_KEY = '@blocs/settings/v1';

export type Settings = Readonly<{ language: Language; theme: ThemeName }>;

const isRecord = (value: unknown): value is object => typeof value === 'object' && value !== null;
const numberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

function parsePieceId(value: unknown): PieceId | null | undefined {
  switch (value) {
    case null:
    case 'single': case 'line-2-h': case 'line-2-v': case 'line-3-h': case 'line-3-v':
    case 'line-4-h': case 'line-4-v': case 'line-5-h': case 'line-5-v':
    case 'square-2': case 'square-3':
    case 'corner-2-tl': case 'corner-2-tr': case 'corner-2-bl': case 'corner-2-br':
    case 'corner-3-tl': case 'corner-3-tr': case 'corner-3-bl': case 'corner-3-br':
      return value;
    default:
      return undefined;
  }
}

function parseBoard(value: unknown): Board | null {
  if (!Array.isArray(value) || value.length !== 10) return null;
  const board: Cell[][] = [];
  for (const rawRow of value) {
    if (!Array.isArray(rawRow) || rawRow.length !== 10) return null;
    const row: Cell[] = [];
    for (const rawCell of rawRow) {
      if (rawCell !== 0 && rawCell !== 1) return null;
      row.push(rawCell);
    }
    board.push(row);
  }
  return board;
}

function parsePieces(value: unknown): PieceSlots | null {
  if (!Array.isArray(value) || value.length !== 3) return null;
  const first = parsePieceId(value[0]);
  const second = parsePieceId(value[1]);
  const third = parsePieceId(value[2]);
  if (first === undefined || second === undefined || third === undefined) return null;
  return [first, second, third];
}

function parseGame(value: unknown): GameState | null {
  if (!isRecord(value)) return null;
  if (!('board' in value) || !('score' in value) || !('placedBlocks' in value) || !('highScore' in value)
    || !('beatHighScore' in value) || !('pieces' in value) || !('randomSeed' in value)
    || !('multiplier' in value) || !('previousMultiplier' in value)) return null;
  const board = parseBoard(value.board);
  const pieces = parsePieces(value.pieces);
  const score = numberOrNull(value.score);
  const placedBlocks = numberOrNull(value.placedBlocks);
  const highScore = numberOrNull(value.highScore);
  const randomSeed = numberOrNull(value.randomSeed);
  const multiplier = numberOrNull(value.multiplier);
  const previousMultiplier = numberOrNull(value.previousMultiplier);
  if (!board || !pieces || score === null || placedBlocks === null || highScore === null || randomSeed === null
    || multiplier === null || previousMultiplier === null || typeof value.beatHighScore !== 'boolean') return null;
  return { board, pieces, score, placedBlocks, highScore, randomSeed, multiplier, previousMultiplier, beatHighScore: value.beatHighScore };
}

function parseSession(value: unknown): PlayingSession | null {
  if (!isRecord(value) || !('game' in value) || !('previousStates' in value) || !('undoTimes' in value)) return null;
  const game = parseGame(value.game);
  const undoTimes = numberOrNull(value.undoTimes);
  if (!game || undoTimes === null || !Array.isArray(value.previousStates)) return null;
  const previousStates: GameState[] = [];
  for (const rawState of value.previousStates) {
    const state = parseGame(rawState);
    if (!state) return null;
    previousStates.push(state);
  }
  return { game, previousStates: previousStates.slice(-3), undoTimes };
}

function parseHistory(value: unknown): ReadonlyArray<HistoryEntry> | null {
  if (!Array.isArray(value)) return null;
  const history: HistoryEntry[] = [];
  for (const item of value) {
    if (!isRecord(item) || !('score' in item) || !('blocks' in item)) return null;
    const score = numberOrNull(item.score);
    const blocks = numberOrNull(item.blocks);
    if (score === null || blocks === null) return null;
    history.push({ score, blocks });
  }
  return history.slice(-10);
}

export function parseSaveData(value: unknown): SaveData | null {
  if (!isRecord(value) || !('version' in value) || value.version !== 1 || !('highScore' in value)
    || !('highScoreBlocks' in value) || !('history' in value) || !('session' in value)) return null;
  const highScore = numberOrNull(value.highScore);
  const highScoreBlocks = numberOrNull(value.highScoreBlocks);
  const history = parseHistory(value.history);
  const session = value.session === null ? null : parseSession(value.session);
  if (highScore === null || highScoreBlocks === null || !history || (value.session !== null && !session)) return null;
  return { version: 1, highScore, highScoreBlocks, history, session };
}

export async function loadSaveData(): Promise<SaveData> {
  try {
    const serialized = await AsyncStorage.getItem(SAVE_KEY);
    if (!serialized) return EMPTY_SAVE;
    return parseSaveData(JSON.parse(serialized)) ?? EMPTY_SAVE;
  } catch {
    return EMPTY_SAVE;
  }
}

export async function storeSaveData(data: SaveData): Promise<void> {
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function parseSettings(value: unknown, fallbackLanguage: Language): Settings {
  if (!isRecord(value) || !('language' in value) || !('theme' in value)) {
    return { language: fallbackLanguage, theme: 'purple' };
  }
  const language = value.language === 'ca' || value.language === 'es' || value.language === 'en'
    ? value.language : fallbackLanguage;
  const theme = value.theme === 'blueYellow' || value.theme === 'green' || value.theme === 'purple'
    ? value.theme : 'purple';
  return { language, theme };
}

export async function loadSettings(fallbackLanguage: Language): Promise<Settings> {
  try {
    const serialized = await AsyncStorage.getItem(SETTINGS_KEY);
    return serialized ? parseSettings(JSON.parse(serialized), fallbackLanguage) : { language: fallbackLanguage, theme: 'purple' };
  } catch {
    return { language: fallbackLanguage, theme: 'purple' };
  }
}

export async function storeSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
