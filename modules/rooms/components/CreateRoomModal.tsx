import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useUser } from '../../../store';
import { createRoom } from '../services/roomService';

type Props = {
  visible: boolean;
  onClose: () => void;
}

const CreateRoomModal= ({ visible, onClose }: Props) => {
  const user = useUser();
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Room name is required');
      return;
    }
    if (!user?.id) {
      Alert.alert('User not found. Please log in again.');
      return;
    }
    setCreating(true);
    try {
      await createRoom(roomName.trim(), user.id);
      setRoomName('');
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setRoomName('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ marginBottom: 12 }} variant="titleMedium">Create a New Room</Text>
          <TextInput
            placeholder="Room Name"
            value={roomName}
            onChangeText={setRoomName}
            style={styles.input}
            editable={!creating}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={handleClose} disabled={creating} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={handleCreateRoom} loading={creating} disabled={creating}>
              Create
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateRoomModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
}); 