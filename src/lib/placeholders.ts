
import type { User, Post, Comment, MandiListing, ChatMessage } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export const MOCK_USER_ID = '1'; // Current logged-in user

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
    commentsCount: 3, // Updated to reflect actual comments and replies
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'p2',
    user: placeholderUsers[1],
    imageUrl: 'https://placehold.co/600x500.png?a=p2&text=Tomatoes',
    caption: 'Harvesting our first batch of organic tomatoes. They are looking juicy! 🍅😋 #organic #harvest #tomatoes #farmtotable',
    hashtags: ['#organic', '#harvest', '#tomatoes', '#farmtotable', '#growyourown'],
    likesCount: 230,
    commentsCount: 1,
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

export const placeholderCommentsData: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    user: placeholderUsers[1], // GreenThumbSarah
    text: 'Absolutely stunning view, John!',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    parentId: null,
  },
  {
    id: 'c2',
    postId: 'p1',
    user: placeholderUsers[2], // UrbanHarvester
    text: 'Makes me miss the countryside. Great shot!',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    parentId: null,
  },
  {
    id: 'c3',
    postId: 'p2',
    user: placeholderUsers[0], // FarmerJohn
    text: 'Those tomatoes look delicious, Sarah! Well done.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    parentId: null,
  },
  {
    id: 'c4', // A reply to c1
    postId: 'p1',
    user: placeholderUsers[0], // FarmerJohn replies to GreenThumbSarah
    text: 'Thanks Sarah! The early bird gets the worm, or in this case, the view! 😉',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 minutes ago
    parentId: 'c1',
  },
];

// Helper function to build the comment tree
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
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}


// Mandi specific placeholder data
export const placeholderStates = [
  { value: 'ap', label: 'Andhra Pradesh' },
  { value: 'ar', label: 'Arunachal Pradesh' },
  { value: 'as', label: 'Assam' },
  { value: 'br', label: 'Bihar' },
  { value: 'cg', label: 'Chhattisgarh' },
  { value: 'dl', label: 'Delhi' },
  { value: 'ga', label: 'Goa' },
  { value: 'gj', label: 'Gujarat' },
  { value: 'hr', label: 'Haryana' },
  { value: 'hp', label: 'Himachal Pradesh' },
  { value: 'jh', label: 'Jharkhand' },
  { value: 'ka', label: 'Karnataka' },
  { value: 'kl', label: 'Kerala' },
  { value: 'mp', label: 'Madhya Pradesh' },
  { value: 'mh', label: 'Maharashtra' },
  { value: 'mn', label: 'Manipur' },
  { value: 'ml', label: 'Meghalaya' },
  { value: 'mz', label: 'Mizoram' },
  { value: 'nl', label: 'Nagaland' },
  { value: 'od', label: 'Odisha' },
  { value: 'pb', label: 'Punjab' },
  { value: 'rj', label: 'Rajasthan' },
  { value: 'sk', label: 'Sikkim' },
  { value: 'tn', label: 'Tamil Nadu' },
  { value: 'ts', label: 'Telangana' },
  { value: 'tr', label: 'Tripura' },
  { value: 'up', label: 'Uttar Pradesh' },
  { value: 'uk', label: 'Uttarakhand' },
  { value: 'wb', label: 'West Bengal' },
  { value: 'an', label: 'Andaman and Nicobar Islands' },
  { value: 'ch', label: 'Chandigarh' },
  { value: 'dn', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'jk', label: 'Jammu and Kashmir' },
  { value: 'la', label: 'Ladakh' },
  { value: 'ld', label: 'Lakshadweep' },
  { value: 'py', label: 'Puducherry' },
];

