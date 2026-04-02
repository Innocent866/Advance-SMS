import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, endpoints } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

interface Teacher {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    department?: string;
    status: 'active' | 'inactive';
    [key: string]: any;
}

export default function TeachersScreen() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const fetchTeachers = async () => {
        try {
            const response = await api(endpoints.teachers.list);
            const teachersData = Array.isArray(response) ? response : (response.teachers || []);
            setTeachers(teachersData);
            setFilteredTeachers(teachersData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        const filtered = teachers.filter((t: Teacher) => {
            const fullName = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unknown';
            const dept = t.department || 'General Education';
            const searchLower = search.toLowerCase();

            return fullName.toLowerCase().includes(searchLower) ||
                dept.toLowerCase().includes(searchLower);
        });
        setFilteredTeachers(filtered);
    }, [search, teachers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTeachers();
    };

    if (loading) return <Loading fullScreen message="Loading Teachers..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Teachers</Text>
                <Input
                    placeholder="Search by name or department..."
                    value={search}
                    onChangeText={setSearch}
                    containerStyle={styles.searchContainer}
                    leftIcon={<Ionicons name="search" size={20} color={themeColors.textSecondary} />}
                />
            </View>

            <FlatList
                data={filteredTeachers}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Teachers Found"
                        message="Start by adding teachers to the system."
                        icon="school-outline"
                    />
                }
                renderItem={({ item }: { item: Teacher }) => {
                    const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown';
                    const dept = item.department || 'General Education';

                    return (
                        <Card style={styles.teacherCard}>
                            <View style={styles.cardContent}>
                                <View style={[styles.avatar, { backgroundColor: themeColors.secondary + '20' }]}>
                                    <View style={styles.avatarInner}>
                                        <Text style={[styles.avatarText, { color: themeColors.secondary }]}>
                                            {fullName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.info}>
                                    <Text style={[styles.name, { color: themeColors.text }]}>{fullName}</Text>
                                    <Text style={[styles.dept, { color: themeColors.textSecondary }]}>
                                        {dept}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.msgBtn}>
                                    <Ionicons name="chatbubble-outline" size={20} color={themeColors.primary} />
                                </TouchableOpacity>
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
    teacherCard: {
        marginBottom: Spacing.md,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    avatarInner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    dept: {
        fontSize: 13,
        marginTop: 2,
    },
    msgBtn: {
        padding: 8,
    }
});
