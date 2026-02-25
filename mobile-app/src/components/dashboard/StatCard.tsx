import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Radius, Spacing, Shadow } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    colors: [string, string];
    index: number;
}

export const StatCard = ({ title, value, icon, trend, trendType = 'neutral', colors: gradientColors, index }: StatCardProps) => {
    const { colors: themeColors } = useTheme();

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 100).duration(400)}
            style={[styles.container, Shadow.sm]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.iconContainer}>{icon}</View>
                </View>

                <Text style={styles.value}>{value}</Text>

                {trend && (
                    <View style={styles.footer}>
                        <Text style={[
                            styles.trend,
                            { color: trendType === 'positive' ? '#86efac' : trendType === 'negative' ? '#fca5a5' : '#e5e7eb' }
                        ]}>
                            {trend}
                        </Text>
                    </View>
                )}
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: Spacing.md,
        borderRadius: Radius.lg,
        overflow: 'hidden',
    },
    gradient: {
        padding: 16,
        height: 120,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
        marginRight: 4,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 6,
        borderRadius: 8,
    },
    value: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '700',
    },
    footer: {
        marginTop: 4,
    },
    trend: {
        fontSize: 10,
        fontWeight: '500',
    },
});
