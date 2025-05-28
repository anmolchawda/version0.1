
// src/app/(app)/crop-science/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

interface CropInfo {
  name: string;
  imageUrl: string;
  aiHint: string;
  slug: string; // For URL-friendly navigation
  unoptimized?: boolean; // Optional flag for diagnostics
}

// Ensure public HTTP(S) URLs are used for images. gs:// URIs are not web-accessible.
const commonCrops: CropInfo[] = [
  // Vegetables
  { name: 'Tomato', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Ftomato%201.jpeg?alt=media', aiHint: 'tomato white-background', slug: 'tomato', unoptimized: true },
  { name: 'Potato', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fpotato.jpg?alt=media', aiHint: 'potato vegetable', slug: 'potato', unoptimized: true },
  { name: 'Onion', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FONION.jpeg?alt=media', aiHint: 'onion vegetable', slug: 'onion', unoptimized: true },
  { name: 'Carrot', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcarrot.jpg?alt=media', aiHint: 'carrot vegetable', slug: 'carrot', unoptimized: true },
  { name: 'Broccoli', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FBROCCOLI.jpg?alt=media&token=1ea3e09d-cbbc-44be-885f-d7a1a60c7281', aiHint: 'broccoli vegetable', slug: 'broccoli', unoptimized: true },
  { name: 'Spinach', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fspinach.jpg?alt=media', aiHint: 'spinach leaves', slug: 'spinach', unoptimized: true },
  { name: 'Bell Pepper', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fred-yellow-capsicum.jpg?alt=media', aiHint: 'bell pepper', slug: 'bell-pepper', unoptimized: true },
  { name: 'Cucumber', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcucumber.jpeg?alt=media', aiHint: 'cucumber vegetable', slug: 'cucumber', unoptimized: true },
  { name: 'Lettuce', imageUrl: 'https://images.unsplash.com/photo-1622943495354-f49d2964094c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8bGV0dHVjZXxlbnwwfHx8fDE3NDgyMzk5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'lettuce leaves', slug: 'lettuce' },
  { name: 'Eggplant', imageUrl: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxlZ2dwbGFudHxlbnwwfHx8fDE3NDgyNDAwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'eggplant vegetable', slug: 'eggplant' },
  { name: 'Beans', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FBeans.jpeg?alt=media&token=07738d31-ae7b-4c9d-9a7e-9c5795dba540', aiHint: 'beans vegetable', slug: 'beans', unoptimized: true },
  { name: 'Bottle Gourd', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbottle%20gourd.jpeg?alt=media', aiHint: 'bottle gourd', slug: 'bottle-gourd', unoptimized: true },
  { name: 'Bitter Gourd', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbitter%20gourd.jpeg?alt=media', aiHint: 'bitter gourd', slug: 'bitter-gourd', unoptimized: true },
  { name: 'Cabbage', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcabbage.jpeg?alt=media', aiHint: 'cabbage vegetable', slug: 'cabbage', unoptimized: true },
  { name: 'Cauliflower', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcauliflower.jpeg?alt=media', aiHint: 'cauliflower vegetable', slug: 'cauliflower', unoptimized: true },
  { name: 'Radish', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fradish.jpeg?alt=media', aiHint: 'radish vegetable', slug: 'radish', unoptimized: true },
  { name: 'Ridge Gourd', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fridge%20gourd.jpeg?alt=media', aiHint: 'ridge gourd', slug: 'ridge-gourd', unoptimized: true },
  { name: 'Drumstick', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fdrumstick.jpeg?alt=media', aiHint: 'drumstick vegetable', slug: 'drumstick', unoptimized: true },
  { name: 'Okra', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fokra.jpeg?alt=media', aiHint: 'okra vegetable', slug: 'okra', unoptimized: true },
  // Fruits
  { name: 'Apple', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fapple.jpg?alt=media', aiHint: 'apple fruit', slug: 'apple', unoptimized: true },
  { name: 'Banana', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbanana.jpg?alt=media', aiHint: 'banana fruit', slug: 'banana', unoptimized: true },
  { name: 'Orange', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Forange.jpg?alt=media', aiHint: 'orange fruit', slug: 'orange', unoptimized: true },
  { name: 'Mango', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fmango.jpg?alt=media', aiHint: 'mango fruit', slug: 'mango', unoptimized: true },
  { name: 'Grapes', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fgrapes.jpg?alt=media', aiHint: 'grapes fruit', slug: 'grapes', unoptimized: true },
  { name: 'Strawberry', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fstrawberry%20(1).jpg?alt=media', aiHint: 'strawberry fruit', slug: 'strawberry', unoptimized: true },
  { name: 'Pineapple', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fpineapple.jpg?alt=media', aiHint: 'pineapple fruit', slug: 'pineapple', unoptimized: true },
  { name: 'Watermelon', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fwatermelon.jpg?alt=media', aiHint: 'watermelon fruit', slug: 'watermelon', unoptimized: true },
  { name: 'Pomegranate', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fpomegranade.jpg?alt=media', aiHint: 'pomegranate fruit', slug: 'pomegranate', unoptimized: true },
  { name: 'Kiwi', imageUrl: 'https://storage.googleapis.com/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fkiwi.jpg?alt=media', aiHint: 'kiwi fruit', slug: 'kiwi', unoptimized: true },
];

export default function CropSciencePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <FlaskConical className="mr-3 h-7 w-7 text-primary" />
            Crop Science Hub
          </CardTitle>
          <CardDescription>
            Explore information about various common vegetable and fruit crops.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commonCrops.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {commonCrops.map((crop) => (
                <Link key={crop.slug} href={`/crop-science/${crop.slug}`} passHref>
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg h-full flex flex-col cursor-pointer">
                    <div className="aspect-square bg-card flex items-center justify-center p-1 relative">
                      <Image
                        src={crop.imageUrl}
                        alt={crop.name || 'Crop image'}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md max-h-full max-w-full"
                        data-ai-hint={crop.aiHint}
                        unoptimized={crop.unoptimized} 
                      />
                    </div>
                    <div className="p-3 text-center bg-muted/30 mt-auto">
                      <p className="font-semibold text-sm text-foreground truncate">{crop.name}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No crop information available at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Added comment to ensure change is picked up.
