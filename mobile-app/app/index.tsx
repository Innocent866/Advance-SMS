import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';

export default function Index() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    const role = user.role;
    if (role === 'super_admin') return <Redirect href="/(superadmin)/dashboard" />;
    if (role === 'school_admin') return <Redirect href="/(admin)/dashboard" />;
    if (role === 'teacher') return <Redirect href="/(teacher)/dashboard" />;
    if (role === 'student') return <Redirect href="/(student)/dashboard" />;
    if (role === 'parent') return <Redirect href="/(parent)/dashboard" />;

    return <Redirect href="/(auth)/login" />;
}
