import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

export default function ParentLayout() {
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
                        <Ionicons name="apps-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="children"
                options={{
                    title: 'My Wards',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="finance"
                options={{
                    title: 'Payments',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
