import { Stack } from 'expo-router';

export default function StudentsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Student Profile',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}
