import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

export default function StudentLayout() {
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="academics"
                options={{
                    title: 'Academics',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="school-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Presence',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="finance"
                options={{
                    title: 'Fees',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
