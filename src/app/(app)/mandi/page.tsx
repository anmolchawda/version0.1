
// src/app/(app)/mandi/page.tsx
'use client';

import type { MandiListing, BuyerRequirement, DisplayMandiListing, DisplayBuyerRequirement } from '@/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, ListChecks, PlusCircle, RotateCcw, Briefcase, ClipboardList, PackageSearch, Loader2 } from 'lucide-react';
import { placeholderCategories, placeholderStates, placeholderCities } from '@/lib/placeholders';
import { MandiItemCard } from '@/components/mandi/mandi-item-card';
import { BuyerRequirementCard } from '@/components/mandi/buyer-requirement-card';
import { useTranslations } from '@/hooks/useTranslations';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { db, collection, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from '@/lib/firebase';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type MandiViewMode = 'market' | 'requests' | 'my-products';

export default function MandiPage() {
  const { t } = useTranslations();
  const { authUserId } = useSidebarContext();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [marketListings, setMarketListings] = useState<DisplayMandiListing[]>([]);
  const [buyerRequirements, setBuyerRequirements] = useState<DisplayBuyerRequirement[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);
  
  const [viewMode, setViewMode] = useState<MandiViewMode>(() => {
    const queryView = searchParams.get('view');
    if (queryView === 'my-products' || queryView === 'seller') return 'my-products';
    if (queryView === 'requests') return 'requests';
    return 'market';
  });

  const fetchData = useCallback(async () => {
    if (!db) {
      toast({ title: 'Error', description: 'Database not available.', variant: 'destructive'});
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Fetch Listings
      const listingsQuery = query(collection(db, "mandi_listings"), orderBy("createdAt", "desc"));
      const listingsSnapshot = await getDocs(listingsQuery);
      const fetchedListings = listingsSnapshot.docs.map(doc => {
        const data = doc.data() as MandiListing;
        return {
          ...data,
          id: doc.id,
          listedDate: format((data.createdAt as Timestamp).toDate(), "MMM d, yy"),
        };
      });
      setMarketListings(fetchedListings);

      // Fetch Buyer Requests
      const requestsQuery = query(collection(db, "mandi_buyer_requests"), orderBy("createdAt", "desc"));
      const requestsSnapshot = await getDocs(requestsQuery);
      const fetchedRequests = requestsSnapshot.docs.map(doc => {
        const data = doc.data() as BuyerRequirement;
        return {
          ...data,
          id: doc.id,
          postedDate: format((data.createdAt as Timestamp).toDate(), "MMM d, yyyy"),
        };
      });
      setBuyerRequirements(fetchedRequests);

    } catch (error) {
        console.error("Error fetching Mandi data:", error);
        toast({ title: 'Error', description: 'Could not fetch marketplace data.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (selectedState) {
      setAvailableCities(placeholderCities[selectedState as keyof typeof placeholderCities] || []);
      setSelectedCity(undefined);
    } else {
      setAvailableCities([]);
      setSelectedCity(undefined);
    }
  }, [selectedState]);

  const filteredMarketListings = useMemo(() => marketListings.filter(listing => {
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
  }), [searchTerm, selectedState, selectedCity, selectedCategory, marketListings]);

  const filteredMyProducts = useMemo(() => marketListings.filter(listing => {
     const matchesUser = authUserId ? listing.seller.id === authUserId : false;
     if (!matchesUser) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = listing.name.toLowerCase().includes(searchLower) ||
                          (listing.description && listing.description.toLowerCase().includes(searchLower)) ||
                          listing.category.toLowerCase().includes(searchLower) ||
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
  }), [searchTerm, selectedState, selectedCity, selectedCategory, authUserId, marketListings]);


  const filteredBuyerRequests = useMemo(() => buyerRequirements.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = req.itemName.toLowerCase().includes(searchLower) ||
                          req.category.toLowerCase().includes(searchLower) ||
                          (req.preferredLocation && req.preferredLocation.toLowerCase().includes(searchLower)) ||
                          (req.specifications && req.specifications.toLowerCase().includes(searchLower)) ||
                          req.postedBy.username.toLowerCase().includes(searchLower);
    
    const stateLabel = selectedState ? placeholderStates.find(s => s.value === selectedState)?.label.toLowerCase() : undefined;
    const cityLabel = selectedCity && selectedState ? (placeholderCities[selectedState as keyof typeof placeholderCities] || []).find(c => c.value === selectedCity)?.label.toLowerCase() : undefined;

    let matchesLocation = true;
    if (selectedState && req.preferredLocation) {
        if (cityLabel) {
            matchesLocation = req.preferredLocation.toLowerCase().includes(cityLabel);
        } else if (stateLabel) {
             const stateObj = placeholderStates.find(s => s.value === selectedState);
             if (stateObj && req.preferredLocation) {
                matchesLocation = req.preferredLocation.toLowerCase().includes(stateObj.label.toLowerCase()) || req.preferredLocation.toUpperCase().includes(`, ${stateObj.value.toUpperCase()}`);
             } else {
                matchesLocation = false;
             }
        }
    }
    const matchesCategory = selectedCategory === 'all' || req.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesLocation && matchesCategory;
  }), [searchTerm, selectedState, selectedCity, selectedCategory, buyerRequirements]);


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

  const handleDeleteRequirement = async (requirementId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "mandi_buyer_requests", requirementId));
      setBuyerRequirements(prev => prev.filter(req => req.id !== requirementId));
      toast({
        title: t('mandiRequirementDeletedTitle'),
        description: `The requirement has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting requirement:", error);
      toast({ title: 'Error', description: 'Could not delete the requirement.', variant: 'destructive'});
    }
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
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as MandiViewMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="market">{t('mandiMarketplaceTab')}</TabsTrigger>
              <TabsTrigger value="requests">{t('mandiBuyerRequestsTab')}</TabsTrigger>
              <TabsTrigger value="my-products">{t('mandiMyProductsTab')}</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-card">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('mandiSearchPlaceholder')}
                className="w-full pl-12 py-3 rounded-lg text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full py-3 rounded-lg text-sm sm:text-base">
                  <SelectValue placeholder={t('mandiFilterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {placeholderCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full py-3 rounded-lg text-sm sm:text-base">
                  <SelectValue placeholder={t('mandiFilterByState')} />
                </SelectTrigger>
                <SelectContent>
                  {placeholderStates.map(state => (
                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState || availableCities.length === 0}>
                <SelectTrigger className="w-full py-3 rounded-lg text-sm sm:text-base">
                  <SelectValue placeholder={t('mandiFilterByCity')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.length > 0 ? availableCities.map(city => (
                    <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                  )) : <SelectItem value="no-cities" disabled>{!selectedState ? t('mandiSelectStateFirst') : t('mandiNoCitiesForState')}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            {areFiltersActive() && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={handleResetFilters} size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('mandiResetFiltersButton')}
                </Button>
              </div>
            )}
          </div>
          
          {isLoading ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           ) : (
            <>
              {/* Tab Content */}
              {viewMode === 'market' && (
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center">
                      <PackageSearch className="mr-3 h-7 w-7"/>
                      {t('mandiMarketplaceListings')}
                    </h2>
                    <Button asChild variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href="/mandi/add-requirement"> 
                        <Briefcase className="mr-2 h-4 w-4" /> {t('mandiListRequirementButton')}
                      </Link>
                    </Button>
                  </div>
                  {filteredMarketListings.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMarketListings.map((listing) => (
                        <MandiItemCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
                      <p className="text-lg sm:text-xl font-semibold text-muted-foreground">{t('mandiNoListingsBuyerPrompt')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('mandiNoListingsBuyerSuggestion')}</p>
                    </div>
                  )}
                </section>
              )}

              {viewMode === 'requests' && (
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center">
                      <ClipboardList className="mr-3 h-7 w-7"/>
                      {t('mandiBuyerRequestsTitle')}
                    </h2>
                     <Button asChild variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href="/mandi/add-requirement"> 
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('mandiPostNewRequirementButton')}
                      </Link>
                    </Button>
                  </div>
                  {filteredBuyerRequests.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBuyerRequests.map((req) => (
                        <BuyerRequirementCard 
                          key={req.id} 
                          requirement={req} 
                          currentUserId={authUserId}
                          onDeleteRequirement={handleDeleteRequirement}
                        />
                      ))}
                    </div>
                  ) : (
                     <div className="text-center py-16">
                      <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
                      <p className="text-lg sm:text-xl font-semibold text-muted-foreground">{t('mandiNoBuyerRequestsPrompt')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('mandiNoBuyerRequestsSuggestion')}</p>
                    </div>
                  )}
                </section>
              )}

              {viewMode === 'my-products' && (
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center">
                      <PackageSearch className="mr-3 h-7 w-7"/>
                       {t('mandiMyProductsForSaleTitle')}
                    </h2>
                    <Button asChild variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href="/mandi/add-crop">
                        <PlusCircle className="mr-2 h-5 w-5" /> {t('mandiListNewItem')}
                      </Link>
                    </Button>
                  </div>
                  {filteredMyProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMyProducts.map((listing) => (
                        <MandiItemCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
                       <p className="text-lg sm:text-xl font-semibold text-muted-foreground">{t('mandiNoListingsSellerPrompt')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('mandiNoListingsSellerSuggestion')}</p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
