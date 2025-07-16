import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../store';
import firestore from '@react-native-firebase/firestore';
import { User } from '../../auth/models/User';

export function useProfileState() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(user?.avatar || '');
  const [likedUsers, setLikedUsers] = useState<User[]>([]);

  const fetchLikedUsers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userDoc = await firestore().collection('users').doc(user.id).get();
      const userData = userDoc.data();
      if (userData?.likedUsers && Array.isArray(userData.likedUsers)) {
        // Limit concurrent requests to avoid rate limiting
        const batchSize = 10;
        const likedUsersData: User[] = [];
        
        for (let i = 0; i < userData.likedUsers.length; i += batchSize) {
          const batch = userData.likedUsers.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(async (userId: string) => {
              try {
                const likedUserDoc = await firestore().collection('users').doc(userId).get();
                return likedUserDoc.data() as User;
              } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
                return null;
              }
            })
          );
          likedUsersData.push(...batchResults.filter(Boolean) as User[]);
        }
        
        setLikedUsers(likedUsersData);
      }
    } catch (error) {
      console.error('Error fetching liked users:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLikedUsers();
    }
  }, [user?.id, fetchLikedUsers]);

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return {
    user,
    isLoading,
    selectedImage,
    likedUsers,
    handleImageSelected,
    setLoading,
  };
} 