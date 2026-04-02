import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, Platform } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, endpoints } from '@/utils/api';

export default function ResultsScreen() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const fetchResults = async () => {
        try {
            const response = await api(endpoints.results.list);
            setResults(response.results || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchResults();
    };

    if (loading) return <Loading fullScreen message="Loading Results..." />;

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return '#16a34a';
            case 'B': return '#3b82f6';
            case 'C': return '#f59e0b';
            case 'D': return '#f97316';
            default: return '#ef4444';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Academic Results</Text>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Results Yet"
                        message="Student grades and scores will appear here after entry."
                        icon="analytics-outline"
                    />
                }
                renderItem={({ item }: any) => (
                    <Card style={styles.resultCard}>
                        <View style={styles.row}>
                            <View style={styles.mainInfo}>
                                <Text style={[styles.subject, { color: themeColors.text }]}>{item.subject?.name || 'Subject'}</Text>
                                <Text style={[styles.studentName, { color: themeColors.textSecondary }]}>
                                    {item.student?.name || 'Unknown Student'}
                                </Text>
                                <Text style={[styles.term, { color: themeColors.primary }]}>
                                    {item.term} • {item.examType}
                                </Text>
                            </View>
                            <View style={[styles.gradeCircle, { borderColor: getGradeColor(item.grade) }]}>
                                <Text style={[styles.gradeText, { color: getGradeColor(item.grade) }]}>{item.grade}</Text>
                                <Text style={[styles.scoreText, { color: themeColors.textSecondary }]}>{item.score}%</Text>
                            </View>
                        </View>
                    </Card>
                )}
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
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    resultCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainInfo: {
        flex: 1,
    },
    subject: {
        fontSize: 18,
        fontWeight: '700',
    },
    studentName: {
        fontSize: 14,
        marginTop: 2,
    },
    term: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    gradeCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeText: {
        fontSize: 20,
        fontWeight: '800',
    },
    scoreText: {
        fontSize: 10,
        fontWeight: '600',
    }
});
