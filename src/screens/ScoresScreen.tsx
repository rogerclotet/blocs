import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BUTTON_FONT, GameButton, Logo, Panel, UI_FONT, UI_FONT_BOLD } from '../components/PixelUi';
import type { SaveData } from '../domain/types';
import type { Translator } from '../i18n/translations';
import type { Theme } from '../theme/themes';

export function ScoresScreen({ save, theme, t, onBack }: { save: SaveData; theme: Theme; t: Translator; onBack: () => void }) {
  const history = [...save.history].reverse().slice(0, 5);
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Logo theme={theme} compact />
        <Panel theme={theme} style={styles.scorePanel}>
          <Text style={[styles.eyebrow, { color: theme.textMuted }]}>{t('highScore')}</Text>
          <Text style={[styles.highScore, { color: theme.secondary }]}>{save.highScore}</Text>
          <Text style={[styles.blocks, { color: theme.textMuted }]}>{save.highScoreBlocks} {t('blocks')}</Text>
        </Panel>
        <Text style={[styles.heading, { color: theme.text }]}>{t('latestGames')}</Text>
        <Panel theme={theme} style={styles.historyPanel}>
          {history.length > 0 ? history.map((entry, index) => (
            <View
              key={`${entry.score}-${entry.blocks}-${index}`}
              style={[
                styles.historyRow,
                { borderBottomColor: index < history.length - 1 ? theme.surfaceRaised : 'transparent' },
              ]}
            >
              <Text style={[styles.historyScore, { color: theme.text }]}>{entry.score}</Text>
              <Text style={[styles.historyBlocks, { color: theme.textMuted }]}>{entry.blocks} {t('blocks')}</Text>
            </View>
          )) : <Text style={[styles.empty, { color: theme.textMuted }]}>{t('emptyHistory')}</Text>}
        </Panel>
        <GameButton label={t('back')} onPress={onBack} theme={theme} wide variant="quiet" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 26 },
  content: { width: '100%', maxWidth: 430, alignItems: 'center' },
  heading: { alignSelf: 'flex-start', fontFamily: BUTTON_FONT, fontSize: 24, lineHeight: 30, marginTop: 24, marginBottom: 10, marginLeft: 4 },
  scorePanel: { width: '100%', minHeight: 152, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: UI_FONT_BOLD, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
  highScore: { fontFamily: BUTTON_FONT, fontSize: 58, lineHeight: 66, textAlign: 'center' },
  blocks: { fontFamily: UI_FONT, fontSize: 14, textAlign: 'center' },
  historyPanel: { width: '100%', minHeight: 178, paddingVertical: 8 },
  historyRow: { width: '100%', minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, paddingHorizontal: 8 },
  historyScore: { fontFamily: UI_FONT_BOLD, fontSize: 21 },
  historyBlocks: { fontFamily: UI_FONT, fontSize: 14 },
  empty: { fontFamily: UI_FONT, fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 18, paddingVertical: 44 },
});
