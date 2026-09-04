import type { PieceColor } from '../domain/types';

export type Theme = Readonly<{
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  accent: string;
  ink: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  board: string;
  cell: string;
}>;

export const theme: Theme = {
  primary: '#9B72F2', primaryDark: '#6241B5', secondary: '#FFD166',
  secondaryLight: '#FFF0B8', background: '#171321', accent: '#82E6BC', ink: '#100C18',
  surface: '#241D31', surfaceRaised: '#30263F', text: '#FBF8FF', textMuted: '#BEB5CA',
  board: '#1E182A', cell: '#342B43',
};

export type BlockColors = Readonly<{ face: string; dark: string }>;

export const blockColors = {
  purple: { face: '#9B72F2', dark: '#6241B5' },
  blue: { face: '#43A4E6', dark: '#2568A0' },
  green: { face: '#63C98F', dark: '#35865A' },
  gold: { face: '#FFD45C', dark: '#B57A22' },
  mint: { face: '#79E0C1', dark: '#2D8E73' },
  coral: { face: '#F27D86', dark: '#A83F55' },
} satisfies Record<PieceColor, BlockColors>;
