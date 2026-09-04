import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  LayoutAnimation,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { BoardGrid, DraggablePiece, PieceShape, type ClearEffect, type DragPoint } from '../components/GamePieces';
import { BUTTON_FONT, GameButton, IconButton, UI_FONT, UI_FONT_BOLD } from '../components/PixelUi';
import { scoreFeedbackAnchor, type BoardAnchor } from '../domain/feedback';
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
type ScoreFeedback = Readonly<{ text: string; anchor: BoardAnchor }>;

const FEEDBACK_WIDTH = 144;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}

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
  const [feedback, setFeedback] = useState<ScoreFeedback | null>(null);
  const [clearEffect, setClearEffect] = useState<ClearEffect | null>(null);
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const dragLiftAnimation = useRef(new Animated.Value(0)).current;
  const scorePulseAnimation = useRef(new Animated.Value(0)).current;
  const gameOverAnimation = useRef(new Animated.Value(0)).current;
  const clearEffectId = useRef(0);
  const boardRef = useRef<View>(null);
  const rootRef = useRef<View>(null);
  const { width, height } = useWindowDimensions();
  const boardSize = Math.max(180, Math.min(width - 32, height - 244, 520));
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
    const offeredPiece = session.game.pieces[slot];
    if (!offeredPiece || !boardRect) return null;
    const piece = getPiece(offeredPiece.id);
    const cellSize = boardRect.width / 10;
    const pieceLeft = point.pageX - piece.columns * cellSize / 2;
    const pieceTop = point.pageY - (piece.rows + 2) * cellSize;
    const row = Math.round((pieceTop - boardRect.y) / cellSize);
    const column = Math.round((pieceLeft - boardRect.x) / cellSize);
    return { row, column, valid: isPiecePlaceable(session.game.board, piece, row, column) };
  }, [boardRect, session.game.board, session.game.pieces]);

  const beginDrag = useCallback((slot: number, point: DragPoint) => {
    const anchor = anchorFor(slot, point);
    if (!anchor) return;
    setDrag({ slot, point, ...anchor });
    dragLiftAnimation.stopAnimation();
    dragLiftAnimation.setValue(0);
    Animated.spring(dragLiftAnimation, {
      toValue: 1,
      speed: 24,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }, [anchorFor, dragLiftAnimation]);

  const moveDrag = useCallback((slot: number, point: DragPoint) => {
    const anchor = anchorFor(slot, point);
    if (anchor) setDrag({ slot, point, ...anchor });
  }, [anchorFor]);

  const showScore = useCallback(({
    pieceScore,
    lineScore,
    anchor,
  }: {
    pieceScore: number;
    lineScore: number;
    anchor: BoardAnchor;
  }) => {
    setFeedback({ text: `+${pieceScore + lineScore}`, anchor });
    feedbackAnimation.stopAnimation();
    feedbackAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 170,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.delay(520),
      Animated.timing(feedbackAnimation, {
        toValue: 2,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setFeedback(null);
    });

    scorePulseAnimation.stopAnimation();
    scorePulseAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(scorePulseAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.spring(scorePulseAnimation, { toValue: 0, speed: 20, bounciness: 8, useNativeDriver: true }),
    ]).start();
  }, [feedbackAnimation, scorePulseAnimation]);

  const commitPlacement = useCallback((slot: number, row: number, column: number) => {
    const offeredPiece = session.game.pieces[slot];
    if (!offeredPiece) return;
    const placedPiece = getPiece(offeredPiece.id);
    const result = placePiece(session, slot, row, column);
    if (result.kind === 'invalid') return;
    const lineScore = result.lineScores.reduce((total, line) => total + line.score, 0);
    platformGameService.reportPlacedBlocks(placedPiece.blocks.length);
    if (result.lineScores.length > 0) platformGameService.reportClearedLines(result.lineScores.length);
    const feedbackAnchor = scoreFeedbackAnchor({ row, column, piece: placedPiece, lines: result.lineScores });
    showScore({ pieceScore: result.pieceScore, lineScore, anchor: feedbackAnchor });
    if (result.lineScores.length > 0) {
      clearEffectId.current += 1;
      setClearEffect({ id: clearEffectId.current, lines: result.lineScores });
    } else {
      setClearEffect(null);
    }
    setSelectedSlot(null);
    if (result.kind === 'placed') {
      setSession(result.session);
      onSave(savePlaying(save, result.session));
      return;
    }
    platformGameService.reportFinishedGame(result.game.score);
    gameOverAnimation.setValue(0);
    setGameOver(result.game);
    Animated.spring(gameOverAnimation, {
      toValue: 1,
      speed: 16,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
    onSave(finishGame(save, result.game));
  }, [gameOverAnimation, onSave, save, session, showScore]);

  const endDrag = useCallback((slot: number, point: DragPoint) => {
    const anchor = anchorFor(slot, point);
    if (anchor?.valid) {
      setDrag(null);
      commitPlacement(slot, anchor.row, anchor.column);
      return;
    }
    Animated.timing(dragLiftAnimation, {
      toValue: 0,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setDrag((current) => current?.slot === slot ? null : current);
    });
  }, [anchorFor, commitPlacement, dragLiftAnimation]);

  const doUndo = useCallback(() => {
    if (gameOver || !canUndo(session)) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const previous = undo(session);
    setSession(previous);
    setClearEffect(null);
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

  const selectedPiece = selectedSlot === null ? null : session.game.pieces[selectedSlot]?.id ?? null;
  const feedbackPosition = feedback ? {
    left: clamp(feedback.anchor.column * boardCellSize - FEEDBACK_WIDTH / 2, 4, boardSize - FEEDBACK_WIDTH - 4),
    top: clamp(feedback.anchor.row * boardCellSize - 25, 4, boardSize - 54),
  } : null;
  const preview = useMemo(() => {
    if (!drag) return null;
    const offeredPiece = session.game.pieces[drag.slot];
    if (!offeredPiece) return null;
    return {
      row: drag.row,
      column: drag.column,
      blocks: getPiece(offeredPiece.id).blocks,
      valid: drag.valid,
      color: offeredPiece.color,
    };
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
        <Animated.View
          style={[
            styles.scoreCard,
            { backgroundColor: theme.surface, borderColor: theme.surfaceRaised },
            {
              transform: [{
                scale: scorePulseAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }),
              }],
            },
          ]}
        >
          <View style={styles.scoreStat}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>{t('score')}</Text>
            <Text style={[styles.scoreValue, { color: theme.text }]}>{session.game.score}</Text>
          </View>
          <View style={[styles.scoreDivider, { backgroundColor: theme.surfaceRaised }]} />
          <View style={styles.scoreStat}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>{t('highScore')}</Text>
            <Text style={[styles.scoreValue, { color: theme.secondary }]}>{session.game.highScore}</Text>
          </View>
        </Animated.View>
        <View style={styles.headerButtons}>
          {canUndo(session) && !gameOver ? (
            <IconButton icon="undo" label={t('undo')} onPress={doUndo} theme={theme} />
          ) : null}
          <IconButton icon="home" label={t('home')} onPress={onHome} theme={theme} />
        </View>
      </View>

      <View ref={boardRef} onLayout={measureLayouts}>
        <BoardGrid
          board={gameOver?.board ?? session.game.board}
          size={boardSize}
          theme={theme}
          preview={preview}
          clearEffect={clearEffect}
          selectedPiece={selectedPiece}
          onCellPress={placeSelectedAt}
        />
        {feedback && feedbackPosition ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.feedback,
              feedbackPosition,
              {
                opacity: feedbackAnimation.interpolate({
                  inputRange: [0, 0.15, 1, 1.7, 2],
                  outputRange: [0, 1, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: feedbackAnimation.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [9, -7, -36],
                    }),
                  },
                  {
                    scale: feedbackAnimation.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0.7, 1, 0.94],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.feedbackText, { color: theme.accent }]}>{feedback.text}</Text>
          </Animated.View>
        ) : null}
      </View>

      <View
        style={[
          styles.tray,
          {
            width: boardSize,
            backgroundColor: theme.surface,
            borderColor: theme.surfaceRaised,
            shadowColor: theme.ink,
          },
        ]}
      >
        {session.game.pieces.map((piece, slot) => (
          <View key={slot} style={styles.traySlot}>
            {piece ? (
              <DraggablePiece
                id={piece.id}
                color={piece.color}
                slot={slot}
                previewCellSize={previewCellSize}
                theme={theme}
                selected={selectedSlot === slot}
                onSelect={(nextSlot) => setSelectedSlot(selectedSlot === nextSlot ? null : nextSlot)}
                onDragStart={beginDrag}
                onDragMove={moveDrag}
                onDragEnd={endDrag}
              />
            ) : null}
          </View>
        ))}
      </View>

      {drag && rootRect ? (() => {
        const offeredPiece = session.game.pieces[drag.slot];
        if (!offeredPiece) return null;
        const piece = getPiece(offeredPiece.id);
        return (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dragPiece,
              {
                left: drag.point.pageX - rootRect.x - piece.columns * boardCellSize / 2,
                top: drag.point.pageY - rootRect.y - (piece.rows + 2) * boardCellSize,
                opacity: dragLiftAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
                transform: [
                  {
                    translateY: dragLiftAnimation.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
                  },
                  {
                    scale: dragLiftAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }),
                  },
                ],
              },
            ]}
          >
            <PieceShape id={offeredPiece.id} cellSize={boardCellSize} color={offeredPiece.color} ghost />
          </Animated.View>
        );
      })() : null}

      {gameOver ? (
        <Animated.View
          style={[
            styles.gameOverBackdrop,
            {
              backgroundColor: `${theme.ink}F0`,
              opacity: gameOverAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.gameOverCard,
              { backgroundColor: theme.surface, borderColor: theme.surfaceRaised },
              {
                transform: [
                  {
                    translateY: gameOverAnimation.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
                  },
                  {
                    scale: gameOverAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.noMoves, { color: theme.secondary }]}>{t('noMoves')}</Text>
            <Text style={[styles.result, { color: theme.text }]}>{t('result', { score: gameOver.score, blocks: gameOver.placedBlocks })}</Text>
            {gameOver.beatHighScore ? <Text style={[styles.newRecord, { color: theme.accent }]}>{t('newHighScore')}</Text> : null}
            <GameButton label={t('playAgain')} onPress={onRestart} theme={theme} wide variant="primary" />
            <GameButton label={t('share')} onPress={() => void shareResult()} theme={theme} wide />
            <GameButton label={t('mainMenu')} onPress={onHome} theme={theme} wide variant="quiet" />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  header: { minHeight: 58, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreCard: { height: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 17, paddingHorizontal: 12 },
  scoreStat: { minWidth: 54 },
  scoreLabel: { fontFamily: UI_FONT_BOLD, fontSize: 9, lineHeight: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  scoreValue: { fontFamily: UI_FONT_BOLD, fontSize: 20, lineHeight: 24 },
  scoreDivider: { width: 1, height: 28, marginHorizontal: 11 },
  headerButtons: { flexDirection: 'row' },
  tray: { minHeight: 96, flexDirection: 'row', alignItems: 'center', padding: 6, borderWidth: 1, borderRadius: 24, shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  traySlot: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  feedback: { position: 'absolute', zIndex: 8, width: FEEDBACK_WIDTH, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  feedbackText: { fontFamily: BUTTON_FONT, fontSize: 25, lineHeight: 30, textAlign: 'center', textShadowColor: '#00000066', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8 },
  dragPiece: { position: 'absolute', zIndex: 12 },
  gameOverBackdrop: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 20, alignItems: 'center', justifyContent: 'center', padding: 24 },
  gameOverCard: { width: '100%', maxWidth: 390, alignItems: 'center', borderWidth: 1, borderRadius: 30, paddingHorizontal: 22, paddingVertical: 26 },
  noMoves: { fontFamily: BUTTON_FONT, fontSize: 31, lineHeight: 37, textAlign: 'center', marginBottom: 12 },
  result: { fontFamily: UI_FONT, fontSize: 19, lineHeight: 28, textAlign: 'center', marginBottom: 10 },
  newRecord: { fontFamily: UI_FONT_BOLD, fontSize: 16, lineHeight: 22, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
});
