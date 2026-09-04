import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BUTTON_FONT, GameButton, Logo, Panel, UI_FONT } from '../components/PixelUi';
import type { Translator, Language } from '../i18n/translations';
import type { Settings } from '../storage/persistence';
import type { Theme } from '../theme/themes';

function Choice({ label, active, theme, onPress }: { label: string; active: boolean; theme: Theme; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: active ? theme.surfaceRaised : 'transparent',
          borderColor: active ? theme.primary : 'transparent',
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.radio, { borderColor: active ? theme.primary : theme.textMuted }]}>
        {active ? <View style={[styles.radioDot, { backgroundColor: theme.primary }]} /> : null}
      </View>
      <Text style={[styles.choiceText, { color: active ? theme.text : theme.textMuted }]}>{label}</Text>
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
  const setLanguage = (language: Language) => onChange({ ...settings, language });
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Logo theme={theme} compact />
        <Panel theme={theme} style={styles.panel}>
          <Text style={[styles.heading, { color: theme.text }]}>{t('language')}</Text>
          <Choice label="Català" active={settings.language === 'ca'} theme={theme} onPress={() => setLanguage('ca')} />
          <Choice label="English" active={settings.language === 'en'} theme={theme} onPress={() => setLanguage('en')} />
          <Choice label="Español" active={settings.language === 'es'} theme={theme} onPress={() => setLanguage('es')} />
        </Panel>
        <GameButton label={t('back')} onPress={onBack} theme={theme} wide variant="quiet" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 26 },
  content: { width: '100%', maxWidth: 430, alignItems: 'center' },
  panel: { width: '100%', marginBottom: 14 },
  heading: { fontFamily: BUTTON_FONT, fontSize: 24, lineHeight: 29, marginBottom: 10 },
  choice: { minHeight: 48, width: '100%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, marginTop: 6 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  choiceText: { fontFamily: UI_FONT, fontSize: 16, lineHeight: 22 },
});
