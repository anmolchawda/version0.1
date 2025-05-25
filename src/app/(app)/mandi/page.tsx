
// src/app/(app)/mandi/page.tsx
'use client';

import type { MandiListing } from '@/types';
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
import { Search, MapPin, CalendarDays, Building2, ListChecks, ShoppingCart, PlusCircle, Filter } from 'lucide-react';
import { format } from 'date-fns';

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

const placeholderCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'crops', label: 'Crops' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'tractors', label: 'Tractors' },
  { value: 'farm_equipment', label: 'Farm Equipment' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'fungicides', label: 'Fungicides' },
];

const placeholderListings: MandiListing[] = [
  {
    id: 'item1',
    name: 'Organic Tomatoes',
    category: 'Crops',
    description: 'Heirloom Blend, juicy and ripe.',
    quantity: '120 lbs',
    price: '₹210/kg', // Example price in INR
    imageUrl: 'https://placehold.co/300x200.png?text=Tomatoes',
    aiHint: 'tomatoes vegetable',
    seller: { id: '1', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
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
    seller: { id: '2', username: 'GreenThumbSarah', avatarUrl: 'https://placehold.co/40x40.png?text=GS&a=s2' },
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
    seller: { id: '1', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
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
    seller: { id: '3', username: 'UrbanHarvester', avatarUrl: 'https://placehold.co/40x40.png?text=UH&a=s3' },
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
    seller: { id: '2', username: 'GreenThumbSarah', avatarUrl: 'https://placehold.co/40x40.png?text=GS&a=s2' },
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
    seller: { id: '1', username: 'FarmerJohn', avatarUrl: 'https://placehold.co/40x40.png?text=FJ&a=s1' },
    listedDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    location: 'Ludhiana, PB'
  },
];

export default function MandiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (selectedState) {
      setAvailableCities(placeholderCities[selectedState as keyof typeof placeholderCities] || []);
      setSelectedCity(undefined);
    } else {
      setAvailableCities([]);
      setSelectedCity(undefined);
    }
  }, [selectedState]);

  const filteredListings = placeholderListings.filter(listing => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = listing.name.toLowerCase().includes(searchLower) ||
                          (listing.description && listing.description.toLowerCase().includes(searchLower)) ||
                          listing.category.toLowerCase().includes(searchLower) ||
                          listing.seller.username.toLowerCase().includes(searchLower) ||
                          listing.location.toLowerCase().includes(searchLower);

    const stateLabel = selectedState ? placeholderStates.find(s => s.value === selectedState)?.label.toLowerCase() : undefined;
    const cityLabel = selectedCity && selectedState ? (placeholderCities[selectedState as keyof typeof placeholderCities] || []).find(c => c.value === selectedCity)?.label.toLowerCase() : undefined;

    let matchesLocation = true;
    if (selectedState) {
        if (cityLabel) {
            matchesLocation = listing.location.toLowerCase().includes(cityLabel);
        } else if (stateLabel) {
             // If only state is selected, we assume it means any city in that state.
             // The location string format is "City, ST_ABBREVIATION" or "City, State Name"
             // We'll check if the location string contains the state label (e.g., "Maharashtra")
             // or the state abbreviation (e.g., "MH" for Maharashtra).
             const stateObj = placeholderStates.find(s => s.value === selectedState);
             if (stateObj) {
                matchesLocation = listing.location.toLowerCase().includes(stateObj.label.toLowerCase()) || listing.location.toUpperCase().includes(`, ${stateObj.value.toUpperCase()}`);
             } else {
                matchesLocation = false;
             }
        }
    }
    
    const matchesCategory = selectedCategory === 'all' || listing.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesLocation && matchesCategory;
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
                Discover and trade agriculture products from here
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-card">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, categories, sellers, locations..."
                className="w-full pl-12 py-3 text-base rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full py-3 text-base rounded-lg">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  {placeholderCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  )) : <SelectItem value="no-cities" disabled>{!selectedState ? "Select a state first" : "No cities listed/select state"}</SelectItem>}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full py-3 text-base rounded-lg border-primary text-primary hover:bg-primary/10">
                 <Filter className="mr-2 h-4 w-4"/> Apply Filters
              </Button>
            </div>
          </div>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-primary flex items-center">
                <ListChecks className="mr-3 h-7 w-7"/> Marketplace Listings
              </h2>
              <Button
                asChild
                variant="default"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link href="/mandi/add-crop"> {/* Link remains /mandi/add-crop for now */}
                  <PlusCircle className="mr-2 h-5 w-5" /> List New Item
                </Link>
              </Button>
            </div>
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <div className="relative w-full h-52 bg-muted">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={listing.aiHint}
                      />
                       <Badge variant="default" className="absolute top-2 left-2 bg-primary/80 text-primary-foreground">
                          {listing.price}
                       </Badge>
                       <Badge variant="secondary" className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground">
                          {listing.category}
                       </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-primary hover:underline">
                        {/* Link to a future item detail page: /mandi/item/{listing.id} */}
                        <Link href={`#`}>{listing.name}</Link>
                      </CardTitle>
                      {listing.description && <CardDescription className="line-clamp-2">{listing.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm flex-grow">
                      <p><strong className="text-foreground">Quantity:</strong> {listing.quantity}</p>
                       <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {listing.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <CalendarDays className="h-4 w-4 mr-1.5 text-primary" />
                        Listed: {format(new Date(listing.listedDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center pt-2">
                        <Avatar className="h-7 w-7 mr-2 border">
                          <AvatarImage src={listing.seller.avatarUrl} alt={listing.seller.username} data-ai-hint="person farmer" />
                          <AvatarFallback>{listing.seller.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Link href={`/profile/${listing.seller.id}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                          Sold by: @{listing.seller.username}
                        </Link>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 mt-auto">
                       {/* This button can link to /mandi/item/{listing.id} in the future */}
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        <ShoppingCart className="mr-2 h-4 w-4" /> View Details & Contact
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
                <p className="text-xl font-semibold text-muted-foreground">No listings found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters, or check back later!</p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
