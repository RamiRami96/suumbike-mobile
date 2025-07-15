import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { AuthService } from '../services/authService';
import { StyleSheet, View } from 'react-native';
import { useAppDispatch } from '../../../store';
import { setUser } from '../models/userSlice';

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
      const user = await AuthService.login(data.email, data.password);
      if (user) {
        dispatch(setUser(user));
      } else {
        setError('root', { type: 'manual', message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error(error);
      setError('root', { type: 'manual', message: 'Login failed. Please try again.' });
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
            rules={{ required: 'Email is required' }}
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
            rules={{ required: 'Password is required' }}
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
    padding: 16,
    backgroundColor: 'transparent',
  },
  card: {
    width: '100%',
    maxWidth: 400,
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