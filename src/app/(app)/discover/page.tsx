
// src/app/(app)/discover/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ProfileCard } from '@/components/profile/profile-card';
import { placeholderUsers, placeholderPosts, placeholderListings, type MandiListing } from '@/lib/placeholders';
import { PostCard } from '@/components/feed/post-card';
import { MandiItemCard } from '@/components/mandi/mandi-item-card'; // New component
import { Search, Users, Image as ImageIcon, Store, ListChecks } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, Post } from '@/types';

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const searchLower = searchTerm.toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!searchLower) return placeholderUsers.slice(0, 6); // Show some initial suggestions or all if not searching
    return placeholderUsers.filter(user =>
      user.username.toLowerCase().includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.bio && user.bio.toLowerCase().includes(searchLower)) ||
      (user.location && user.location.toLowerCase().includes(searchLower)) ||
      (user.produce && user.produce.some(p => p.toLowerCase().includes(searchLower)))
    );
  }, [searchLower]);

  const filteredPosts = useMemo(() => {
    if (!searchLower) return placeholderPosts.slice(0, 4); // Show some initial suggestions
    return placeholderPosts.filter(post =>
      post.caption.toLowerCase().includes(searchLower) ||
      post.user.username.toLowerCase().includes(searchLower) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [searchLower]);

  const filteredMandiListings = useMemo(() => {
    if (!searchLower) return placeholderListings.slice(0, 6); // Show some initial suggestions
    return placeholderListings.filter(listing =>
      listing.name.toLowerCase().includes(searchLower) ||
      listing.category.toLowerCase().includes(searchLower) ||
      (listing.description && listing.description.toLowerCase().includes(searchLower)) ||
      listing.location.toLowerCase().includes(searchLower) ||
      listing.seller.username.toLowerCase().includes(searchLower)
    );
  }, [searchLower]);

  const renderEmptyState = (itemType: string) => (
    <div className="text-center py-16">
      <ListChecks className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
      <p className="text-xl font-semibold text-muted-foreground">No {itemType} found for &quot;{searchTerm}&quot;.</p>
      <p className="text-sm text-muted-foreground mt-2">Try a different search term or browse all items.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search FARMDOCC (farmers, posts, mandi...)"
          className="w-full pl-10 py-3 text-base rounded-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="farmers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 mb-6"> {/* Updated to 3 columns */}
          <TabsTrigger value="farmers" className="py-2.5 text-sm">
            <Users className="mr-2 h-5 w-5" /> Farmers
          </TabsTrigger>
          <TabsTrigger value="posts" className="py-2.5 text-sm">
            <ImageIcon className="mr-2 h-5 w-5" /> Posts
          </TabsTrigger>
          <TabsTrigger value="mandi" className="py-2.5 text-sm"> {/* New Mandi Tab */}
            <Store className="mr-2 h-5 w-5" /> Mandi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farmers">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              {searchTerm ? `Farmers matching "${searchTerm}"` : "Suggested Farmers"}
            </h2>
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <ProfileCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              renderEmptyState('farmers')
            )}
          </section>
        </TabsContent>

        <TabsContent value="posts">
           <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              {searchTerm ? `Posts matching "${searchTerm}"` : "Trending Posts"}
            </h2>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
               renderEmptyState('posts')
            )}
          </section>
        </TabsContent>

        <TabsContent value="mandi"> {/* New Mandi Tab Content */}
           <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              {searchTerm ? `Mandi items matching "${searchTerm}"` : "Marketplace Listings"}
            </h2>
            {filteredMandiListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Using 3 columns for Mandi items */}
                {filteredMandiListings.map((listing) => (
                  <MandiItemCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
               renderEmptyState('Mandi items')
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
