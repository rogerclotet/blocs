import { StyleSheet, View } from 'react-native';

import { Logo, PixelButton } from '../components/PixelUi';
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
      <Logo theme={theme} />
      <PixelButton label={t('newGame')} onPress={onNewGame} theme={theme} wide />
      {save.session ? <PixelButton label={t('continueGame')} onPress={onContinue} theme={theme} wide /> : null}
      {save.highScore > 0 ? <PixelButton label={t('scores')} onPress={onScores} theme={theme} wide /> : null}
      <PixelButton label={t('settings')} onPress={onSettings} theme={theme} wide />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },
});
