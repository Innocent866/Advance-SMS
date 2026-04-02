import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message, fullScreen = false }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[
            styles.container,
            fullScreen && { ...StyleSheet.absoluteFillObject, backgroundColor: themeColors.background, zIndex: 999 }
        ]}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            {message && (
                <Text style={[styles.message, { color: themeColors.textSecondary }]}>
                    {message}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: Spacing.md,
        fontSize: 14,
        fontWeight: '500',
    },
});
