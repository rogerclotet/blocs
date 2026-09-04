export type Language = 'ca' | 'en' | 'es';

export const translations = {
  en: {
    newGame: 'new game', continueGame: 'continue', scores: 'scores', settings: 'settings',
    score: 'score', highScore: 'high score', blocks: 'blocks', latestGames: 'latest games', back: 'back',
    noMoves: 'no valid moves left :(', result: 'you got\n{score} points\nwith {blocks} blocks!',
    newHighScore: 'new high score!', share: 'share!', playAgain: 'play again', mainMenu: 'main menu',
    theme: 'theme', language: 'language', purple: 'purple', blueYellow: 'blue', green: 'green',
    undo: 'undo move', home: 'main menu', emptyHistory: 'finish a game to see it here',
    shareText: 'I got {score} points with {blocks} blocks! Can you beat it? Play at https://play.google.com/store/apps/details?id=dev.clotet.Blocs',
  },
  es: {
    newGame: 'nueva partida', continueGame: 'continuar', scores: 'puntuaciones', settings: 'opciones',
    score: 'puntos', highScore: 'récord', blocks: 'bloques', latestGames: 'últimas partidas', back: 'volver',
    noMoves: 'no hay movimientos disponibles :(', result: 'has conseguido\n{score} puntos\ncon {blocks} bloques!',
    newHighScore: '¡nuevo récord!', share: '¡compartir!', playAgain: 'volver a jugar', mainMenu: 'menú principal',
    theme: 'tema', language: 'lengua', purple: 'lila', blueYellow: 'azul', green: 'verde',
    undo: 'deshacer jugada', home: 'menú principal', emptyHistory: 'termina una partida para verla aquí',
    shareText: '¡He conseguido {score} puntos con {blocks} bloques! ¿Puedes superarlo? Juega en https://play.google.com/store/apps/details?id=dev.clotet.Blocs',
  },
  ca: {
    newGame: 'nova partida', continueGame: 'continuar', scores: 'puntuacions', settings: 'opcions',
    score: 'punts', highScore: 'rècord', blocks: 'blocs', latestGames: 'últimes partides', back: 'tornar',
    noMoves: 'no hi ha moviments disponibles :(', result: 'has aconseguit\n{score} punts\namb {blocks} blocs!',
    newHighScore: 'nou rècord!', share: 'compartir!', playAgain: 'tornar a jugar', mainMenu: 'menú principal',
    theme: 'tema', language: 'llengua', purple: 'lila', blueYellow: 'blau', green: 'verd',
    undo: 'desfer jugada', home: 'menú principal', emptyHistory: 'acaba una partida per veure-la aquí',
    shareText: 'He aconseguit {score} punts amb {blocks} blocs! Pots superar-ho? Juga a https://play.google.com/store/apps/details?id=dev.clotet.Blocs',
  },
} satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof typeof translations.en;

export type Translator = (key: TranslationKey, values?: Readonly<Record<string, string | number>>) => string;

export function systemLanguage(locale: string | undefined): Language {
  const code = locale?.slice(0, 2).toLowerCase();
  if (code === 'ca' || code === 'es') return code;
  return 'en';
}

export function makeTranslator(language: Language): Translator {
  return (key, values = {}) => {
    let text = translations[language][key];
    for (const [name, value] of Object.entries(values)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  };
}
