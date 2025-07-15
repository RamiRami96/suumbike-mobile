import React from 'react';
import { Card } from 'react-native-paper';
import { Room } from '../models/Room';
import { StyleSheet } from 'react-native';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Title
        title={room.name}
        subtitle={`Created: ${new Date(room.createdAt).toLocaleString()}`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
}); 