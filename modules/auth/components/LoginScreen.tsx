import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { login } from '../services/authService';
import { validateEmail, validatePassword } from '../helpers/validation';
import { StyleSheet, View } from 'react-native';
import { useAppDispatch } from '../../../store';
import { setUser } from '../../../store/slices/userSlice';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, setError, clearErrors } = useForm({
    defaultValues: { email: '', password: '' },
  });
  const dispatch = useAppDispatch();

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    clearErrors('root');
    try {
      const userCredential = await login(data.email, data.password);
      const uid = userCredential.user?.uid || '';
      dispatch(setUser({
        id: uid,
        email: data.email,
        name: '',
        age: 0,
        avatar: '',
        likedUsers: [],
      }));
      // Firebase automatically manages user state; you may fetch user info if needed
      // Optionally, you can use auth().currentUser here
      // dispatch(setUser({ email: data.email })); // You may want to fetch more user info
    } catch (error: any) {
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      setError('root', { type: 'manual', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Login" titleStyle={styles.cardTitle} />
        <Card.Content>
          <Controller
            control={control}
            name="email"
            rules={{ 
              required: 'Email is required',
              validate: (value) => validateEmail(value) || true
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                error={!!errors.email}
                disabled={isLoading}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message as string}</Text>}
          <Controller
            control={control}
            name="password"
            rules={{ 
              required: 'Password is required',
              validate: (value) => validatePassword(value) || true
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                style={styles.input}
                error={!!errors.password}
                disabled={isLoading}
              />
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message as string}</Text>}
          {errors.root && <Text style={styles.errorText}>{errors.root.message as string}</Text>}
          <Button 
            mode="contained" 
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#19181e',
    width: '80%',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    backgroundColor: '#23222a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 16,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d2c36',
    color: '#fff',
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff7675',
    marginBottom: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#a29bfe',
    borderRadius: 12,
    marginTop: 8,
    minHeight: 48,
    justifyContent: 'center',
    elevation: 0,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    color: '#23222a',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 0.5,
  },
}); 