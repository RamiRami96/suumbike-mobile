import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';

type Props = {
  onImageSelected: (imageUri: string) => void;
  title?: string;
}

export default function ImagePickerComponent({ onImageSelected, title = "Upload profile image" }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to select images.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Removed image preview to avoid duplicate profile images */}
      <PaperButton
        mode="contained"
        icon={({ color }) => (
          <MaterialCommunityIcons name="camera-plus" size={18} color={color} style={{ marginRight: 10 }} />
        )}
        onPress={pickImage}
        loading={isLoading}
        disabled={isLoading}
        style={styles.uploadBtn}
        contentStyle={styles.uploadBtnContent}
        labelStyle={styles.uploadBtnLabel}
        uppercase={false}
      >
        {title}
      </PaperButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 8,
    width: '100%',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#a29bfe',
    marginBottom: 20,
    backgroundColor: '#23222a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  uploadBtn: {
    backgroundColor: '#3a3543',
    borderRadius: 10,
    minHeight: 56,
    width: '100%',
    justifyContent: 'center',
    elevation: 0,
    shadowColor: 'transparent',
    marginTop: 0,
    borderWidth: 0,
  },
  uploadBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  uploadBtnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400', 
    letterSpacing: 0.5,
  },
  image: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
  },
});