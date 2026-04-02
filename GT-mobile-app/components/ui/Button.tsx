import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        if (!loading && !disabled) {
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onPress();
        }
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return { backgroundColor: themeColors.secondary };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: themeColors.primary
                };
            case 'danger':
                return { backgroundColor: themeColors.error };
            default:
                return { backgroundColor: themeColors.primary };
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return { color: themeColors.primary };
            default:
                return { color: '#fff' };
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                getButtonStyle(),
                (disabled || loading) && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? themeColors.primary : '#fff'} />
            ) : (
                <>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={variant === 'outline' ? themeColors.primary : '#fff'}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                cursor: 'pointer',
            }
        }),
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.6,
    },
});
