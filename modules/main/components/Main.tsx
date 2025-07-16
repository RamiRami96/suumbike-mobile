import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import RoomList from '../../rooms/components/RoomList';
import CreateRoomModal from '../../rooms/components/CreateRoomModal';

export default function Main() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Rooms</Text>
      <Button mode="contained" onPress={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Create Room
      </Button>
      <RoomList />
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
}); 