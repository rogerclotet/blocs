import { StyleSheet, Text, View } from 'react-native';

import { GameButton, Logo, UI_FONT, UI_FONT_BOLD } from '../components/PixelUi';
import type { SaveData } from '../domain/types';
import type { Translator } from '../i18n/translations';
import type { Theme } from '../theme/themes';

export function MenuScreen({
  save,
  theme,
  t,
  onNewGame,
  onContinue,
  onScores,
  onSettings,
}: {
  save: SaveData;
  theme: Theme;
  t: Translator;
  onNewGame: () => void;
  onContinue: () => void;
  onScores: () => void;
  onSettings: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Logo theme={theme} />
        {save.highScore > 0 ? (
          <View style={[styles.scorePill, { backgroundColor: theme.surface, borderColor: theme.surfaceRaised }]}>
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>{t('highScore')}</Text>
            <Text style={[styles.scoreValue, { color: theme.secondary }]}>{save.highScore}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          {save.session ? (
            <GameButton label={t('continueGame')} onPress={onContinue} theme={theme} wide variant="primary" />
          ) : null}
          <GameButton label={t('newGame')} onPress={onNewGame} theme={theme} wide variant={save.session ? 'secondary' : 'primary'} />
          {save.highScore > 0 ? <GameButton label={t('scores')} onPress={onScores} theme={theme} wide /> : null}
          <GameButton label={t('settings')} onPress={onSettings} theme={theme} wide variant="quiet" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 28 },
  content: { width: '100%', maxWidth: 380, alignItems: 'center' },
  scorePill: { flexDirection: 'row', alignItems: 'baseline', borderWidth: 1, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9, marginTop: -18, marginBottom: 20 },
  scoreLabel: { fontFamily: UI_FONT, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginRight: 10 },
  scoreValue: { fontFamily: UI_FONT_BOLD, fontSize: 22 },
  actions: { width: '100%', alignItems: 'center' },
});
