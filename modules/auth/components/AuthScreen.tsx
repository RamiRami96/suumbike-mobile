import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.bg}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#19181e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    marginTop: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
}); 