import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function LoginScreen() {
    const { colors, isDark } = useTheme();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login({ email, password });
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Check your credentials and try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedScreen>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(200)}
                        style={styles.logoContainer}
                    >
                        {/* Logo Placeholder - You would pass your real logo asset path here */}
                        <View style={[styles.logoCircle, { backgroundColor: Colors.primary }]}>
                            <Ionicons name="school" size={48} color="#fff" />
                        </View>
                        <Text style={[styles.brandName, { color: colors.textPrimary }]}>GT-SchoolHub</Text>
                        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Empowering Education Everywhere</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.duration(600).delay(400)}
                        style={[styles.formContainer, { backgroundColor: colors.surface }]}
                    >
                        <Text style={[styles.loginTitle, { color: colors.textPrimary }]}>Welcome Back!</Text>
                        <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>Sign in to continue your journey</Text>

                        <Input
                            label="Email Address"
                            placeholder="name@school.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={() => router.push('/(auth)/forgot-password')}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.submitBtn}
                        />
                    </Animated.View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => Alert.alert('Contact Admin', 'Please contact your school administrator to obtain access.')}>
                            <Text style={styles.registerText}>Contact Admin</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.xxl * 1.5,
        flexGrow: 1,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    brandName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    formContainer: {
        padding: Spacing.lg,
        borderRadius: Radius.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    loginSubtitle: {
        fontSize: 15,
        marginBottom: Spacing.xl,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.xl,
    },
    forgotText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    submitBtn: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingVertical: Spacing.xl,
    },
    footerText: {
        fontSize: 14,
    },
    registerText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
});
