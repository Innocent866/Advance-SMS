import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Shadow, Radius } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    elevated?: boolean;
    noPadding?: boolean;
}

export const Card = ({ children, style, elevated = true, noPadding = false }: CardProps) => {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                elevated ? Shadow.md : Shadow.sm,
                noPadding ? { padding: 0 } : {},
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        padding: 16,
        borderWidth: 1,
    },
});
