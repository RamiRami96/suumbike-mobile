import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useUser } from '../../../store';
import RoomCard from './RoomCard';
import SearchBar from './SearchBar';
import useRoomSearch from '../hooks/useRoomSearch';

export default function RoomList() {
  const user = useUser();
  const { search, setSearch, filteredRooms, loading } = useRoomSearch(user?.id);

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
        <Text>No rooms found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={search} onChange={setSearch} />
      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RoomCard room={item} />}
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
    padding: 16,
  },
}); 