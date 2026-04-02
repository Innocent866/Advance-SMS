import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[
            styles.card,
            { backgroundColor: themeColors.card, borderColor: themeColors.border },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: Spacing.md,
        borderWidth: 1,
        ...Platform.select({
            ios: Shadows.soft,
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            } as any
        }),
    } as ViewStyle,
});
