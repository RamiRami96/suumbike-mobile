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