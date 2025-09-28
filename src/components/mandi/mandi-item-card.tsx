// src/components/mandi/mandi-item-card.tsx
'use client';

import React, { useState } from 'react'; // Added React import
import type { DisplayMandiListing } from '@/types';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarDays, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarContext } from '@/contexts/SidebarContext';

interface MandiItemCardProps {
  listing: DisplayMandiListing;
  onDelete?: (listingId: string) => void;
  showDeleteButton?: boolean;
}

const MandiItemCardComponent = ({ listing, onDelete, showDeleteButton = false }: MandiItemCardProps) => {
  const imageUrls = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : ['https://placehold.co/600x600.png'];
  const { authUserId } = useSidebarContext();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const isOwner = authUserId === listing.sellerId;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(listing.id);
    }
    setIsConfirmOpen(false);
  };


  return (
    <>
      <Card key={listing.id} className="shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <Link href={`/mandi/${listing.id}`} className="flex flex-col flex-grow">
          <div className="relative w-full aspect-square bg-muted group">
            <div className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-t-lg">
                {imageUrls.map((url, index) => (
                    <div key={index} className="relative w-full h-full flex-shrink-0 snap-center">
                        <Image
                            src={url}
                            alt={`${listing.name} image ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={listing.aiHint}
                        />
                    </div>
                ))}
            </div>
            
            {imageUrls.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center space-x-1.5 pointer-events-none">
                    {imageUrls.map((_, i) => (
                    <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-white opacity-50 shadow-md"
                    />
                    ))}
                </div>
            )}

            <div className="absolute top-2 left-2 right-2 flex justify-between items-center space-x-1">
              <Badge variant="default" className="bg-primary/80 text-primary-foreground text-xs px-1.5 py-0.5 truncate">
                {listing.price}
              </Badge>
              <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground text-xs px-1.5 py-0.5 truncate text-right">
                {listing.category}
              </Badge>
            </div>
            
            {showDeleteButton && isOwner && (
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 opacity-80 hover:opacity-100"
                    onClick={handleDeleteClick}
                    aria-label="Delete Listing"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
          </div>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-primary hover:underline line-clamp-1">
              {listing.name}
            </CardTitle>
            {listing.description && <CardDescription className="text-xs line-clamp-2">{listing.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs flex-grow px-3 pb-3">
            <p><strong className="text-foreground">Qty:</strong> {listing.quantity}</p>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1 text-primary" /> {listing.location}
            </div>
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 mr-1 text-primary" />
              Listed: {listing.listedDate}
            </div>
            <div className="flex items-center pt-1.5">
              <Avatar className="h-6 w-6 mr-1.5 border">
                <AvatarImage src={listing.seller.avatarUrl} alt={listing.seller.name || listing.seller.username} data-ai-hint="person farmer" />
                <AvatarFallback className="text-xs">
                  {(listing.seller.name || listing.seller.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground">{listing.seller.name || listing.seller.username}</p>
            </div>
          </CardContent>
          <CardFooter className="p-3 mt-auto">
            <Button asChild size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
              <p><ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> View & Contact</p>
            </Button>
          </CardFooter>
        </Link>
      </Card>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your listing for "{listing.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const MandiItemCard = React.memo(MandiItemCardComponent);