import { useAppDispatch } from '../../../store';
import { logout } from '../../../store/slices/userSlice';
import { logout as logoutService } from '../../auth/services/authService';
import { Alert } from 'react-native';

export function useProfileActions() {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
    } catch {
      console.log('Logout error');
    }
  };

  const handleUpdateProfile = async (setLoading: (loading: boolean) => void) => {
    setLoading(true);
    try {
      // For now, we'll just show a success message
      // In a real app, you'd update the user data in storage
      Alert.alert('Success', 'Profile updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogout,
    handleUpdateProfile,
  };
} 