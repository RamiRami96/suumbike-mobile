import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useUser } from '@/auth/models/store';
import { logout } from '@/auth/models/userSlice';
import { AuthService } from '@/auth/services/authService';

export default function MainPage() {
  const user = useUser();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileSection}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text variant="headlineMedium" style={styles.profileInitial}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        <Text variant="headlineLarge" style={styles.h1}>Welcome, {user?.name}!</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>You are successfully logged in</Text>
      </View>
      
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#ddd',
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#ddd',
  },
  profileInitial: {
    color: '#666',
    fontWeight: 'bold',
  },
  h1: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  logoutButton: {
    marginBottom: 20,
  },
});
