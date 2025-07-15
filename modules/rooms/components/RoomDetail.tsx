import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useRoomDetail } from '../hooks/useRoomDetail';

const userAvatar = 'https://ui-avatars.com/api/?name=You&background=random';
const opponentAvatar = 'https://ui-avatars.com/api/?name=Opponent&background=random';

type Props = {
  id: string;
};

const RoomDetail = ({ id }: Props) => {
  const { handlePass, handleReject } = useRoomDetail(id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room: {id}</Text>
      <View style={styles.avatarsContainer}>
        <View style={styles.avatarBlock}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <Text style={styles.label}>You</Text>
        </View>
        <View style={styles.avatarBlock}>
          <Image source={{ uri: opponentAvatar }} style={styles.avatar} />
          <Text style={styles.label}>Opponent</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={handlePass} style={styles.button}>
          Pass
        </Button>
        <Button mode="outlined" onPress={handleReject} style={styles.button}>
          Reject
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181A1B',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#fff',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarBlock: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#333',
  },
  vs: {
    marginHorizontal: 24,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    marginHorizontal: 8,
    minWidth: 100,
  },
});

export default RoomDetail; 