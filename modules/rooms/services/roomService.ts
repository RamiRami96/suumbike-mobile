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

export async function deleteRoom(roomId: string): Promise<void> {
  await firestore().collection('rooms').doc(roomId).delete();
  // Also delete associated call document if it exists
  try {
    await firestore().collection('calls').doc(roomId).delete();
  } catch (error) {
    console.error('Call document not found or already deleted', error);
  }
}

export async function joinRoom(roomId: string, userId: string): Promise<void> {
  const roomRef = firestore().collection('rooms').doc(roomId);
  await roomRef.update({
    occupied: true,
    users: firestore.FieldValue.arrayUnion(userId)
  });
}

export async function getAvailableRooms(): Promise<Room[]> {
  const snapshot = await firestore()
    .collection('rooms')
    .where('occupied', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
} 