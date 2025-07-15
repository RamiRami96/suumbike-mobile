import firestore from '@react-native-firebase/firestore';
import { Room } from '../models/Room';

export async function getRoomsByUserId(userId: string): Promise<Room[]> {
  const snapshot = await firestore()
    .collection('rooms')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
}

export async function createRoom(name: string, userId: string): Promise<Room> {
  const createdAt = Date.now();
  const roomData = { name, userId, createdAt, occupied: false };
  const docRef = await firestore().collection('rooms').add(roomData);
  return { id: docRef.id, ...roomData };
} 