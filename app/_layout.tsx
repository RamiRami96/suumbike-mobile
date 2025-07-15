import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider, MD3DarkTheme, Text } from 'react-native-paper';
import 'react-native-reanimated';
import { Provider as ReduxProvider } from 'react-redux';
import { AuthScreen } from '../modules/auth';
import { getCurrentUser } from '@/modules/auth/services/authService';
import store, { useAppDispatch, useUser } from '../store';
import { setUser } from '../store/slices/userSlice';
import MainPage from './(tabs)/index';
import { User } from '@/modules/auth/models/User';
import { ProfileScreen }  from '../modules/profile';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#151718',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#9BA1A6',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainPage}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const user = useUser();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          dispatch(setUser(currentUser as unknown as User));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <PaperProvider theme={MD3DarkTheme}>
        {user ? (
          <TabNavigator />
        ) : (
          <AuthScreen />
        )}
        <StatusBar style="light" />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <AppContent />
    </ReduxProvider>
  );
}