export const placeholderCities: Record<string, { value: string; label: string }[]> = {
  ap: [ /* Andhra Pradesh */
    { value: 'vizag', label: 'Visakhapatnam' }, { value: 'vijayawada', label: 'Vijayawada' },
    { value: 'guntur', label: 'Guntur' }, { value: 'nellore', label: 'Nellore' },
    { value: 'kurnool', label: 'Kurnool' }, { value: 'tirupati', label: 'Tirupati' },
    { value: 'rajahmundry', label: 'Rajahmundry' }, { value: 'kakinada', label: 'Kakinada' },
    { value: 'eluru', label: 'Eluru'}, { value: 'kadapa', label: 'Kadapa'}
  ],
  ar: [ /* Arunachal Pradesh */
    { value: 'itanagar', label: 'Itanagar' }, { value: 'naharlagun', label: 'Naharlagun' },
    { value: 'tawang', label: 'Tawang' }, { value: 'pasighat', label: 'Pasighat' }
  ],
  as: [ /* Assam */
    { value: 'guwahati', label: 'Guwahati' }, { value: 'dibrugarh', label: 'Dibrugarh' },
    { value: 'silchar', label: 'Silchar' }, { value: 'jorhat', label: 'Jorhat' },
    { value: 'tezpur', label: 'Tezpur' }, { value: 'nagaon', label: 'Nagaon' }
  ],
  br: [ /* Bihar */
    { value: 'patna', label: 'Patna' }, { value: 'gaya', label: 'Gaya' },
    { value: 'bhagalpur', label: 'Bhagalpur' }, { value: 'muzaffarpur', label: 'Muzaffarpur' },
    { value: 'purnia', label: 'Purnia' }, { value: 'darbhanga', label: 'Darbhanga' }
  ],
  cg: [ /* Chhattisgarh */
    { value: 'raipur', label: 'Raipur' }, { value: 'bilaspur', label: 'Bilaspur' },
    { value: 'durg', label: 'Durg' }, { value: 'bhilai', label: 'Bhilai' },
    { value: 'korba', label: 'Korba' }, { value: 'raigarh', label: 'Raigarh' }
  ],
  dl: [ /* Delhi */
    { value: 'nd', label: 'New Delhi' }, { value: 'sd', label: 'South Delhi' },
    { value: 'wd', label: 'West Delhi' }, { value: 'ed', label: 'East Delhi' },
    { value: 'nod', label: 'North Delhi' }, { value: 'dwarka', label: 'Dwarka' },
    { value: 'rohini', label: 'Rohini' }, { value: 'noida', label: 'Noida (NCR)'}, { value: 'gurgaon', label: 'Gurgaon (NCR)'}
  ],
  ga: [ /* Goa */
    { value: 'panaji', label: 'Panaji' }, { value: 'margao', label: 'Margao' },
    { value: 'vasco', label: 'Vasco da Gama' }, { value: 'mapusa', label: 'Mapusa' },
    { value: 'ponda', label: 'Ponda' }
  ],
  gj: [ /* Gujarat */
    { value: 'ahmedabad', label: 'Ahmedabad' }, { value: 'surat', label: 'Surat' },
    { value: 'vadodara', label: 'Vadodara' }, { value: 'rajkot', label: 'Rajkot' },
    { value: 'bhavnagar', label: 'Bhavnagar' }, { value: 'jamnagar', label: 'Jamnagar' },
    { value: 'gandhinagar', label: 'Gandhinagar' }
  ],
  hr: [ /* Haryana */
    { value: 'faridabad', label: 'Faridabad' }, { value: 'gurugram', label: 'Gurugram' },
    { value: 'panipat', label: 'Panipat' }, { value: 'ambala', label: 'Ambala' },
    { value: 'rohtak', label: 'Rohtak' }, { value: 'hisar', label: 'Hisar' },
    { value: 'karnal', label: 'Karnal' }
  ],
  hp: [ /* Himachal Pradesh */
    { value: 'shimla', label: 'Shimla' }, { value: 'manali', label: 'Manali' },
    { value: 'dharamshala', label: 'Dharamshala' }, { value: 'kullu', label: 'Kullu' },
    { value: 'mandi_town', label: 'Mandi Town' }, { value: 'solan', label: 'Solan' }
  ],
  jh: [ /* Jharkhand */
    { value: 'ranchi', label: 'Ranchi' }, { value: 'jamshedpur', label: 'Jamshedpur' },
    { value: 'dhanbad', label: 'Dhanbad' }, { value: 'bokaro', label: 'Bokaro Steel City' },
    { value: 'hazaribagh', label: 'Hazaribagh'}
  ],
  ka: [ /* Karnataka */
    { value: 'bengaluru', label: 'Bengaluru' }, { value: 'mysuru', label: 'Mysuru' },
    { value: 'mangaluru', label: 'Mangaluru' }, { value: 'hubli', label: 'Hubli-Dharwad' },
    { value: 'belagavi', label: 'Belagavi' }, { value: 'davangere', label: 'Davangere' },
    { value: 'ballari', label: 'Ballari'}
  ],
  kl: [ /* Kerala */
    { value: 'thiruvananthapuram', label: 'Thiruvananthapuram' }, { value: 'kochi', label: 'Kochi' },
    { value: 'kozhikode', label: 'Kozhikode' }, { value: 'thrissur', label: 'Thrissur' },
    { value: 'kollam', label: 'Kollam' }, { value: 'alappuzha', label: 'Alappuzha' },
    { value: 'kannur', label: 'Kannur' }
  ],
  mp: [ /* Madhya Pradesh */
    { value: 'indore', label: 'Indore' }, { value: 'bhopal', label: 'Bhopal' },
    { value: 'jabalpur', label: 'Jabalpur' }, { value: 'gwalior', label: 'Gwalior' },
    { value: 'ujjain', label: 'Ujjain' }, { value: 'sagar', label: 'Sagar' },
    { value: 'rewa', label: 'Rewa'}
  ],
  mh: [ /* Maharashtra */
    { value: 'mum', label: 'Mumbai' }, { value: 'pun', label: 'Pune' },
    { value: 'ngp', label: 'Nagpur' }, { value: 'nsk', label: 'Nashik' },
    { value: 'aur', label: 'Aurangabad (Chhatrapati Sambhajinagar)' }, { value: 'solapur', label: 'Solapur' },
    { value: 'thane', label: 'Thane' }, { value: 'kolhapur', label: 'Kolhapur'}
  ],
  mn: [ /* Manipur */
    { value: 'imphal', label: 'Imphal' }, { value: 'churachandpur', label: 'Churachandpur' }
  ],
  ml: [ /* Meghalaya */
    { value: 'shillong', label: 'Shillong' }, { value: 'tura', label: 'Tura' }
  ],
  mz: [ /* Mizoram */
    { value: 'aizawl', label: 'Aizawl' }, { value: 'lunglei', label: 'Lunglei' }
  ],
  nl: [ /* Nagaland */
    { value: 'kohima', label: 'Kohima' }, { value: 'dimapur', label: 'Dimapur' }
  ],
  od: [ /* Odisha */
    { value: 'bhubaneswar', label: 'Bhubaneswar' }, { value: 'cuttack', label: 'Cuttack' },
    { value: 'rourkela', label: 'Rourkela' }, { value: 'puri', label: 'Puri' },
    { value: 'sambalpur', label: 'Sambalpur' }, { value: 'berhampur', label: 'Berhampur' }
  ],
  pb: [ /* Punjab */
    { value: 'ludhiana', label: 'Ludhiana' }, { value: 'amritsar', label: 'Amritsar' },
    { value: 'jalandhar', label: 'Jalandhar' }, { value: 'patiala', label: 'Patiala' },
    { value: 'bathinda', label: 'Bathinda' }, { value: 'mohali', label: 'Mohali' }
  ],
  rj: [ /* Rajasthan */
    { value: 'jaipur', label: 'Jaipur' }, { value: 'jodhpur', label: 'Jodhpur' },
    { value: 'kota', label: 'Kota' }, { value: 'udaipur', label: 'Udaipur' },
    { value: 'ajmer', label: 'Ajmer' }, { value: 'bikaner', label: 'Bikaner' },
    { value: 'alwar', label: 'Alwar' }
  ],
  sk: [ /* Sikkim */
    { value: 'gangtok', label: 'Gangtok' }, { value: 'namchi', label: 'Namchi' }
  ],
  tn: [ /* Tamil Nadu */
    { value: 'chennai', label: 'Chennai' }, { value: 'coimbatore', label: 'Coimbatore' },
    { value: 'madurai', label: 'Madurai' }, { value: 'trichy', label: 'Tiruchirappalli' },
    { value: 'salem', label: 'Salem' }, { value: 'tirunelveli', label: 'Tirunelveli' },
    { value: 'erode', label: 'Erode' }
  ],
  ts: [ /* Telangana */
    { value: 'hyderabad', label: 'Hyderabad' }, { value: 'warangal', label: 'Warangal' },
    { value: 'nizamabad', label: 'Nizamabad' }, { value: 'karimnagar', label: 'Karimnagar' },
    { value: 'khammam', label: 'Khammam' }
  ],
  tr: [ /* Tripura */
    { value: 'agartala', label: 'Agartala' }, { value: 'udaipur_tr', label: 'Udaipur (Tripura)' }
  ],
  up: [ /* Uttar Pradesh */
    { value: 'lucknow', label: 'Lucknow' }, { value: 'kanpur', label: 'Kanpur' },
    { value: 'ghaziabad', label: 'Ghaziabad' }, { value: 'agra', label: 'Agra' },
    { value: 'varanasi', label: 'Varanasi' }, { value: 'meerut', label: 'Meerut' },
    { value: 'prayagraj', label: 'Prayagraj' }, { value: 'noida', label: 'Noida' },
    { value: 'bareilly', label: 'Bareilly' }
  ],
  uk: [ /* Uttarakhand */
    { value: 'dehradun', label: 'Dehradun' }, { value: 'haridwar', label: 'Haridwar' },
    { value: 'roorkee', label: 'Roorkee' }, { value: 'nainital', label: 'Nainital' },
    { value: 'haldwani', label: 'Haldwani' }
  ],
  wb: [ /* West Bengal */
    { value: 'kolkata', label: 'Kolkata' }, { value: 'howrah', label: 'Howrah' },
    { value: 'durgapur', label: 'Durgapur' }, { value: 'siliguri', label: 'Siliguri' },
    { value: 'asansol', label: 'Asansol' }, { value: 'darjeeling', label: 'Darjeeling' }
  ],
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
  { value: 'farm_equipment', label: 'Farm Equipment' },
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
    price: '₹210/kg', // Example price in INR
    imageUrl: 'https://placehold.co/300x200.png?text=Tomatoes',
    aiHint: 'tomatoes vegetable',
    seller: { id: '1', name: 'John Appleseed', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
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
    seller: { id: '2', name: 'Sarah Green', username: 'GreenThumbSarah', avatarUrl: 'https://placehold.co/40x40.png?text=GS&a=s2' },
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
    seller: { id: '1', name: 'John Appleseed', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
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
    seller: { id: '3', name: 'Mike Chen', username: 'UrbanHarvester', avatarUrl: 'https://placehold.co/40x40.png?text=UH&a=s3' },
    listedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'South Delhi, DL'
  },
  {
    id: 'item5',
    name: 'Power Tiller',
    category: 'Farm Equipment',
    description: 'Brand Y, 8 HP, Petrol Engine. Good for small to medium farms.',
    quantity: '1 unit',
    price: '₹45,000',
    imageUrl: 'https://placehold.co/300x200.png?text=Power+Tiller',
    aiHint: 'tiller equipment',
    seller: { id: '2', name: 'Sarah Green', username: 'GreenThumbSarah', avatarUrl: 'https://placehold.co/40x40.png?text=GS&a=s2' },
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
    seller: { id: '1', name: 'John Appleseed', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
    listedDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    location: 'Ludhiana, PB'
  },
];

// Mock Chat Messages
const placeholderChatMessages: Record<string, ChatMessage[]> = {
  '2': [ // Chat between MOCK_USER_ID ('1') and User '2' (Sarah Green)
    { id: 'msg1', senderId: '2', text: 'Hey John, are you going to the farmers market this weekend?', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: 'msg2', senderId: MOCK_USER_ID, text: 'Hi Sarah! Yes, I plan to. Will have lots of fresh apples!', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
    { id: 'msg3', senderId: '2', text: 'Great! I might need some for my pies.', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
    { id: 'msg4', senderId: MOCK_USER_ID, text: 'Sounds good, see you there!', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  ],
  '3': [ // Chat between MOCK_USER_ID ('1') and User '3' (Mike Chen)
    { id: 'msg5', senderId: MOCK_USER_ID, text: 'Mike, your microgreens setup looks amazing!', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    { id: 'msg6', senderId: '3', text: 'Thanks John! It\'s a lot of fun. Let me know if you want some samples.', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  ]
};

export function getPlaceholderMessagesForChat(chatPartnerId: string): ChatMessage[] {
  return placeholderChatMessages[chatPartnerId] || [];
}

    