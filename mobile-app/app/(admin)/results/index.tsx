import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function AdminResultsSummaryScreen() {
    const { colors } = useTheme();
    const [selectedTerm, setSelectedTerm] = useState('First');

    const terms = ['First', 'Second', 'Third'];

    const resultStats = [
        { class: 'JS1 Gold', published: 38, pending: 2, avg: 72.4 },
        { class: 'JS1 Silver', published: 35, pending: 5, avg: 65.8 },
        { class: 'JS2 Bronze', published: 42, pending: 0, avg: 78.1 },
        { class: 'SS1 Diamond', published: 26, pending: 4, avg: 70.2 },
    ];

    return (
        <AnimatedScreen style={{ paddingTop: 60 }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Academic Results</Text>
                <TouchableOpacity style={styles.configBtn}>
                    <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.termScroll}>
                    {terms.map(term => (
                        <TouchableOpacity
                            key={term}
                            onPress={() => setSelectedTerm(term)}
                            style={[
                                styles.termBtn,
                                {
                                    backgroundColor: selectedTerm === term ? Colors.primary : colors.surface,
                                    borderColor: selectedTerm === term ? Colors.primary : colors.border
                                }
                            ]}
                        >
                            <Text style={[styles.termText, { color: selectedTerm === term ? '#fff' : colors.textPrimary }]}>
                                {term} Term
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Card style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>General Overview</Text>
                        <Badge label="2025/2026 Session" size="sm" bgColor={Colors.primaryLight} color={Colors.primary} />
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>88%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Published</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>12%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>71.6%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Score</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Class-wise Status</Text>
                </View>

                {resultStats.map((item, idx) => (
                    <Card key={idx} style={styles.classCard}>
                        <View style={styles.classInfo}>
                            <Text style={[styles.className, { color: colors.textPrimary }]}>{item.class}</Text>
                            <View style={styles.statusRow}>
                                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                                    {item.published} Published • {item.pending} Pending
                                </Text>
                            </View>
                        </View>
                        <View style={styles.avgBox}>
                            <Text style={[styles.avgValue, { color: Colors.primary }]}>{item.avg}%</Text>
                            <Text style={[styles.avgLabel, { color: colors.textMuted }]}>Average</Text>
                        </View>
                        <TouchableOpacity style={styles.detailBtn}>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    </Card>
                ))}

                <View style={styles.quickActions}>
                    <Button
                        title="Publish All Results"
                        onPress={() => Alert.alert('Action', 'This will make all results visible to parents.')}
                        style={styles.mainAction}
                    />
                    <Button
                        title="Download Summary (PDF)"
                        variant="outline"
                        onPress={() => Alert.alert('Export', 'Generating school-wide result broadsheet...')}
                        style={styles.mainAction}
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
    configBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        marginBottom: Spacing.md,
    },
    termScroll: {
        paddingHorizontal: Spacing.lg,
        gap: 12,
    },
    termBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    termText: {
        fontSize: 13,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    summaryCard: {
        marginBottom: Spacing.lg,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    statBox: {
        alignItems: 'center',
    },
    statNum: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
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
    statusRow: {
        marginTop: 4,
    },
    statusText: {
        fontSize: 12,
    },
    avgBox: {
        alignItems: 'center',
        marginRight: 10,
    },
    avgValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    avgLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    detailBtn: {
        padding: 4,
    },
    quickActions: {
        marginTop: Spacing.lg,
        gap: 12,
    },
    mainAction: {
        width: '100%',
    }
});
