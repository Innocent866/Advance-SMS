import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api, endpoints } from '@/utils/api';

interface ClassLevel {
    _id: string;
    name: string;
    category: string;
}

export default function StudentFormScreen() {
    const router = useRouter();
    const { id, studentData } = useLocalSearchParams();
    const isEditing = !!id;
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState<ClassLevel[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'Male',
        studentId: '',
        classId: '',
        level: 'JSS',
        arm: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classesRes = await api(endpoints.academic.classes);
                setClasses(Array.isArray(classesRes) ? classesRes : (classesRes.classes || []));

                if (isEditing && studentData) {
                    const parsed = JSON.parse(studentData as string);
                    setFormData({
                        firstName: parsed.firstName || '',
                        lastName: parsed.lastName || '',
                        email: parsed.email || '',
                        gender: parsed.gender || 'Male',
                        studentId: parsed.studentId || '',
                        classId: parsed.classId?._id || parsed.classId || '',
                        level: parsed.level || 'JSS',
                        arm: parsed.arm || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching student form data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName || !formData.studentId || !formData.classId) {
            Alert.alert('Validation', 'Please fill in all required fields.');
            return;
        }

        setSaving(true);
        try {
            const endpoint = isEditing ? endpoints.users.students.detail(id as string) : endpoints.users.students.base;
            const method = isEditing ? 'PUT' : 'POST';

            await api(endpoint, {
                method,
                body: JSON.stringify(formData)
            });
            Alert.alert('Success', `Student ${isEditing ? 'updated' : 'created'} successfully.`);
            router.back();
        } catch (error) {
            console.error('Error saving student:', error);
            Alert.alert('Error', 'Failed to save student.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading fullScreen message="Loading..." />;

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>
                    {isEditing ? 'Edit Student' : 'New Student'}
                </Text>
            </View>

            <View style={styles.content}>
                <Card style={styles.formCard}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Personal info</Text>
                    <Input
                        label="First Name"
                        placeholder="e.g. John"
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    />
                    <Input
                        label="Last Name"
                        placeholder="e.g. Doe"
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    />
                    <View style={styles.selectionLabelRow}>
                        <Text style={[styles.selectionLabel, { color: themeColors.textSecondary }]}>Gender</Text>
                    </View>
                    <View style={styles.selectionRow}>
                        {['Male', 'Female', 'Other'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.selectionChip,
                                    { borderColor: themeColors.border },
                                    formData.gender === g && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                ]}
                                onPress={() => setFormData({ ...formData, gender: g })}
                            >
                                <Text style={[
                                    styles.selectionText,
                                    { color: formData.gender === g ? '#fff' : themeColors.text }
                                ]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Card style={[styles.formCard, { marginTop: Spacing.md }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Academic info</Text>
                    <Input
                        label="Admission Number / Student ID"
                        placeholder="e.g. STU-001"
                        value={formData.studentId}
                        onChangeText={(text) => setFormData({ ...formData, studentId: text })}
                    />

                    <Text style={[styles.selectionLabel, { color: themeColors.textSecondary, marginBottom: 8 }]}>Class Level</Text>
                    <View style={styles.selectionRow}>
                        {classes.map((c) => (
                            <TouchableOpacity
                                key={c._id}
                                style={[
                                    styles.selectionChip,
                                    { borderColor: themeColors.border, marginBottom: 8 },
                                    formData.classId === c._id && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                ]}
                                onPress={() => setFormData({ ...formData, classId: c._id, level: c.category as 'JSS' | 'SSS' })}
                            >
                                <Text style={[
                                    styles.selectionText,
                                    { color: formData.classId === c._id ? '#fff' : themeColors.text }
                                ]}>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Input
                        label="Arm (Optional)"
                        placeholder="e.g. A, Gold, Blue"
                        value={formData.arm}
                        onChangeText={(text) => setFormData({ ...formData, arm: text })}
                    />
                </Card>

                <Card style={[styles.formCard, { marginTop: Spacing.md }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Auth Info</Text>
                    <Input
                        label="Email (Optional)"
                        placeholder="student@school.com"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    {!isEditing && (
                        <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>
                            Default student password will be applied from school settings.
                        </Text>
                    )}
                </Card>

                <Button
                    title={saving ? "Saving..." : isEditing ? "Update Student" : "Register Student"}
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
    formCard: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
    },
    selectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    selectionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.md,
    },
    selectionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    selectionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    hintText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    saveButton: {
        marginTop: Spacing.xl,
        marginBottom: 40,
    },
    selectionLabelRow: {
        marginBottom: 4,
    }
});
