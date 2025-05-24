import type { User, Post, Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export const placeholderUsers: User[] = [
  {
    id: '1',
    username: 'FarmerJohn',
    name: 'John Appleseed',
    avatarUrl: 'https://placehold.co/100x100.png?a=1&text=FJ',
    bio: 'Proud farmer growing organic apples and corn. Sharing my journey one post at a time!',
    location: 'Sunnyvale, CA',
    produce: ['Apples', 'Corn', 'Pumpkins'],
    followersCount: 1250,
    followingCount: 300,
    postCount: 150,
  },
  {
    id: '2',
    username: 'GreenThumbSarah',
    name: 'Sarah Green',
    avatarUrl: 'https://placehold.co/100x100.png?a=2&text=GS',
    bio: 'Sustainable farming advocate. Specializing in heirloom tomatoes and free-range poultry.',
    location: 'Green Valley, OR',
    produce: ['Heirloom Tomatoes', 'Free-Range Eggs', 'Leafy Greens'],
    followersCount: 2300,
    followingCount: 450,
    postCount: 220,
  },
  {
    id: '3',
    username: 'UrbanHarvester',
    name: 'Mike Chen',
    avatarUrl: 'https://placehold.co/100x100.png?a=3&text=UC',
    bio: 'Bringing fresh produce to the city! Rooftop farming enthusiast.',
    location: 'Metro City, NY',
    produce: ['Microgreens', 'Herbs', 'Rooftop Vegetables'],
    followersCount: 850,
    followingCount: 150,
    postCount: 95,
  },
];

export const placeholderPosts: Post[] = [
  {
    id: 'p1',
    user: placeholderUsers[0],
    imageUrl: 'https://placehold.co/600x400.png?a=p1&text=Corn+Sunrise',
    caption: 'Beautiful sunrise over the cornfields today! Feeling blessed. 🌽☀️ #farminglife #sunrise #cornfield',
    hashtags: ['#farminglife', '#sunrise', '#cornfield', '#organic'],
    likesCount: 152,
    commentsCount: 2, // Updated to reflect actual comments below
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'p2',
    user: placeholderUsers[1],
    imageUrl: 'https://placehold.co/600x500.png?a=p2&text=Tomatoes',
    caption: 'Harvesting our first batch of organic tomatoes. They are looking juicy! 🍅😋 #organic #harvest #tomatoes #farmtotable',
    hashtags: ['#organic', '#harvest', '#tomatoes', '#farmtotable', '#growyourown'],
    likesCount: 230,
    commentsCount: 1, // Updated to reflect actual comments below
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'p3',
    user: placeholderUsers[0],
    caption: 'Just finished planting the new batch of pumpkin seeds. Can\'t wait for Halloween! 🎃 #pumpkins #plantingseason #fallharvest',
    hashtags: ['#pumpkins', '#plantingseason', '#fallharvest'],
    likesCount: 98,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'p4',
    user: placeholderUsers[2],
    imageUrl: 'https://placehold.co/500x500.png?a=p4&text=Microgreens',
    caption: 'My rooftop microgreens are thriving! So much flavor in these tiny plants. 🌱 #urbanfarming #microgreens #rooftopgarden #cityfarmer',
    hashtags: ['#urbanfarming', '#microgreens', '#rooftopgarden', '#cityfarmer'],
    likesCount: 120,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

export const placeholderComments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    user: placeholderUsers[1], // GreenThumbSarah
    text: 'Absolutely stunning view, John!',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 'c2',
    postId: 'p1',
    user: placeholderUsers[2], // UrbanHarvester
    text: 'Makes me miss the countryside. Great shot!',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: 'c3',
    postId: 'p2',
    user: placeholderUsers[0], // FarmerJohn
    text: 'Those tomatoes look delicious, Sarah! Well done.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
];

export function getPlaceholderUser(userId: string): User | undefined {
  return placeholderUsers.find(user => user.id === userId);
}

export function getPlaceholderPostById(postId: string): Post | undefined {
  return placeholderPosts.find(post => post.id === postId);
}

export function getPlaceholderPostsForUser(userId: string): Post[] {
  return placeholderPosts.filter(post => post.user.id === userId);
}

export function getPlaceholderCommentsForPost(postId: string): Comment[] {
  return placeholderComments.filter(comment => comment.postId === postId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function formatTimeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
