export type Room = {
  id: string;
  name: string;
  userId: string; // The user who owns this room
  createdAt: number;
};

export default Room; 