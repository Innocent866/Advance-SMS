import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function NotificationsScreen() {
    const { colors } = useTheme();

    const notifications = [
        { id: '1', title: 'New Result Published', body: 'The first term results for JS1 Gold have been published.', time: '10m ago', type: 'result', unread: true },
        { id: '2', title: 'Fee Payment Received', body: 'Chidi Okafor has paid ₦45,000 for the second term.', time: '2h ago', type: 'finance', unread: true },
        { id: '3', title: 'System Alert', body: 'The server will be undergoing maintenance at 12:00 AM.', time: '5h ago', type: 'alert', unread: false },
        { id: '4', title: 'Attendance Report', body: 'Attendance summary for last week is now available.', time: 'Yesterday', type: 'attendance', unread: false },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'result': return { name: 'document-text-outline', color: Colors.primary };
            case 'finance': return { name: 'wallet-outline', color: Colors.secondary };
            case 'attendance': return { name: 'calendar-outline', color: '#3b82f6' };
            default: return { name: 'notifications-outline', color: Colors.textSecondary };
        }
    };

    return (
        <AnimatedScreen style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
                <TouchableOpacity>
                    <Text style={styles.markReadText}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {notifications.map((item) => {
                    const icon = getIcon(item.type);
                    return (
                        <TouchableOpacity key={item.id}>
                            <Card style={[styles.notificationCard, item.unread && { borderLeftColor: Colors.primary, borderLeftWidth: 4 }]}>
                                <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
                                    <Ionicons name={icon.name as any} size={22} color={icon.color} />
                                </View>
                                <View style={styles.content}>
                                    <View style={styles.titleRow}>
                                        <Text style={[styles.notifTitle, { color: colors.textPrimary, fontWeight: item.unread ? '700' : '600' }]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.timeText, { color: colors.textMuted }]}>{item.time}</Text>
                                    </View>
                                    <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>
                                        {item.body}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.emptyFoot}>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>You're all caught up!</Text>
                </View>
            </ScrollView>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    markReadText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 15,
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    notifBody: {
        fontSize: 13,
        lineHeight: 18,
    },
    emptyFoot: {
        alignItems: 'center',
        marginTop: 40,
    },
});
