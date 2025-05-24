
export interface User {
  id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  produce?: string[];
  followersCount?: number;
  followingCount?: number;
  postCount?: number;
}

export interface Post {
  id: string;
  user: User;
  imageUrl?: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string; // ISO date string for consistent time handling
}

export interface Comment {
  id: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl'>; // User who made the comment
  postId: string;
  text: string;
  createdAt: string; // ISO date string
  parentId?: string | null; // ID of the comment this is a reply to
  replies?: Comment[]; // Nested replies
}
