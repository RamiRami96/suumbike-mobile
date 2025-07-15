import React from 'react';
import { Card, Button } from 'react-native-paper';
import { Room } from '../models/Room';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

type Props = {
  room: Room;
}

export default function RoomCard({ room }: Props) {
  const isOccupied = room.occupied;
  return (
    <Card style={[styles.card, isOccupied && styles.occupiedCard]}>
      <Card.Title
        title={room.name}
        subtitle={`Created: ${new Date(room.createdAt).toLocaleString()}`}
      />
      <Card.Actions>
        {!isOccupied && (
          // @ts-expect-error: Dynamic route type not recognized by expo-router types
          <Link href={{ pathname: '/(tabs)/room/[id]', params: { id: room.id } }} asChild>
            <Button mode="contained">
              View Room
            </Button>
          </Link>
        )}
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  occupiedCard: {
    backgroundColor: 'red',
  },
}); 