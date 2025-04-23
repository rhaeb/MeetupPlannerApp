/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { themeColors, ThemeColorName } from '../constants/themeColors';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(colorName: ThemeColorName) {
  const colorScheme = useColorScheme() ?? 'light';
  return themeColors[colorScheme][colorName];
}

