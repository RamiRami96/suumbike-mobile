export type Call = {
  id: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: number;
  roomId: string;
};

export type CallCandidate = {
  id: string;
  candidate: RTCIceCandidateInit;
  createdAt: number;
};

export default Call; 