// src/app/(app)/mandi/page.tsx
'use client';

import type { MandiListing } from '@/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, ListChecks, PlusCircle, RotateCcw, Briefcase } from 'lucide-react';
import { placeholderListings, placeholderCategories, placeholderStates, placeholderCities, MOCK_USER_ID } from '@/lib/placeholders';
import { MandiItemCard } from '@/components/mandi/mandi-item-card';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';


export default function MandiPage() {
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  const searchParams = useSearchParams(); // Get search params

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);
  
  // Initialize viewMode based on query parameter or default to 'buyer'
  const [viewMode, setViewMode] = useState<'buyer' | 'seller'>(() => {
    return searchParams.get('view') === 'seller' ? 'seller' : 'buyer';
  });

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
    
    let matchesViewMode = true;
    if (viewMode === 'seller') {
      matchesViewMode = authUserId ? listing.seller.id === authUserId : false;
    }
    
    return matchesSearch && matchesLocation && matchesCategory && matchesViewMode;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedState(undefined);
    setSelectedCity(undefined);
    setSelectedCategory('all');
    setAvailableCities([]);
  };

  const areFiltersActive = () => {
    return searchTerm !== '' || selectedState !== undefined || selectedCity !== undefined || selectedCategory !== 'all';
  };


  return (
    <div className="h-full flex flex-col">
      <Card className="shadow-xl rounded-xl overflow-hidden flex flex-col flex-grow">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-accent/10 p-4 sm:p-6">
          <div className="flex items-center space-x-4 text-primary">
            <Store className="h-10 w-10" />
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">{t('mandiTitle')}</CardTitle>
              <CardDescription className="text-sm sm:text-md text-muted-foreground">
                {t('mandiDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto flex-1 scrollbar-none">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'buyer' | 'seller')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="buyer">{t('mandiViewAsBuyer')}</TabsTrigger>
              <TabsTrigger value="seller">{t('mandiViewAsSeller')}</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-card">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, categories, sellers..."
                className="w-full pl-12 py-3 rounded-lg text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full py-3 rounded-lg text-sm sm:text-base">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  {placeholderCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full py-3 rounded-lg text-sm sm:text-base">
                  <SelectValue placeholder="Filter by State" />
                </SelectTrigger>
                <SelectContent>
                  {placeholderStates.map(state => (
                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState || availableCities.length === 0}>
                <SelectTrigger className="w-full py-3 rounded-lg text-sm sm:text-base">
                  <SelectValue placeholder="Filter by City" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.length > 0 ? availableCities.map(city => (
                    <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                  )) : <SelectItem value="no-cities" disabled>{!selectedState ? "Select a state first" : "No cities listed/select state"}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            {areFiltersActive() && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={handleResetFilters} size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center">
                <ListChecks className="mr-3 h-7 w-7"/>
                {viewMode === 'buyer' ? t('mandiMarketplaceListings') : t('mandiYourListingsTitle')}
              </h2>
              {viewMode === 'buyer' && (
                <Button
                  asChild
                  variant="default"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link href="/mandi/add-requirement"> 
                    <Briefcase className="mr-2 h-4 w-4" /> {t('mandiListRequirementButton')}
                  </Link>
                </Button>
              )}
              {viewMode === 'seller' && (
                <Button
                  asChild
                  variant="default"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link href="/mandi/add-crop">
                    <PlusCircle className="mr-2 h-5 w-5" /> {t('mandiListNewItem')}
                  </Link>
                </Button>
              )}
            </div>
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <MandiItemCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
                {viewMode === 'buyer' ? (
                  <>
                    <p className="text-lg sm:text-xl font-semibold text-muted-foreground">{t('mandiNoListingsBuyerPrompt')}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('mandiNoListingsBuyerSuggestion')}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg sm:text-xl font-semibold text-muted-foreground">{t('mandiNoListingsSellerPrompt')}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('mandiNoListingsSellerSuggestion')}</p>
                  </>
                )}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
