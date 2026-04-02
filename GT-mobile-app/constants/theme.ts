/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#16a34a',
    secondary: '#f59e0b',
    text: '#11181C',
    textSecondary: '#687076',
    background: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#16a34a',
    tint: '#16a34a',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#16a34a',
  },
  dark: {
    primary: '#22c55e',
    secondary: '#fbbf24',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    background: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    error: '#f87171',
    success: '#22c55e',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
};
