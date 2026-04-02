import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, Platform, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, endpoints } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const fetchNotifications = async () => {
        try {
            const response = await api(endpoints.notifications.list).catch(() => ({ notifications: [] }));
            setNotifications(response.notifications || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    if (loading) return <Loading fullScreen message="Loading Notifications..." />;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Notifications</Text>
                <TouchableOpacity>
                    <Text style={{ color: themeColors.primary, fontWeight: '600' }}>Mark all as read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <EmptyState
                        title="All Caught Up!"
                        message="You don't have any new notifications at the moment."
                        icon="notifications-off-outline"
                    />
                }
                renderItem={({ item }: any) => (
                    <Card style={[styles.notifCard, !item.read && { borderLeftWidth: 4, borderLeftColor: themeColors.primary }] as any}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: !item.read ? themeColors.primary + '15' : themeColors.border + '30' }]}>
                                <Ionicons
                                    name={item.type === 'alert' ? 'alert-circle' : 'information-circle'}
                                    size={24}
                                    color={!item.read ? themeColors.primary : themeColors.textSecondary}
                                />
                            </View>
                            <View style={styles.content}>
                                <Text style={[styles.notifTitle, { color: themeColors.text }, !item.read && { fontWeight: '700' }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.message, { color: themeColors.textSecondary }]} numberOfLines={2}>
                                    {item.message}
                                </Text>
                                <Text style={[styles.time, { color: themeColors.border }]}>
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    notifCard: {
        marginBottom: Spacing.sm,
        padding: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        padding: 10,
        borderRadius: 12,
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    message: {
        fontSize: 14,
        marginTop: 2,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '600',
    },
});
