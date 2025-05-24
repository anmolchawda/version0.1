
// src/app/(app)/mandi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, CalendarDays, ListFilter, Building2, Wheat, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

// Placeholder data
const placeholderStates = [
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

const placeholderCities: Record<string, { value: string; label: string }[]> = {
  ap: [
    { value: 'vizag', label: 'Visakhapatnam' },
    { value: 'vijayawada', label: 'Vijayawada' },
    { value: 'guntur', label: 'Guntur' },
    { value: 'nellore', label: 'Nellore' },
    { value: 'kurnool', label: 'Kurnool' },
  ],
  ar: [
    { value: 'itanagar', label: 'Itanagar' },
    { value: 'naharlagun', label: 'Naharlagun' },
  ],
  as: [
    { value: 'guwahati', label: 'Guwahati' },
    { value: 'dibrugarh', label: 'Dibrugarh' },
    { value: 'silchar', label: 'Silchar' },
  ],
  br: [
    { value: 'patna', label: 'Patna' },
    { value: 'gaya', label: 'Gaya' },
    { value: 'bhagalpur', label: 'Bhagalpur' },
    { value: 'muzaffarpur', label: 'Muzaffarpur' },
  ],
  cg: [
    { value: 'raipur', label: 'Raipur' },
    { value: 'bilaspur', label: 'Bilaspur' },
    { value: 'durg', label: 'Durg' },
  ],
  dl: [
    { value: 'nd', label: 'New Delhi' },
    { value: 'sd', label: 'South Delhi' },
    { value: 'wd', label: 'West Delhi' },
    { value: 'ed', label: 'East Delhi' },
    { value: 'nod', label: 'North Delhi' },
  ],
  ga: [
    { value: 'panaji', label: 'Panaji' },
    { value: 'margao', label: 'Margao' },
    { value: 'vasco', label: 'Vasco da Gama' },
  ],
  gj: [
    { value: 'ahmedabad', label: 'Ahmedabad' },
    { value: 'surat', label: 'Surat' },
    { value: 'vadodara', label: 'Vadodara' },
    { value: 'rajkot', label: 'Rajkot' },
  ],
  hr: [
    { value: 'faridabad', label: 'Faridabad' },
    { value: 'gurugram', label: 'Gurugram' },
    { value: 'panipat', label: 'Panipat' },
    { value: 'ambala', label: 'Ambala' },
  ],
  hp: [
    { value: 'shimla', label: 'Shimla' },
    { value: 'manali', label: 'Manali' },
    { value: 'dharamshala', label: 'Dharamshala' },
  ],
  jh: [
    { value: 'ranchi', label: 'Ranchi' },
    { value: 'jamshedpur', label: 'Jamshedpur' },
    { value: 'dhanbad', label: 'Dhanbad' },
  ],
  ka: [
    { value: 'bengaluru', label: 'Bengaluru' },
    { value: 'mysuru', label: 'Mysuru' },
    { value: 'mangaluru', label: 'Mangaluru' },
    { value: 'hubli', label: 'Hubli-Dharwad' },
  ],
  kl: [
    { value: 'thiruvananthapuram', label: 'Thiruvananthapuram' },
    { value: 'kochi', label: 'Kochi' },
    { value: 'kozhikode', label: 'Kozhikode' },
    { value: 'thrissur', label: 'Thrissur' },
  ],
  mp: [
    { value: 'indore', label: 'Indore' },
    { value: 'bhopal', label: 'Bhopal' },
    { value: 'jabalpur', label: 'Jabalpur' },
    { value: 'gwalior', label: 'Gwalior' },
  ],
  mh: [
    { value: 'mum', label: 'Mumbai' },
    { value: 'pun', label: 'Pune' },
    { value: 'ngp', label: 'Nagpur' },
    { value: 'nsk', label: 'Nashik' },
    { value: 'aur', label: 'Aurangabad' },
  ],
  mn: [{ value: 'imphal', label: 'Imphal' }],
  ml: [{ value: 'shillong', label: 'Shillong' }],
  mz: [{ value: 'aizawl', label: 'Aizawl' }],
  nl: [
    { value: 'kohima', label: 'Kohima' },
    { value: 'dimapur', label: 'Dimapur' },
  ],
  od: [
    { value: 'bhubaneswar', label: 'Bhubaneswar' },
    { value: 'cuttack', label: 'Cuttack' },
    { value: 'rourkela', label: 'Rourkela' },
  ],
  pb: [
    { value: 'ludhiana', label: 'Ludhiana' },
    { value: 'amritsar', label: 'Amritsar' },
    { value: 'jalandhar', label: 'Jalandhar' },
  ],
  rj: [
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'jodhpur', label: 'Jodhpur' },
    { value: 'kota', label: 'Kota' },
    { value: 'udaipur', label: 'Udaipur' },
  ],
  sk: [{ value: 'gangtok', label: 'Gangtok' }],
  tn: [
    { value: 'chennai', label: 'Chennai' },
    { value: 'coimbatore', label: 'Coimbatore' },
    { value: 'madurai', label: 'Madurai' },
    { value: 'trichy', label: 'Tiruchirappalli' },
  ],
  ts: [
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'warangal', label: 'Warangal' },
    { value: 'nizamabad', label: 'Nizamabad' },
  ],
  tr: [{ value: 'agartala', label: 'Agartala' }],
  up: [
    { value: 'lucknow', label: 'Lucknow' },
    { value: 'kanpur', label: 'Kanpur' },
    { value: 'ghaziabad', label: 'Ghaziabad' },
    { value: 'agra', label: 'Agra' },
    { value: 'varanasi', label: 'Varanasi' },
  ],
  uk: [
    { value: 'dehradun', label: 'Dehradun' },
    { value: 'haridwar', label: 'Haridwar' },
    { value: 'roorkee', label: 'Roorkee' },
  ],
  wb: [
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'howrah', label: 'Howrah' },
    { value: 'durgapur', label: 'Durgapur' },
    { value: 'siliguri', label: 'Siliguri' },
  ],
  an: [{ value: 'portblair', label: 'Port Blair' }],
  ch: [{ value: 'chandigarh', label: 'Chandigarh' }],
  dn: [
    { value: 'daman', label: 'Daman' },
    { value: 'silvassa', label: 'Silvassa' },
  ],
  jk: [
    { value: 'srinagar', label: 'Srinagar' },
    { value: 'jammu', label: 'Jammu' },
  ],
  la: [
    { value: 'leh', label: 'Leh' },
    { value: 'kargil', label: 'Kargil' },
  ],
  ld: [{ value: 'kavaratti', label: 'Kavaratti' }],
  py: [{ value: 'puducherry', label: 'Puducherry' }],
};


