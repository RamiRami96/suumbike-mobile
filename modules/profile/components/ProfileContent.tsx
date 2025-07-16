import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { useProfileActions } from '../hooks/useProfileActions';
import { User } from '@/modules/auth/models/User';

interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({
  user,
}: ProfileContentProps) {
  const { handleLogout } = useProfileActions();

  return (
    <Card style={styles.card}>
      <Card.Title 
        title="Profile Settings" 
        right={(props) => (
          <IconButton
            {...props}
            icon="logout"
            onPress={handleLogout}
            style={{ marginRight: 8 }}
            accessibilityLabel="Logout"
          />
        )}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.profileSection}>
        <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          <Text variant="headlineSmall" style={styles.userName}>{user.name}</Text>
          <Text variant="bodyMedium" style={styles.userEmail}>{user.email}</Text>
        </View>
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
    marginTop: 32,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#23222a', // darker placeholder
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
    color: '#fff', // white text for dark bg
  },
  userEmail: {
    opacity: 0.7,
    color: '#ccc', // lighter text for dark bg
  },
  updateButton: {
    marginTop: 16,
  },
  cardContent: {
    backgroundColor: '#18171c', // dark background for card content
  },
}); 