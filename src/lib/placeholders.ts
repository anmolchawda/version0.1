
import type { User, Post, Comment, MandiListing, ChatMessage, FirestoreConversation, DisplayConversation, Yojna, DiscoverDisease } from '@/types'; // Updated imports
import { formatDistanceToNow } from 'date-fns';
import type { Timestamp } from 'firebase/firestore'; // Import Firebase Timestamp
// Removed NotebookText import as icon field is removed from Yojna
// import { NotebookText, ShieldAlert, CalendarDays as CalendarIconLucide } from 'lucide-react';

export const MOCK_USER_ID = '1'; // Current logged-in user for placeholders if needed, auth.currentUser.uid should be used mostly

export const placeholderUsers: User[] = [
  {
    id: '1',
    username: 'FarmerJohn',
    name: 'John Appleseed',
    avatarUrl: 'https://images.unsplash.com/photo-1543257605-17af419e3124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
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
    avatarUrl: 'https://images.unsplash.com/photo-1495812911089-ac29f92223d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
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
    avatarUrl: 'https://images.unsplash.com/photo-1528693404014-b13ebe6e723e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
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
    imageUrl: 'https://images.unsplash.com/reserve/22gQ9dqRziaAoZeBpZVY_kornmark-01.png?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxmYXJtJTIwZmllbGQlMjBjcm9wfGVufDB8fHx8MTc0ODgxMjI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Beautiful sunrise over the cornfields today! Feeling blessed. 🌽☀️ #farminglife #sunrise #cornfield',
    hashtags: ['#farminglife', '#sunrise', '#cornfield', '#organic'],
    likesCount: 152,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    user: placeholderUsers[1],
    imageUrl: 'https://images.unsplash.com/photo-1465378295786-5cb1fca555ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxmYXJtJTIwZmllbGQlMjBjcm9wfGVufDB8fHx8MTc0ODgxMjI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Harvesting our first batch of organic tomatoes. They are looking juicy! 🍅😋 #organic #harvest #tomatoes #farmtotable',
    hashtags: ['#organic', '#harvest', '#tomatoes', '#farmtotable', '#growyourown'],
    likesCount: 230,
    commentsCount: 1,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p3',
    user: placeholderUsers[0],
    caption: 'Just finished planting the new batch of pumpkin seeds. Can\'t wait for Halloween! 🎃 #pumpkins #plantingseason #fallharvest',
    hashtags: ['#pumpkins', '#plantingseason', '#fallharvest'],
    likesCount: 98,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p4',
    user: placeholderUsers[2],
    imageUrl: 'https://images.unsplash.com/photo-1422651973727-50f085c0b26f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmYXJtJTIwZmllbGQlMjBjcm9wfGVufDB8fHx8MTc0ODgxMjI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'My rooftop microgreens are thriving! So much flavor in these tiny plants. 🌱 #urbanfarming #microgreens #rooftopgarden #cityfarmer',
    hashtags: ['#urbanfarming', '#microgreens', '#rooftopgarden', '#cityfarmer'],
    likesCount: 120,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const placeholderCommentsData: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    user: placeholderUsers[1],
    text: 'Absolutely stunning view, John!',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    parentId: null,
  },
  {
    id: 'c2',
    postId: 'p1',
    user: placeholderUsers[2],
    text: 'Makes me miss the countryside. Great shot!',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    parentId: null,
  },
  {
    id: 'c3',
    postId: 'p2',
    user: placeholderUsers[0],
    text: 'Those tomatoes look delicious, Sarah! Well done.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    parentId: null,
  },
  {
    id: 'c4',
    postId: 'p1',
    user: placeholderUsers[0],
    text: 'Thanks Sarah! The early bird gets the worm, or in this case, the view! 😉',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    parentId: 'c1',
  },
];

