import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImagePickerComponent from '@/modules/auth/components/ImagePicker';
import { AuthService } from '../services/authService';
import { getAge, formatDate } from '../helpers/userHelpers';
import { useRegistrationFormState } from '../hooks/useRegistrationFormState';
import { useAppDispatch } from '../../../store';
import { setUser } from '../models/userSlice';

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
    if (!data.name || !data.email || !data.password || !dateOfBirth) {
      setError('root', { type: 'manual', message: 'Please fill all required fields' });
      return;
    }
    const age = getAge(dateOfBirth);
    if (age < 13 || age > 120) {
      setError('root', { type: 'manual', message: 'Age must be between 13 and 120' });
      return;
    }
    setIsLoading(true);
    clearErrors('root');
    try {
      const user = await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        age,
        avatar: selectedImage,
      });
      dispatch(setUser(user));
    } catch (error: any) {
      setError('root', { 
        type: 'manual', 
        message: error.message || 'Registration failed. Please try again.' 
      });
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
    <View style={styles.bg}>
      <View style={styles.centerWrap}>
        <Card style={styles.card} elevation={4}>
          <Card.Title title="Register" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.formField}>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
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
                rules={{ required: 'Email is required' }}
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
                rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
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
              style={styles.registerBtn}
              contentStyle={{ height: 48 }}
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
  bg: {
    flex: 1,
    backgroundColor: '#19181e',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 600,
    padding: 16,
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
  registerBtn: {
    marginTop: 8,
    borderRadius: 24,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
}); 