import type { User, Post } from '@/types';

export const placeholderUsers: User[] = [
  {
    id: '1',
    username: 'FarmerJohn',
    name: 'John Appleseed',
    avatarUrl: 'https://placehold.co/100x100.png?a=1',
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
    avatarUrl: 'https://placehold.co/100x100.png?a=2',
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
    avatarUrl: 'https://placehold.co/100x100.png?a=3',
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
    imageUrl: 'https://placehold.co/600x400.png?a=p1',
    caption: 'Beautiful sunrise over the cornfields today! Feeling blessed. 🌽☀️ #farminglife #sunrise #cornfield',
    hashtags: ['#farminglife', '#sunrise', '#cornfield', '#organic'],
    likesCount: 152,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'p2',
    user: placeholderUsers[1],
    imageUrl: 'https://placehold.co/600x500.png?a=p2',
    caption: 'Harvesting our first batch of organic tomatoes. They are looking juicy! 🍅😋 #organic #harvest #tomatoes #farmtotable',
    hashtags: ['#organic', '#harvest', '#tomatoes', '#farmtotable', '#growyourown'],
    likesCount: 230,
    commentsCount: 25,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'p3',
    user: placeholderUsers[0],
    caption: 'Just finished planting the new batch of pumpkin seeds. Can\'t wait for Halloween! 🎃 #pumpkins #plantingseason #fallharvest',
    hashtags: ['#pumpkins', '#plantingseason', '#fallharvest'],
    likesCount: 98,
    commentsCount: 7,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'p4',
    user: placeholderUsers[2],
    imageUrl: 'https://placehold.co/500x500.png?a=p4',
    caption: 'My rooftop microgreens are thriving! So much flavor in these tiny plants. 🌱 #urbanfarming #microgreens #rooftopgarden #cityfarmer',
    hashtags: ['#urbanfarming', '#microgreens', '#rooftopgarden', '#cityfarmer'],
    likesCount: 120,
    commentsCount: 18,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

export function getPlaceholderUser(userId: string): User | undefined {
  return placeholderUsers.find(user => user.id === userId);
}

export function getPlaceholderPostsForUser(userId: string): Post[] {
  return placeholderPosts.filter(post => post.user.id === userId);
}
