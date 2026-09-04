import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  LayoutAnimation,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { BoardGrid, DraggablePiece, PieceShape, type DragPoint } from '../components/GamePieces';
import { GAME_FONT, IconButton, PixelButton } from '../components/PixelUi';
import { canUndo, finishGame, isPiecePlaceable, placePiece, savePlaying, undo } from '../domain/game';
import { getPiece } from '../domain/pieces';
import type { GameState, PlayingSession, SaveData } from '../domain/types';
import type { Translator } from '../i18n/translations';
import { platformGameService } from '../services/platformGameService';
import type { Theme } from '../theme/themes';

type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;
type DragState = Readonly<{
  slot: number;
  point: DragPoint;
  row: number;
  column: number;
  valid: boolean;
}>;

const homeIcon = require('../../assets/images/home.png');
const undoIcon = require('../../assets/images/undo.png');

export function GameScreen({
  initialSession,
  save,
  theme,
  t,
  onSave,
  onHome,
  onRestart,
}: {
  initialSession: PlayingSession;
  save: SaveData;
  theme: Theme;
  t: Translator;
  onSave: (data: SaveData) => void;
  onHome: () => void;
  onRestart: () => void;
}) {
  const [session, setSession] = useState(initialSession);
  const [gameOver, setGameOver] = useState<GameState | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [boardRect, setBoardRect] = useState<Rect | null>(null);
  const [rootRect, setRootRect] = useState<Rect | null>(null);
  const [feedback, setFeedback] = useState('');
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const boardRef = useRef<View>(null);
  const rootRef = useRef<View>(null);
  const { width, height } = useWindowDimensions();
  const boardSize = Math.max(180, Math.min(width - 20, height - 255, 540));
  const boardCellSize = boardSize / 10;
  const previewCellSize = Math.max(11, Math.min(22, boardCellSize * 0.54));

  const measureLayouts = useCallback(() => {
    rootRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      setRootRect({ x, y, width: measuredWidth, height: measuredHeight });
    });
    boardRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      setBoardRect({ x, y, width: measuredWidth, height: measuredHeight });
    });
  }, []);

  const anchorFor = useCallback((slot: number, point: DragPoint) => {
    const id = session.game.pieces[slot];
    if (!id || !boardRect) return null;
    const piece = getPiece(id);
    const cellSize = boardRect.width / 10;
    const pieceLeft = point.pageX - piece.columns * cellSize / 2;
    const pieceTop = point.pageY - (piece.rows + 2) * cellSize;
    const row = Math.round((pieceTop - boardRect.y) / cellSize);
    const column = Math.round((pieceLeft - boardRect.x) / cellSize);
    return { row, column, valid: isPiecePlaceable(session.game.board, piece, row, column) };
  }, [boardRect, session.game.board, session.game.pieces]);

  const beginDrag = useCallback((slot: number, point: DragPoint) => {
    const anchor = anchorFor(slot, point);
    if (anchor) setDrag({ slot, point, ...anchor });
  }, [anchorFor]);

  const moveDrag = useCallback((slot: number, point: DragPoint) => {
    const anchor = anchorFor(slot, point);
    if (anchor) setDrag({ slot, point, ...anchor });
  }, [anchorFor]);

  const showScore = useCallback((pieceScore: number, lineScore: number, maxMultiplier: number) => {
    const multiplier = maxMultiplier > 1 ? `  x${maxMultiplier}` : '';
    setFeedback(`+${pieceScore + lineScore}${multiplier}`);
    feedbackAnimation.stopAnimation();
    feedbackAnimation.setValue(0);
    Animated.sequence([
      Animated.spring(feedbackAnimation, { toValue: 1, useNativeDriver: true, speed: 18 }),
      Animated.delay(450),
      Animated.timing(feedbackAnimation, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [feedbackAnimation]);

  const commitPlacement = useCallback((slot: number, row: number, column: number) => {
    const result = placePiece(session, slot, row, column);
    if (result.kind === 'invalid') return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const lineScore = result.lineScores.reduce((total, line) => total + line.score, 0);
    const maxMultiplier = result.lineScores.reduce((maximum, line) => Math.max(maximum, line.multiplier), 1);
    const placedPiece = session.game.pieces[slot];
    if (placedPiece) platformGameService.reportPlacedBlocks(getPiece(placedPiece).blocks.length);
    if (result.lineScores.length > 0) platformGameService.reportClearedLines(result.lineScores.length);
    showScore(result.pieceScore, lineScore, maxMultiplier);
    setSelectedSlot(null);
    if (result.kind === 'placed') {
      setSession(result.session);
      onSave(savePlaying(save, result.session));
      return;
    }
    platformGameService.reportFinishedGame(result.game.score);
    setGameOver(result.game);
    onSave(finishGame(save, result.game));
  }, [onSave, save, session, showScore]);

  const endDrag = useCallback((slot: number, point: DragPoint) => {
    const anchor = anchorFor(slot, point);
    setDrag(null);
    if (anchor?.valid) commitPlacement(slot, anchor.row, anchor.column);
  }, [anchorFor, commitPlacement]);

  const doUndo = useCallback(() => {
    if (gameOver || !canUndo(session)) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const previous = undo(session);
    setSession(previous);
    setSelectedSlot(null);
    onSave(savePlaying(save, previous));
  }, [gameOver, onSave, save, session]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (gameOver) onHome();
      else doUndo();
      return true;
    });
    return () => subscription.remove();
  }, [doUndo, gameOver, onHome]);

  const selectedPiece = selectedSlot === null ? null : session.game.pieces[selectedSlot] ?? null;
  const preview = useMemo(() => {
    if (!drag) return null;
    const id = session.game.pieces[drag.slot];
    if (!id) return null;
    return { row: drag.row, column: drag.column, blocks: getPiece(id).blocks, valid: drag.valid };
  }, [drag, session.game.pieces]);

  const placeSelectedAt = (row: number, column: number) => {
    if (selectedSlot !== null) commitPlacement(selectedSlot, row, column);
  };

  const shareResult = async () => {
    if (!gameOver) return;
    await Share.share({ message: t('shareText', { score: gameOver.score, blocks: gameOver.placedBlocks }) });
  };

  return (
    <View ref={rootRef} onLayout={measureLayouts} style={styles.root}>
      <View style={[styles.header, { width: boardSize }]}>
        <Text style={[styles.score, { color: theme.secondary }]}>
          {t('score')}: {session.game.score}{'\n'}{t('highScore')}: {session.game.highScore}
        </Text>
        <View style={styles.headerButtons}>
          {canUndo(session) && !gameOver ? (
            <IconButton icon={undoIcon} label={t('undo')} onPress={doUndo} theme={theme} />
          ) : null}
          <IconButton icon={homeIcon} label={t('home')} onPress={onHome} theme={theme} />
        </View>
      </View>

      <View ref={boardRef} onLayout={measureLayouts}>
        <BoardGrid
          board={gameOver?.board ?? session.game.board}
          size={boardSize}
          theme={theme}
          preview={preview}
          selectedPiece={selectedPiece}
          onCellPress={placeSelectedAt}
        />
        <Animated.Text
          pointerEvents="none"
          style={[
            styles.feedback,
            {
              color: theme.accent,
              opacity: feedbackAnimation,
              transform: [{ translateY: feedbackAnimation.interpolate({ inputRange: [0, 1], outputRange: [8, -12] }) }],
            },
          ]}
        >
          {feedback}
        </Animated.Text>
      </View>

      <View style={[styles.tray, { width: boardSize, backgroundColor: theme.primaryDark }]}>
        {session.game.pieces.map((id, slot) => id ? (
          <DraggablePiece
            key={`${slot}-${id}`}
            id={id}
            slot={slot}
            previewCellSize={previewCellSize}
            theme={theme}
            selected={selectedSlot === slot}
            onSelect={(nextSlot) => setSelectedSlot(selectedSlot === nextSlot ? null : nextSlot)}
            onDragStart={beginDrag}
            onDragMove={moveDrag}
            onDragEnd={endDrag}
          />
        ) : <View key={slot} style={styles.emptySlot} />)}
      </View>

      {drag && rootRect ? (() => {
        const id = session.game.pieces[drag.slot];
        if (!id) return null;
        const piece = getPiece(id);
        return (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: drag.point.pageX - rootRect.x - piece.columns * boardCellSize / 2,
              top: drag.point.pageY - rootRect.y - (piece.rows + 2) * boardCellSize,
            }}
          >
            <PieceShape id={id} cellSize={boardCellSize} theme={theme} ghost />
          </View>
        );
      })() : null}

      {gameOver ? (
        <View style={[styles.gameOverBackdrop, { backgroundColor: `${theme.ink}EE` }]}>
          <Text style={[styles.noMoves, { color: theme.secondary }]}>{t('noMoves')}</Text>
          <Text style={styles.result}>{t('result', { score: gameOver.score, blocks: gameOver.placedBlocks })}</Text>
          {gameOver.beatHighScore ? <Text style={[styles.newRecord, { color: theme.accent }]}>{t('newHighScore')}</Text> : null}
          <PixelButton label={t('playAgain')} onPress={onRestart} theme={theme} />
          <PixelButton label={t('share')} onPress={() => void shareResult()} theme={theme} />
          <PixelButton label={t('mainMenu')} onPress={onHome} theme={theme} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  header: { minHeight: 57, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  score: { fontFamily: GAME_FONT, fontSize: 24, lineHeight: 25, textTransform: 'uppercase' },
  headerButtons: { flexDirection: 'row' },
  tray: { minHeight: 92, flexDirection: 'row', alignItems: 'center', padding: 4 },
  emptySlot: { flex: 1, height: 86 },
  feedback: { position: 'absolute', alignSelf: 'center', top: '42%', fontFamily: GAME_FONT, fontSize: 47, textShadowColor: '#00000077', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 },
  gameOverBackdrop: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 20, alignItems: 'center', justifyContent: 'center', padding: 24 },
  noMoves: { fontFamily: GAME_FONT, fontSize: 43, lineHeight: 43, textAlign: 'center', textTransform: 'uppercase', marginBottom: 18 },
  result: { fontFamily: GAME_FONT, color: '#FFFFFF', fontSize: 34, lineHeight: 35, textAlign: 'center', textTransform: 'uppercase', marginBottom: 12 },
  newRecord: { fontFamily: GAME_FONT, fontSize: 37, lineHeight: 40, textTransform: 'uppercase', marginBottom: 12 },
});