const buildCommentTree = (comments: Comment[], parentId: string | null = null): Comment[] => {
  return comments
    .filter(comment => comment.parentId === parentId)
    .map(comment => ({
      ...comment,
      replies: buildCommentTree(comments, comment.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    })).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

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
  const flatComments = placeholderCommentsData.filter(comment => comment.postId === postId);
  return buildCommentTree(flatComments);
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    console.warn("Error formatting date string:", dateString, error);
    return 'Invalid date';
  }
}


// Mandi specific placeholder data
export const placeholderStates = [
  { value: 'ap', label: 'Andhra Pradesh' }, { value: 'ar', label: 'Arunachal Pradesh' },
  { value: 'as', label: 'Assam' }, { value: 'br', label: 'Bihar' },
  { value: 'cg', label: 'Chhattisgarh' }, { value: 'dl', label: 'Delhi' },
  { value: 'ga', label: 'Goa' }, { value: 'gj', label: 'Gujarat' },
  { value: 'hr', label: 'Haryana' }, { value: 'hp', label: 'Himachal Pradesh' },
  { value: 'jh', label: 'Jharkhand' }, { value: 'ka', label: 'Karnataka' },
  { value: 'kl', label: 'Kerala' }, { value: 'mp', label: 'Madhya Pradesh' },
  { value: 'mh', label: 'Maharashtra' }, { value: 'mn', label: 'Manipur' },
  { value: 'ml', label: 'Meghalaya' }, { value: 'mz', label: 'Mizoram' },
  { value: 'nl', label: 'Nagaland' }, { value: 'od', label: 'Odisha' },
  { value: 'pb', label: 'Punjab' }, { value: 'rj', label: 'Rajasthan' },
  { value: 'sk', label: 'Sikkim' }, { value: 'tn', label: 'Tamil Nadu' },
  { value: 'ts', label: 'Telangana' }, { value: 'tr', label: 'Tripura' },
  { value: 'up', label: 'Uttar Pradesh' }, { value: 'uk', label: 'Uttarakhand' },
  { value: 'wb', label: 'West Bengal' }, { value: 'an', label: 'Andaman and Nicobar Islands' },
  { value: 'ch', label: 'Chandigarh' }, { value: 'dn', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'jk', label: 'Jammu and Kashmir' }, { value: 'la', label: 'Ladakh' },
  { value: 'ld', label: 'Lakshadweep' }, { value: 'py', label: 'Puducherry' },
];

