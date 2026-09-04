import { useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { PixelBackdrop } from './src/components/PixelUi';
import { createNewSession } from './src/domain/game';
import type { PlayingSession, SaveData } from './src/domain/types';
import { makeTranslator, systemLanguage } from './src/i18n/translations';
import { GameScreen } from './src/screens/GameScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { ScoresScreen } from './src/screens/ScoresScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import {
  loadSaveData,
  loadSettings,
  storeSaveData,
  storeSettings,
  type Settings,
} from './src/storage/persistence';
import { themes } from './src/theme/themes';

type Screen =
  | Readonly<{ kind: 'menu' }>
  | Readonly<{ kind: 'scores' }>
  | Readonly<{ kind: 'settings' }>
  | Readonly<{ kind: 'game'; runId: number; session: PlayingSession }>;

type LoadedState = Readonly<{ save: SaveData; settings: Settings }>;

export default function App() {
  const [fontsLoaded] = useFonts({ Gamer: require('./assets/fonts/gamer.ttf') });
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });
  const theme = themes[loaded?.settings.theme ?? 'purple'];
  const t = useMemo(() => makeTranslator(loaded?.settings.language ?? 'en'), [loaded?.settings.language]);

  useEffect(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const fallbackLanguage = systemLanguage(locale);
    void Promise.all([loadSaveData(), loadSettings(fallbackLanguage)]).then(([save, settings]) => {
      setLoaded({ save, settings });
    });
  }, []);

  useEffect(() => {
    if (screen.kind !== 'scores' && screen.kind !== 'settings') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen({ kind: 'menu' });
      return true;
    });
    return () => subscription.remove();
  }, [screen.kind]);

  if (!fontsLoaded || !loaded) {
    return <View style={[styles.loading, { backgroundColor: theme.background }]} />;
  }

  const updateSave = (save: SaveData) => {
    setLoaded((current) => current ? { ...current, save } : current);
    void storeSaveData(save).catch(() => undefined);
  };

  const updateSettings = (settings: Settings) => {
    setLoaded((current) => current ? { ...current, settings } : current);
    void storeSettings(settings).catch(() => undefined);
  };

  const openGame = (session: PlayingSession) => {
    updateSave({ ...loaded.save, highScore: session.game.highScore, session });
    setScreen({ kind: 'game', session, runId: Date.now() });
  };

  const newGame = () => openGame(createNewSession(loaded.save.highScore, Date.now()));
  const continueGame = () => {
    if (loaded.save.session) openGame(loaded.save.session);
  };

  return (
    <SafeAreaProvider>
      <PixelBackdrop theme={theme}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
          {screen.kind === 'menu' ? (
            <MenuScreen
              save={loaded.save}
              theme={theme}
              t={t}
              onNewGame={newGame}
              onContinue={continueGame}
              onScores={() => setScreen({ kind: 'scores' })}
              onSettings={() => setScreen({ kind: 'settings' })}
            />
          ) : null}
          {screen.kind === 'scores' ? (
            <ScoresScreen save={loaded.save} theme={theme} t={t} onBack={() => setScreen({ kind: 'menu' })} />
          ) : null}
          {screen.kind === 'settings' ? (
            <SettingsScreen
              settings={loaded.settings}
              theme={theme}
              t={t}
              onChange={updateSettings}
              onBack={() => setScreen({ kind: 'menu' })}
            />
          ) : null}
          {screen.kind === 'game' ? (
            <GameScreen
              key={screen.runId}
              initialSession={screen.session}
              save={loaded.save}
              theme={theme}
              t={t}
              onSave={updateSave}
              onHome={() => setScreen({ kind: 'menu' })}
              onRestart={newGame}
            />
          ) : null}
        </SafeAreaView>
        <StatusBar style="light" />
      </PixelBackdrop>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  safeArea: { flex: 1 },
});
