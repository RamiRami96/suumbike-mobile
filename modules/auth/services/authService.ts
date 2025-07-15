import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const register = (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export const login = (email: string, password: string) => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const logout = (): Promise<void> => {
  return auth().signOut();
}; 

export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};