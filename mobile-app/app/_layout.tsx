import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <ThemeProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            animation: 'fade',
                            contentStyle: { backgroundColor: '#f9fafb' }, // Default background
                        }}
                    >
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
                        <Stack.Screen name="(student)" options={{ headerShown: false }} />
                        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
                        <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: true, title: 'Settings' }} />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
