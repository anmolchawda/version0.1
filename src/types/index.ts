
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

export interface NavLink {
  href: string;
  label: string;
  icon?: JSX.Element;
}

export interface MandiListing {
  id: string;
  name: string; // Product name
  category: string; // e.g., 'Crops', 'Seeds', 'Tractors'
  description?: string; // For variety, specs, etc.
  quantity: string; // e.g., '120 lbs', '1 unit', '5 liters'
  price: string; // e.g., '₹275/kg', '$5000'
  imageUrl: string;
  aiHint: string;
  seller: { id: string; username: string; avatarUrl: string };
  listedDate: string; // ISO date string
  location: string; // City, State
}
