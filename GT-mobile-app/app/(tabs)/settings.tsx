import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Platform, Alert, RefreshControl } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { api, endpoints } from '@/utils/api';

export default function SettingsScreen() {
    const { user, login, logout } = useAuth();
    const [fetchingProfile, setFetchingProfile] = React.useState(false);
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const fetchProfile = async () => {
        setFetchingProfile(true);
        try {
            const profile = await api(endpoints.auth.profile);
            if (profile && user) {
                await login({ ...user, ...profile });
            }
        } catch (error) {
            console.error('Profile sync failed:', error);
        } finally {
            setFetchingProfile(false);
        }
    };

    React.useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/login');
                }
            }
        ]);
    };

    const SettingItem = ({ icon, label, onPress, color }: any) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: (color || themeColors.primary) + '15' }]}>
                <Ionicons name={icon} size={22} color={color || themeColors.primary} />
            </View>
            <Text style={[styles.label, { color: themeColors.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={themeColors.border} />
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: themeColors.background }]}
            refreshControl={<RefreshControl refreshing={fetchingProfile} onRefresh={fetchProfile} />}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>
            </View>

            <View style={styles.profileSection}>
                <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
                </View>
                <Text style={[styles.name, { color: themeColors.text }]}>{user?.name || 'Administrator'}</Text>
                <Text style={[styles.email, { color: themeColors.textSecondary }]}>{user?.email || 'admin@schoolhub.com'}</Text>
                <View style={[styles.roleBadge, { backgroundColor: themeColors.primary + '20' }]}>
                    <Text style={[styles.roleText, { color: themeColors.primary }]}>{user?.role || 'SYSTEM ADMIN'}</Text>
                </View>
            </View>

            <View style={styles.listSection}>
                {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                    <>
                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>ADMINISTRATION</Text>
                        <Card style={styles.card}>
                            <SettingItem
                                icon="business-outline"
                                label="School Settings"
                                onPress={() => router.push('/school-settings' as any)}
                                color={themeColors.primary}
                            />
                            <SettingItem
                                icon="people-outline"
                                label="User Management"
                                onPress={() => router.push('/user-management' as any)}
                                color="#f59e0b"
                            />
                        </Card>
                    </>
                )}

                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>ACCOUNT</Text>
                <Card style={styles.card}>
                    <SettingItem icon="person-outline" label="Personal Information" onPress={() => { }} />
                    <SettingItem icon="notifications-outline" label="Notification Settings" onPress={() => { }} />
                    <SettingItem icon="shield-checkmark-outline" label="Security & Privacy" onPress={() => { }} />
                </Card>

                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>PREFERENCES</Text>
                <Card style={styles.card}>
                    <SettingItem icon="moon-outline" label="Dark Moder (System Default)" onPress={() => { }} />
                    <SettingItem icon="language-outline" label="App Language" onPress={() => { }} />
                </Card>

                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>SUPPORT</Text>
                <Card style={styles.card}>
                    <SettingItem icon="help-circle-outline" label="Help Center" onPress={() => { }} />
                    <SettingItem icon="information-circle-outline" label="About GT-SchoolHub" onPress={() => { }} />
                </Card>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={themeColors.error} />
                    <Text style={[styles.logoutText, { color: themeColors.error }]}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (Build 102)</Text>
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
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '800',
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
    },
    email: {
        fontSize: 14,
        marginTop: 4,
    },
    roleBadge: {
        marginTop: Spacing.md,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    listSection: {
        padding: Spacing.lg,
        paddingBottom: 120,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
        letterSpacing: 1,
    },
    card: {
        padding: 0,
        marginBottom: Spacing.xl,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    iconBox: {
        padding: 8,
        borderRadius: 10,
        marginRight: Spacing.md,
    },
    label: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
        marginTop: Spacing.md,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: Spacing.sm,
    },
    versionText: {
        textAlign: 'center',
        color: 'rgba(0,0,0,0.3)',
        fontSize: 12,
        marginTop: Spacing.xl,
    },
});
