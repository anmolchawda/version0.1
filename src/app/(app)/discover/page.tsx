
// src/app/(app)/discover/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ProfileCard } from '@/components/profile/profile-card';
import { placeholderUsers, placeholderPosts, placeholderListings } from '@/lib/placeholders';
import { PostCard } from '@/components/feed/post-card';
import { MandiItemCard } from '@/components/mandi/mandi-item-card';
import { Search, Users, Image as ImageIcon, Store, ListChecks, Tractor, Info } from 'lucide-react';
import type { User, Post, MandiListing } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');

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

  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0 || filteredMandiListings.length > 0;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <Search className="mr-3 h-7 w-7" /> Universal Search
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search farmers, posts, mandi items, diseases, codes..."
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
          <p className="text-xl font-semibold text-muted-foreground">No results found for &quot;{searchTerm}&quot;.</p>
          <p className="text-sm text-muted-foreground mt-2">Try a different search term or check spelling.</p>
        </div>
      )}

      {!searchTerm && (
         <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
          <p className="text-xl font-semibold text-muted-foreground">Search KrishiX</p>
          <p className="text-sm text-muted-foreground mt-2">Find farmers, posts, mandi items, crop information, and more.</p>
        </div>
      )}

      {searchTerm && hasResults && (
        <div className="space-y-8">
          {filteredUsers.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary flex items-center"><Users className="mr-2 h-6 w-6"/> Matching Farmers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <ProfileCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}

          {filteredPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary flex items-center"><ImageIcon className="mr-2 h-6 w-6"/> Matching Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {filteredMandiListings.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-primary flex items-center"><Store className="mr-2 h-6 w-6"/> Matching Mandi Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMandiListings.map((listing) => (
                  <MandiItemCard key={listing.id} listing={listing} />
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
                    Currently searching farmers, posts, and mandi items. 
                    <br className="sm:hidden"/>
                    Expanded search for diseases, codes, events, and yojanas is coming soon!
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
