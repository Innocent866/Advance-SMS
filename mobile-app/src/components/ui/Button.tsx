import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
}: ButtonProps) => {
    const { colors } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15 });
    };

    const bgMap: Record<string, string> = {
        primary: Colors.primary,
        secondary: Colors.secondary,
        outline: 'transparent',
        ghost: 'transparent',
        danger: Colors.error,
    };
    const textMap: Record<string, string> = {
        primary: '#fff',
        secondary: '#fff',
        outline: Colors.primary,
        ghost: Colors.textSecondary,
        danger: '#fff',
    };
    const borderMap: Record<string, string> = {
        primary: Colors.primary,
        secondary: Colors.secondary,
        outline: Colors.primary,
        ghost: 'transparent',
        danger: Colors.error,
    };

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.85}
            disabled={disabled || loading}
            style={[
                styles.base,
                size === 'sm' && styles.sm,
                size === 'lg' && styles.lg,
                {
                    backgroundColor: disabled ? Colors.border : bgMap[variant],
                    borderColor: disabled ? Colors.border : borderMap[variant],
                    borderWidth: variant === 'outline' ? 1.5 : 0,
                    opacity: disabled ? 0.6 : 1,
                },
                animatedStyle,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={textMap[variant]} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={[
                        styles.text,
                        size === 'sm' && styles.textSm,
                        size === 'lg' && styles.textLg,
                        { color: disabled ? Colors.textMuted : textMap[variant] },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radius.md,
    },
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: Radius.sm,
    },
    lg: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    textSm: {
        fontSize: 13,
    },
    textLg: {
        fontSize: 18,
    },
});
