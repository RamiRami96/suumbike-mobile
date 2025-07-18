export type Room = {
  id: string;
  name: string;
  userId: string; // The user who owns this room
  createdAt: number;
  occupied?: boolean; // true if someone is in the room
  users?: string[]; // Array of user IDs who have joined the room
};

export default Room; 