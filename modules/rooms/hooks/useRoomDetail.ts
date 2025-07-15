import { useEffect, useRef, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../../store';
import { router } from 'expo-router';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
  RTCIceCandidate,
} from 'react-native-webrtc';

export function useRoomDetail(id: string) {
  const user = useUser();
  const [opponent, setOpponent] = useState<any>(null);
  const [callDoc, setCallDoc] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const pc = useRef<any>(null);
  const localStream = useRef<any>(null);

  useEffect(() => {
    const unsub = firestore().collection('calls').doc(id).onSnapshot((doc: any) => {
      setCallDoc(doc.data());
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (
      callDoc?.offer &&
      !callDoc?.answer &&
      !isInCall &&
      !isCalling
    ) {
      joinCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callDoc]);

  useEffect(() => {
    const fetchOpponent = async () => {
      if (!user) return;
      const roomDoc = await firestore().collection('rooms').doc(id).get();
      const roomData = roomDoc.data();
      if (!roomData) return;
      const opponentId = (roomData.users || []).find((uid: string) => uid !== user.id);
      if (!opponentId) return;
      const opponentDoc = await firestore().collection('users').doc(opponentId).get();
      setOpponent(opponentDoc.data());
    };
    fetchOpponent();
  }, [id, user]);

  const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  const joinCall = async () => {
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
    router.push('/profile');
  };

  const handleReject = () => {
    router.push('/');
  };

  return {
    user,
    opponent,
    callDoc,
    isCalling,
    isInCall,
    handlePass,
    handleReject,
  };
} 