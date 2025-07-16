import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Card, Button } from 'react-native-paper';
import { useUser } from '../../../store';
import { getAvailableRooms, joinRoom } from '../services/roomService';
import { Room } from '../models/Room';
import { router } from 'expo-router';
import SearchBar from './SearchBar';

export default function RoomList() {
  const user = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  const fetchAvailableRooms = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const availableRooms = await getAvailableRooms();
      // Filter out rooms created by the current user
      const filteredRooms = availableRooms.filter(room => room.userId !== user.id);
      setRooms(filteredRooms);
      setFilteredRooms(filteredRooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchAvailableRooms();
    }
  }, [user?.id, fetchAvailableRooms]);

  useEffect(() => {
    // Debounce search for available rooms
    const handler = setTimeout(() => {
      if (!search) {
        setFilteredRooms(rooms);
      } else {
        setFilteredRooms(
          rooms.filter(room =>
            room.name.toLowerCase().includes(search.toLowerCase())
          )
        );
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, rooms]);

  const handleJoinRoom = async (room: Room) => {
    if (!user?.id) return;
    try {
      await joinRoom(room.id, user.id);
      router.push({ pathname: '/(tabs)/room/[id]', params: { id: room.id } });
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#a29bfe" />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  if (!filteredRooms.length) {
    return (
      <View style={styles.centered}>
        <SearchBar value={search} onChange={setSearch} />
        <Text style={styles.noRoomsText}>No available rooms to join.</Text>
      </View>
    );
  }

  const renderAvailableRoom = ({ item }: { item: Room }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`Created: ${new Date(item.createdAt).toLocaleString()}`}
      />
      <Card.Actions>
        <Button mode="contained" onPress={() => handleJoinRoom(item)}>
          Join Room
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={search} onChange={setSearch} />
      <FlatList
        data={filteredRooms}
        renderItem={renderAvailableRoom}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  noRoomsText: {
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    opacity: 0.7,
  },
}); 