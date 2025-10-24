import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as z from 'zod';

import { spacing, theme, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';
import { SignInData } from '../../types';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { signIn, signInWithGoogle, signInWithApple, isLoading, error } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInData) => {
    try {
      await signIn(data);
      // Navigation is handled by AppNavigator based on auth state
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Login failed. Please try again.');
      setSnackbarVisible(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Google sign-in failed');
      setSnackbarVisible(true);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
      setSnackbarMessage('Apple Sign-In is only available on iOS devices');
      setSnackbarVisible(true);
      return;
    }

    try {
      await signInWithApple();
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Apple sign-in failed');
      setSnackbarVisible(true);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Title */}
          <View style={styles.headerSection}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to EnatBet</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!errors.email}
                  left={<TextInput.Icon icon="email-outline" />}
                  style={styles.input}
                />
              )}
            />
            {errors.email && (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email.message}
              </HelperText>
            )}

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                />
              )}
            />
            {errors.password && (
              <HelperText type="error" visible={!!errors.password}>
                {errors.password.message}
              </HelperText>
            )}

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
            >
              Sign In
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.dividerSection}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <Button
              mode="outlined"
              onPress={handleGoogleSignIn}
              icon={({ size, color }) => <Icon name="google" size={size} color={color} />}
              style={styles.socialButton}
              contentStyle={styles.socialButtonContent}
            >
              Continue with Google
            </Button>

            {Platform.OS === 'ios' && (
              <Button
                mode="outlined"
                onPress={handleAppleSignIn}
                icon={({ size, color }) => <Icon name="apple" size={size} color={color} />}
                style={[styles.socialButton, styles.appleButton]}
                contentStyle={styles.socialButtonContent}
                textColor="#000"
              >
                Continue with Apple
              </Button>
            )}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: theme.colors.onBackground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: theme.colors.onSurfaceVariant,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  forgotPassword: {
    ...typography.body2,
    color: theme.colors.primary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  loginButtonContent: {
    paddingVertical: spacing.xs,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outline,
  },
  dividerText: {
    ...typography.body2,
    color: theme.colors.onSurfaceVariant,
    paddingHorizontal: spacing.md,
  },
  socialSection: {
    marginBottom: spacing.xl,
  },
  socialButton: {
    marginBottom: spacing.md,
    borderColor: theme.colors.outline,
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  socialButtonContent: {
    paddingVertical: spacing.xs,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...typography.body1,
    color: theme.colors.onSurfaceVariant,
  },
  signUpLink: {
    ...typography.body1,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
