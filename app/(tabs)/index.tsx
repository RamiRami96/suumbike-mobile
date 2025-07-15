import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/userSlice';
import { logout as logoutService } from '../../modules/auth/services/authService';
import RoomList from '../../modules/rooms/components/RoomList';

export default function MainPage() {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <RoomList />
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#19181e',
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
