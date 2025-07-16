import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';

interface AccountSectionProps {
  onLogout: () => void;
}

export default function AccountSection({ onLogout }: AccountSectionProps) {
  return (
    <Card style={styles.card}>
      <Card.Title title="Account" />
      <Card.Content>
        <Button 
          mode="outlined" 
          onPress={onLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
}); 