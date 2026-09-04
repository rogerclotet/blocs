export type PlatformGameService = Readonly<{
  reportPlacedBlocks: (amount: number) => void;
  reportClearedLines: (amount: number) => void;
  reportFinishedGame: (score: number) => void;
}>;

// Expo Go has no Google Play Games native API. A development-build adapter can
// replace this object without coupling the game rules or screens to Android.
export const platformGameService: PlatformGameService = {
  reportPlacedBlocks: () => undefined,
  reportClearedLines: () => undefined,
  reportFinishedGame: () => undefined,
};
