import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius, Shadow } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AttendanceSummaryScreen() {
    const { colors } = useTheme();

    // Mock data for attendance overview
    const stats = [
        { label: 'Present Today', value: '1,180', color: Colors.success, icon: 'checkmark-circle' },
        { label: 'Absent Today', value: '68', color: Colors.error, icon: 'close-circle' },
        { label: 'Avg. Rate', value: '94.5%', color: Colors.primary, icon: 'trending-up' },
    ];

    const classData = [
        { name: 'JS1 Gold', present: 38, total: 40, rate: 95 },
        { name: 'JS1 Silver', present: 35, total: 40, rate: 87.5 },
        { name: 'JS2 Bronze', present: 42, total: 42, rate: 100 },
        { name: 'SS1 Diamond', present: 28, total: 30, rate: 93.3 },
    ];

    return (
        <AnimatedScreen style={{ paddingTop: 60 }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Attendance Overview</Text>
                <TouchableOpacity
                    style={[styles.historyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push('/(admin)/attendance/history')}
                >
                    <Ionicons name="time-outline" size={20} color={Colors.primary} />
                    <Text style={styles.historyBtnText}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.statsContainer}>
                    {stats.map((stat, idx) => (
                        <Card key={idx} style={[styles.statCard, { width: (width - Spacing.lg * 2 - 24) / 3 }]}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                        </Card>
                    ))}
                </View>

                <Card style={styles.chartCard}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Weekly Trends</Text>
                    <View style={styles.chartPlaceholder}>
                        {/* Visual placeholder for a bar chart */}
                        {[60, 85, 95, 90, 94].map((h, i) => (
                            <View key={i} style={styles.chartBarContainer}>
                                <View style={[styles.chartBar, { height: h, backgroundColor: i === 4 ? Colors.primary : Colors.primary + '40' }]} />
                                <Text style={[styles.chartDay, { color: colors.textMuted }]}>{['M', 'T', 'W', 'T', 'F'][i]}</Text>
                            </View>
                        ))}
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Class Attendance</Text>
                </View>

                {classData.map((item, idx) => (
                    <Card key={idx} style={styles.classCard}>
                        <View style={styles.classInfo}>
                            <Text style={[styles.className, { color: colors.textPrimary }]}>{item.name}</Text>
                            <Text style={[styles.classDetails, { color: colors.textSecondary }]}>
                                {item.present} / {item.total} Students
                            </Text>
                        </View>
                        <View style={styles.rateContainer}>
                            <Text style={[styles.rateText, { color: item.rate >= 90 ? Colors.success : Colors.warning }]}>
                                {item.rate}%
                            </Text>
                            <View style={styles.rateBarBg}>
                                <View style={[styles.rateBarFill, { width: `${item.rate}%`, backgroundColor: item.rate >= 90 ? Colors.success : Colors.warning }]} />
                            </View>
                        </View>
                    </Card>
                ))}

                <Button
                    title="Mark New Attendance"
                    onPress={() => Alert.alert('Attendance', 'Feature to mark attendance manually from admin role is coming soon.')}
                    style={styles.mainAction}
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
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Radius.full,
        borderWidth: 1,
        gap: 6,
    },
    historyBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: Spacing.lg,
    },
    statCard: {
        padding: 12,
        alignItems: 'center',
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 2,
    },
    chartCard: {
        marginBottom: Spacing.lg,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: Spacing.lg,
    },
    chartPlaceholder: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 120,
        paddingBottom: 20,
    },
    chartBarContainer: {
        alignItems: 'center',
        gap: 8,
    },
    chartBar: {
        width: 24,
        borderRadius: 6,
    },
    chartDay: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    classCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginBottom: 12,
    },
    classInfo: {
        flex: 1,
    },
    className: {
        fontSize: 15,
        fontWeight: '700',
    },
    classDetails: {
        fontSize: 12,
        marginTop: 2,
    },
    rateContainer: {
        alignItems: 'flex-end',
        width: 100,
    },
    rateText: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    rateBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
    },
    rateBarFill: {
        height: '100%',
    },
    mainAction: {
        marginTop: Spacing.lg,
    }
});
