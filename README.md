# Blocs!

A block puzzle game for Android, iOS, and the web, built with Expo and React Native.

The gameplay is inspired by puzzle games that were weighed down by ads and in-app purchases. Blocs keeps the premise simple: place pieces on a 10×10 board, clear completed rows and columns, and chase a higher score.

The original Android release is available on the [Play Store](https://play.google.com/store/apps/details?id=dev.clotet.Blocs), and the web version is available at [blocs.clotet.dev](https://blocs.clotet.dev).

## Development

Install dependencies and start Expo:

```sh
npm install
npm start
```

Use `npm run ios`, `npm run android`, or `npm run web` to open a platform directly.

Run the automated checks with:

```sh
npm test
npm run typecheck
```

## Project structure

- `assets/` contains fonts, app icons, and in-game images.
- `src/components/` contains reusable React Native UI.
- `src/domain/` contains the platform-independent game rules.
- `src/screens/` contains app screens.
- `src/services/` contains platform integrations.
- `src/storage/` contains persisted game and settings data.

The app includes the 10×10 board, original piece set and scoring multipliers, single-step undo, saved games, score history, themes, Catalan, English, Spanish, and native result sharing. Google Play Games achievements and leaderboards require a custom Android development build; gameplay does not depend on that service.
