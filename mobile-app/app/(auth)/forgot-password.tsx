import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedScreen } from '@/components/AnimatedScreen';
import { forgotPasswordApi } from '@/api/auth.api';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Radius } from '@/constants/colors';

export default function ForgotPasswordScreen() {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await forgotPasswordApi({ email });
            Alert.alert(
                'Success',
                'If an account exists with this email, you will receive a password reset link shortly.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View
                        entering={FadeInDown.duration(600)}
                        style={styles.content}
                    >
                        <View style={[styles.iconBox, { backgroundColor: Colors.primaryLight }]}>
                            <Ionicons name="key-outline" size={32} color={Colors.primary} />
                        </View>

                        <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password?</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            No worries! Enter your registered email address below and we'll send you instructions to reset your password.
                        </Text>

                        <Input
                            label="Email Address"
                            placeholder="name@school.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoFocus
                        />

                        <Button
                            title="Send Reset Link"
                            onPress={handleResetPassword}
                            loading={loading}
                            style={styles.submitBtn}
                        />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </AnimatedScreen>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: Spacing.lg,
        flexGrow: 1,
    },
    content: {
        alignItems: 'center',
        paddingTop: Spacing.xl,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xxl,
    },
    submitBtn: {
        width: '100%',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginTop: Spacing.md,
    },
});
