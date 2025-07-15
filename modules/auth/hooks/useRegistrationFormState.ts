import { useState } from 'react';

export function useRegistrationFormState() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  return {
    isLoading,
    setIsLoading,
    selectedImage,
    setSelectedImage,
    dateOfBirth,
    setDateOfBirth,
    showDatePicker,
    setShowDatePicker,
  };
} 