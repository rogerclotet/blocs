export type ThemeName = 'purple' | 'blueYellow' | 'green';

export type Theme = Readonly<{
  name: ThemeName;
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  accent: string;
  ink: string;
}>;

export const themes = {
  purple: {
    name: 'purple', primary: '#8157A1', primaryDark: '#46285D', secondary: '#F0D979',
    secondaryLight: '#FFEB9E', background: '#6A3D8C', accent: '#A4C54F', ink: '#25152F',
  },
  blueYellow: {
    name: 'blueYellow', primary: '#2D6A8F', primaryDark: '#1B2A3B', secondary: '#F0D979',
    secondaryLight: '#FFEB9E', background: '#2F4858', accent: '#A4C54F', ink: '#15222B',
  },
  green: {
    name: 'green', primary: '#5B8151', primaryDark: '#2F362B', secondary: '#EADFB8',
    secondaryLight: '#F0EAC7', background: '#4C5F49', accent: '#D3DB68', ink: '#20261E',
  },
} satisfies Record<ThemeName, Theme>;
