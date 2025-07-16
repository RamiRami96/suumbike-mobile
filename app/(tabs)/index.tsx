import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/userSlice';
import { logout as logoutService } from '../../modules/auth/services/authService';
import RoomList from '../../modules/rooms/components/RoomList';
import CreateRoomModal from '../../modules/rooms/components/CreateRoomModal';

export default function MainPage() {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);

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
      <Text style={styles.sectionTitle}>My Rooms</Text>
      <Button mode="contained" onPress={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Create Room
      </Button>
      <RoomList type="my-rooms" />
      
      <Text style={styles.sectionTitle}>Available Rooms to Join</Text>
      <RoomList type="available-rooms" />
      
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
      <CreateRoomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#19181e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 20,
  },
});