export const placeholderCities: Record<string, { value: string; label: string }[]> = {
  ap: [ { value: 'vizag', label: 'Visakhapatnam' }, { value: 'vijayawada', label: 'Vijayawada' }, { value: 'guntur', label: 'Guntur' }, { value: 'nellore', label: 'Nellore' }, { value: 'kurnool', label: 'Kurnool' }, { value: 'tirupati', label: 'Tirupati' }, { value: 'rajahmundry', label: 'Rajahmundry' }, { value: 'kakinada', label: 'Kakinada' }, { value: 'eluru', label: 'Eluru'}, { value: 'kadapa', label: 'Kadapa'} ],
  ar: [ { value: 'itanagar', label: 'Itanagar' }, { value: 'naharlagun', label: 'Naharlagun' }, { value: 'tawang', label: 'Tawang' }, { value: 'pasighat', label: 'Pasighat' } ],
  as: [ { value: 'guwahati', label: 'Guwahati' }, { value: 'dibrugarh', label: 'Dibrugarh' }, { value: 'silchar', label: 'Silchar' }, { value: 'jorhat', label: 'Jorhat' }, { value: 'tezpur', label: 'Tezpur' }, { value: 'nagaon', label: 'Nagaon' } ],
  br: [ { value: 'patna', label: 'Patna' }, { value: 'gaya', label: 'Gaya' }, { value: 'bhagalpur', label: 'Bhagalpur' }, { value: 'muzaffarpur', label: 'Muzaffarpur' }, { value: 'purnia', label: 'Purnia' }, { value: 'darbhanga', label: 'Darbhanga' } ],
  cg: [ { value: 'raipur', label: 'Raipur' }, { value: 'bilaspur', label: 'Bilaspur' }, { value: 'durg', label: 'Durg' }, { value: 'bhilai', label: 'Bhilai' }, { value: 'korba', label: 'Korba' }, { value: 'raigarh', label: 'Raigarh' } ],
  dl: [ { value: 'nd', label: 'New Delhi' }, { value: 'sd', label: 'South Delhi' }, { value: 'wd', label: 'West Delhi' }, { value: 'ed', label: 'East Delhi' }, { value: 'nod', label: 'North Delhi' }, { value: 'dwarka', label: 'Dwarka' }, { value: 'rohini', label: 'Rohini' }, { value: 'noida', label: 'Noida (NCR)'}, { value: 'gurgaon', label: 'Gurgaon (NCR)'} ],
  ga: [ { value: 'panaji', label: 'Panaji' }, { value: 'margao', label: 'Margao' }, { value: 'vasco', label: 'Vasco da Gama' }, { value: 'mapusa', label: 'Mapusa' }, { value: 'ponda', label: 'Ponda' } ],
  gj: [ { value: 'ahmedabad', label: 'Ahmedabad' }, { value: 'surat', label: 'Surat' }, { value: 'vadodara', label: 'Vadodara' }, { value: 'rajkot', label: 'Rajkot' }, { value: 'bhavnagar', label: 'Bhavnagar' }, { value: 'jamnagar', label: 'Jamnagar' }, { value: 'gandhinagar', label: 'Gandhinagar' } ],
  hr: [ { value: 'faridabad', label: 'Faridabad' }, { value: 'gurugram', label: 'Gurugram' }, { value: 'panipat', label: 'Panipat' }, { value: 'ambala', label: 'Ambala' }, { value: 'rohtak', label: 'Rohtak' }, { value: 'hisar', label: 'Hisar' }, { value: 'karnal', label: 'Karnal' } ],
  hp: [ { value: 'shimla', label: 'Shimla' }, { value: 'manali', label: 'Manali' }, { value: 'dharamshala', label: 'Dharamshala' }, { value: 'kullu', label: 'Kullu' }, { value: 'mandi_town', label: 'Mandi Town' }, { value: 'solan', label: 'Solan' } ],
  jh: [ { value: 'ranchi', label: 'Ranchi' }, { value: 'jamshedpur', label: 'Jamshedpur' }, { value: 'dhanbad', label: 'Dhanbad' }, { value: 'bokaro', label: 'Bokaro Steel City' }, { value: 'hazaribagh', label: 'Hazaribagh'} ],
  ka: [ { value: 'bengaluru', label: 'Bengaluru' }, { value: 'mysuru', label: 'Mysuru' }, { value: 'mangaluru', label: 'Mangaluru' }, { value: 'hubli', label: 'Hubli-Dharwad' }, { value: 'belagavi', label: 'Belagavi' }, { value: 'davangere', label: 'Davangere' }, { value: 'ballari', label: 'Ballari'} ],
  kl: [ { value: 'thiruvananthapuram', label: 'Thiruvananthapuram' }, { value: 'kochi', label: 'Kochi' }, { value: 'kozhikode', label: 'Kozhikode' }, { value: 'thrissur', label: 'Thrissur' }, { value: 'kollam', label: 'Kollam' }, { value: 'alappuzha', label: 'Alappuzha' }, { value: 'kannur', label: 'Kannur' } ],
  mp: [ { value: 'indore', label: 'Indore' }, { value: 'bhopal', label: 'Bhopal' }, { value: 'jabalpur', label: 'Jabalpur' }, { value: 'gwalior', label: 'Gwalior' }, { value: 'ujjain', label: 'Ujjain' }, { value: 'sagar', label: 'Sagar' }, { value: 'rewa', label: 'Rewa'} ],
  mh: [ { value: 'mum', label: 'Mumbai' }, { value: 'pun', label: 'Pune' }, { value: 'ngp', label: 'Nagpur' }, { value: 'nsk', label: 'Nashik' }, { value: 'aur', label: 'Aurangabad (Chhatrapati Sambhajinagar)' }, { value: 'solapur', label: 'Solapur' }, { value: 'thane', label: 'Thane' }, { value: 'kolhapur', label: 'Kolhapur'} ],
  mn: [ { value: 'imphal', label: 'Imphal' }, { value: 'churachandpur', label: 'Churachandpur' } ],
  ml: [ { value: 'shillong', label: 'Shillong' }, { value: 'tura', label: 'Tura' } ],
  mz: [ { value: 'aizawl', label: 'Aizawl' }, { value: 'lunglei', label: 'Lunglei' } ],
  nl: [ { value: 'kohima', label: 'Kohima' }, { value: 'dimapur', label: 'Dimapur' } ],
  od: [ { value: 'bhubaneswar', label: 'Bhubaneswar' }, { value: 'cuttack', label: 'Cuttack' }, { value: 'rourkela', label: 'Rourkela' }, { value: 'puri', label: 'Puri' }, { value: 'sambalpur', label: 'Sambalpur' }, { value: 'berhampur', label: 'Berhampur' } ],
  pb: [ { value: 'ludhiana', label: 'Ludhiana' }, { value: 'amritsar', label: 'Amritsar' }, { value: 'jalandhar', label: 'Jalandhar' }, { value: 'patiala', label: 'Patiala' }, { value: 'bathinda', label: 'Bathinda' }, { value: 'mohali', label: 'Mohali' } ],
  rj: [ { value: 'jaipur', label: 'Jaipur' }, { value: 'jodhpur', label: 'Jodhpur' }, { value: 'kota', label: 'Kota' }, { value: 'udaipur', label: 'Udaipur' }, { value: 'ajmer', label: 'Ajmer' }, { value: 'bikaner', label: 'Bikaner' }, { value: 'alwar', label: 'Alwar' } ],
  sk: [ { value: 'gangtok', label: 'Gangtok' }, { value: 'namchi', label: 'Namchi' } ],
  tn: [ { value: 'chennai', label: 'Chennai' }, { value: 'coimbatore', label: 'Coimbatore' }, { value: 'madurai', label: 'Madurai' }, { value: 'trichy', label: 'Tiruchirappalli' }, { value: 'salem', label: 'Salem' }, { value: 'tirunelveli', label: 'Tirunelveli' }, { value: 'erode', label: 'Erode' } ],
  ts: [ { value: 'hyderabad', label: 'Hyderabad' }, { value: 'warangal', label: 'Warangal' }, { value: 'nizamabad', label: 'Nizamabad' }, { value: 'karimnagar', label: 'Karimnagar' }, { value: 'khammam', label: 'Khammam' } ],
  tr: [ { value: 'agartala', label: 'Agartala' }, { value: 'udaipur_tr', label: 'Udaipur (Tripura)' } ],
  up: [ { value: 'lucknow', label: 'Lucknow' }, { value: 'kanpur', label: 'Kanpur' }, { value: 'ghaziabad', label: 'Ghaziabad' }, { value: 'agra', label: 'Agra' }, { value: 'varanasi', label: 'Varanasi' }, { value: 'meerut', label: 'Meerut' }, { value: 'prayagraj', label: 'Prayagraj' }, { value: 'noida', label: 'Noida' }, { value: 'bareilly', label: 'Bareilly' } ],
  uk: [ { value: 'dehradun', label: 'Dehradun' }, { value: 'haridwar', label: 'Haridwar' }, { value: 'roorkee', label: 'Roorkee' }, { value: 'nainital', label: 'Nainital' }, { value: 'haldwani', label: 'Haldwani' } ],
  wb: [ { value: 'kolkata', label: 'Kolkata' }, { value: 'howrah', label: 'Howrah' }, { value: 'durgapur', label: 'Durgapur' }, { value: 'siliguri', label: 'Siliguri' }, { value: 'asansol', label: 'Asansol' }, { value: 'darjeeling', label: 'Darjeeling' } ],
  an: [{ value: 'portblair', label: 'Port Blair' }],
  ch: [{ value: 'chandigarh', label: 'Chandigarh' }],
  dn: [ { value: 'daman', label: 'Daman' }, { value: 'silvassa', label: 'Silvassa' } ],
  jk: [ { value: 'srinagar', label: 'Srinagar' }, { value: 'jammu', label: 'Jammu' }, { value: 'anantnag', label: 'Anantnag' } ],
  la: [ { value: 'leh', label: 'Leh' }, { value: 'kargil', label: 'Kargil' } ],
  ld: [{ value: 'kavaratti', label: 'Kavaratti' }],
  py: [{ value: 'puducherry', label: 'Puducherry' }],
};

