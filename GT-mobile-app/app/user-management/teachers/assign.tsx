import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api, endpoints } from '@/utils/api';

interface ClassLevel {
    _id: string;
    name: string;
    arms: { name: string }[];
}

interface Subject {
    _id: string;
    name: string;
    code: string;
}

export default function TeacherAssignmentScreen() {
    const router = useRouter();
    const { teacherId, teacherName } = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState<ClassLevel[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [selection, setSelection] = useState({
        classId: '',
        arm: '',
        subjectId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesRes, subjectsRes] = await Promise.all([
                    api(endpoints.academic.classes),
                    api(endpoints.academic.subjects)
                ]);
                setClasses(Array.isArray(classesRes) ? classesRes : (classesRes.classes || []));
                setSubjects(Array.isArray(subjectsRes) ? subjectsRes : (subjectsRes.subjects || []));
            } catch (error) {
                console.error('Error fetching assignment data:', error);
                Alert.alert('Error', 'Failed to load classes or subjects.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selection.classId || !selection.subjectId) {
            Alert.alert('Validation', 'Please select a class and a subject.');
            return;
        }

        setSaving(true);
        try {
            await api(endpoints.users.assignTeacher, {
                method: 'POST',
                body: JSON.stringify({
                    teacherId,
                    ...selection
                })
            });
            Alert.alert('Success', 'Assignment added successfully.');
            router.back();
        } catch (error) {
            console.error('Error assigning teacher:', error);
            Alert.alert('Error', 'Failed to add assignment.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading fullScreen message="Loading Data..." />;

    const selectedClass = classes.find(c => c._id === selection.classId);

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Assign Teacher</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.contextText, { color: themeColors.textSecondary }]}>
                    Adding assignment for: {teacherName}
                </Text>

                <Card style={styles.sectionCard}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>1. Select Class</Text>
                    <View style={styles.chipGrid}>
                        {classes.map((c) => (
                            <TouchableOpacity
                                key={c._id}
                                style={[
                                    styles.chip,
                                    { borderColor: themeColors.border },
                                    selection.classId === c._id && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                ]}
                                onPress={() => setSelection({ ...selection, classId: c._id, arm: '' })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: selection.classId === c._id ? '#fff' : themeColors.text }
                                ]}>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {selectedClass && (
                    <Card style={[styles.sectionCard, { marginTop: Spacing.md }]}>
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>2. Select Arm (Optional)</Text>
                        <View style={styles.chipGrid}>
                            {selectedClass.arms.map((a, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.chip,
                                        { borderColor: themeColors.border },
                                        selection.arm === a.name && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                    ]}
                                    onPress={() => setSelection({ ...selection, arm: a.name })}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: selection.arm === a.name ? '#fff' : themeColors.text }
                                    ]}>{a.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>
                )}

                <Card style={[styles.sectionCard, { marginTop: Spacing.md }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>3. Select Subject</Text>
                    <View style={styles.chipGrid}>
                        {subjects.map((s) => (
                            <TouchableOpacity
                                key={s._id}
                                style={[
                                    styles.chip,
                                    { borderColor: themeColors.border },
                                    selection.subjectId === s._id && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                ]}
                                onPress={() => setSelection({ ...selection, subjectId: s._id })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: selection.subjectId === s._id ? '#fff' : themeColors.text }
                                ]}>{s.name} ({s.code})</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Button
                    title={saving ? "Saving Assignment..." : "Confirm Assignment"}
                    onPress={handleAssign}
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
        fontSize: 14,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        marginTop: Spacing.xl,
        marginBottom: 40,
    },
});
