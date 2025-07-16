import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImagePickerComponent from '@/modules/auth/components/ImagePicker';
import { register } from '../services/authService';
import { getAge, formatDate } from '../helpers/userHelpers';
import { validateEmail, validatePassword, validateName, validateDateOfBirth } from '../helpers/validation';
import { useRegistrationFormState } from '../hooks/useRegistrationFormState';
import { useAppDispatch } from '../../../store';
import { setUser } from '../../../store/slices/userSlice';
import auth from '@react-native-firebase/auth';

export default function RegistrationScreen() {
  const {
    isLoading,
    setIsLoading,
    selectedImage,
    setSelectedImage,
    dateOfBirth,
    setDateOfBirth,
    showDatePicker,
    setShowDatePicker,
  } = useRegistrationFormState();
  const { control, handleSubmit, formState: { errors }, setError, clearErrors } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  });
  const dispatch = useAppDispatch();

  const onSubmit = async (data: { name: string; email: string; password: string }) => {
    // Validate all fields
    const nameError = validateName(data.name);
    const emailError = validateEmail(data.email);
    const passwordError = validatePassword(data.password);
    const dateOfBirthError = validateDateOfBirth(dateOfBirth);
    
    if (nameError) {
      setError('name', { type: 'manual', message: nameError });
      return;
    }
    if (emailError) {
      setError('email', { type: 'manual', message: emailError });
      return;
    }
    if (passwordError) {
      setError('password', { type: 'manual', message: passwordError });
      return;
    }
    if (dateOfBirthError) {
      setError('root', { type: 'manual', message: dateOfBirthError });
      return;
    }
    
    const age = getAge(dateOfBirth!);
    setIsLoading(true);
    clearErrors('root');
    try {
      await register(data.email, data.password);
      const uid = auth().currentUser?.uid || '';
      dispatch(setUser({
        id: uid,
        email: data.email,
        name: data.name,
        age,
        avatar: selectedImage || '',
        likedUsers: [],
      }));
    } catch (error: any) {
      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
      }
      setError('root', { type: 'manual', message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerWrap}>
        <Card style={styles.card} elevation={4}>
          <Card.Title title="Register" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.formField}>
              <Controller
                control={control}
                name="name"
                rules={{ 
                  required: 'Name is required',
                  validate: (value) => validateName(value) || true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    error={!!errors.name}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.name && <Text style={styles.error}>{errors.name.message as string}</Text>}
            </View>
            <View style={styles.formField}>
              <Controller
                control={control}
                name="email"
                rules={{ 
                  required: 'Email is required',
                  validate: (value) => validateEmail(value) || true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    error={!!errors.email}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message as string}</Text>}
            </View>
            <View style={styles.formField}>
              <Controller
                control={control}
                name="password"
                rules={{ 
                  required: 'Password is required',
                  validate: (value) => validatePassword(value) || true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    style={styles.input}
                    error={!!errors.password}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.password && <Text style={styles.error}>{errors.password.message as string}</Text>}
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="calendar" size={18} color="#bdbdbd" style={{ marginRight: 12 }} />
                <Text style={styles.dateText}>
                  {dateOfBirth ? formatDate(dateOfBirth) : 'Select date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01')}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date('1900-01-01')}
                />
              )}
              {dateOfBirth && (
                <Text style={styles.agePreview}>Age: {getAge(dateOfBirth)}</Text>
              )}
            </View>
            <View style={styles.formField}>
              <ImagePickerComponent
                onImageSelected={handleImageSelected}
                currentImage={selectedImage}
                title="Profile Picture"
              />
            </View>
            {errors.root && <Text style={styles.error}>{errors.root.message as string}</Text>}
            <Button 
              mode="contained" 
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Register
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#19181e',
    width: '80%',
  },
  centerWrap: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#23222a',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  formField: {
    marginBottom: 24,
    width: '100%',
  },
  input: {
    borderRadius: 10,
    backgroundColor: '#3a3543',
    color: '#fff',
    fontSize: 16,
    borderWidth: 0,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  label: {
    color: '#bdbdbd',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3543',
    borderRadius: 10,
    paddingHorizontal: 16,
    minHeight: 56,
    marginTop: 2,
    marginBottom: 2,
    borderWidth: 0,
    width: '100%',
    position: 'relative',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  agePreview: {
    color: '#bdbdbd',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  error: {
    color: '#ff6b6b',
    marginTop: 4,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#a29bfe',
    borderRadius: 12,
    marginTop: 8,
    minHeight: 48,
    justifyContent: 'center',
    elevation: 0,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    color: '#23222a',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 0.5,
  },

}); 