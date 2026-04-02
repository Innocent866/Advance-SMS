import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, endpoints } from '@/utils/api';

interface Session {
    _id: string;
    name: string;
    isActive: boolean;
    currentTerm?: string;
    terms: { name: string; startDate?: string; endDate?: string }[];
}

export default function AcademicSetupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);

    const fetchSessions = async () => {
        try {
            const data = await api(endpoints.academic.sessions);
            setSessions(Array.isArray(data) ? data : (data.sessions || []));
        } catch (error) {
            console.error('Error fetching sessions:', error);
            Alert.alert('Error', 'Failed to load academic sessions.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSessions();
    };

    const handleActivate = async (sessionId: string, termName: string) => {
        try {
            await api(endpoints.academic.activateSession, {
                method: 'POST',
                body: JSON.stringify({ sessionId, termName })
            });
            Alert.alert('Success', `Activated ${termName} for this session.`);
            fetchSessions();
        } catch (error) {
            console.error('Error activating session:', error);
            Alert.alert('Error', 'Failed to activate session/term.');
        }
    };

    if (loading) return <Loading fullScreen message="Loading Sessions..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Academic Setup</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.actionHeader}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Academic Sessions</Text>
                    <Button
                        title="New Session"
                        size="small"
                        onPress={() => Alert.alert('Coming Soon', 'Manual session creation will be available in the next update.')}
                    />
                </View>

                {sessions.length === 0 ? (
                    <EmptyState
                        title="No Sessions Configured"
                        message="Get started by creating your first academic session."
                        icon="calendar-outline"
                    />
                ) : (
                    sessions.map((session) => (
                        <Card key={session._id} style={styles.sessionCard}>
                            <View style={styles.sessionHeader}>
                                <View>
                                    <View style={styles.nameRow}>
                                        <Text style={[styles.sessionName, { color: themeColors.text }]}>{session.name}</Text>
                                        {session.isActive && (
                                            <View style={styles.activeBadge}>
                                                <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.termInfo, { color: themeColors.textSecondary }]}>
                                        Current: {session.currentTerm || 'None'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={[styles.subTitle, { color: themeColors.textSecondary }]}>Select Term to Activate:</Text>
                            <View style={styles.termsGrid}>
                                {session.terms.map((term, index) => {
                                    const isCurrentTerm = session.isActive && session.currentTerm === term.name;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.termButton,
                                                { borderColor: isCurrentTerm ? themeColors.primary : themeColors.border },
                                                isCurrentTerm && { backgroundColor: themeColors.primary + '10' }
                                            ]}
                                            onPress={() => handleActivate(session._id, term.name)}
                                        >
                                            <Text style={[
                                                styles.termText,
                                                { color: isCurrentTerm ? themeColors.primary : themeColors.text }
                                            ]}>
                                                {term.name}
                                            </Text>
                                            {isCurrentTerm && <Ionicons name="checkmark-circle" size={16} color={themeColors.primary} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: Spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
    },
    content: {
        padding: Spacing.lg,
    },
    actionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sessionCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.md,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sessionName: {
        fontSize: 18,
        fontWeight: '700',
        marginRight: Spacing.sm,
    },
    activeBadge: {
        backgroundColor: '#16a34a',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    termInfo: {
        fontSize: 14,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: Spacing.md,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
    },
    termsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    termButton: {
        width: '48%',
        padding: Spacing.sm,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    termText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
