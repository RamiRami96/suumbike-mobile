import { useEffect, useRef, useState, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../../store';
import { router } from 'expo-router';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { deleteRoom, joinRoom } from '../services/roomService';
import { Alert } from 'react-native';
import { User } from '../../auth/models/User';
import { Call } from '../models/Call';
import { WEBRTC_CONFIG, MEDIA_CONSTRAINTS, OFFER_OPTIONS } from '../config/webrtcConfig';

export function useRoomDetail(id: string) {
  const user = useUser();
  const [opponent, setOpponent] = useState<User | null>(null);
  const [callDoc, setCallDoc] = useState<Call | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    const unsub = firestore().collection('calls').doc(id).onSnapshot((doc) => {
      const data = doc.data();
      if (data) {
        setCallDoc(data as Call);
      }
    });
    return () => unsub();
  }, [id]);

  // Monitor room for deletion (for guests)
  useEffect(() => {
    if (isOwner) return; // Only monitor for guests
    
    const unsub = firestore().collection('rooms').doc(id).onSnapshot((doc: any) => {
      if (!doc.exists()) {
        // Room was deleted - guest was rejected
        setRoomDeleted(true);
        Alert.alert(
          'Room Rejected',
          'Owner of the room rejected you',
          [
            {
              text: 'OK',
              onPress: () => router.push('/')
            }
          ]
        );
      }
    });
    
    return () => unsub();
  }, [id, isOwner]);

  // Monitor user's likedUsers for pass notification (for guests)
  useEffect(() => {
    if (isOwner || !user?.id) return; // Only monitor for guests
    
    const unsub = firestore().collection('users').doc(user.id).onSnapshot((doc: any) => {
      const userData = doc.data();
      if (userData?.likedUsers && opponent) {
        // Check if opponent was recently added to likedUsers
        const wasAdded = userData.likedUsers.some((likedUser: any) => likedUser.id === opponent.id);
        if (wasAdded && !roomDeleted) {
          Alert.alert(
            'Connection Made!',
            'Owner of the room added you in contacts. You can see them in your liked users.',
            [
              {
                text: 'View Profile',
                onPress: () => router.push('/profile')
              },
              {
                text: 'OK',
                onPress: () => router.push('/profile')
              }
            ]
          );
        }
      }
    });
    
    return () => unsub();
  }, [user?.id, isOwner, opponent, roomDeleted]);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!user) return;
      const roomDoc = await firestore().collection('rooms').doc(id).get();
      const roomData = roomDoc.data();
      if (!roomData) return;
      
      // Check if current user is the room owner
      setIsOwner(roomData.userId === user.id);
      
      // If room has users array, find opponent
      if (roomData.users && roomData.users.length > 0) {
        const opponentId = roomData.users.find((uid: string) => uid !== user.id);
        if (opponentId) {
          const opponentDoc = await firestore().collection('users').doc(opponentId).get();
          const opponentData = opponentDoc.data();
          if (opponentData) {
            setOpponent(opponentData as User);
          }
        }
      }

      // If user is not owner and room is not occupied, join the room
      if (!isOwner && !roomData.occupied && !hasJoined) {
        try {
          await joinRoom(id, user.id);
          setHasJoined(true);
        } catch (error) {
          console.error('Error joining room:', error);
        }
      }
    };
    fetchRoomData();
  }, [id, user, isOwner, hasJoined]);

  useEffect(() => {
    if (
      callDoc?.offer &&
      !callDoc?.answer &&
      !isInCall &&
      !isCalling &&
      opponent // Only join call if opponent is present
    ) {
      joinCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callDoc, opponent]);

  // Cleanup on unmount - if owner exits, delete room
  useEffect(() => {
    return () => {
      if (isOwner && !opponent) {
        // Only delete if owner and no opponent (room was waiting for partner)
        deleteRoom(id).catch(console.error);
      }
      
      // Cleanup WebRTC
      if (localStream.current) {
        localStream.current.getTracks().forEach((track: any) => track.stop());
      }
      if (pc.current) {
        pc.current.close();
      }
    };
  }, [id, isOwner, opponent]);

  const createOffer = useCallback(async () => {
    if (!isOwner || !opponent) return;
    
    setIsCalling(true);
    try {
      pc.current = new RTCPeerConnection(WEBRTC_CONFIG);
      const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStream.current = stream;
      stream.getTracks().forEach((track) => pc.current?.addTrack(track, stream));
      
      const offer = await pc.current.createOffer(OFFER_OPTIONS);
      await pc.current.setLocalDescription(offer);
      await firestore().collection('calls').doc(id).set({ 
        offer: offer.toJSON(),
        createdAt: Date.now(),
        roomId: id
      });
      
      (pc.current as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          firestore()
            .collection('calls')
            .doc(id)
            .collection('candidates')
            .add(event.candidate.toJSON());
        }
      };
      
      setIsInCall(true);
    } catch (error) {
      console.error('Error creating offer:', error);
      Alert.alert('Error', 'Failed to start call. Please try again.');
    }
  }, [isOwner, opponent, id]);

  const joinCall = async () => {
    if (!opponent) return;
    
    setIsCalling(true);
    try {
      pc.current = new RTCPeerConnection(WEBRTC_CONFIG);
      const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      localStream.current = stream;
      stream.getTracks().forEach((track) => pc.current?.addTrack(track, stream));
      
      const callDoc = await firestore().collection('calls').doc(id).get();
      const offer = callDoc.data()?.offer;
      if (!offer) {
        Alert.alert('Error', 'No offer found. Please try again.');
        return;
      }
      
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      await firestore().collection('calls').doc(id).update({ answer: answer.toJSON() });
      
      (pc.current as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          firestore()
            .collection('calls')
            .doc(id)
            .collection('candidates')
            .add(event.candidate.toJSON());
        }
      };
      
      firestore()
        .collection('calls')
        .doc(id)
        .collection('candidates')
        .onSnapshot((snapshot: any) => {
          snapshot.docChanges().forEach(async (change: any) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              await pc.current?.addIceCandidate(candidate);
            }
          });
        });
      
      setIsInCall(true);
    } catch (error) {
      console.error('Error joining call:', error);
      Alert.alert('Error', 'Failed to join call. Please try again.');
    }
  };

  // Start call when opponent joins (for room owner)
  useEffect(() => {
    if (isOwner && opponent && !isInCall && !isCalling) {
      createOffer();
    }
  }, [isOwner, opponent, isInCall, isCalling, createOffer]);

  const handlePass = async () => {
    if (!user || !opponent) return;
    const userRef = firestore().collection('users').doc(user.id);
    const opponentRef = firestore().collection('users').doc(opponent.id);
    await userRef.update({
      likedUsers: firestore.FieldValue.arrayUnion(opponent.id)
    });
    await opponentRef.update({
      likedUsers: firestore.FieldValue.arrayUnion(user.id)
    });
    // Delete room after successful pass
    await deleteRoom(id);
    router.push('/profile');
  };

  const handleReject = async () => {
    // Delete room when rejecting
    await deleteRoom(id);
    router.push('/');
  };

  return {
    user,
    opponent,
    callDoc,
    isCalling,
    isInCall,
    isOwner,
    handlePass,
    handleReject,
  };
} 