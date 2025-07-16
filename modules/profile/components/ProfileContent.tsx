import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import ImagePickerComponent from '../../../components/ImagePicker';

interface ProfileContentProps {
  user: any;
  selectedImage: string;
  isLoading: boolean;
  onImageSelected: (imageUri: string) => void;
  onUpdateProfile: () => void;
}

export default function ProfileContent({
  user,
  selectedImage,
  isLoading,
  onImageSelected,
  onUpdateProfile,
}: ProfileContentProps) {
  return (
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
          onImageSelected={onImageSelected}
          currentImage={selectedImage}
          title="Update Profile Picture"
        />

        <Button 
          mode="contained" 
          onPress={onUpdateProfile}
          loading={isLoading}
          disabled={isLoading}
          style={styles.updateButton}
        >
          Update Profile
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
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
}); 