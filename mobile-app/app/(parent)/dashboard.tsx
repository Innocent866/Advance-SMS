import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function ParentDashboard() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    const children = [
        { id: '1', name: 'Chidi Okafor', class: 'JS1 Gold', avatar: '#16a34a', status: 'In School', score: '74.5%' },
        { id: '2', name: 'Amaka Okafor', class: 'SS2 Diamond', avatar: '#f59e0b', status: 'At Home', score: '82.1%' },
    ];

    return (
        <AnimatedScreen>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Good Day,</Text>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>Mr. Okafor</Text>
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
                <Card style={styles.paymentAlert}>
                    <View style={styles.alertIcon}>
                        <Ionicons name="alert-circle" size={24} color={Colors.warning} />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>Fee Reminder</Text>
                        <Text style={[styles.alertBody, { color: colors.textSecondary }]}>
                            ₦15,000 outstanding for Amaka Okafor's 2nd term fee.
                        </Text>
                        <TouchableOpacity style={styles.payNowBtn}>
                            <Text style={styles.payNowText}>Pay Now</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Children</Text>
                </View>

                {children.map((child) => (
                    <Card key={child.id} style={styles.childCard}>
                        <View style={styles.childHeader}>
                            <Avatar name={child.name} size={50} color={child.avatar} />
                            <View style={styles.childInfo}>
                                <Text style={[styles.childName, { color: colors.textPrimary }]}>{child.name}</Text>
                                <Text style={[styles.childClass, { color: colors.textSecondary }]}>{child.class}</Text>
                            </View>
                            <Badge
                                label={child.status}
                                size="sm"
                                bgColor={child.status === 'In School' ? Colors.successLight : Colors.border}
                                color={child.status === 'In School' ? Colors.success : colors.textMuted}
                            />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <View style={styles.childStats}>
                            <View style={styles.miniStat}>
                                <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Average Score</Text>
                                <Text style={[styles.miniValue, { color: Colors.primary }]}>{child.score}</Text>
                            </View>
                            <View style={styles.miniStat}>
                                <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Attendance</Text>
                                <Text style={[styles.miniValue, { color: Colors.secondary }]}>94%</Text>
                            </View>
                        </View>
                        <View style={styles.childActions}>
                            <Button title="Report Card" variant="outline" size="sm" style={styles.actionBtn} />
                            <Button title="Message Teacher" variant="secondary" size="sm" style={styles.actionBtn} />
                        </View>
                    </Card>
                ))}

                <Card style={styles.announcementCard}>
                    <Text style={[styles.annTitle, { color: colors.textPrimary }]}>School Announcement</Text>
                    <Text style={[styles.annBody, { color: colors.textSecondary }]}>
                        The annual Parent-Teacher Association (PTA) meeting will hold this Friday at 4:30 PM in the school hall.
                    </Text>
                    <TouchableOpacity style={styles.readMore}>
                        <Text style={[styles.readMoreText, { color: Colors.primary }]}>Read More</Text>
                        <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                </Card>
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
        fontSize: 22,
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
    paymentAlert: {
        flexDirection: 'row',
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
        marginBottom: Spacing.lg,
    },
    alertIcon: {
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    alertBody: {
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
    payNowBtn: {
        marginTop: 10,
    },
    payNowText: {
        color: Colors.warning,
        fontWeight: '700',
        fontSize: 14,
    },
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    childCard: {
        padding: 16,
        marginBottom: Spacing.lg,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childInfo: {
        flex: 1,
        marginLeft: 12,
    },
    childName: {
        fontSize: 16,
        fontWeight: '700',
    },
    childClass: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 15,
    },
    childStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    miniStat: {
        alignItems: 'center',
    },
    miniLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    miniValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    childActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
    },
    announcementCard: {
        padding: 16,
        backgroundColor: Colors.primary + '05',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    annTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 8,
    },
    annBody: {
        fontSize: 13,
        lineHeight: 20,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 4,
    },
    readMoreText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
