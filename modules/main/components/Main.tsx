import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import RoomList from '../../rooms/components/RoomList';
import CreateRoomModal from '../../rooms/components/CreateRoomModal';

export default function Main() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <RoomList />
      <CreateRoomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
        color="#fff"
        accessibilityLabel="Create Room"
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 28,
    elevation: 6,
  },
}); 