import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models/User';

const USERS_STORAGE_KEY = '@users';
const CURRENT_USER_KEY = '@current_user';

interface UserWithPassword extends User {
  password: string;
}

export const AuthService = {
  // Register a new user
  register: async (userData: Omit<User, 'id' | 'likedUsers'> & { password: string }): Promise<User> => {
    try {
      // Get existing users from storage
      const existingUsersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const existingUsers: UserWithPassword[] = existingUsersJson ? JSON.parse(existingUsersJson) : [];

      // Check if user already exists
      const existingUser = existingUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: UserWithPassword = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        likedUsers: [],
      };

      // Add to storage
      existingUsers.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existingUsers));

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // Get users from storage
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];

      // Find user by email and password
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Store current user session
        const { password, ...userWithoutPassword } = user;
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  // Get current logged in user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return !!userJson;
    } catch (error) {
      console.error('Check login status error:', error);
      return false;
    }
  },
}; 