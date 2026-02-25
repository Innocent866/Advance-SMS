import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Radius } from '@/constants/colors';

interface BadgeProps {
    label: string;
    color?: string;
    bgColor?: string;
    style?: StyleProp<ViewStyle>;
    size?: 'sm' | 'md';
}

export const Badge = ({ label, color = '#fff', bgColor = '#16a34a', style, size = 'md' }: BadgeProps) => (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' ? styles.sm : styles.md, style]}>
        <Text style={[styles.text, { color }, size === 'sm' ? styles.textSm : styles.textMd]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    badge: { borderRadius: Radius.full, alignSelf: 'flex-start' },
    md: { paddingHorizontal: 12, paddingVertical: 4 },
    sm: { paddingHorizontal: 8, paddingVertical: 2 },
    text: { fontWeight: '600' },
    textMd: { fontSize: 12 },
    textSm: { fontSize: 10 },
});
