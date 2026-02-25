import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { Radius } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) => {
    const { colors, isDark } = useTheme();
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.4, { duration: 750 }), withTiming(1, { duration: 750 })),
            -1,
            false
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View
            style={[
                animStyle,
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: isDark ? '#334155' : '#e5e7eb',
                },
                style,
            ]}
        />
    );
};

export const SkeletonCard = () => {
    const { colors } = useTheme();
    return (
        <View style={[skStyles.card, { backgroundColor: colors.surface }]}>
            <View style={skStyles.row}>
                <Skeleton width={44} height={44} borderRadius={22} />
                <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="40%" height={12} />
                </View>
            </View>
            <Skeleton height={12} style={{ marginTop: 12 }} />
            <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
        </View>
    );
};

const skStyles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        padding: 16,
        marginBottom: 12,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
});