const placeholderCrops = [
  {
    id: 'crop1',
    name: 'Organic Tomatoes',
    variety: 'Heirloom Blend',
    quantity: '120 lbs',
    price: '$2.75/lb',
    imageUrl: 'https://placehold.co/300x200.png?text=Tomatoes',
    aiHint: 'tomatoes vegetable',
    seller: { id: '1', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
    listedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    location: 'Mumbai, MH'
  },
  {
    id: 'crop2',
    name: 'Sweet Corn',
    variety: 'Golden Bantam',
    quantity: '75 dozen',
    price: '$3.50/dozen',
    imageUrl: 'https://placehold.co/300x200.png?text=Corn',
    aiHint: 'corn vegetable',
    seller: { id: '2', username: 'GreenThumbSarah', avatarUrl: 'https://placehold.co/40x40.png?text=GS&a=s2' },
    listedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    location: 'New Delhi, DL'
  },
  {
    id: 'crop3',
    name: 'Fresh Apples',
    variety: 'Gala Supreme',
    quantity: '25 bushels',
    price: '$18.00/bushel',
    imageUrl: 'https://placehold.co/300x200.png?text=Apples',
    aiHint: 'apples fruit',
    seller: { id: '1', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
    listedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    location: 'Pune, MH'
  },
  {
    id: 'crop4',
    name: 'Bell Peppers',
    variety: 'Mixed Colors',
    quantity: '50 lbs',
    price: '$2.00/lb',
    imageUrl: 'https://placehold.co/300x200.png?text=Peppers',
    aiHint: 'peppers vegetable',
    seller: { id: '3', username: 'UrbanHarvester', avatarUrl: 'https://placehold.co/40x40.png?text=UH&a=s3' },
    listedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    location: 'South Delhi, DL'
  },
];

export default function MandiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (selectedState) {
      setAvailableCities(placeholderCities[selectedState as keyof typeof placeholderCities] || []);
      setSelectedCity(undefined); // Reset city when state changes
    } else {
      setAvailableCities([]);
      setSelectedCity(undefined);
    }
  }, [selectedState]);

  // Filtering logic
  const filteredCrops = placeholderCrops.filter(crop => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = crop.name.toLowerCase().includes(searchLower) ||
                          crop.variety.toLowerCase().includes(searchLower) ||
                          crop.seller.username.toLowerCase().includes(searchLower) ||
                          crop.location.toLowerCase().includes(searchLower);
    
    // Get full state label for matching, e.g. "Maharashtra" from "mh"
    const stateLabel = selectedState ? placeholderStates.find(s => s.value === selectedState)?.label.toLowerCase() : undefined;
    // Get full city label for matching
    const cityLabel = selectedCity && selectedState ? (placeholderCities[selectedState as keyof typeof placeholderCities] || []).find(c => c.value === selectedCity)?.label.toLowerCase() : undefined;

    const matchesState = stateLabel ? crop.location.toLowerCase().includes(stateLabel) : true;
    // If a state is selected, also check if city matches if selected, or pass if no city is selected
    const matchesCity = selectedState ? (cityLabel ? crop.location.toLowerCase().includes(cityLabel) : true) : true;
    
    return matchesSearch && matchesState && matchesCity;
  });


  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-accent/10 p-6">
          <div className="flex items-center space-x-4 text-primary">
            <Building2 className="h-10 w-10" />
            <div>
              <CardTitle className="text-3xl font-bold">Mandi (Marketplace)</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Discover and trade agricultural produce directly from farmers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Search and Filters */}
          <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-card">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search crops, varieties, sellers, or locations..."
                className="w-full pl-12 py-3 text-base rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full py-3 text-base rounded-lg">
                  <SelectValue placeholder="Filter by State" />
                </SelectTrigger>
                <SelectContent>
                  {placeholderStates.map(state => (
                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState || availableCities.length === 0}>
                <SelectTrigger className="w-full py-3 text-base rounded-lg">
                  <SelectValue placeholder="Filter by City" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.length > 0 ? availableCities.map(city => (
                    <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                  )) : <SelectItem value="no-cities" disabled>{!selectedState ? "Select a state first" : "No cities listed for this state"}</SelectItem>}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full py-3 text-base rounded-lg border-primary text-primary hover:bg-primary/10 md:col-span-1">
                <ListFilter className="mr-2 h-5 w-5" /> Apply Filters (WIP)
              </Button>
            </div>
          </div>

          {/* Crop Listings */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center">
              <Wheat className="mr-3 h-7 w-7"/> Available Crops
            </h2>
            {filteredCrops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCrops.map((crop) => (
                  <Card key={crop.id} className="shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <div className="relative w-full h-52 bg-muted">
                      <Image
                        src={crop.imageUrl}
                        alt={crop.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={crop.aiHint}
                      />
                       <Badge variant="default" className="absolute top-2 left-2 bg-primary/80 text-primary-foreground">
                          {crop.price}
                       </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-primary hover:underline">
                        <Link href={`/mandi/crop/${crop.id}`}>{crop.name}</Link>
                      </CardTitle>
                      <CardDescription>{crop.variety}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm flex-grow">
                      <p><strong className="text-foreground">Quantity:</strong> {crop.quantity}</p>
                       <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {crop.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <CalendarDays className="h-4 w-4 mr-1.5 text-primary" />
                        Listed: {format(new Date(crop.listedDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center pt-2">
                        <Avatar className="h-7 w-7 mr-2 border">
                          <AvatarImage src={crop.seller.avatarUrl} alt={crop.seller.username} data-ai-hint="person farmer" />
                          <AvatarFallback>{crop.seller.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Link href={`/profile/${crop.seller.id}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                          Sold by: @{crop.seller.username}
                        </Link>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 mt-auto">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        <ShoppingCart className="mr-2 h-4 w-4" /> View Details & Contact
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Wheat className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
                <p className="text-xl font-semibold text-muted-foreground">No crops found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters, or check back later!</p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
