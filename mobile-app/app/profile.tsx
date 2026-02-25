import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function ProfileScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [editing, setEditing] = useState(false);

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');

    const handleUpdate = () => {
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
    };

    return (
        <AnimatedScreen style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>My Profile</Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Text style={[styles.editBtnText, { color: Colors.primary }]}>
                        {editing ? 'Cancel' : 'Edit'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                    <Avatar name={user?.name} size={100} color={Colors.primary} />
                    <TouchableOpacity style={styles.changeAvatarBtn}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.name}</Text>
                    <Text style={[styles.profileRole, { color: colors.textSecondary }]}>{user?.role?.toUpperCase().replace('_', ' ')}</Text>
                </View>

                <Card style={styles.detailsCard}>
                    {editing ? (
                        <View style={styles.form}>
                            <Input
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                            />
                            <Input
                                label="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                            />
                            <Input
                                label="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter your phone"
                                keyboardType="phone-pad"
                            />
                            <Button
                                title="Save Changes"
                                onPress={handleUpdate}
                                style={{ marginTop: 10 }}
                            />
                        </View>
                    ) : (
                        <View style={styles.viewDetails}>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Full Name</Text>
                                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{user?.name}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email Address</Text>
                                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{user?.email}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{user?.phone || 'Not set'}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Status</Text>
                                <Text style={[styles.detailValue, { color: Colors.success }]}>Active</Text>
                            </View>
                        </View>
                    )}
                </Card>

                <View style={styles.statsSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT STATISTICS</Text>
                    <View style={styles.statsGrid}>
                        <Card style={styles.statBox}>
                            <Text style={[styles.statNum, { color: Colors.primary }]}>2</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Devices</Text>
                        </Card>
                        <Card style={styles.statBox}>
                            <Text style={[styles.statNum, { color: Colors.secondary }]}>14</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Logins (MTD)</Text>
                        </Card>
                    </View>
                </View>

                <Button
                    title="Secure Logout"
                    variant="outline"
                    onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'No' }, { text: 'Yes', onPress: () => router.replace('/(auth)/login') }])}
                    style={{ marginTop: 30, borderColor: Colors.error }}
                    textStyle={{ color: Colors.error }}
                />
            </ScrollView>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    editBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    changeAvatarBtn: {
        position: 'absolute',
        bottom: 60,
        right: '35%',
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 15,
    },
    profileRole: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 4,
    },
    detailsCard: {
        padding: 20,
        marginBottom: Spacing.xl,
    },
    form: {
        gap: 10,
    },
    viewDetails: {
        gap: 15,
    },
    detailItem: {
        gap: 4,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    statsSection: {
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        padding: 15,
    },
    statNum: {
        fontSize: 24,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});
