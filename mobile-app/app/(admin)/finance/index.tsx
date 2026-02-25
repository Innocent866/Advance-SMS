import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';

const { width } = Dimensions.get('window');

export default function AdminFinanceScreen() {
    const { colors } = useTheme();

    const stats = [
        { label: 'Expected', value: 5800000, color: Colors.primary, icon: 'calculator-outline' },
        { label: 'Collected', value: 4250000, color: Colors.success, icon: 'cash-outline' },
        { label: 'Outstanding', value: 1550000, color: Colors.error, icon: 'alert-circle-outline' },
    ];

    const recentPayments = [
        { id: '1', student: 'Chidi Okafor', class: 'JS1 Gold', amount: 45000, date: '2026-02-23', status: 'Paid' },
        { id: '2', student: 'Fatima Musa', class: 'SS2 Diamond', amount: 120000, date: '2026-02-23', status: 'Paid' },
        { id: '3', student: 'Emeka Obi', class: 'JS3 Bronze', amount: 35000, date: '2026-02-22', status: 'Part-paid' },
        { id: '4', student: 'Sarah Adams', class: 'JS1 Silver', amount: 45000, date: '2026-02-22', status: 'Paid' },
    ];

    return (
        <AnimatedScreen style={{ paddingTop: 60 }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Fee Management</Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="filter-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    {stats.map((stat, idx) => (
                        <Card key={idx} style={[styles.statCard, { width: (width - Spacing.lg * 2 - 20) / 3 }]}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                {formatCurrency(stat.value).replace('₦', '')}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                        </Card>
                    ))}
                </View>

                <Card style={styles.totalCollectedCard}>
                    <Text style={[styles.cardTag, { color: colors.textSecondary }]}>Total Collection Rate</Text>
                    <Text style={[styles.totalValue, { color: Colors.primary }]}>73.3%</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '73.3%', backgroundColor: Colors.primary }]} />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={[styles.progressText, { color: colors.textMuted }]}>₦4.25M Collected</Text>
                        <Text style={[styles.progressText, { color: colors.textMuted }]}>₦5.8M Goal</Text>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Payments</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>Broadsheet</Text>
                    </TouchableOpacity>
                </View>

                {recentPayments.map((payment, idx) => (
                    <Card key={idx} style={styles.paymentCard}>
                        <View style={styles.paymentMain}>
                            <View>
                                <Text style={[styles.studentName, { color: colors.textPrimary }]}>{payment.student}</Text>
                                <Text style={[styles.paymentMeta, { color: colors.textSecondary }]}>
                                    {payment.class} • {payment.date}
                                </Text>
                            </View>
                            <Text style={[styles.amountText, { color: colors.textPrimary }]}>
                                {formatCurrency(payment.amount)}
                            </Text>
                        </View>
                        <View style={styles.paymentFooter}>
                            <Badge
                                label={payment.status.toUpperCase()}
                                bgColor={payment.status === 'Paid' ? Colors.successLight : Colors.warningLight}
                                color={payment.status === 'Paid' ? Colors.success : Colors.warning}
                                size="sm"
                            />
                            <TouchableOpacity>
                                <Text style={[styles.receiptLink, { color: Colors.primary }]}>View Receipt</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))}

                <View style={styles.actionButtons}>
                    <Button
                        title="Broadcast Fee Reminder"
                        variant="secondary"
                        onPress={() => Alert.alert('Broadcast', 'Sending SMS and Push notifications to parents with outstanding fees...')}
                    />
                    <Button
                        title="Generate Finance Report"
                        variant="outline"
                        onPress={() => Alert.alert('Report', 'Preparing termly financial summary PDF...')}
                    />
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
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    filterBtn: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: Spacing.lg,
    },
    statCard: {
        padding: 10,
        alignItems: 'center',
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    totalCollectedCard: {
        marginBottom: Spacing.xl,
        padding: 20,
        alignItems: 'center',
    },
    cardTag: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 16,
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    progressText: {
        fontSize: 11,
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
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
    paymentCard: {
        marginBottom: 12,
        padding: 16,
    },
    paymentMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '700',
    },
    paymentMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '800',
    },
    paymentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    receiptLink: {
        fontSize: 13,
        fontWeight: '700',
    },
    actionButtons: {
        marginTop: Spacing.lg,
        gap: 12,
    },
});
