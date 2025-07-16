import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useRoomDetail } from '../hooks/useRoomDetail';
import { router } from 'expo-router';

const userAvatar = 'https://ui-avatars.com/api/?name=You&background=random';
const opponentAvatar = 'https://ui-avatars.com/api/?name=Opponent&background=random';

type Props = {
  id: string;
};

const RoomDetail = ({ id }: Props) => {
  const { handlePass, handleReject, isOwner, opponent, isInCall } = useRoomDetail(id);

  const handleBack = () => {
    router.back();
  };

  // Show waiting state for room owner when no opponent
  if (isOwner && !opponent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBack}
            iconColor="#fff"
          />
          <Text style={styles.headerTitle}>Room</Text>
        </View>
        <Text style={styles.title}>Waiting for Partner...</Text>
        <View style={styles.avatarsContainer}>
          <View style={styles.avatarBlock}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <Text style={styles.label}>You</Text>
          </View>
          <View style={styles.avatarBlock}>
            <View style={styles.waitingAvatar}>
              <Text style={styles.waitingText}>?</Text>
            </View>
            <Text style={styles.label}>Waiting...</Text>
          </View>
        </View>
        <Text style={styles.waitingMessage}>
          Your room is ready! Share the room ID with someone or wait for them to join.
        </Text>
        <Text style={styles.roomId}>Room ID: {id}</Text>
      </View>
    );
  }

  // Show joining state for participant when no opponent yet
  if (!isOwner && !opponent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBack}
            iconColor="#fff"
          />
          <Text style={styles.headerTitle}>Joining Room</Text>
        </View>
        <Text style={styles.title}>Joining Room...</Text>
        <View style={styles.avatarsContainer}>
          <View style={styles.avatarBlock}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <Text style={styles.label}>You</Text>
          </View>
          <View style={styles.avatarBlock}>
            <View style={styles.waitingAvatar}>
              <Text style={styles.waitingText}>?</Text>
            </View>
            <Text style={styles.label}>Waiting for owner...</Text>
          </View>
        </View>
        <Text style={styles.waitingMessage}>
          You&apos;ve joined the room! Waiting for the room owner to start the audio chat.
        </Text>
      </View>
    );
  }

  // Show audio chat interface when opponent is present
  if (opponent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBack}
            iconColor="#fff"
          />
          <Text style={styles.headerTitle}>Audio Chat</Text>
        </View>
        <Text style={styles.title}>
          {isInCall ? 'Audio Chat Active' : 'Room: ' + id}
        </Text>
        <View style={styles.avatarsContainer}>
          <View style={styles.avatarBlock}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <Text style={styles.label}>You</Text>
          </View>
          <View style={styles.avatarBlock}>
            <Image source={{ uri: opponentAvatar }} style={styles.avatar} />
            <Text style={styles.label}>{opponent.name || 'Opponent'}</Text>
          </View>
        </View>
        {isInCall && (
          <Text style={styles.audioStatus}>🎤 Audio chat is active</Text>
        )}
        <View style={styles.buttonRow}>
          <Button mode="contained" onPress={handlePass} style={styles.button}>
            Pass
          </Button>
          <Button mode="outlined" onPress={handleReject} style={styles.button}>
            Reject
          </Button>
        </View>
      </View>
    );
  }

  // Fallback loading state
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          iconColor="#fff"
        />
        <Text style={styles.headerTitle}>Room</Text>
      </View>
      <Text style={styles.title}>Loading room...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A1B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    justifyContent: 'center',
  },
  avatarBlock: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#333',
  },
  waitingAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
  waitingMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
    paddingHorizontal: 24,
  },
  roomId: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  audioStatus: {
    color: '#4CAF50',
    fontSize: 16,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 8,
    minWidth: 100,
  },
});

export default RoomDetail; 