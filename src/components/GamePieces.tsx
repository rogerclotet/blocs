import { useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { getPiece } from '../domain/pieces';
import type { Board, PieceId, Position } from '../domain/types';
import type { Theme } from '../theme/themes';

export function PixelBlock({ size, theme, ghost = false }: { size: number; theme: Theme; ghost?: boolean }) {
  return (
    <View style={[styles.block, { width: size, height: size, backgroundColor: theme.primaryDark, opacity: ghost ? 0.58 : 1 }]}>
      <View style={[styles.blockFace, { backgroundColor: theme.primary }]} />
      <View style={[styles.blockTop, { backgroundColor: theme.secondaryLight }]} />
      <View style={[styles.blockLeft, { backgroundColor: theme.secondaryLight }]} />
    </View>
  );
}

export function PieceShape({
  id,
  cellSize,
  theme,
  ghost = false,
}: {
  id: PieceId;
  cellSize: number;
  theme: Theme;
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
            <View key={`${row}-${column}`} style={{ position: 'absolute', left: column * cellSize, top: row * cellSize }}>
              <PixelBlock size={cellSize - 1} theme={theme} ghost={ghost} />
            </View>
          ) : null,
        ),
      )}
    </View>
  );
}

export type DragPoint = Readonly<{ pageX: number; pageY: number }>;

export function DraggablePiece({
  id,
  slot,
  previewCellSize,
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
      style={[styles.pieceSlot, { borderColor: selected ? theme.accent : 'transparent' }]}
      {...responder.panHandlers}
    >
      <PieceShape id={id} cellSize={previewCellSize} theme={theme} />
    </View>
  );
}

export function BoardGrid({
  board,
  size,
  theme,
  preview,
  selectedPiece,
  onCellPress,
}: {
  board: Board;
  size: number;
  theme: Theme;
  preview: Readonly<{ row: number; column: number; blocks: ReadonlyArray<Position>; valid: boolean }> | null;
  selectedPiece: PieceId | null;
  onCellPress: (row: number, column: number) => void;
}) {
  const cellSize = size / 10;
  const isPreview = (row: number, column: number) => preview?.blocks.some(
    (block) => preview.row + block.row === row && preview.column + block.column === column,
  ) ?? false;

  return (
    <View style={[styles.board, { width: size, height: size, backgroundColor: theme.secondary, borderColor: theme.primaryDark }]}>
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 10 }, (_, column) => {
          const filled = board[row]?.[column] === 1;
          const previewed = isPreview(row, column);
          return (
            <Pressable
              key={`${row}-${column}`}
              accessibilityRole={selectedPiece ? 'button' : undefined}
              accessibilityLabel={selectedPiece ? `Row ${row + 1}, column ${column + 1}` : undefined}
              onPress={selectedPiece ? () => onCellPress(row, column) : undefined}
              style={{ position: 'absolute', left: column * cellSize, top: row * cellSize, width: cellSize, height: cellSize, padding: 1 }}
            >
              <View style={[styles.cell, { backgroundColor: theme.secondaryLight }]}>
                {filled ? <PixelBlock size={cellSize - 2} theme={theme} /> : null}
                {previewed && !filled ? (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: preview?.valid ? theme.primary : '#C34444', opacity: 0.55 }]} />
                ) : null}
              </View>
            </Pressable>
          );
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { overflow: 'hidden' },
  blockFace: { position: 'absolute', top: 2, left: 2, right: 3, bottom: 3 },
  blockTop: { position: 'absolute', left: 2, right: 3, top: 2, height: 2, opacity: 0.42 },
  blockLeft: { position: 'absolute', left: 2, top: 2, bottom: 3, width: 2, opacity: 0.35 },
  pieceSlot: { flex: 1, height: 90, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  board: { borderWidth: 4, position: 'relative', overflow: 'hidden' },
  cell: { flex: 1, overflow: 'hidden' },
});
