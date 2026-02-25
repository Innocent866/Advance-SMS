import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function MessagingScreen() {
    const { colors } = useTheme();
    const [search, setSearch] = useState('');

    const chats = [
        { id: '1', name: 'Mrs. Adebayo', role: 'Teacher', lastMsg: 'I have uploaded the test results for...', time: '10:45 AM', unread: 2 },
        { id: '2', name: 'Mr. Okoro', role: 'Teacher', lastMsg: 'The attendance record for Class JS2 has...', time: 'Yesterday', unread: 0 },
        { id: '3', name: 'Admin Broadcast', role: 'System', lastMsg: 'Reminder: The school field trip is...', time: 'Mon', unread: 0 },
        { id: '4', name: 'James Wilson (Parent)', role: 'Parent', lastMsg: 'Thank you for the update on Chidi...', time: 'Sun', unread: 0 },
    ];

    return (
        <AnimatedScreen style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Messages</Text>
                <TouchableOpacity style={styles.composeBtn}>
                    <Ionicons name="create-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        placeholder="Search messages..."
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {chats.map((chat) => (
                    <TouchableOpacity key={chat.id}>
                        <Card style={styles.chatCard}>
                            <Avatar name={chat.name} size={50} color={chat.role === 'System' ? Colors.secondary : Colors.primary} />
                            <View style={styles.chatContent}>
                                <View style={styles.chatHeader}>
                                    <Text style={[styles.chatName, { color: colors.textPrimary }]}>{chat.name}</Text>
                                    <Text style={[styles.timeText, { color: colors.textMuted }]}>{chat.time}</Text>
                                </View>
                                <View style={styles.chatBody}>
                                    <Text style={[styles.lastMsg, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {chat.lastMsg}
                                    </Text>
                                    {chat.unread > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>{chat.unread}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
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
        fontSize: 22,
        fontWeight: '700',
    },
    composeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        height: 44,
        borderRadius: Radius.md,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 40,
    },
    chatCard: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 12,
        borderWidth: 0,
        elevation: 2,
    },
    chatContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 15,
        fontWeight: '700',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    chatBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMsg: {
        fontSize: 13,
        flex: 1,
        marginRight: 10,
    },
    unreadBadge: {
        backgroundColor: Colors.primary,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    unreadText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
