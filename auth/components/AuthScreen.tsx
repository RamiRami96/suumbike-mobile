import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';

export default function AuthScreen({ onAuth }: { onAuth?: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ThemedView style={styles.container}>
      {isLogin ? (
        <LoginScreen onLogin={onAuth} />
      ) : (
        <RegistrationScreen onRegister={onAuth} />
      )}
      
      <Button 
        mode="text" 
        onPress={() => setIsLogin(!isLogin)}
        style={styles.toggleButton}
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </Button>
    </ThemedView>
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