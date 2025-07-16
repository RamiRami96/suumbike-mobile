import { useAppDispatch } from '../../../store';
import { logout } from '../../../store/slices/userSlice';
import { logout as logoutService } from '../../auth/services/authService';

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

 

  return {
    handleLogout,
  };
} 