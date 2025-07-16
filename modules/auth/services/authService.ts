import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const register = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await auth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}; 

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  try {
    return auth().currentUser;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};