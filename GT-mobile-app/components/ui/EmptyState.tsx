import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
    title: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    message,
    icon = 'document-outline'
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={themeColors.border} />
            <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
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
        padding: Spacing.xxl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: Spacing.md,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});
