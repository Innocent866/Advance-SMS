import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStudentByIdApi } from '@/api/students.api';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';
import type { Student } from '@/types/student.types';

export default function StudentDetailScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            const data = await getStudentByIdApi(id as string);
            setStudent(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!student) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.textPrimary }}>Student not found</Text>
            </View>
        );
    }

    return (
        <AnimatedScreen>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                    <Avatar name={student.name} size={100} color={Colors.primary} />
                    <Text style={[styles.studentName, { color: colors.textPrimary }]}>{student.name}</Text>
                    <Text style={[styles.studentId, { color: colors.textSecondary }]}>{student.studentId}</Text>
                    <View style={styles.badgeRow}>
                        <Badge
                            label={student.status.toUpperCase()}
                            bgColor={student.status === 'active' ? Colors.successLight : Colors.errorLight}
                            color={student.status === 'active' ? Colors.success : Colors.error}
                        />
                    </View>
                </View>

                <View style={styles.infoGrid}>
                    <Card style={styles.infoCard}>
                        <Ionicons name="school-outline" size={24} color={Colors.primary} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Class</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{student.class} {student.arm}</Text>
                        </View>
                    </Card>
                    <Card style={styles.infoCard}>
                        <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                                {student.dateOfBirth ? formatDate(student.dateOfBirth) : 'N/A'}
                            </Text>
                        </View>
                    </Card>
                    <Card style={styles.infoCard}>
                        <Ionicons name="person-outline" size={24} color={Colors.primary} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Parent Name</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{student.parentName || 'N/A'}</Text>
                        </View>
                    </Card>
                    <Card style={styles.infoCard}>
                        <Ionicons name="call-outline" size={24} color={Colors.primary} />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Parent Phone</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{student.parentPhone || 'N/A'}</Text>
                        </View>
                    </Card>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Performance Overview</Text>
                </View>

                <Card style={styles.performanceCard}>
                    <View style={styles.perfRow}>
                        <View style={styles.perfItem}>
                            <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Average Score</Text>
                            <Text style={[styles.perfValue, { color: Colors.primary }]}>68.5%</Text>
                        </View>
                        <View style={[styles.perfDivider, { backgroundColor: colors.divider }]} />
                        <View style={styles.perfItem}>
                            <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Attendance</Text>
                            <Text style={[styles.perfValue, { color: Colors.secondary }]}>92%</Text>
                        </View>
                    </View>
                    <View style={{ marginTop: Spacing.md }}>
                        <Button
                            title="View Report Card"
                            variant="outline"
                            onPress={() => Alert.alert('Coming Soon', 'PDF Report Viewer will be implemented in the next phase.')}
                        />
                    </View>
                </Card>

                <View style={styles.actions}>
                    <Button
                        title="Edit Student"
                        onPress={() => Alert.alert('Edit', 'Edit profile screen coming soon.')}
                        style={styles.actionBtn}
                    />
                    <Button
                        title="Message Parent"
                        variant="secondary"
                        onPress={() => Alert.alert('Messaging', 'Redirecting to messaging center...')}
                        style={styles.actionBtn}
                    />
                </View>
            </ScrollView>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    studentName: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 12,
    },
    studentId: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 4,
    },
    badgeRow: {
        marginTop: 12,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    infoCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
    },
    infoTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    performanceCard: {
        marginBottom: Spacing.xl,
    },
    perfRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    perfItem: {
        alignItems: 'center',
    },
    perfLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 4,
    },
    perfValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    perfDivider: {
        width: 1,
        height: 40,
    },
    actions: {
        gap: 12,
    },
    actionBtn: {
        width: '100%',
    }
});
