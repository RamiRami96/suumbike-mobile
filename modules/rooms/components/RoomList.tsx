import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Card, Button } from 'react-native-paper';
import { useUser } from '../../../store';
import { getAvailableRooms, joinRoom } from '../services/roomService';
import { Room } from '../models/Room';
import { router } from 'expo-router';
import RoomCard from './RoomCard';
import SearchBar from './SearchBar';
import useRoomSearch from '../hooks/useRoomSearch';

type RoomListProps = {
  type: 'my-rooms' | 'available-rooms';
  title?: string;
};

export default function RoomList({ type, title }: RoomListProps) {
  const user = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  // Use the existing search hook for my-rooms
  const { search: searchHook, setSearch: setSearchHook, filteredRooms: hookFilteredRooms, loading: hookLoading } = useRoomSearch(user?.id);

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
      if (type === 'my-rooms') {
        // Use the existing hook for my-rooms
        return;
      } else {
        fetchAvailableRooms();
      }
    }
  }, [user?.id, type, fetchAvailableRooms]);

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
      // Navigate to the room
      // @ts-expect-error: Dynamic route type not recognized by expo-router types
      router.push({ pathname: '/(tabs)/room/[id]', params: { id: room.id } });
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  // Use hook data for my-rooms
  if (type === 'my-rooms') {
    if (hookLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!hookFilteredRooms.length) {
      return (
        <View style={styles.centered}>
          <SearchBar value={searchHook} onChange={setSearchHook} />
          <Text style={styles.noRoomsText}>No rooms found.</Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <SearchBar value={searchHook} onChange={setSearchHook} />
        <FlatList
          data={hookFilteredRooms}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <RoomCard room={item} />}
        />
      </View>
    );
  }

  // Available rooms logic
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
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
}); 