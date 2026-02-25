import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function AdminDashboard() {
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
                <View>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Admin'}</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <View style={styles.badge} />
                    <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
            >
                <View style={styles.statsGrid}>
                    <StatCard
                        index={0}
                        title="Total Students"
                        value="1,248"
                        icon={<Ionicons name="people" size={20} color="#fff" />}
                        trend="+12% this term"
                        trendType="positive"
                        colors={['#16a34a', '#22c55e']}
                    />
                    <StatCard
                        index={1}
                        title="Total Staff"
                        value="84"
                        icon={<Ionicons name="briefcase" size={20} color="#fff" />}
                        trend="2 joined recently"
                        trendType="neutral"
                        colors={['#2563eb', '#3b82f6']}
                    />
                    <StatCard
                        index={2}
                        title="Avg. Attendance"
                        value="94.2%"
                        icon={<Ionicons name="calendar" size={20} color="#fff" />}
                        trend="-2% from last week"
                        trendType="negative"
                        colors={['#f59e0b', '#fbbf24']}
                    />
                    <StatCard
                        index={3}
                        title="Revenue"
                        value="₦4.2M"
                        icon={<Ionicons name="wallet" size={20} color="#fff" />}
                        trend="+8% vs target"
                        trendType="positive"
                        colors={['#7c3aed', '#8b5cf6']}
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <Card style={styles.activityCard}>
                    {[1, 2, 3].map((item, idx) => (
                        <View key={item} style={[
                            styles.activityItem,
                            idx !== 2 && { borderBottomWidth: 1, borderBottomColor: colors.divider }
                        ]}>
                            <Avatar
                                name={item === 1 ? "John Doe" : item === 2 ? "Alice Smith" : "Bob Brown"}
                                size={40}
                                color={item === 1 ? Colors.primary : item === 2 ? Colors.secondary : '#7c3aed'}
                            />
                            <View style={styles.activityInfo}>
                                <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                                    {item === 1 ? "New student enrolled" : item === 2 ? "Results published" : "Fee payment received"}
                                </Text>
                                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>2 hours ago</Text>
                            </View>
                        </View>
                    ))}
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
                </View>

                <View style={styles.actionsGrid}>
                    {[
                        { label: 'Add Student', icon: 'person-add-outline', color: '#16a34a' },
                        { label: 'Mark Attendance', icon: 'checkmark-circle-outline', color: '#2563eb' },
                        { label: 'Fee Payment', icon: 'cash-outline', color: '#f59e0b' },
                        { label: 'Broadcast', icon: 'megaphone-outline', color: '#7c3aed' },
                    ].map((action, idx) => (
                        <TouchableOpacity key={idx} style={[styles.actionBtn, { backgroundColor: colors.surface }]}>
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
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
    welcomeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
    },
    notificationBtn: {
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
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
    activityCard: {
        padding: 0,
        marginBottom: Spacing.lg,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    activityInfo: {
        marginLeft: 12,
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    activityTime: {
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
