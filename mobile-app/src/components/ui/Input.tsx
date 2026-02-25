import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    rightIcon?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

export const Input = ({ label, error, rightIcon, containerStyle, ...props }: InputProps) => {
    const { colors, isDark } = useTheme();
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: error ? Colors.error : focused ? Colors.primary : colors.border,
                        backgroundColor: isDark ? colors.surface : '#f9fafb',
                    },
                ]}
            >
                <TextInput
                    {...props}
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholderTextColor={colors.textMuted}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { marginBottom: Spacing.md },
    label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        minHeight: 50,
    },
    input: { flex: 1, fontSize: 15, paddingVertical: 12 },
    rightIcon: { marginLeft: 8 },
    error: { marginTop: 4, fontSize: 12, color: Colors.error },
});
