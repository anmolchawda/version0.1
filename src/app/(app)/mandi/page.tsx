
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
import { Search, MapPin, CalendarDays, Building2, ListChecks, ShoppingCart, PlusCircle, Filter, Store } from 'lucide-react';
import { format } from 'date-fns';
import { placeholderListings, placeholderCategories, placeholderStates, placeholderCities } from '@/lib/placeholders';


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
            <Store className="h-10 w-10" /> {/* Updated Icon */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"> {/* Changed to md:grid-cols-3 */}
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
              {/* Apply button is now removed from here to match 3-column layout without it needing to span */}
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
                <Link href="/mandi/add-crop">
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

    