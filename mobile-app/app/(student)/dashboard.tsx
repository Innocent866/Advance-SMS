import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function StudentDashboard() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    return (
        <AnimatedScreen>
            <View style={styles.header}>
                <View style={styles.profileInfo}>
                    <Avatar name={user?.name} size={44} color={Colors.primary} />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome,</Text>
                        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] || 'Student'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
                    <View style={styles.badge} />
                    <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                <Card style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Class</Text>
                            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>JS1 Gold</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Term</Text>
                            <Text style={[styles.statusValue, { color: Colors.primary }]}>2nd Term</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Fees</Text>
                            <Badge label="PAID" size="sm" bgColor={Colors.successLight} color={Colors.success} />
                        </View>
                    </View>
                </Card>

                <View style={styles.statsGrid}>
                    <StatCard
                        index={0}
                        title="Avg. Score"
                        value="74.5%"
                        icon={<Ionicons name="school" size={20} color="#fff" />}
                        trend="+5% from 1st term"
                        trendType="positive"
                        colors={['#16a34a', '#22c55e']}
                    />
                    <StatCard
                        index={1}
                        title="Attendance"
                        value="92.4%"
                        icon={<Ionicons name="calendar" size={20} color="#fff" />}
                        trend="Target: 95%"
                        trendType="neutral"
                        colors={['#2563eb', '#3b82f6']}
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Upcoming Assignments</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {[
                    { title: 'Quadratic Equations', subject: 'Mathematics', due: 'Tomorrow, 08:00 AM', color: '#16a34a' },
                    { title: 'Essay Writing', subject: 'English', due: 'Wed, 10:30 AM', color: '#2563eb' },
                ].map((item, idx) => (
                    <Card key={idx} style={styles.assignmentCard}>
                        <View style={[styles.subjDot, { backgroundColor: item.color }]} />
                        <View style={styles.assignInfo}>
                            <Text style={[styles.assignTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                            <Text style={[styles.assignMeta, { color: colors.textSecondary }]}>{item.subject} • Due {item.due}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Card>
                ))}

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
                </View>

                <View style={styles.actionsGrid}>
                    {[
                        { label: 'Report Card', icon: 'document-text-outline', color: '#16a34a' },
                        { label: 'Time Table', icon: 'time-outline', color: '#2563eb' },
                        { label: 'Pay Fees', icon: 'wallet-outline', color: '#f59e0b' },
                        { label: 'Messaging', icon: 'chatbubble-outline', color: '#7c3aed' },
                    ].map((action, idx) => (
                        <TouchableOpacity key={idx} style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '10' }]}>
                                <Ionicons name={action.icon as any} size={24} color={action.color} />
                            </View>
                            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: Spacing.md,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.error,
        zIndex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    statusCard: {
        padding: 16,
        marginBottom: Spacing.lg,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statusItem: {
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    divider: {
        width: 1,
        height: 30,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    viewAllText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    assignmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    subjDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    assignInfo: {
        flex: 1,
    },
    assignTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    assignMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionBtn: {
        width: '48%',
        padding: 16,
        borderRadius: Radius.lg,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
});
