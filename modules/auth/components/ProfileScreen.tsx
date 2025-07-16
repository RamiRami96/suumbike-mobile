import React, { useState } from 'react';
import { StyleSheet, Image, View, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import ImagePickerComponent from '../../../components/ImagePicker';
import { logout } from '../../../store/slices/userSlice';
import { logout as logoutService } from '../services/authService';
import { useAppDispatch, useUser } from '../../../store';

export default function ProfileScreen() {
  const user = useUser();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(user?.avatar || '');

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
    } catch {
      console.log('Logout error');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // For now, we'll just show a success message
      // In a real app, you'd update the user data in storage
      Alert.alert('Success', 'Profile updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Profile Settings" />
        <Card.Content>
          <View style={styles.profileSection}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text variant="headlineMedium" style={styles.profileInitial}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text variant="headlineSmall" style={styles.userName}>{user.name}</Text>
            <Text variant="bodyMedium" style={styles.userEmail}>{user.email}</Text>
          </View>

          <ImagePickerComponent
            onImageSelected={handleImageSelected}
            currentImage={selectedImage}
            title="Update Profile Picture"
          />

          <Button 
            mode="contained" 
            onPress={handleUpdateProfile}
            loading={isLoading}
            disabled={isLoading}
            style={styles.updateButton}
          >
            Update Profile
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Account" />
        <Card.Content>
          <Button 
            mode="outlined" 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ddd',
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ddd',
  },
  profileInitial: {
    color: '#666',
    fontWeight: 'bold',
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
  },
  updateButton: {
    marginTop: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
}); 