import { StyleSheet, Text, View } from 'react-native';

import { GAME_FONT, Logo, PixelButton, Panel } from '../components/PixelUi';
import type { SaveData } from '../domain/types';
import type { Translator } from '../i18n/translations';
import type { Theme } from '../theme/themes';

export function ScoresScreen({ save, theme, t, onBack }: { save: SaveData; theme: Theme; t: Translator; onBack: () => void }) {
  const history = [...save.history].reverse().slice(0, 5);
  return (
    <View style={styles.container}>
      <Logo theme={theme} compact />
      <Text style={[styles.heading, { color: theme.secondary }]}>{t('highScore')}</Text>
      <Panel theme={theme} style={styles.scorePanel}>
        <Text style={[styles.highScore, { color: theme.secondary }]}>{save.highScore}</Text>
        <Text style={styles.blocks}>({save.highScoreBlocks} {t('blocks')})</Text>
      </Panel>
      <Text style={[styles.heading, { color: theme.secondary }]}>{t('latestGames')}</Text>
      <Panel theme={theme} style={styles.historyPanel}>
        {history.length > 0 ? history.map((entry, index) => (
          <View key={`${entry.score}-${entry.blocks}-${index}`} style={styles.historyRow}>
            <Text style={[styles.historyScore, { color: theme.secondary }]}>{entry.score}</Text>
            <Text style={styles.historyBlocks}>({entry.blocks} {t('blocks')})</Text>
          </View>
        )) : <Text style={styles.empty}>{t('emptyHistory')}</Text>}
      </Panel>
      <PixelButton label={t('back')} onPress={onBack} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 18, justifyContent: 'space-around' },
  heading: { fontFamily: GAME_FONT, fontSize: 34, lineHeight: 38, textTransform: 'uppercase' },
  scorePanel: { width: '82%', maxWidth: 420, minHeight: 105 },
  highScore: { fontFamily: GAME_FONT, fontSize: 54, lineHeight: 58, textAlign: 'center' },
  blocks: { fontFamily: GAME_FONT, color: '#FFFFFF', fontSize: 24, textAlign: 'center' },
  historyPanel: { width: '82%', maxWidth: 420, minHeight: 190 },
  historyRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginVertical: 3 },
  historyScore: { fontFamily: GAME_FONT, fontSize: 33, marginRight: 12 },
  historyBlocks: { fontFamily: GAME_FONT, color: '#FFFFFF', fontSize: 22 },
  empty: { fontFamily: GAME_FONT, color: '#FFFFFF', fontSize: 23, lineHeight: 27, textAlign: 'center', marginTop: 38 },
});
