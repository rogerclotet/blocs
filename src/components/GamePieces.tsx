import { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { getPiece } from '../domain/pieces';
import type { Board, LineScore, PieceColor, PieceId, Position } from '../domain/types';
import { blockColors, type Theme } from '../theme/themes';

export function GlossyBlock({ size, color, ghost = false }: { size: number; color: PieceColor; ghost?: boolean }) {
  const radius = Math.max(3, size * 0.24);
  const colors = blockColors[color];
  return (
    <View
      style={[
        styles.block,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.dark,
          opacity: ghost ? 0.64 : 1,
          shadowColor: colors.face,
        },
      ]}
    >
      <View style={[styles.blockFace, { backgroundColor: colors.face, borderRadius: radius }]} />
      <View style={[styles.blockShine, { borderRadius: radius }]} />
    </View>
  );
}

export function PieceShape({
  id,
  cellSize,
  color,
  ghost = false,
}: {
  id: PieceId;
  cellSize: number;
  color: PieceColor;
  ghost?: boolean;
}) {
  const piece = getPiece(id);
  const occupied = (row: number, column: number) =>
    piece.blocks.some((block) => block.row === row && block.column === column);
  return (
    <View style={{ width: piece.columns * cellSize, height: piece.rows * cellSize }}>
      {Array.from({ length: piece.rows }, (_, row) =>
        Array.from({ length: piece.columns }, (_, column) =>
          occupied(row, column) ? (
            <View
              key={`${row}-${column}`}
              style={[
                styles.shapeCell,
                {
                  left: column * cellSize,
                  top: row * cellSize,
                  width: cellSize,
                  height: cellSize,
                },
              ]}
            >
              <GlossyBlock size={cellSize - 2} color={color} ghost={ghost} />
            </View>
          ) : null,
        ),
      )}
    </View>
  );
}

export type DragPoint = Readonly<{ pageX: number; pageY: number }>;

export type ClearEffect = Readonly<{
  id: number;
  lines: ReadonlyArray<LineScore>;
}>;

export function DraggablePiece({
  id,
  slot,
  previewCellSize,
  color,
  theme,
  selected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  id: PieceId;
  slot: number;
  previewCellSize: number;
  color: PieceColor;
  theme: Theme;
  selected: boolean;
  onSelect: (slot: number) => void;
  onDragStart: (slot: number, point: DragPoint) => void;
  onDragMove: (slot: number, point: DragPoint) => void;
  onDragEnd: (slot: number, point: DragPoint) => void;
}) {
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => onDragStart(slot, event.nativeEvent),
    onPanResponderMove: (event) => onDragMove(slot, event.nativeEvent),
    onPanResponderRelease: (event, gesture) => {
      onDragEnd(slot, event.nativeEvent);
      if (Math.abs(gesture.dx) + Math.abs(gesture.dy) <= 5) onSelect(slot);
    },
    onPanResponderTerminate: (event) => onDragEnd(slot, event.nativeEvent),
  }), [onDragEnd, onDragMove, onDragStart, onSelect, slot]);

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Piece ${slot + 1}`}
      accessibilityHint="Drag it to the board, or select it and tap a board cell"
      onAccessibilityTap={() => onSelect(slot)}
      style={[
        styles.pieceSlot,
        {
          borderColor: selected ? theme.accent : 'transparent',
          backgroundColor: selected ? theme.surfaceRaised : 'transparent',
        },
      ]}
      {...responder.panHandlers}
    >
      <PieceShape id={id} cellSize={previewCellSize} color={color} />
    </View>
  );
}

function LineFlash({ line, cellSize, theme, order }: { line: LineScore; cellSize: number; theme: Theme; order: number }) {
  const flash = useRef(new Animated.Value(0)).current;
  const isRow = line.kind === 'row';

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(order * 55),
      Animated.timing(flash, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [flash, order]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.lineFlash,
        {
          left: isRow ? 0 : line.index * cellSize,
          top: isRow ? line.index * cellSize : 0,
          width: isRow ? cellSize * 10 : cellSize,
          height: isRow ? cellSize : cellSize * 10,
          backgroundColor: theme.accent,
          opacity: flash,
        },
      ]}
    />
  );
}

export function BoardGrid({
  board,
  size,
  theme,
  preview,
  clearEffect,
  selectedPiece,
  onCellPress,
}: {
  board: Board;
  size: number;
  theme: Theme;
  preview: Readonly<{
    row: number;
    column: number;
    blocks: ReadonlyArray<Position>;
    valid: boolean;
    color: PieceColor;
  }> | null;
  clearEffect: ClearEffect | null;
  selectedPiece: PieceId | null;
  onCellPress: (row: number, column: number) => void;
}) {
  const cellSize = size / 10;
  const isPreview = (row: number, column: number) => preview?.blocks.some(
    (block) => preview.row + block.row === row && preview.column + block.column === column,
  ) ?? false;

  return (
    <View
      style={[
        styles.board,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 10 }, (_, column) => {
          const color = board[row]?.[column] ?? null;
          const filled = color !== null;
          const previewed = isPreview(row, column);
          return (
            <Pressable
              key={`${row}-${column}`}
              accessibilityRole={selectedPiece ? 'button' : undefined}
              accessibilityLabel={selectedPiece ? `Row ${row + 1}, column ${column + 1}` : undefined}
              onPress={selectedPiece ? () => onCellPress(row, column) : undefined}
              style={{
                position: 'absolute',
                left: column * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
                padding: Math.max(1.2, cellSize * 0.055),
              }}
            >
              <View style={[styles.cell, { backgroundColor: theme.cell, borderRadius: Math.max(3, cellSize * 0.19) }]}>
                {filled ? (
                  <GlossyBlock
                    size={cellSize - Math.max(2.4, cellSize * 0.11)}
                    color={color}
                  />
                ) : null}
                {previewed && !filled ? (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      styles.preview,
                      { backgroundColor: preview?.valid ? blockColors[preview.color].face : '#F06464' },
                    ]}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        }),
      )}
      {clearEffect?.lines.map((line, order) => (
        <LineFlash
          key={`${clearEffect.id}-${line.kind}-${line.index}`}
          line={line}
          cellSize={cellSize}
          theme={theme}
          order={order}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { overflow: 'hidden', shadowOpacity: 0.24, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  blockFace: { position: 'absolute', left: 0, top: 0, right: 0, bottom: '9%' },
  blockShine: { position: 'absolute', left: '15%', top: '12%', width: '48%', height: '18%', backgroundColor: '#FFFFFF', opacity: 0.25 },
  shapeCell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pieceSlot: { width: '100%', maxWidth: 86, aspectRatio: 1, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  board: { position: 'relative', overflow: 'visible' },
  cell: { flex: 1, overflow: 'visible' },
  preview: { borderRadius: 6, opacity: 0.62 },
  lineFlash: { position: 'absolute', zIndex: 3, borderRadius: 9 },
});
