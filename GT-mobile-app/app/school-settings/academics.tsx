import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, endpoints } from '@/utils/api';

interface ClassLevel {
    _id: string;
    name: string;
    category: 'JSS' | 'SSS';
    arms: { name: string }[];
}

export default function AcademicsManagementScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [classes, setClasses] = useState<ClassLevel[]>([]);
    const [showAddClass, setShowAddClass] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', category: 'JSS' as 'JSS' | 'SSS' });

    const fetchClasses = async () => {
        try {
            const data = await api(endpoints.academic.classes);
            setClasses(Array.isArray(data) ? data : (data.classes || []));
        } catch (error) {
            console.error('Error fetching classes:', error);
            Alert.alert('Error', 'Failed to load classes.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchClasses();
    };

    const handleAddClass = async () => {
        if (!newClass.name) return;
        try {
            await api(endpoints.academic.classes, {
                method: 'POST',
                body: JSON.stringify(newClass)
            });
            setNewClass({ name: '', category: 'JSS' });
            setShowAddClass(false);
            fetchClasses();
        } catch (error) {
            Alert.alert('Error', 'Failed to create class.');
        }
    };

    const handleAddArm = async (classId: string) => {
        Alert.prompt(
            'Add New Arm',
            'Enter the name of the arm (e.g., A, Gold, Blue)',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: async (armName) => {
                        if (!armName) return;
                        try {
                            await api(endpoints.academic.arms, {
                                method: 'POST',
                                body: JSON.stringify({ classId, armName })
                            });
                            fetchClasses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to add arm.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <Loading fullScreen message="Loading Academics..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Academics</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.actionHeader}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Classes & Arms</Text>
                    <Button
                        title={showAddClass ? "Cancel" : "Add Class"}
                        size="small"
                        variant={showAddClass ? "outline" : "primary"}
                        onPress={() => setShowAddClass(!showAddClass)}
                    />
                </View>

                {showAddClass && (
                    <Card style={styles.addCard}>
                        <View style={styles.row}>
                            <View style={{ flex: 2, marginRight: 8 }}>
                                <Input
                                    placeholder="Class Name (e.g. JSS 1)"
                                    value={newClass.name}
                                    onChangeText={(text) => setNewClass({ ...newClass, name: text })}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                                    onPress={() => setNewClass({ ...newClass, category: newClass.category === 'JSS' ? 'SSS' : 'JSS' })}
                                >
                                    <Text style={{ color: themeColors.text }}>{newClass.category}</Text>
                                    <Ionicons name="swap-horizontal" size={14} color={themeColors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Button title="Create Class" onPress={handleAddClass} />
                    </Card>
                )}

                {classes.length === 0 ? (
                    <EmptyState
                        title="No Classes Found"
                        message="Start by adding classes like JSS 1 or SSS 3."
                        icon="layers-outline"
                    />
                ) : (
                    classes.map((item) => (
                        <Card key={item._id} style={styles.classCard}>
                            <View style={styles.classHeader}>
                                <View>
                                    <Text style={[styles.className, { color: themeColors.text }]}>{item.name}</Text>
                                    <Text style={[styles.categoryText, { color: themeColors.textSecondary }]}>{item.category} Category</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleAddArm(item._id)}>
                                    <Ionicons name="add-circle" size={28} color={themeColors.primary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.armsList}>
                                {item.arms.length === 0 ? (
                                    <Text style={[styles.noArms, { color: themeColors.textSecondary }]}>No arms added yet</Text>
                                ) : (
                                    item.arms.map((arm, index) => (
                                        <View key={index} style={[styles.armBadge, { backgroundColor: themeColors.primary + '15' }]}>
                                            <Text style={[styles.armText, { color: themeColors.primary }]}>{arm.name}</Text>
                                        </View>
                                    ))
                                )}
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
    addCard: {
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    toggleBtn: {
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    classCard: {
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    className: {
        fontSize: 18,
        fontWeight: '700',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    armsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.xs,
    },
    armBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    armText: {
        fontSize: 14,
        fontWeight: '700',
    },
    noArms: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});
