import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api, endpoints } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import * as Animatable from 'react-native-animatable';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const response = await api(endpoints.auth.login, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // Handle both {user, token} and {user: {..., token}} formats
            const userData = response.user || response;
            const token = response.token || userData.token;

            if (token) {
                await login({ ...userData, token });
                router.replace('/(tabs)');
            } else {
                throw new Error('No authentication token received');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: themeColors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Animatable.View animation="fadeInDown" duration={1000}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animatable.View>
                    <Animatable.Text
                        animation="fadeInUp"
                        duration={1000}
                        style={[styles.title, { color: themeColors.text }]}
                    >
                        GT-SchoolHub
                    </Animatable.Text>
                    <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                        Sign in to your account
                    </Text>
                </View>

                <Animatable.View animation="fadeInUp" duration={1200} style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="name@school.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginBtn}
                    />
                    <View style={styles.footer}>
                        <Text style={{ color: themeColors.textSecondary }}>
                            Forgot password? Contact management.
                        </Text>
                    </View>
                </Animatable.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    form: {
        width: '100%',
    },
    loginBtn: {
        marginTop: Spacing.md,
    },
    footer: {
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
});
