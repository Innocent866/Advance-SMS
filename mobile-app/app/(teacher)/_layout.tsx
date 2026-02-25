import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

export default function TeacherLayout() {
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
                name="students"
                options={{
                    title: 'My Class',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Marking',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="checkbox-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="results"
                options={{
                    title: 'Grades',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="create-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
