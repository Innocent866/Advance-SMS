import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius } from '@/constants/colors';
import { getInitials } from '@/utils/formatters';
import { useTheme } from '@/context/ThemeContext';

interface AvatarProps {
    name?: string;
    uri?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
    color?: string;
}

export const Avatar = ({ name = '', size = 44, style, color = Colors.primary }: AvatarProps) => {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color + '20',
                    borderColor: color + '40',
                },
                style,
            ]}
        >
            <Text style={[styles.initials, { color, fontSize: size * 0.38 }]}>
                {getInitials(name)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    initials: { fontWeight: '700' },
});
