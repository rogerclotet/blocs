import type { ReactNode } from 'react';
import House from 'lucide-react-native/icons/house';
import Undo2 from 'lucide-react-native/icons/undo-2';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import type { Theme } from '../theme/themes';

export const DISPLAY_FONT = 'Fredoka_700Bold';
export const BUTTON_FONT = 'Fredoka_600SemiBold';
export const UI_FONT = 'Manrope_600SemiBold';
export const UI_FONT_BOLD = 'Manrope_700Bold';

export type GameIcon = 'home' | 'undo';

export function GameBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.backdrop}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.velvetPool, styles.velvetPoolTop]} />
        <View style={[styles.velvetPool, styles.velvetPoolMiddle]} />
        <View style={[styles.velvetPool, styles.velvetPoolBottom]} />
        <View style={styles.velvetVeil} />
      </View>
      {children}
    </View>
  );
}

function LogoBlock({ theme, style }: { theme: Theme; style?: ViewStyle }) {
  return (
    <View style={[styles.logoBlock, { backgroundColor: theme.primary, shadowColor: theme.primary }, style]}>
      <View style={styles.logoBlockShine} />
    </View>
  );
}

export function Logo({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  return (
    <View style={[styles.logoWrap, compact && styles.logoWrapCompact]} accessibilityRole="header">
      <View style={[styles.logoMark, compact && styles.logoMarkCompact]}>
        <LogoBlock theme={theme} />
        <LogoBlock theme={theme} style={styles.logoBlockOffset} />
        <LogoBlock theme={theme} style={styles.logoBlockCorner} />
      </View>
      <Text style={[styles.logoText, compact && styles.logoTextCompact, { color: theme.text }]}>Blocs<Text style={{ color: theme.secondary }}>!</Text></Text>
    </View>
  );
}

export function GameButton({
  label,
  onPress,
  theme,
  disabled = false,
  wide = false,
  variant = 'secondary',
}: {
  label: string;
  onPress: () => void;
  theme: Theme;
  disabled?: boolean;
  wide?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet';
}) {
  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary ? theme.secondary : variant === 'quiet' ? 'transparent' : theme.surfaceRaised;
  const textColor = isPrimary ? theme.ink : variant === 'quiet' ? theme.textMuted : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        wide && styles.buttonWide,
        {
          backgroundColor,
          borderColor: isPrimary ? theme.secondaryLight : theme.cell,
          opacity: disabled ? 0.4 : 1,
          shadowColor: isPrimary ? theme.secondary : '#000000',
        },
        pressed && styles.buttonPressed,
      ]}
    >
      {isPrimary ? <View pointerEvents="none" style={styles.buttonShine} /> : null}
      <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.buttonText, { color: textColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  theme,
  disabled = false,
}: {
  icon: GameIcon;
  label: string;
  onPress: () => void;
  theme: Theme;
  disabled?: boolean;
}) {
  const Icon = icon === 'undo' ? Undo2 : House;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: theme.surfaceRaised,
          borderColor: theme.cell,
          opacity: disabled ? 0.3 : 1,
        },
        pressed && styles.iconPressed,
      ]}
    >
      <View style={styles.iconGraphic}>
        <Icon color={theme.text} size={24} strokeWidth={2.35} />
      </View>
    </Pressable>
  );
}

export function Panel({ theme, children, style }: { theme: Theme; children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceRaised,
          shadowColor: theme.ink,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, overflow: 'hidden', backgroundColor: '#10091A' },
  velvetPool: { position: 'absolute', borderRadius: 999 },
  velvetPoolTop: { width: 520, height: 520, top: -300, right: -210, backgroundColor: '#3B1F5A', opacity: 0.68 },
  velvetPoolMiddle: { width: 390, height: 560, top: '26%', left: -300, backgroundColor: '#29143F', opacity: 0.72, transform: [{ rotate: '-18deg' }] },
  velvetPoolBottom: { width: 500, height: 380, right: -330, bottom: -160, backgroundColor: '#241238', opacity: 0.78, transform: [{ rotate: '24deg' }] },
  velvetVeil: { position: 'absolute', width: '140%', height: 150, left: '-20%', top: '44%', backgroundColor: '#170B27', opacity: 0.5, transform: [{ rotate: '-11deg' }] },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 38 },
  logoWrapCompact: { flexDirection: 'row', marginBottom: 18 },
  logoMark: { width: 72, height: 42, marginBottom: 13 },
  logoMarkCompact: { width: 47, height: 32, marginBottom: 0, marginRight: 10, transform: [{ scale: 0.72 }] },
  logoBlock: {
    position: 'absolute',
    width: 28,
    height: 28,
    left: 8,
    top: 7,
    borderRadius: 9,
    shadowOpacity: 0.35,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    overflow: 'hidden',
  },
  logoBlockOffset: { left: 39, top: 7 },
  logoBlockCorner: { left: 39, top: -24 },
  logoBlockShine: { position: 'absolute', top: 4, left: 5, width: 13, height: 6, borderRadius: 5, backgroundColor: '#FFFFFF', opacity: 0.3 },
  logoText: { fontFamily: DISPLAY_FONT, fontSize: 76, lineHeight: 82, letterSpacing: -3.2, textShadowColor: '#0000003D', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 12 },
  logoTextCompact: { fontSize: 43, lineHeight: 49, letterSpacing: -1.8 },
  button: {
    width: 224,
    minHeight: 58,
    marginVertical: 6,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
    overflow: 'hidden',
  },
  buttonWide: { width: '100%' },
  buttonShine: { position: 'absolute', left: 20, right: 20, top: 4, height: 10, borderRadius: 8, backgroundColor: '#FFFFFF', opacity: 0.16 },
  buttonText: { fontFamily: BUTTON_FONT, fontSize: 20, lineHeight: 25, textAlign: 'center' },
  buttonPressed: { transform: [{ scale: 0.975 }, { translateY: 2 }], shadowOpacity: 0.08 },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  iconGraphic: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  iconPressed: { transform: [{ scale: 0.92 }] },
  panel: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
});
