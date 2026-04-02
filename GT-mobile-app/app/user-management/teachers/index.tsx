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

interface Teacher {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status: 'active' | 'inactive';
    subjects: any[];
    classes: any[];
}

export default function TeacherManagementScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTeachers = async () => {
        try {
            const data = await api(endpoints.users.teachers.base);
            const teacherList = Array.isArray(data) ? data : (data.teachers || []);
            setTeachers(teacherList);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            Alert.alert('Error', 'Failed to load teachers.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTeachers();
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Teacher',
            `Are you sure you want to delete ${name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api(endpoints.users.teachers.detail(id), { method: 'DELETE' });
                            Alert.alert('Success', 'Teacher deleted successfully.');
                            fetchTeachers();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete teacher.');
                        }
                    }
                }
            ]
        );
    };

    const toggleStatus = async (teacher: Teacher) => {
        const newStatus = teacher.status === 'active' ? 'inactive' : 'active';
        try {
            await api(endpoints.users.teachers.detail(teacher._id), {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            fetchTeachers();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status.');
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderTeacherCard = ({ item }: { item: Teacher }) => (
        <Card style={styles.teacherCard}>
            <View style={styles.teacherInfo}>
                <View style={styles.mainInfo}>
                    <Text style={[styles.teacherName, { color: themeColors.text }]}>
                        {item.firstName} {item.lastName}
                    </Text>
                    <Text style={[styles.teacherEmail, { color: themeColors.textSecondary }]}>
                        {item.email} • {item.phoneNumber || 'No Phone'}
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statChip, { backgroundColor: themeColors.border + '20' }]}>
                            <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                                {item.classes?.length || 0} Classes
                            </Text>
                        </View>
                        <View style={[styles.statChip, { backgroundColor: themeColors.border + '20' }]}>
                            <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                                {item.subjects?.length || 0} Subjects
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'active' ? '#16a34a' + '20' : '#f59e0b' + '20' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'active' ? '#16a34a' : '#f59e0b' }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => toggleStatus(item)}
                >
                    <Ionicons
                        name={item.status === 'active' ? "pause-circle-outline" : "play-circle-outline"}
                        size={20}
                        color={themeColors.textSecondary}
                    />
                    <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push({
                        pathname: '/user-management/teachers/assign' as any,
                        params: {
                            teacherId: item._id,
                            teacherName: `${item.firstName} ${item.lastName}`
                        }
                    })}
                >
                    <Ionicons name="link-outline" size={20} color={themeColors.primary} />
                    <Text style={[styles.actionLabel, { color: themeColors.primary }]}>Assign</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push({
                        pathname: '/user-management/teachers/form' as any,
                        params: {
                            id: item._id,
                            teacherData: JSON.stringify(item)
                        }
                    })}
                >
                    <Ionicons name="create-outline" size={20} color={themeColors.primary} />
                    <Text style={[styles.actionLabel, { color: themeColors.primary }]}>Edit</Text>
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
    );

    if (loading) return <Loading fullScreen message="Loading Teachers..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: themeColors.text }]}>Teachers</Text>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
                        onPress={() => router.push('/user-management/teachers/form')}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Ionicons name="search" size={20} color={themeColors.textSecondary} />
                    <Input
                        placeholder="Search By Name or Email..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        containerStyle={styles.searchInner}
                    />
                </View>
            </View>

            <FlatList
                data={filteredTeachers}
                keyExtractor={(item) => item._id}
                renderItem={renderTeacherCard}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Teachers Found"
                        message={searchQuery ? "No matches for your search." : "Start by adding teachers to your staff."}
                        icon="people-outline"
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
    teacherCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
    },
    teacherInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mainInfo: {
        flex: 1,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '700',
    },
    teacherEmail: {
        fontSize: 12,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    statChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    statText: {
        fontSize: 10,
        fontWeight: '600',
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
