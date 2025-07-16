import { db } from '../../../firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, arrayUnion } from 'firebase/firestore';
import { Room } from '../models/Room';

export async function getRoomsByUserId(userId: string): Promise<Room[]> {
  const snapshot = await getDocs(query(collection(db, 'rooms'), where('userId', '==', userId), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
}

export async function createRoom(name: string, userId: string): Promise<Room> {
  const createdAt = Date.now();
  const roomData = { name, userId, createdAt, occupied: false };
  const docRef = await addDoc(collection(db, 'rooms'), roomData);
  return { id: docRef.id, ...roomData };
}

export async function deleteRoom(roomId: string): Promise<void> {
  await deleteDoc(doc(db, 'rooms', roomId));
  // Also delete associated call document if it exists
  try {
    await deleteDoc(doc(db, 'calls', roomId));
  } catch (error) {
    console.error('Call document not found or already deleted', error);
  }
}

export async function joinRoom(roomId: string, userId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    occupied: true,
    users: arrayUnion(userId)
  });
}

export async function getAvailableRooms(): Promise<Room[]> {
  const snapshot = await getDocs(query(collection(db, 'rooms'), where('occupied', '==', false), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
} 