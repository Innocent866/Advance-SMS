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

export default function TeacherFormScreen() {
    const router = useRouter();
    const { id, teacherData } = useLocalSearchParams();
    const isEditing = !!id;
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: 'Male',
        qualification: '',
    });

    useEffect(() => {
        if (isEditing && teacherData) {
            try {
                const parsed = JSON.parse(teacherData as string);
                setFormData({
                    firstName: parsed.firstName || '',
                    lastName: parsed.lastName || '',
                    email: parsed.email || '',
                    phoneNumber: parsed.phoneNumber || '',
                    gender: parsed.gender || 'Male',
                    qualification: parsed.qualification || '',
                });
            } catch (error) {
                console.error('Error parsing teacher data:', error);
            }
        }
        setLoading(false);
    }, [id]);

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            Alert.alert('Validation', 'Please fill in all required fields (Name and Email).');
            return;
        }

        setSaving(true);
        try {
            const endpoint = isEditing ? endpoints.users.teachers.detail(id as string) : endpoints.users.teachers.base;
            const method = isEditing ? 'PUT' : 'POST';

            await api(endpoint, {
                method,
                body: JSON.stringify(formData)
            });
            Alert.alert('Success', `Teacher ${isEditing ? 'updated' : 'created'} successfully.`);
            router.back();
        } catch (error) {
            console.error('Error saving teacher:', error);
            Alert.alert('Error', 'Failed to save teacher.');
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
                    {isEditing ? 'Edit Teacher' : 'New Teacher'}
                </Text>
            </View>

            <View style={styles.content}>
                <Card style={styles.formCard}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Personal info</Text>
                    <Input
                        label="First Name"
                        placeholder="e.g. Jane"
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    />
                    <Input
                        label="Last Name"
                        placeholder="e.g. Smith"
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
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Contact & Professional</Text>
                    <Input
                        label="Email Address"
                        placeholder="teacher@school.com"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        label="Phone Number"
                        placeholder="+234..."
                        value={formData.phoneNumber}
                        onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                        keyboardType="phone-pad"
                    />
                    <Input
                        label="Qualification"
                        placeholder="e.g. B.Ed, MSc Mathematics"
                        value={formData.qualification}
                        onChangeText={(text) => setFormData({ ...formData, qualification: text })}
                    />
                </Card>

                {!isEditing && (
                    <Text style={[styles.hintText, { color: themeColors.textSecondary, paddingHorizontal: Spacing.sm }]}>
                        A login account will be automatically created. The teacher will be notified via email if SMTP is configured.
                    </Text>
                )}

                <Button
                    title={saving ? "Saving..." : isEditing ? "Update Profile" : "Register Teacher"}
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
        marginTop: 12,
        textAlign: 'center',
    },
    saveButton: {
        marginTop: Spacing.xl,
        marginBottom: 40,
    },
    selectionLabelRow: {
        marginBottom: 4,
    }
});
