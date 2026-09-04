import type { ReactNode } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import type { Theme } from '../theme/themes';

export const GAME_FONT = 'Gamer';

export function PixelBackdrop({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <View style={[styles.backdrop, { backgroundColor: theme.background }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 14 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.backdropStripe,
              {
                backgroundColor: theme.primaryDark,
                left: `${index * 10 - 22}%`,
                opacity: index % 2 === 0 ? 0.12 : 0.07,
              },
            ]}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

export function Logo({ theme, compact = false }: { theme: Theme; compact?: boolean }) {
  return (
    <View style={[styles.logoWrap, compact && styles.logoWrapCompact]}>
      <View style={[styles.logoShadow, { backgroundColor: theme.primaryDark }]} />
      <View style={[styles.logoTile, { backgroundColor: theme.primary }]}>
        <View style={[styles.logoHighlightTop, { backgroundColor: theme.secondaryLight }]} />
        <View style={[styles.logoHighlightLeft, { backgroundColor: theme.secondaryLight }]} />
        <Text style={[styles.logoText, compact && styles.logoTextCompact, { color: theme.secondary }]}>Blocs!</Text>
      </View>
    </View>
  );
}

export function PixelButton({
  label,
  onPress,
  theme,
  disabled = false,
  wide = false,
}: {
  label: string;
  onPress: () => void;
  theme: Theme;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonShadow,
        wide && styles.buttonWide,
        { backgroundColor: theme.primaryDark, opacity: disabled ? 0.42 : 1 },
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={[styles.buttonFace, { backgroundColor: theme.secondary }]}>
        <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.buttonText, { color: theme.primaryDark }]}>
          {label}
        </Text>
      </View>
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
  icon: ImageSourcePropType;
  label: string;
  onPress: () => void;
  theme: Theme;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconShadow,
        { backgroundColor: theme.primaryDark, opacity: disabled ? 0.3 : 1 },
        pressed && styles.iconPressed,
      ]}
    >
      <View style={[styles.iconFace, { backgroundColor: theme.secondary }]}>
        <Image source={icon} resizeMode="contain" style={[styles.icon, { tintColor: theme.primaryDark }]} />
      </View>
    </Pressable>
  );
}

export function Panel({ theme, children, style }: { theme: Theme; children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.panelShadow, { backgroundColor: theme.primaryDark }, style]}>
      <View style={[styles.panel, { backgroundColor: theme.primary }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, overflow: 'hidden' },
  backdropStripe: { position: 'absolute', top: '-20%', width: '4%', height: '150%', transform: [{ rotate: '18deg' }] },
  logoWrap: { width: 278, height: 190, marginBottom: 26 },
  logoWrapCompact: { width: 190, height: 96, marginBottom: 12 },
  logoShadow: { position: 'absolute', left: 12, top: 12, right: 0, bottom: 0 },
  logoTile: { position: 'absolute', left: 0, top: 0, right: 12, bottom: 12, alignItems: 'center', justifyContent: 'center' },
  logoHighlightTop: { position: 'absolute', left: 0, top: 0, right: 0, height: 10, opacity: 0.65 },
  logoHighlightLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, opacity: 0.65 },
  logoText: { fontFamily: GAME_FONT, fontSize: 88, lineHeight: 94, textShadowColor: 'rgba(0,0,0,0.22)', textShadowOffset: { width: 3, height: 4 }, textShadowRadius: 0 },
  logoTextCompact: { fontSize: 58, lineHeight: 63 },
  buttonShadow: { width: 220, minHeight: 61, paddingRight: 5, paddingBottom: 6, marginVertical: 6 },
  buttonWide: { width: 260 },
  buttonFace: { flex: 1, minHeight: 55, paddingHorizontal: 16, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: GAME_FONT, fontSize: 31, lineHeight: 34, textAlign: 'center', textTransform: 'uppercase' },
  buttonPressed: { transform: [{ translateX: 3 }, { translateY: 4 }] },
  iconShadow: { width: 47, height: 47, paddingRight: 4, paddingBottom: 5, marginLeft: 8 },
  iconFace: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 25, height: 25 },
  iconPressed: { transform: [{ translateX: 2 }, { translateY: 3 }] },
  panelShadow: { paddingRight: 7, paddingBottom: 8 },
  panel: { flex: 1, padding: 18 },
});
