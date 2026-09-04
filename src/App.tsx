import { useEffect, useMemo, useState } from 'react';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GameBackdrop } from './components/PixelUi';
import { createNewSession } from './domain/game';
import type { PlayingSession, SaveData } from './domain/types';
import { makeTranslator, systemLanguage } from './i18n/translations';
import { GameScreen } from './screens/GameScreen';
import { MenuScreen } from './screens/MenuScreen';
import { ScoresScreen } from './screens/ScoresScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import {
  loadSaveData,
  loadSettings,
  storeSaveData,
  storeSettings,
  type Settings,
} from './storage/persistence';
import { theme } from './theme/themes';

type Screen =
  | Readonly<{ kind: 'menu' }>
  | Readonly<{ kind: 'scores' }>
  | Readonly<{ kind: 'settings' }>
  | Readonly<{ kind: 'game'; runId: number; session: PlayingSession }>;

type LoadedState = Readonly<{ save: SaveData; settings: Settings }>;

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });
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
      <GameBackdrop>
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
      </GameBackdrop>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  safeArea: { flex: 1 },
});
