import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useProfileState } from '../hooks/useProfileState';
import ProfileContent from './ProfileContent';
import LikedUsersList from './LikedUsersList';

export default function Profile() {
  const { user, likedUsers } = useProfileState();

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
      />
      
      <LikedUsersList likedUsers={likedUsers} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#19181e',
  },
}); 