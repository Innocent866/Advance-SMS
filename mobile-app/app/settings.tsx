import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const { colors, theme, toggleTheme, isDark } = useTheme();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    const SettingItem = ({ icon, label, onPress, rightContent, danger = false }: any) => (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <View style={[styles.item, { borderBottomColor: colors.divider }]}>
                <View style={styles.itemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: (danger ? Colors.error : Colors.primary) + '15' }]}>
                        <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.primary} />
                    </View>
                    <Text style={[styles.itemLabel, { color: danger ? Colors.error : colors.textPrimary }]}>{label}</Text>
                </View>
                {rightContent || <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <AnimatedScreen style={{ paddingTop: 20 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <Avatar name={user?.name} size={80} color={Colors.primary} />
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
                    <TouchableOpacity style={styles.editBtn}>
                        <Text style={styles.editText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PREFERENCES</Text>
                    <Card style={styles.settingsCard}>
                        <SettingItem
                            icon="moon-outline"
                            label="Dark Mode"
                            rightContent={
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#e5e7eb', true: Colors.primary + '80' }}
                                    thumbColor={isDark ? Colors.primary : '#f4f3f4'}
                                />
                            }
                        />
                        <SettingItem
                            icon="notifications-outline"
                            label="Push Notifications"
                            onPress={() => Alert.alert('Settings', 'Notification settings screen.')}
                        />
                        <SettingItem
                            icon="language-outline"
                            label="Language"
                            rightContent={<Text style={{ color: colors.textSecondary }}>English</Text>}
                            onPress={() => { }}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SECURITY</Text>
                    <Card style={styles.settingsCard}>
                        <SettingItem
                            icon="lock-closed-outline"
                            label="Change Password"
                            onPress={() => Alert.alert('Security', 'Password change flow.')}
                        />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label="Privacy Policy"
                            onPress={() => router.push('/privacy' as any)}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
                    <Card style={styles.settingsCard}>
                        <SettingItem
                            icon="help-circle-outline"
                            label="Help & Support"
                            onPress={() => { }}
                        />
                        <SettingItem
                            icon="log-out-outline"
                            label="Log Out"
                            onPress={handleLogout}
                            danger
                        />
                    </Card>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 1.0.0 (Building GT-SchoolHub Mobile)</Text>
                </View>
            </ScrollView>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 60,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 12,
    },
    userEmail: {
        fontSize: 14,
        marginTop: 4,
    },
    editBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: Radius.full,
        backgroundColor: Colors.primaryLight,
    },
    editText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    settingsCard: {
        padding: 0,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
