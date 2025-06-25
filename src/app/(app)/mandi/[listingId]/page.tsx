
// src/app/(app)/mandi/[listingId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { MandiListing, User, DisplayMandiListing } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Loader2, AlertTriangle, MapPin, Phone, MessageSquare, Tag, Scale, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { db, doc, getDoc, Timestamp } from '@/lib/firebase';

export default function MandiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const listingId = params.listingId as string;

  const [listing, setListing] = useState<DisplayMandiListing | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId || !db) {
        setError('Listing ID is missing or database is not available.');
        setIsLoading(false);
        return;
    }

    const fetchListing = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const listingDocRef = doc(db, 'mandi_listings', listingId);
            const docSnap = await getDoc(listingDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as MandiListing;
                const displayData: DisplayMandiListing = {
                    ...data,
                    id: docSnap.id,
                    listedDate: format( (data.createdAt as Timestamp).toDate(), "PPP")
                };
                
                setListing(displayData);
                setSeller(data.seller as User); // Seller info is denormalized
                if (data.imageUrls && data.imageUrls.length > 0) {
                    setSelectedImageUrl(data.imageUrls[0]);
                }
            } else {
                setError('Listing not found.');
            }
        } catch (err) {
            console.error("Error fetching listing:", err);
            setError('Failed to load listing details.');
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchListing();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading listing details...</p>
      </div>
    );
  }

  if (error || !listing || !seller) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Mandi
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">{error || 'Listing Not Found'}</p>
          <p className="text-sm text-center">The requested item could not be found or loaded.</p>
        </div>
      </div>
    );
  }

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-center text-sm">
        <div className="text-muted-foreground mr-2">{icon}</div>
        <span className="font-medium text-foreground mr-1">{label}:</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-0 inline-flex items-center text-primary hover:text-primary/80">
        <ChevronLeft className="mr-2 h-5 w-5" /> {t('backToMandiButton')}
      </Button>

      <Card className="shadow-xl rounded-xl overflow-hidden">
        <div className="relative w-full aspect-video bg-muted">
          {selectedImageUrl && (
              <Image
                src={selectedImageUrl}
                alt={listing.name}
                fill
                style={{ objectFit: "cover" }}
                data-ai-hint={listing.aiHint}
                priority
              />
          )}
        </div>

        {listing.imageUrls && listing.imageUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2 p-2 bg-muted/20">
                {listing.imageUrls.map((url, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImageUrl(url)}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${selectedImageUrl === url ? 'border-primary scale-105' : 'border-transparent hover:opacity-80'}`}
                    >
                        <Image
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                        />
                    </button>
                ))}
            </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold text-primary">{listing.name}</CardTitle>
              <Badge variant="default" className="text-lg">{listing.price}</Badge>
          </div>
          {listing.description && <CardDescription>{listing.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-3 border-t pt-4">
            <h3 className="text-md font-semibold text-foreground mb-2">Item Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <DetailItem icon={<Tag className="h-4 w-4" />} label="Category" value={listing.category} />
                <DetailItem icon={<Scale className="h-4 w-4" />} label="Quantity" value={listing.quantity} />
                <DetailItem icon={<MapPin className="h-4 w-4" />} label="Location" value={listing.location} />
                <DetailItem icon={<Package className="h-4 w-4" />} label="Specifications" value={listing.details} />
                <DetailItem icon={<Calendar className="h-4 w-4" />} label="Listed On" value={listing.listedDate} />
            </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start space-y-4 bg-muted/30 p-4 border-t">
          <h3 className="text-md font-semibold text-foreground">Seller Information</h3>
          <div className="flex items-center justify-between w-full">
            <Link href={`/profile/${seller.id}`} className="flex items-center space-x-3 group">
              <Avatar className="h-12 w-12 border-2 border-primary group-hover:scale-105 transition-transform">
                <AvatarImage src={seller.avatarUrl} alt={seller.name || seller.username} />
                <AvatarFallback>{(seller.name || seller.username).charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-primary group-hover:underline">{seller.name || seller.username}</p>
                <p className="text-xs text-muted-foreground">@{seller.username}</p>
              </div>
            </Link>
             <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                {seller.phoneNumber && (
                  <Button asChild size="sm">
                    <a href={`tel:${seller.phoneNumber}`}>
                      <Phone className="mr-2 h-4 w-4" /> Call Seller
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                   <Link href={`/messages/${seller.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                   </Link>
                </Button>
            </div>
          </div>
           {!seller.phoneNumber && (
                <p className="text-xs text-destructive w-full text-center py-2">Seller's phone number is not available.</p>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
