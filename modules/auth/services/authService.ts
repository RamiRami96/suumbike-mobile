import { auth } from '../../../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, UserCredential } from 'firebase/auth';

export const register = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}; 

export const getCurrentUser = (): User | null => {
  try {
    return auth.currentUser;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};