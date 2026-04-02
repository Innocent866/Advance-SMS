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

export default function PromotionScreen() {
    const router = useRouter();
    const { studentIds, studentNames } = useLocalSearchParams();
    const parsedStudentIds = JSON.parse(studentIds as string || '[]');

    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);

    const [selection, setSelection] = useState({
        newClassId: '',
        newLevel: 'JSS',
        newArm: ''
    });

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await api(endpoints.academic.classes);
                setClasses(Array.isArray(data) ? data : (data.classes || []));
            } catch (error) {
                console.error('Error fetching classes:', error);
                Alert.alert('Error', 'Failed to load classes.');
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const handlePromote = async () => {
        if (!selection.newClassId || !selection.newLevel) {
            Alert.alert('Validation', 'Please select the target Class and Level.');
            return;
        }

        setSaving(true);
        try {
            await api(endpoints.users.students.promote, {
                method: 'POST',
                body: JSON.stringify({
                    studentIds: parsedStudentIds,
                    ...selection
                })
            });
            Alert.alert('Success', `Students promoted to ${classes.find(c => c._id === selection.newClassId)?.name} successfully.`);
            router.back();
        } catch (error) {
            console.error('Error promoting students:', error);
            Alert.alert('Error', 'Failed to promote students.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading fullScreen message="Loading Setup..." />;

    const selectedClass = classes.find(c => c._id === selection.newClassId);

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Promotion / Transfer</Text>
            </View>

            <View style={styles.content}>
                <Card style={styles.contextCard}>
                    <Ionicons name="people-outline" size={24} color={themeColors.primary} />
                    <View style={styles.contextInfo}>
                        <Text style={[styles.contextTitle, { color: themeColors.text }]}>Selected Students</Text>
                        <Text style={[styles.contextValue, { color: themeColors.textSecondary }]} numberOfLines={2}>
                            {studentNames || `${parsedStudentIds.length} students selected`}
                        </Text>
                    </View>
                </Card>

                <View style={styles.formSection}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>1. Target Academic Level</Text>
                    <View style={styles.chipRow}>
                        {['JSS', 'SSS'].map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.chip,
                                    { borderColor: themeColors.border },
                                    selection.newLevel === level && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                ]}
                                onPress={() => setSelection({ ...selection, newLevel: level })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: selection.newLevel === level ? '#fff' : themeColors.text }
                                ]}>{level}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>2. Target Class</Text>
                    <View style={styles.chipGrid}>
                        {classes.filter(c => c.category === selection.newLevel).map((c) => (
                            <TouchableOpacity
                                key={c._id}
                                style={[
                                    styles.chip,
                                    { borderColor: themeColors.border },
                                    selection.newClassId === c._id && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                ]}
                                onPress={() => setSelection({ ...selection, newClassId: c._id, newArm: '' })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: selection.newClassId === c._id ? '#fff' : themeColors.text }
                                ]}>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {selectedClass && selectedClass.arms?.length > 0 && (
                    <View style={styles.formSection}>
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>3. Target Arm (Optional)</Text>
                        <View style={styles.chipGrid}>
                            {selectedClass.arms.map((arm: any, idx: number) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.chip,
                                        { borderColor: themeColors.border },
                                        selection.newArm === arm.name && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                    ]}
                                    onPress={() => setSelection({ ...selection, newArm: arm.name })}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        { color: selection.newArm === arm.name ? '#fff' : themeColors.text }
                                    ]}>{arm.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.warningBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#f59e0b" />
                    <Text style={styles.warningText}>
                        This action will update the current class of the selected students. Previous performance records will be kept in their history.
                    </Text>
                </View>

                <Button
                    title={saving ? "Processing..." : "Carry Out Promotion"}
                    onPress={handlePromote}
                    loading={saving}
                    style={styles.actionBtn}
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
    contextCard: {
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    contextInfo: {
        marginLeft: 12,
        flex: 1,
    },
    contextTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    contextValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    formSection: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: Spacing.md,
    },
    chipRow: {
        flexDirection: 'row',
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        marginRight: 10,
        marginBottom: 10,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '700',
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 12,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#92400e',
        marginLeft: 8,
        lineHeight: 18,
    },
    actionBtn: {
        marginBottom: 50,
    },
});
