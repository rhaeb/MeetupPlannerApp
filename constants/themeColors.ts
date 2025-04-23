// themeColors.ts
import { colors } from './colors';

export const themeColors = {
  light: {
    background: colors.white,
    text: colors.black,
    primary: colors.green[600],
    secondary: colors.blue[600],
    accent: colors.amber[500],
    error: colors.red[500],
    card: colors.gray[100],
    border: colors.gray[200],
    // Add more light theme colors as needed
  },
  dark: {
    background: colors.gray[900],
    text: colors.white,
    primary: colors.green[500],
    secondary: colors.blue[600], // or choose a different shade for dark mode
    accent: colors.amber[500],
    error: colors.red[500],
    card: colors.gray[800],
    border: colors.gray[700],
    // Add more dark theme colors as needed
  },
};

export type ThemeColorName = keyof typeof themeColors.light;