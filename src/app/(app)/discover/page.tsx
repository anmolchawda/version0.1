
// src/app/(app)/discover/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card imports
import { Input } from '@/components/ui/input';
import { ProfileCard } from '@/components/profile/profile-card';
import { placeholderUsers, placeholderPosts, placeholderListings } from '@/lib/placeholders';
import { PostCard } from '@/components/feed/post-card';
import { MandiItemCard } from '@/components/mandi/mandi-item-card';
import { Search, Users, Image as ImageIcon, Store, ListChecks, Info, CalendarDays } from 'lucide-react';
import { mockEventsData } from '@/data/events'; // Importing mock events

// Helper function to format Firebase Timestamp (assuming you have one or need a basic one)
// Replace this with your actual timestamp formatting logic if available elsewhere
const formatFirebaseTimestamp = (timestamp: { toDate: () => Date }): string => {
  if (timestamp && timestamp.toDate) {
    // Example formatting using date-fns: "Jan 20, 2023"
    // Make sure you have date-fns installed: npm install date-fns or yarn add date-fns
    // And import format from 'date-fns' at the top of the file if not already
    return format(timestamp.toDate(), "PPP");
  }
  return 'Invalid Date'; // Or a placeholder like '-'
};


import { useTranslations } from '@/hooks/useTranslations'; // Keep useTranslations
import { format } from 'date-fns'; // Keep format
import type { MandiListing } from '@/types'; // Keep MandiListing if used as type annotation


// For UI display after fetching and converting timestamp
// Assuming this type is not globally defined or needs to be here for clarity
interface DisplayMandiListing extends Omit<MandiListing, 'createdAt'> {
  listedDate: string; // Formatted date string
}


export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslations();

  const searchLower = searchTerm.toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!searchLower) return [];
    return placeholderUsers.filter(user =>
      user.username.toLowerCase().includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.bio && user.bio.toLowerCase().includes(searchLower)) ||
      (user.location && user.location.toLowerCase().includes(searchLower)) ||
      (user.produce && user.produce.some(p => p.toLowerCase().includes(searchLower)))
    );
  }, [searchLower]);

  const filteredPosts = useMemo(() => {
    if (!searchLower) return [];
    return placeholderPosts.filter(post =>
      post.caption.toLowerCase().includes(searchLower) ||
      post.user.username.toLowerCase().includes(searchLower) ||
      (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }, [searchLower]);

  const displayMandiListings = useMemo(() => {
    if (!searchLower) return [];
    const filtered = placeholderListings.filter(listing =>
      listing.name.toLowerCase().includes(searchLower) ||
      listing.category.toLowerCase().includes(searchLower) ||
      (listing.description && listing.description.toLowerCase().includes(searchLower)) ||
      listing.location.toLowerCase().includes(searchLower) ||
      listing.seller.username.toLowerCase().includes(searchLower)
    );
    // Map to DisplayMandiListing
    return filtered.map(listing => ({
      ...listing, // Copy existing properties from MandiListing
      listedDate: formatFirebaseTimestamp(listing.createdAt), // Convert and add listedDate
    })) as DisplayMandiListing[]; // Cast to ensure correct type
  }, [searchLower]);

  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0 || displayMandiListings.length > 0;
  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <Search className="mr-3 h-7 w-7" /> {t('discoverUniversalSearchTitle')}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder={t('discoverSearchPlaceholder')}
                className="w-full pl-10 py-3 text-base rounded-lg shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardContent>
      </Card>

      {searchTerm && !hasResults && (
        <div className="text-center py-16">
          <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          <p className="text-xl font-semibold text-muted-foreground">{t('discoverNoResultsFound', { searchTerm })}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('discoverNoResultsSuggestion')}</p>
        </div>
      )}

      {!searchTerm && (
         <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          <p className="text-xl font-semibold text-muted-foreground">{t('discoverInitialSearchPromptTitle')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('discoverInitialSearchPromptDescription')}</p>
        </div>
      )}

      {searchTerm && hasResults && (
        <div className="space-y-6">
          {filteredUsers.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><Users className="mr-2 h-6 w-6"/> {t('discoverMatchingFarmersTitle')}</h2>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <ProfileCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}

          {filteredPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><ImageIcon className="mr-2 h-6 w-6"/> {t('discoverMatchingPostsTitle')}</h2>
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {displayMandiListings.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><Store className="mr-2 h-6 w-6"/> {t('discoverMatchingMandiTitle')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayMandiListings.map((listing) => (
                  <MandiItemCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}


          {mockEventsData.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><CalendarDays className="mr-2 h-6 w-6"/> {t('discoverMatchingEventsTitle')}</h2>
              <div className="space-y-3">
                {mockEventsData.filter(event => event.title.toLowerCase().includes(searchLower) || (event.description && event.description.toLowerCase().includes(searchLower))).map((event) => (
 <Link key={event.id} href="/events" passHref>
                    <Card className="p-3 hover:bg-muted/50 cursor-pointer rounded-lg shadow-sm">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{format(event.date, "PPP")} - {event.location}</p>
                      {event.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      
      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-4 text-sm text-muted-foreground">
            <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary shrink-0"/>
                <div>
                  {t('discoverInfoFooter')}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
