import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';

export default function AttendanceHistoryScreen() {
    const { colors } = useTheme();

    // Mock history data
    const history = [
        { id: '1', date: '2026-02-23', class: 'JS1 Gold', present: 38, absent: 2, markedBy: 'Mrs. Adebayo' },
        { id: '2', date: '2026-02-23', class: 'JS2 Bronze', present: 42, absent: 0, markedBy: 'Mr. Okoro' },
        { id: '3', date: '2026-02-22', class: 'JS1 Gold', present: 37, absent: 3, markedBy: 'Mrs. Adebayo' },
        { id: '4', date: '2026-02-22', class: 'JS2 Bronze', present: 41, absent: 1, markedBy: 'Mr. Okoro' },
        { id: '5', date: '2026-02-21', class: 'JS1 Gold', present: 39, absent: 1, markedBy: 'Mrs. Adebayo' },
    ];

    const renderItem = ({ item }: { item: typeof history[0] }) => (
        <Card style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View style={styles.dateBox}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                    <Text style={[styles.dateText, { color: colors.textPrimary }]}>{formatDate(item.date)}</Text>
                </View>
                <Badge
                    label={item.absent === 0 ? '100% Present' : `${item.present} Present`}
                    bgColor={item.absent === 0 ? Colors.successLight : Colors.infoLight}
                    color={item.absent === 0 ? Colors.success : Colors.info}
                    size="sm"
                />
            </View>

            <View style={styles.cardBody}>
                <View>
                    <Text style={[styles.className, { color: colors.textPrimary }]}>{item.class}</Text>
                    <Text style={[styles.markedText, { color: colors.textSecondary }]}>By: {item.markedBy}</Text>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statMini}>
                        <Text style={[styles.statNum, { color: Colors.success }]}>{item.present}</Text>
                        <Text style={[styles.statUnit, { color: colors.textMuted }]}>Pres.</Text>
                    </View>
                    <View style={[styles.statSplit, { backgroundColor: colors.divider }]} />
                    <View style={styles.statMini}>
                        <Text style={[styles.statNum, { color: Colors.error }]}>{item.absent}</Text>
                        <Text style={[styles.statUnit, { color: colors.textMuted }]}>Abs.</Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    return (
        <AnimatedScreen>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            Showing attendance logs for all classes in the current term.
                        </Text>
                    </View>
                }
            />
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    listHeader: {
        marginBottom: Spacing.md,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    historyCard: {
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 10,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    className: {
        fontSize: 16,
        fontWeight: '700',
    },
    markedText: {
        fontSize: 12,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statMini: {
        alignItems: 'center',
    },
    statNum: {
        fontSize: 16,
        fontWeight: '800',
    },
    statUnit: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 1,
    },
    statSplit: {
        width: 1,
        height: 24,
    },
});
