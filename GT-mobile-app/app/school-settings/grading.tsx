import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, endpoints } from '@/utils/api';

interface AssessmentComponent {
    name: string;
    maxScore: number;
}

interface GradeScale {
    grade: string;
    minScore: number;
    maxScore: number;
    remark?: string;
}

export default function GradingSystemScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({ session: '', term: '' });
    const [components, setComponents] = useState<AssessmentComponent[]>([
        { name: 'CA 1', maxScore: 20 },
        { name: 'CA 2', maxScore: 20 },
        { name: 'Exam', maxScore: 60 }
    ]);
    const [gradingScale, setGradingScale] = useState<GradeScale[]>([
        { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
        { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
        { grade: 'C', minScore: 50, maxScore: 59, remark: 'Credit' },
        { grade: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
        { grade: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
        { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' }
    ]);

    const fetchData = async () => {
        try {
            // 1. Fetch sessions to find active one
            const sessionsRes = await api(endpoints.academic.sessions);
            const sessions = Array.isArray(sessionsRes) ? sessionsRes : (sessionsRes.sessions || []);
            const activeSession = sessions.find((s: any) => s.isActive);

            if (activeSession) {
                const session = activeSession.name;
                const term = activeSession.currentTerm;
                setSessionInfo({ session, term });

                // 2. Fetch config for active session/term
                const config = await api(`${endpoints.assessment.config}?session=${session}&term=${term}`);
                if (config && config.components) {
                    setComponents(config.components);
                    if (config.gradingScale) setGradingScale(config.gradingScale);
                }
            } else {
                Alert.alert('Configuration Required', 'Please activate an academic session first.');
                router.back();
            }
        } catch (error) {
            console.error('Error fetching grading config:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        const total = components.reduce((sum, c) => sum + Number(c.maxScore), 0);
        if (total !== 100) {
            Alert.alert('Validation Error', `Total Max Score must be 100%. Current total: ${total}%`);
            return;
        }

        setSaving(true);
        try {
            await api(endpoints.assessment.config, {
                method: 'POST',
                body: JSON.stringify({
                    session: sessionInfo.session,
                    term: sessionInfo.term,
                    components,
                    gradingScale
                })
            });
            Alert.alert('Success', 'Grading system updated successfully.');
            router.back();
        } catch (error) {
            console.error('Error saving grading config:', error);
            Alert.alert('Error', 'Failed to save grading system.');
        } finally {
            setSaving(false);
        }
    };

    const updateComponent = (index: number, field: keyof AssessmentComponent, value: any) => {
        const newComponents = [...components];
        newComponents[index] = { ...newComponents[index], [field]: value };
        setComponents(newComponents);
    };

    if (loading) return <Loading fullScreen message="Loading Grading Config..." />;

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Grading System</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.contextText, { color: themeColors.textSecondary }]}>
                    Configuring for: {sessionInfo.session} • {sessionInfo.term}
                </Text>

                <Card style={styles.sectionCard}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Assessment Components</Text>
                    {components.map((comp, index) => (
                        <View key={index} style={styles.componentRow}>
                            <View style={{ flex: 2, marginRight: 8 }}>
                                <Input
                                    label={index === 0 ? "Name" : ""}
                                    value={comp.name}
                                    onChangeText={(text) => updateComponent(index, 'name', text)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label={index === 0 ? "Max %" : ""}
                                    value={comp.maxScore.toString()}
                                    onChangeText={(text) => updateComponent(index, 'maxScore', parseInt(text) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    ))}
                    <Text style={[styles.totalText, { color: themeColors.primary }]}>
                        Total: {components.reduce((sum, c) => sum + Number(c.maxScore), 0)}%
                    </Text>
                </Card>

                <Card style={[styles.sectionCard, { marginTop: Spacing.lg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Grading Scale</Text>
                    <View style={styles.scaleHeader}>
                        <Text style={[styles.scaleHeaderText, { flex: 1, color: themeColors.textSecondary }]}>Grade</Text>
                        <Text style={[styles.scaleHeaderText, { flex: 1, color: themeColors.textSecondary }]}>Min</Text>
                        <Text style={[styles.scaleHeaderText, { flex: 1, color: themeColors.textSecondary }]}>Max</Text>
                        <Text style={[styles.scaleHeaderText, { flex: 2, color: themeColors.textSecondary }]}>Remark</Text>
                    </View>
                    {gradingScale.map((s, index) => (
                        <View key={index} style={styles.scaleRow}>
                            <Text style={[styles.gradeText, { flex: 1, color: themeColors.text }]}>{s.grade}</Text>
                            <Text style={[styles.gradeText, { flex: 1, color: themeColors.text }]}>{s.minScore}</Text>
                            <Text style={[styles.gradeText, { flex: 1, color: themeColors.text }]}>{s.maxScore}</Text>
                            <Text style={[styles.gradeText, { flex: 2, color: themeColors.textSecondary }]}>{s.remark}</Text>
                        </View>
                    ))}
                    <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>
                        Grading scales are currently read-only on mobile. Use the web for detailed range adjustments.
                    </Text>
                </Card>

                <Button
                    title={saving ? "Saving..." : "Save Configuration"}
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                />
            </View>
        </ScrollView>
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
        paddingTop: 0,
    },
    contextText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    sectionCard: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    componentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalText: {
        textAlign: 'right',
        fontSize: 16,
        fontWeight: '800',
        marginTop: Spacing.sm,
    },
    scaleHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 8,
    },
    scaleHeaderText: {
        fontSize: 12,
        fontWeight: '700',
    },
    scaleRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    gradeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    hintText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: Spacing.md,
        textAlign: 'center',
    },
    saveButton: {
        marginTop: Spacing.xl,
        marginBottom: 40,
    },
});
