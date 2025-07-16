import React from 'react';
import { useRoute } from '@react-navigation/native';
import RoomDetail from '../../../modules/rooms/components/RoomDetail';

export default function RoomTabId() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  return <RoomDetail id={id} />;
} 