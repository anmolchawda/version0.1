
// src/app/(app)/discover/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { ProfileCard } from '@/components/profile/profile-card';
import { placeholderUsers, placeholderPosts, placeholderListings, placeholderYojnas, placeholderDiscoverDiseases, formatTimeAgo } from '@/lib/placeholders';
import { PostCard } from '@/components/feed/post-card';
import { MandiItemCard } from '@/components/mandi/mandi-item-card';
import { Search, Users, Image as ImageIcon, Store, ListChecks, Tractor, Info, NotebookText, ShieldAlert as DiseaseIcon, CalendarDays } from 'lucide-react';
import type { User, Post, MandiListing, Yojna, DiscoverDisease } from '@/types';
import { mockEventsData } from '@/app/(app)/events/page'; // Importing mock events
import type { MockEvent } from '@/app/(app)/events/page'; // Importing type for events
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/useTranslations';
import { format, isSameDay, addDays, startOfMonth } from 'date-fns';

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
      post.hashtags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [searchLower]);

  const filteredMandiListings = useMemo(() => {
    if (!searchLower) return [];
    return placeholderListings.filter(listing =>
      listing.name.toLowerCase().includes(searchLower) ||
      listing.category.toLowerCase().includes(searchLower) ||
      (listing.description && listing.description.toLowerCase().includes(searchLower)) ||
      listing.location.toLowerCase().includes(searchLower) ||
      listing.seller.username.toLowerCase().includes(searchLower)
    );
  }, [searchLower]);

  const filteredDiseases = useMemo(() => {
    if (!searchLower) return [];
    return placeholderDiscoverDiseases.filter(disease =>
      disease.name.toLowerCase().includes(searchLower) ||
      disease.cropName.toLowerCase().includes(searchLower) ||
      disease.symptomsSummary.toLowerCase().includes(searchLower)
    );
  }, [searchLower]);

  const filteredEvents = useMemo(() => {
    if (!searchLower) return [];
    return mockEventsData.filter(event =>
      event.title.toLowerCase().includes(searchLower) ||
      (event.description && event.description.toLowerCase().includes(searchLower)) ||
      (event.location && event.location.toLowerCase().includes(searchLower))
    );
  }, [searchLower]);

  const filteredYojnas = useMemo(() => {
    if (!searchLower) return [];
    return placeholderYojnas.filter(yojna =>
      yojna.name.toLowerCase().includes(searchLower) ||
      yojna.description.toLowerCase().includes(searchLower) ||
      (yojna.department && yojna.department.toLowerCase().includes(searchLower)) ||
      (yojna.benefits && yojna.benefits.toLowerCase().includes(searchLower))
    );
  }, [searchLower]);

  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0 || filteredMandiListings.length > 0 || filteredDiseases.length > 0 || filteredEvents.length > 0 || filteredYojnas.length > 0;

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

          {filteredMandiListings.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><Store className="mr-2 h-6 w-6"/> {t('discoverMatchingMandiTitle')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMandiListings.map((listing) => (
                  <MandiItemCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}

          {filteredDiseases.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><DiseaseIcon className="mr-2 h-6 w-6"/> {t('discoverMatchingDiseasesTitle')}</h2>
              <div className="space-y-3">
                {filteredDiseases.map((disease) => (
                  <Link key={disease.id} href={`/crop-science/${disease.cropSlug}/diseases/${encodeURIComponent(disease.name)}`} passHref>
                    <Card className="p-3 hover:bg-muted/50 cursor-pointer rounded-lg shadow-sm flex items-center space-x-3">
                      {disease.imageUrl && (
                        <div className="relative w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                          <Image src={disease.imageUrl} alt={disease.name} layout="fill" objectFit="cover" data-ai-hint={disease.aiHint || 'disease'} />
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="font-medium text-foreground">{disease.name} <span className="text-xs text-muted-foreground">({disease.cropName})</span></p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{disease.symptomsSummary}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredEvents.length > 0 && (
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

          {filteredYojnas.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center"><NotebookText className="mr-2 h-6 w-6"/> {t('discoverMatchingYojnasTitle')}</h2>
              <div className="space-y-3">
                {filteredYojnas.map((yojna) => (
                  <Card key={yojna.id} className="p-3 hover:bg-muted/50 rounded-lg shadow-sm">
                    <p className="font-medium text-foreground">{yojna.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{yojna.description}</p>
                    {yojna.department && <Badge variant="outline" className="mt-1 text-xs">{yojna.department}</Badge>}
                     {yojna.link && <a href={yojna.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline block mt-1">Learn More</a>}
                  </Card>
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
