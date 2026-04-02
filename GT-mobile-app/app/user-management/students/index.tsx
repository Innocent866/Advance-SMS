import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert, RefreshControl, FlatList } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, endpoints } from '@/utils/api';

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    classId: { name: string };
    arm: string;
    status: 'active' | 'suspended' | 'graduated';
}

export default function StudentManagementScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStudents = async () => {
        try {
            const data = await api(endpoints.users.students.base);
            const studentList = Array.isArray(data) ? data : (data.students || []);
            setStudents(studentList);
        } catch (error) {
            console.error('Error fetching students:', error);
            Alert.alert('Error', 'Failed to load students.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Student',
            `Are you sure you want to delete ${name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api(endpoints.users.students.detail(id), { method: 'DELETE' });
                            Alert.alert('Success', 'Student deleted successfully.');
                            fetchStudents();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete student.');
                        }
                    }
                }
            ]
        );
    };

    const toggleStatus = async (student: Student) => {
        const newStatus = student.status === 'active' ? 'suspended' : 'active';
        try {
            await api(endpoints.users.students.detail(student._id), {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            fetchStudents();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status.');
        }
    };

    const filteredStudents = students.filter(s => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) ||
            s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderStudentCard = ({ item }: { item: Student }) => (
        <TouchableOpacity
            onPress={() => router.push(`/user-management/students/${item._id}` as any)}
            activeOpacity={0.7}
        >
            <Card style={styles.studentCard}>
                <View style={styles.studentInfo}>
                    <View style={styles.mainInfo}>
                        <Text style={[styles.studentName, { color: themeColors.text }]}>
                            {item.firstName} {item.lastName}
                        </Text>
                        <Text style={[styles.studentId, { color: themeColors.textSecondary }]}>
                            ID: {item.studentId} • {item.classId?.name || 'N/A'} {item.arm || ''}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'active' ? '#16a34a' + '20' : '#dc2626' + '20' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.status === 'active' ? '#16a34a' : '#dc2626' }
                        ]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push({
                            pathname: '/user-management/students/promote',
                            params: {
                                studentIds: JSON.stringify([item._id]),
                                studentNames: `${item.firstName} ${item.lastName}`
                            }
                        } as any)}
                    >
                        <Ionicons name="swap-horizontal-outline" size={20} color={themeColors.primary} />
                        <Text style={[styles.actionLabel, { color: themeColors.primary }]}>Transfer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push({
                            pathname: '/user-management/students/form' as any,
                            params: {
                                id: item._id,
                                studentData: JSON.stringify(item)
                            }
                        })}
                    >
                        <Ionicons name="create-outline" size={20} color={themeColors.textSecondary} />
                        <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDelete(item._id, `${item.firstName} ${item.lastName}`)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#dc2626" />
                        <Text style={[styles.actionLabel, { color: "#dc2626" }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </TouchableOpacity>
    );

    if (loading) return <Loading fullScreen message="Loading Students..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: themeColors.text }]}>Students</Text>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
                        onPress={() => router.push('/user-management/students/form' as any)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Ionicons name="search" size={20} color={themeColors.textSecondary} />
                    <Input
                        placeholder="Search By Name or ID..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        containerStyle={styles.searchInner}
                    />
                </View>
            </View>

            <FlatList
                data={filteredStudents}
                keyExtractor={(item) => item._id}
                renderItem={renderStudentCard}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Students Found"
                        message={searchQuery ? "No matches for your search." : "Start by adding students to your database."}
                        icon="school-outline"
                    />
                }
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    backButton: {
        marginRight: Spacing.sm,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        flex: 1,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInner: {
        flex: 1,
        marginBottom: 0,
        borderWidth: 0,
    },
    searchInput: {
        borderWidth: 0,
        height: 44,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
    studentCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
    },
    studentInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mainInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
    },
    studentId: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: Spacing.md,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    },
});
