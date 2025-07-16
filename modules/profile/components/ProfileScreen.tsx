import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Image, View, Alert, FlatList } from 'react-native';
import { Button, Card, Text, Avatar } from 'react-native-paper';
import ImagePickerComponent from '../../auth/components/ImagePicker';
import { logout } from '../../../store/slices/userSlice';
import { logout as logoutService } from '../../auth/services/authService';
import { useAppDispatch, useUser } from '../../../store';
import firestore from '@react-native-firebase/firestore';
import { User } from '../../auth/models/User';

export default function ProfileScreen() {
  const user = useUser();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(user?.avatar || '');
  const [likedUsers, setLikedUsers] = useState<User[]>([]);

  const fetchLikedUsers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userDoc = await firestore().collection('users').doc(user.id).get();
      const userData = userDoc.data();
      if (userData?.likedUsers && Array.isArray(userData.likedUsers)) {
        // Limit concurrent requests to avoid rate limiting
        const batchSize = 10;
        const likedUsersData: User[] = [];
        
        for (let i = 0; i < userData.likedUsers.length; i += batchSize) {
          const batch = userData.likedUsers.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(async (userId: string) => {
              try {
                const likedUserDoc = await firestore().collection('users').doc(userId).get();
                return likedUserDoc.data() as User;
              } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
                return null;
              }
            })
          );
          likedUsersData.push(...batchResults.filter(Boolean) as User[]);
        }
        
        setLikedUsers(likedUsersData);
      }
    } catch (error) {
      console.error('Error fetching liked users:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLikedUsers();
    }
  }, [user?.id, fetchLikedUsers]);

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

  const renderLikedUser = ({ item }: { item: User }) => (
    <View style={styles.likedUserItem}>
      <Avatar.Image 
        size={40} 
        source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random` }} 
      />
      <View style={styles.likedUserInfo}>
        <Text variant="bodyMedium">{item.name}</Text>
        <Text variant="bodySmall" style={styles.userAge}>Age: {item.age}</Text>
      </View>
    </View>
  );

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
        <Card.Title title={`Liked Users (${likedUsers.length})`} />
        <Card.Content>
          {likedUsers.length > 0 ? (
            <FlatList
              data={likedUsers}
              renderItem={renderLikedUser}
              keyExtractor={(item) => item.id}
              style={styles.likedUsersList}
            />
          ) : (
            <Text variant="bodyMedium" style={styles.noLikedUsers}>
              No liked users yet. Start matching to see your connections!
            </Text>
          )}
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
  likedUsersList: {
    maxHeight: 200,
  },
  likedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  likedUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userAge: {
    opacity: 0.7,
  },
  noLikedUsers: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
}); 