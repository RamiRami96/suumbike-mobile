import { useEffect, useRef, useState, useCallback } from 'react';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
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
    const unsub = onSnapshot(doc(db, 'calls', id), (doc) => {
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
    
    const unsub = onSnapshot(doc(db, 'rooms', id), (doc: any) => {
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
    
    const unsub = onSnapshot(doc(db, 'users', user.id), (doc: any) => {
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
      const roomDoc = await getDoc(doc(db, 'rooms', id));
      const roomData = roomDoc.data();
      if (!roomData) return;
      
      // Check if current user is the room owner
      setIsOwner(roomData.userId === user.id);
      
      // If room has users array, find opponent
      if (roomData.users && roomData.users.length > 0) {
        const opponentId = roomData.users.find((uid: string) => uid !== user.id);
        if (opponentId) {
          const opponentDoc = await getDoc(doc(db, 'users', opponentId));
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
      await setDoc(doc(db, 'calls', id), { 
        offer: offer.toJSON(),
        createdAt: Date.now(),
        roomId: id
      });
      
      (pc.current as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          setDoc(doc(db, 'calls', id), {
            candidates: arrayUnion({
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
              candidate: event.candidate.candidate,
            }),
          });
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
      
      const callDoc = await getDoc(doc(db, 'calls', id));
      const offer = callDoc.data()?.offer;
      if (!offer) {
        Alert.alert('Error', 'No offer found. Please try again.');
        return;
      }
      
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      await setDoc(doc(db, 'calls', id), { answer: answer.toJSON() });
      
      (pc.current as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          setDoc(doc(db, 'calls', id), {
            candidates: arrayUnion({
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
              candidate: event.candidate.candidate,
            }),
          });
        }
      };
      
      onSnapshot(doc(db, 'calls', id, 'candidates'), (snapshot: any) => {
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
    const userRef = doc(db, 'users', user.id);
    const opponentRef = doc(db, 'users', opponent.id);
    await updateDoc(userRef, {
      likedUsers: arrayUnion(opponent.id)
    });
    await updateDoc(opponentRef, {
      likedUsers: arrayUnion(user.id)
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