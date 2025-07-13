export type User = {
  id: string;
  age: number;
  name: string;
  email: string;
  avatar: string;
  roomId?: string;
  likedUsers: User[];
};

export default User; 