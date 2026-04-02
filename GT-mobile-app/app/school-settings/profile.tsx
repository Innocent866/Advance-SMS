import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, endpoints } from '@/utils/api';

export default function SchoolProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactEmail: '',
        branding: {
            primaryColor: '#16a34a',
            secondaryColor: '#f59e0b'
        }
    });

    const fetchSchoolData = async () => {
        try {
            const data = await api(endpoints.school.get);
            setFormData({
                name: data.name || '',
                address: data.address || '',
                contactEmail: data.contactEmail || '',
                branding: {
                    primaryColor: data.branding?.primaryColor || '#16a34a',
                    secondaryColor: data.branding?.secondaryColor || '#f59e0b'
                }
            });
        } catch (error) {
            console.error('Error fetching school data:', error);
            Alert.alert('Error', 'Failed to load school profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolData();
    }, []);

    const handleSave = async () => {
        if (!formData.name || !formData.contactEmail) {
            Alert.alert('Validation Error', 'School name and contact email are required.');
            return;
        }

        setSaving(true);
        try {
            await api(endpoints.school.update, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            Alert.alert('Success', 'School profile updated successfully.');
            router.back();
        } catch (error) {
            console.error('Error updating school profile:', error);
            Alert.alert('Error', 'Failed to update school profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading fullScreen message="Loading School Profile..." />;

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>School Profile</Text>
            </View>

            <View style={styles.content}>
                <Card style={styles.formCard}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Basic Information</Text>

                    <Input
                        label="School Name"
                        placeholder="Enter school name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />

                    <Input
                        label="Address"
                        placeholder="Enter school address"
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        multiline
                        numberOfLines={3}
                    />

                    <Input
                        label="Contact Email"
                        placeholder="Enter contact email"
                        value={formData.contactEmail}
                        onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </Card>

                <Card style={[styles.formCard, { marginTop: Spacing.lg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Branding Colors</Text>

                    <View style={styles.colorRow}>
                        <View style={styles.colorInputWrapper}>
                            <Input
                                label="Primary Color"
                                placeholder="#000000"
                                value={formData.branding.primaryColor}
                                onChangeText={(text) => setFormData({
                                    ...formData,
                                    branding: { ...formData.branding, primaryColor: text }
                                })}
                            />
                            <View style={[styles.colorPreview, { backgroundColor: formData.branding.primaryColor }]} />
                        </View>

                        <View style={styles.colorInputWrapper}>
                            <Input
                                label="Secondary Color"
                                placeholder="#000000"
                                value={formData.branding.secondaryColor}
                                onChangeText={(text) => setFormData({
                                    ...formData,
                                    branding: { ...formData.branding, secondaryColor: text }
                                })}
                            />
                            <View style={[styles.colorPreview, { backgroundColor: formData.branding.secondaryColor }]} />
                        </View>
                    </View>
                </Card>

                <Button
                    title={saving ? "Saving..." : "Save Changes"}
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
    },
    formCard: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    colorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    colorInputWrapper: {
        width: '48%',
        position: 'relative',
    },
    colorPreview: {
        position: 'absolute',
        right: 12,
        top: 38,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        marginTop: Spacing.xl,
        marginBottom: 40,
    },
});
