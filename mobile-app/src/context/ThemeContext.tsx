import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: typeof Colors;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        AsyncStorage.getItem('gt_theme').then((saved) => {
            if (saved === 'dark' || saved === 'light') setTheme(saved);
        });
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        AsyncStorage.setItem('gt_theme', next);
    };

    const isDark = theme === 'dark';

    const colors = {
        ...Colors,
        background: isDark ? Colors.dark.background : Colors.background,
        surface: isDark ? Colors.dark.surface : Colors.surface,
        textPrimary: isDark ? Colors.dark.textPrimary : Colors.textPrimary,
        textSecondary: isDark ? Colors.dark.textSecondary : Colors.textSecondary,
        textMuted: isDark ? Colors.dark.textMuted : Colors.textMuted,
        border: isDark ? Colors.dark.border : Colors.border,
        divider: isDark ? Colors.dark.divider : Colors.divider,
    };

    return (
        <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
