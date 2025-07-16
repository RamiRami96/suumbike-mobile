import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';

interface LikedUsersListProps {
  likedUsers: any[];
}

export default function LikedUsersList({ likedUsers }: LikedUsersListProps) {
  const renderLikedUser = ({ item }: { item: any }) => (
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

  return (
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
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
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