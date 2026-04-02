import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SchoolSettingsMenu() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const MenuButton = ({ icon, title, subtitle, onPress, color }: any) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.menuItemWrapper}>
            <Card style={styles.menuCard}>
                <View style={styles.menuContent}>
                    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                        <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={[styles.menuTitle, { color: themeColors.text }]}>{title}</Text>
                        <Text style={[styles.menuSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.border} />
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>School Settings</Text>
            </View>

            <View style={styles.content}>
                <MenuButton
                    icon="business"
                    title="School Profile"
                    subtitle="Edit name, logo, address, and contact info"
                    color="#3b82f6"
                    onPress={() => router.push('/school-settings/profile')}
                />

                <MenuButton
                    icon="calendar"
                    title="Academic Setup"
                    subtitle="Configure sessions, terms, and active periods"
                    color="#16a34a"
                    onPress={() => router.push('/school-settings/sessions')}
                />

                <MenuButton
                    icon="stats-chart"
                    title="Grading System"
                    subtitle="Set CA weightage and grade scales"
                    color="#f59e0b"
                    onPress={() => router.push('/school-settings/grading')}
                />

                <MenuButton
                    icon="layers"
                    title="Academics Management"
                    subtitle="Manage Departments, Classes, and Arms"
                    color="#8b5cf6"
                    onPress={() => router.push('/school-settings/academics')}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: Spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
    },
    content: {
        padding: Spacing.lg,
    },
    menuItemWrapper: {
        marginBottom: Spacing.md,
    },
    menuCard: {
        padding: Spacing.md,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    menuSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
