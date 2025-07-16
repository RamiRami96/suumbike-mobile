import { useEffect, useRef, useState, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../../store';
import { router } from 'expo-router';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  RTCIceCandidate,
} from 'react-native-webrtc';
import { deleteRoom, joinRoom } from '../services/roomService';

export function useRoomDetail(id: string) {
  const user = useUser();
  const [opponent, setOpponent] = useState<any>(null);
  const [callDoc, setCallDoc] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const pc = useRef<any>(null);
  const localStream = useRef<any>(null);

  useEffect(() => {
    const unsub = firestore().collection('calls').doc(id).onSnapshot((doc: any) => {
      setCallDoc(doc.data());
    });
    return () => unsub();
  }, [id]);

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
          setOpponent(opponentDoc.data());
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
    
    const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    setIsCalling(true);
    pc.current = new RTCPeerConnection(servers);
    const stream = await mediaDevices.getUserMedia({ audio: true });
    localStream.current = stream;
    stream.getTracks().forEach((track: any) => (pc.current as any)?.addTrack(track, stream));
    
    const offer = await (pc.current as any).createOffer({});
    await (pc.current as any).setLocalDescription(offer);
    await firestore().collection('calls').doc(id).set({ offer: offer.toJSON() });
    
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
  }, [isOwner, opponent, id]);

  const joinCall = async () => {
    if (!opponent) return;
    
    const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    setIsCalling(true);
    pc.current = new RTCPeerConnection(servers);
    const stream = await mediaDevices.getUserMedia({ audio: true });
    localStream.current = stream;
    stream.getTracks().forEach((track: any) => (pc.current as any)?.addTrack(track, stream));
    
    const callDoc = await firestore().collection('calls').doc(id).get();
    const offer = callDoc.data()?.offer;
    if (!offer) return alert('No offer found');
    
    await (pc.current as any).setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await (pc.current as any).createAnswer({});
    await (pc.current as any).setLocalDescription(answer);
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
            await (pc.current as any)?.addIceCandidate(candidate);
          }
        });
      });
    
    setIsInCall(true);
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
      likedUsers: firestore.FieldValue.arrayUnion(opponent)
    });
    await opponentRef.update({
      likedUsers: firestore.FieldValue.arrayUnion(user)
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