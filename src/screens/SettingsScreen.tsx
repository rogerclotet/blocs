import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GAME_FONT, Logo, PixelButton, Panel } from '../components/PixelUi';
import type { Translator, Language } from '../i18n/translations';
import type { Settings } from '../storage/persistence';
import type { Theme, ThemeName } from '../theme/themes';

function Choice({ label, active, theme, onPress }: { label: string; active: boolean; theme: Theme; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={onPress} style={styles.choice}>
      <View style={[styles.swatch, { backgroundColor: active ? theme.accent : theme.primaryDark }]} />
      <Text style={[styles.choiceText, { color: active ? theme.accent : '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

export function SettingsScreen({
  settings,
  theme,
  t,
  onChange,
  onBack,
}: {
  settings: Settings;
  theme: Theme;
  t: Translator;
  onChange: (settings: Settings) => void;
  onBack: () => void;
}) {
  const setTheme = (name: ThemeName) => onChange({ ...settings, theme: name });
  const setLanguage = (language: Language) => onChange({ ...settings, language });
  return (
    <View style={styles.container}>
      <Logo theme={theme} compact />
      <Panel theme={theme} style={styles.panel}>
        <Text style={[styles.heading, { color: theme.secondary }]}>{t('theme')}</Text>
        <Choice label={t('purple')} active={settings.theme === 'purple'} theme={theme} onPress={() => setTheme('purple')} />
        <Choice label={t('blueYellow')} active={settings.theme === 'blueYellow'} theme={theme} onPress={() => setTheme('blueYellow')} />
        <Choice label={t('green')} active={settings.theme === 'green'} theme={theme} onPress={() => setTheme('green')} />
      </Panel>
      <Panel theme={theme} style={styles.panel}>
        <Text style={[styles.heading, { color: theme.secondary }]}>{t('language')}</Text>
        <Choice label="Català" active={settings.language === 'ca'} theme={theme} onPress={() => setLanguage('ca')} />
        <Choice label="English" active={settings.language === 'en'} theme={theme} onPress={() => setLanguage('en')} />
        <Choice label="Español" active={settings.language === 'es'} theme={theme} onPress={() => setLanguage('es')} />
      </Panel>
      <PixelButton label={t('back')} onPress={onBack} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-around', padding: 18 },
  panel: { width: '82%', maxWidth: 420, minHeight: 185 },
  heading: { fontFamily: GAME_FONT, fontSize: 37, lineHeight: 40, textAlign: 'center', textTransform: 'uppercase', marginBottom: 8 },
  choice: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 13, height: 13, marginRight: 10 },
  choiceText: { fontFamily: GAME_FONT, fontSize: 27, lineHeight: 31, textTransform: 'uppercase' },
});
