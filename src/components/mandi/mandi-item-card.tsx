
// src/components/mandi/mandi-item-card.tsx
'use client';

import type { MandiListing } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
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
import { MapPin, CalendarDays, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface MandiItemCardProps {
  listing: MandiListing;
}

export function MandiItemCard({ listing }: MandiItemCardProps) {
  return (
    <Card key={listing.id} className="shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="relative w-full h-48 sm:h-52 bg-muted"> {/* Adjusted height for discover page consistency */}
        <Image
          src={listing.imageUrl}
          alt={listing.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={listing.aiHint}
        />
        <Badge variant="default" className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-xs sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1">
          {listing.price}
        </Badge>
        <Badge variant="secondary" className="absolute top-2 right-2 bg-secondary/80 text-secondary-foreground text-xs sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1">
          {listing.category}
        </Badge>
      </div>
      <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
        <CardTitle className="text-md sm:text-lg text-primary hover:underline line-clamp-1">
          <Link href={`#`}>{listing.name}</Link> {/* Placeholder link */}
        </CardTitle>
        {listing.description && <CardDescription className="text-xs sm:text-sm line-clamp-2">{listing.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-1.5 text-xs sm:text-sm flex-grow px-3 sm:px-4 pb-3">
        <p><strong className="text-foreground">Qty:</strong> {listing.quantity}</p>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mr-1 text-primary" /> {listing.location}
        </div>
        <div className="flex items-center text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1 text-primary" />
          Listed: {format(new Date(listing.listedDate), "MMM d, yy")}
        </div>
        <div className="flex items-center pt-1.5">
          <Avatar className="h-6 w-6 mr-1.5 border">
            <AvatarImage src={listing.seller.avatarUrl} alt={listing.seller.name || listing.seller.username} data-ai-hint="person farmer" />
            <AvatarFallback className="text-xs">
              {(listing.seller.name || listing.seller.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link href={`/profile/${listing.seller.id}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
            {listing.seller.name || listing.seller.username}
          </Link>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 mt-auto">
        <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm">
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> View & Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
