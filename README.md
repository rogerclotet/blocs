# Blocs!

A block puzzle game for Android, iOS, and the web, built with Expo and React Native.

The gameplay is inspired by puzzle games that were weighed down by ads and in-app purchases. Blocs keeps the premise simple: place pieces on a 10×10 board, clear completed rows and columns, and chase a higher score.

The original Android release is available on the [Play Store](https://play.google.com/store/apps/details?id=dev.clotet.blocs), and the web version is available at [blocs.clotet.dev](https://blocs.clotet.dev).

## Development

Install dependencies and start Expo:

```sh
pnpm install
pnpm start
```

Use `pnpm ios`, `pnpm android`, or `pnpm web` to open a platform directly.

Run the automated checks with:

```sh
pnpm test
pnpm typecheck
```

## Android releases

GitHub Actions builds a sideloadable Android APK and attaches it to a GitHub Release. There is no iOS build yet.

Ask an agent to create a release (or invoke `/create-release`). It chooses patch, minor, or major from the changes since the last tag, updates `CHANGELOG.md`, `package.json`, and `app.json`, then creates an annotated `vX.Y.Z` tag. Push the tag only when you want to publish:

```sh
git push origin v2.0.0
```

You can also tag by hand or run the **Android Release** workflow from the Actions tab. If you do not pass a tag, the workflow uses `v` plus the version in `package.json`.

Download `blocs-<version>.apk` from the release page and open it on the device. You may need to allow installing from the browser. The Android package is `dev.clotet.blocs`.

## Conductor

The shared Conductor setup installs dependencies from `pnpm-lock.yaml`. The Run menu includes:

- `Web` starts Expo Web on the workspace's assigned port and is the default action.
- `Expo` starts the Expo development server on a second assigned port for device testing.
- `Test` runs Vitest in watch mode.

Conductor assigns different ports to each workspace, so these scripts can run alongside another Blocs workspace.

## Project structure

- `assets/` contains fonts, app icons, and in-game images.
- `src/components/` contains reusable React Native UI.
- `src/domain/` contains the platform-independent game rules.
- `src/screens/` contains app screens.
- `src/services/` contains platform integrations.
- `src/storage/` contains persisted game and settings data.

The app includes the 10×10 board, original piece set and scoring multipliers, single-step undo, saved games, score history, themes, Catalan, English, Spanish, and native result sharing. Google Play Games achievements and leaderboards require a custom Android development build; gameplay does not depend on that service.
