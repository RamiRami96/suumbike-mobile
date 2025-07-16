import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useProfileState } from '../hooks/useProfileState';
import { useProfileActions } from '../hooks/useProfileActions';
import ProfileContent from './ProfileContent';
import LikedUsersList from './LikedUsersList';
import AccountSection from './AccountSection';

export default function Profile() {
  const { user, isLoading, selectedImage, likedUsers, handleImageSelected, setLoading } = useProfileState();
  const { handleLogout, handleUpdateProfile } = useProfileActions();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileContent
        user={user}
        selectedImage={selectedImage}
        isLoading={isLoading}
        onImageSelected={handleImageSelected}
        onUpdateProfile={() => handleUpdateProfile(setLoading)}
      />
      
      <LikedUsersList likedUsers={likedUsers} />
      
      <AccountSection onLogout={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 