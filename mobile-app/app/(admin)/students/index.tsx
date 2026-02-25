import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getStudentsApi } from '@/api/students.api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';
import type { Student } from '@/types/student.types';

export default function StudentsListScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        if (!user?.schoolId) return;
        try {
            setLoading(true);
            const data = await getStudentsApi(user.schoolId);
            setStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase())
    );

    const renderStudent = ({ item }: { item: Student }) => (
        <TouchableOpacity onPress={() => router.push(`/(admin)/students/${item._id}`)}>
            <Card style={styles.studentCard}>
                <Avatar name={item.name} size={48} color={Colors.primary} />
                <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.studentId, { color: colors.textSecondary }]}>{item.studentId}</Text>
                    <View style={styles.classRow}>
                        <Text style={[styles.classText, { color: colors.textSecondary }]}>Class: {item.class} {item.arm}</Text>
                    </View>
                </View>
                <Badge
                    label={item.status === 'active' ? 'Active' : 'Inactive'}
                    bgColor={item.status === 'active' ? Colors.successLight : Colors.errorLight}
                    color={item.status === 'active' ? Colors.success : Colors.error}
                    size="sm"
                />
            </Card>
        </TouchableOpacity>
    );

    return (
        <AnimatedScreen style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Students Management</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <Ionicons name="add" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        placeholder="Search students by name or ID..."
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={{ flex: 1, paddingHorizontal: Spacing.lg }}>
                {loading ? (
                    <View>
                        {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
                    </View>
                ) : (
                    <FlashList
                        data={filteredStudents}
                        renderItem={renderStudent}
                        estimatedItemSize={100}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search" size={48} color={colors.textMuted} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No students found</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: Radius.md,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
    },
    studentInfo: {
        marginLeft: 12,
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    studentId: {
        fontSize: 13,
        marginBottom: 4,
    },
    classRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    classText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    },
});
