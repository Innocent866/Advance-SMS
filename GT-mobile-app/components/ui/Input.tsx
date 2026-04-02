import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    leftIcon,
    ...props
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: themeColors.background,
                        borderColor: error ? themeColors.error : themeColors.border,
                    },
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        { color: themeColors.text },
                    ]}
                    placeholderTextColor={themeColors.textSecondary}
                    {...props}
                />
            </View>
            {error && <Text style={[styles.error, { color: themeColors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    error: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
