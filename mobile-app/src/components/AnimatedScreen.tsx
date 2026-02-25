import React, { useEffect, ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

interface AnimatedScreenProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const AnimatedScreen = ({ children, style }: AnimatedScreenProps) => {
    const { colors } = useTheme();
    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.container, { backgroundColor: colors.background }, style]}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});
