import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function TeacherDashboard() {
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
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Hello,</Text>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] || 'Teacher'}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
                        <View style={styles.badge} />
                        <Ionicons name="notifications-outline" size={26} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                <Card style={styles.classCard}>
                    <View style={styles.classHeader}>
                        <View style={[styles.classIcon, { backgroundColor: Colors.primary + '15' }]}>
                            <Ionicons name="school" size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.classMeta}>
                            <Text style={[styles.classTitle, { color: colors.textPrimary }]}>JS1 Gold</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Form Teacher</Text>
                        </View>
                        <Button title="View All" variant="ghost" size="sm" onPress={() => { }} />
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniValue, { color: colors.textPrimary }]}>42</Text>
                            <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Students</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniValue, { color: Colors.success }]}>96%</Text>
                            <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Attendance</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniValue, { color: Colors.secondary }]}>12</Text>
                            <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Pending Exams</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Schedule</Text>
                </View>

                <Card style={styles.scheduleCard}>
                    {[
                        { subject: 'Mathematics', time: '08:30 AM - 09:15 AM', class: 'JS1 Gold', active: true },
                        { subject: 'English Language', time: '10:00 AM - 10:45 AM', class: 'JS2 Bronze', active: false },
                        { subject: 'Computer Science', time: '11:15 AM - 12:00 PM', class: 'JS1 Gold', active: false },
                    ].map((item, idx) => (
                        <View key={idx} style={[styles.scheduleItem, idx !== 2 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
                            <View style={[styles.timeSlot, item.active && { backgroundColor: Colors.primary + '15' }]}>
                                <Text style={[styles.timeText, { color: item.active ? Colors.primary : colors.textSecondary }]}>
                                    {item.time.split(' - ')[0]}
                                </Text>
                            </View>
                            <View style={styles.subjContent}>
                                <Text style={[styles.subjTitle, { color: colors.textPrimary }]}>{item.subject}</Text>
                                <Text style={[styles.subjClass, { color: colors.textSecondary }]}>{item.class}</Text>
                            </View>
                            {item.active && <View style={styles.activeDot} />}
                        </View>
                    ))}
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Tools</Text>
                </View>

                <View style={styles.toolsGrid}>
                    {[
                        { label: 'Mark Attendance', icon: 'checkbox-outline', color: '#16a34a' },
                        { label: 'Submit Grades', icon: 'create-outline', color: '#2563eb' },
                        { label: 'Message Parent', icon: 'chatbubble-outline', color: '#7c3aed' },
                        { label: 'Lesson Plan', icon: 'book-outline', color: '#f59e0b' },
                    ].map((tool, idx) => (
                        <TouchableOpacity key={idx} style={[styles.toolBtn, { backgroundColor: colors.surface }]}>
                            <View style={[styles.toolIcon, { backgroundColor: tool.color + '15' }]}>
                                <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                            </View>
                            <Text style={[styles.toolLabel, { color: colors.textPrimary }]}>{tool.label}</Text>
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
        fontSize: 22,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
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
    classCard: {
        padding: 20,
        marginBottom: Spacing.lg,
    },
    classHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    classIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    classMeta: {
        marginLeft: 15,
        flex: 1,
    },
    classTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    miniStat: {
        alignItems: 'center',
    },
    miniValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    miniLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
    },
    sectionHeader: {
        marginBottom: Spacing.md,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scheduleCard: {
        padding: 0,
        marginBottom: Spacing.lg,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    timeSlot: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.md,
        backgroundColor: '#f3f4f6',
        width: 80,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    subjContent: {
        flex: 1,
        marginLeft: 16,
    },
    subjTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    subjClass: {
        fontSize: 12,
        marginTop: 2,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    toolsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    toolBtn: {
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
    toolIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    toolLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
});
