import { Stack } from 'expo-router';

export default function AttendanceLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="history"
                options={{
                    title: 'Attendance History',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}
