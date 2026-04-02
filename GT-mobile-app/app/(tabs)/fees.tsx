import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, Platform, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, endpoints } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

interface Payment {
    _id: string;
    student?: {
        name?: string;
        firstName?: string;
        lastName?: string;
    };
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    status: 'success' | 'pending' | 'failed';
}

interface FeeSummary {
    overview: {
        totalRevenue: number;
        totalTransactions: number;
        successfulTransactions: number;
        pendingTransactions: number;
    };
    dailyIncome: any[];
}

export default function FeesScreen() {
    const [fees, setFees] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<FeeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const fetchFeesData = async () => {
        try {
            const [feesRes, summaryRes] = await Promise.all([
                api(endpoints.fees.list),
                api(endpoints.fees.summary).catch(() => ({
                    overview: { totalRevenue: 0, totalTransactions: 0, successfulTransactions: 0, pendingTransactions: 0 },
                    dailyIncome: []
                }))
            ]);
            setFees(Array.isArray(feesRes) ? feesRes : []);
            setSummary(summaryRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeesData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFeesData();
    };

    if (loading) return <Loading fullScreen message="Loading Fees Data..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Fees & Payments</Text>
            </View>

            <View style={styles.summaryContainer}>
                <Card style={[styles.summaryCard, { backgroundColor: themeColors.primary }] as any}>
                    <Text style={styles.summaryLabel}>Total Revenue</Text>
                    <Text style={styles.summaryValue}>NGN {(summary?.overview?.totalRevenue || 0).toLocaleString()}</Text>
                </Card>
                <Card style={[styles.summaryCard, { backgroundColor: themeColors.secondary }] as any}>
                    <Text style={styles.summaryLabel}>Pending Trans.</Text>
                    <Text style={styles.summaryValue}>{summary?.overview?.pendingTransactions || 0}</Text>
                </Card>
            </View>

            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Recent Transactions</Text>
            <FlatList
                data={fees}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Transactions"
                        message="Recent fee payments will appear here."
                        icon="cash-outline"
                    />
                }
                renderItem={({ item }: { item: Payment }) => {
                    const student = item.student;
                    const fullName = student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Unknown Student';

                    return (
                        <Card style={styles.feeCard}>
                            <View style={styles.feeRow}>
                                <View style={[styles.iconBox, { backgroundColor: '#16a34a15' }]}>
                                    <Ionicons name="receipt" size={20} color="#16a34a" />
                                </View>
                                <View style={styles.feeInfo}>
                                    <Text style={[styles.studentName, { color: themeColors.text }]}>{fullName}</Text>
                                    <Text style={[styles.date, { color: themeColors.textSecondary }]}>
                                        {new Date(item.paymentDate).toLocaleDateString()} • {item.paymentMethod}
                                    </Text>
                                </View>
                                <Text style={[styles.amount, { color: themeColors.primary }]}>
                                    +{item.amount.toLocaleString()}
                                </Text>
                            </View>
                        </Card>
                    );
                }}
            />
        </View>
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
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    summaryCard: {
        width: '48%',
        padding: Spacing.md,
        borderWidth: 0,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    summaryValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    feeCard: {
        marginBottom: Spacing.sm,
        padding: Spacing.md,
    },
    feeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        padding: 10,
        borderRadius: 10,
        marginRight: Spacing.md,
    },
    feeInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '700',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
    },
});
