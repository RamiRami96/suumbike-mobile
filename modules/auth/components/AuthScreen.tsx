import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';
import { useAppDispatch } from '../models/store';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <LoginScreen />
      ) : (
        <RegistrationScreen />
      )}
      <Button 
        mode="text" 
        onPress={() => setIsLogin(!isLogin)}
        style={styles.toggleButton}
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  toggleButton: {
    marginTop: 16,
  },
}); 