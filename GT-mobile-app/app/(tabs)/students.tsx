import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, Platform, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, endpoints } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

interface Student {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    classId?: { name: string };
    class?: string; // Fallback for teacher-mapped data
    studentId?: string;
    admissionNumber?: string; // Fallback for teacher-mapped data
    status: 'active' | 'inactive' | 'suspended' | 'graduated';
    [key: string]: any;
}

export default function StudentsScreen() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const fetchStudents = async () => {
        try {
            const response = await api(endpoints.students.list);
            const studentsData = Array.isArray(response) ? response : (response.students || []);
            setStudents(studentsData);
            setFilteredStudents(studentsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const filtered = students.filter((s: Student) => {
            const fullName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
            const searchLower = search.toLowerCase();
            const studentId = s.studentId || s.admissionNumber || '';

            return fullName.toLowerCase().includes(searchLower) ||
                studentId.toLowerCase().includes(searchLower);
        });
        setFilteredStudents(filtered);
    }, [search, students]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudents();
    };

    if (loading) return <Loading fullScreen message="Loading Students..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Students</Text>
                <Input
                    placeholder="Search by name or admission number..."
                    value={search}
                    onChangeText={setSearch}
                    containerStyle={styles.searchContainer}
                    leftIcon={<Ionicons name="search" size={20} color={themeColors.textSecondary} />}
                />
            </View>

            <FlatList
                data={filteredStudents}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Students Found"
                        message="We couldn't find any students matching your criteria."
                        icon="people-outline"
                    />
                }
                renderItem={({ item }: { item: Student }) => {
                    const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown';
                    const className = item.classId?.name || item.class || 'No Class';
                    const studentId = item.studentId || item.admissionNumber || 'N/A';

                    return (
                        <Card style={styles.studentCard}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.avatar, { backgroundColor: themeColors.primary + '20' }]}>
                                    <Text style={[styles.avatarText, { color: themeColors.primary }]}>
                                        {fullName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.studentInfo}>
                                    <Text style={[styles.name, { color: themeColors.text }]}>{fullName}</Text>
                                    <Text style={[styles.details, { color: themeColors.textSecondary }]}>
                                        {className} • {studentId}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: item.status === 'active' ? '#16a34a20' : '#ef444420' } as ViewStyle
                                ]}>
                                    <Text style={[styles.statusText, { color: item.status === 'active' ? '#16a34a' : '#ef4444' }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    );
                }}
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
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: Spacing.md,
    },
    searchContainer: {
        marginBottom: 0,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: 0,
        paddingBottom: 100,
    },
    studentCard: {
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    studentInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    details: {
        fontSize: 13,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