export const placeholderCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'crops', label: 'Crops' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'tractors', label: 'Tractors' },
  { value: 'equipments', label: 'Equipments' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'fungicides', label: 'Fungicides' },
  { value: 'mulching', label: 'Mulching' },
];

export const placeholderListings: MandiListing[] = [
  {
    id: 'item1',
    name: 'Organic Tomatoes',
    category: 'Crops',
    description: 'Heirloom Blend, juicy and ripe.',
    quantity: '120 lbs',
    price: '₹210/kg',
    imageUrl: 'https://placehold.co/300x200.png?text=Tomatoes',
    aiHint: 'tomatoes vegetable',
    seller: { id: '1', name: 'John Appleseed', username: 'FarmerJohn', avatarUrl: 'https://images.unsplash.com/photo-1543257605-17af419e3124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    listedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Mumbai, MH'
  },
  {
    id: 'item2',
    name: 'Hybrid Corn Seeds',
    category: 'Seeds',
    description: 'High yield, disease-resistant variety. Germination rate: 95%.',
    quantity: '50 kg bags',
    price: '₹1500/bag',
    imageUrl: 'https://placehold.co/300x200.png?text=Corn+Seeds',
    aiHint: 'corn seeds',
    seller: { id: '2', name: 'Sarah Green', username: 'GreenThumbSarah', avatarUrl: 'https://images.unsplash.com/photo-1495812911089-ac29f92223d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    listedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'New Delhi, DL'
  },
  {
    id: 'item3',
    name: 'Used Tractor - Model X',
    category: 'Tractors',
    description: '55 HP, 2018 model, well-maintained. 1200 hours run.',
    quantity: '1 unit',
    price: '₹3,50,000',
    imageUrl: 'https://placehold.co/300x200.png?text=Tractor',
    aiHint: 'tractor farm',
    seller: { id: '1', name: 'John Appleseed', username: 'FarmerJohn', avatarUrl: 'https://images.unsplash.com/photo-1543257605-17af419e3124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    listedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    location: 'Pune, MH'
  },
  {
    id: 'item4',
    name: 'Organic Fertilizer Mix',
    category: 'Fertilizers',
    description: 'NPK rich, suitable for all vegetables. Compost based.',
    quantity: '25 kg bags',
    price: '₹800/bag',
    imageUrl: 'https://placehold.co/300x200.png?text=Fertilizer',
    aiHint: 'fertilizer organic',
    seller: { id: '3', name: 'Mike Chen', username: 'UrbanHarvester', avatarUrl: 'https://images.unsplash.com/photo-1528693404014-b13ebe6e723e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    listedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'South Delhi, DL'
  },
  {
    id: 'item5',
    name: 'Power Tiller',
    category: 'Equipments',
    description: 'Brand Y, 8 HP, Petrol Engine. Good for small to medium farms.',
    quantity: '1 unit',
    price: '₹45,000',
    imageUrl: 'https://placehold.co/300x200.png?text=Power+Tiller',
    aiHint: 'tiller equipment',
    seller: { id: '2', name: 'Sarah Green', username: 'GreenThumbSarah', avatarUrl: 'https://images.unsplash.com/photo-1495812911089-ac29f92223d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    listedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Bengaluru, KA'
  },
  {
    id: 'item6',
    name: 'Neem Oil Pesticide',
    category: 'Pesticides',
    description: 'Organic, cold-pressed neem oil. Effective against common pests.',
    quantity: '5 Liters',
    price: '₹1200/can',
    imageUrl: 'https://placehold.co/300x200.png?text=Pesticide',
    aiHint: 'neem oil',
    seller: { id: '1', name: 'John Appleseed', username: 'FarmerJohn', avatarUrl: 'https://images.unsplash.com/photo-1543257605-17af419e3124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBmYXJtZXJ8ZW58MHx8fHwxNzQ4ODEyMjgzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    listedDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    location: 'Ludhiana, PB'
  },
];

export const placeholderYojnas: Yojna[] = [
  {
    id: 'yojna1',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'A crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.',
    eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops in the notified areas are eligible for coverage.',
    benefits: 'Provides insurance coverage and financial support in case of crop failure. Stabilizes income of farmers.',
    link: 'https://pmfby.gov.in/',
    department: 'Ministry of Agriculture & Farmers Welfare',
  },
  {
    id: 'yojna2',
    name: 'Kisan Credit Card (KCC) Scheme',
    description: 'Provides farmers with timely access to credit for their cultivation and other needs.',
    eligibility: 'All farmers - individuals/joint borrowers who are owner cultivators; Tenant farmers, oral lessees & sharecroppers; SHGs or JLGs of farmers.',
    benefits: 'Adequate and timely credit support for agricultural needs, simplified loan procedures, flexibility in drawing cash.',
    department: 'Department of Financial Services, Ministry of Finance',
  },
  {
    id: 'yojna3',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
    description: 'Aims to enhance physical access of water on farm and expand cultivable area under assured irrigation, improve on-farm water use efficiency to reduce wastage of water.',
    benefits: 'Improved water availability and efficiency, leading to increased agricultural productivity and better water resource management.',
    link: 'https://pmksy.gov.in/',
    department: 'Ministry of Jal Shakti & Ministry of Agriculture',
  }
];

// Simplified list of diseases for Discover page search
export const placeholderDiscoverDiseases: DiscoverDisease[] = [
  {
    id: 'disease-tomato-early-blight',
    name: 'Early Blight',
    cropName: 'Tomato',
    cropSlug: 'tomato',
    symptomsSummary: 'Dark, concentric lesions on lower leaves; yellowing.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight.JPG?alt=media&token=6000b4ec-c6e4-4798-995f-1dc37859a6ab',
    aiHint: 'tomato blight',
  },
  {
    id: 'disease-potato-late-blight',
    name: 'Late Blight',
    cropName: 'Potato',
    cropSlug: 'potato',
    symptomsSummary: 'Water-soaked lesions on leaves and stems, white mold on undersides.',
    imageUrl: 'https://placehold.co/100x100.png?text=Potato+Blight',
    aiHint: 'potato blight',
  },
  {
    id: 'disease-tomato-late-blight',
    name: 'Late Blight',
    cropName: 'Tomato',
    cropSlug: 'tomato',
    symptomsSummary: 'Dark, water-soaked lesions on leaves, stems, and fruits. White mold may appear.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight%202.JPG?alt=media&token=55816d31-ddd3-45dc-85ac-571fceba877f', // Using an existing relevant tomato image for late blight
    aiHint: 'tomato blight disease',
  },
  {
    id: 'disease-corn-rust',
    name: 'Common Rust',
    cropName: 'Corn',
    cropSlug: 'corn',
    symptomsSummary: 'Small, cinnamon-brown pustules on both leaf surfaces.',
    imageUrl: 'https://placehold.co/100x100.png?text=Corn+Rust',
    aiHint: 'corn rust disease',
  }
];

