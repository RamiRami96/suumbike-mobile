import { useEffect, useState } from 'react';
import { getRoomsByUserId } from '../services/roomService';
import { Room } from '../models/Room';

export default function useRoomSearch(userId?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch rooms
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getRoomsByUserId(userId)
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [userId]);

  // Debounce search
  useEffect(() => {
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

  // Keep filteredRooms in sync if rooms change and search is empty
  useEffect(() => {
    if (!search) setFilteredRooms(rooms);
  }, [rooms, search]);

  return { search, setSearch, filteredRooms, loading };
} 