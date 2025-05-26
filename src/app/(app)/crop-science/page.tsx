
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

const commonCrops: CropInfo[] = [
  // Vegetables
  { name: 'Tomato', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/tomato%201.jpeg', aiHint: 'tomato white-background', slug: 'tomato', unoptimized: true },
  { name: 'Potato', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/potato.jpg', aiHint: 'potato vegetable', slug: 'potato', unoptimized: true },
  { name: 'Onion', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/ONION.jpeg', aiHint: 'onion vegetable', slug: 'onion', unoptimized: true },
  { name: 'Carrot', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/carrot.jpg', aiHint: 'carrot vegetable', slug: 'carrot', unoptimized: true },
  { name: 'Broccoli', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/BROCCOLI.jpg', aiHint: 'broccoli vegetable', slug: 'broccoli', unoptimized: true },
  { name: 'Spinach', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/spinach.jpg', aiHint: 'spinach leaves', slug: 'spinach', unoptimized: true },
  { name: 'Bell Pepper', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/red-yellow-capsicum.jpg', aiHint: 'bell pepper', slug: 'bell-pepper', unoptimized: true },
  { name: 'Cucumber', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/cucumber.jpeg', aiHint: 'cucumber vegetable', slug: 'cucumber', unoptimized: true },
  { name: 'Lettuce', imageUrl: 'https://images.unsplash.com/photo-1622943495354-f49d2964094c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8bGV0dHVjZXxlbnwwfHx8fDE3NDgyMzk5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'lettuce leaves', slug: 'lettuce' },
  { name: 'Eggplant', imageUrl: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxlZ2dwbGFudHxlbnwwfHx8fDE3NDgyNDAwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'eggplant vegetable', slug: 'eggplant' },
  { name: 'Beans', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/Beans.jpeg', aiHint: 'beans vegetable', slug: 'beans', unoptimized: true },
  { name: 'Bottle Gourd', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/bottle%20gourd.jpeg', aiHint: 'bottle gourd', slug: 'bottle-gourd', unoptimized: true },
  { name: 'Bitter Gourd', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/bitter%20gourd.jpeg', aiHint: 'bitter gourd', slug: 'bitter-gourd', unoptimized: true },
  { name: 'Cabbage', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/cabbage.jpeg', aiHint: 'cabbage vegetable', slug: 'cabbage', unoptimized: true },
  { name: 'Cauliflower', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/cauliflower.jpeg', aiHint: 'cauliflower vegetable', slug: 'cauliflower', unoptimized: true },
  { name: 'Radish', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/radish.jpeg', aiHint: 'radish vegetable', slug: 'radish', unoptimized: true },
  { name: 'Ridge Gourd', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/ridge%20gourd.jpeg', aiHint: 'ridge gourd', slug: 'ridge-gourd', unoptimized: true },
  { name: 'Drumstick', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/drumstick.jpeg', aiHint: 'drumstick vegetable', slug: 'drumstick', unoptimized: true },
  { name: 'Okra', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/okra.jpeg', aiHint: 'okra vegetable', slug: 'okra', unoptimized: true },
  // Fruits
  { name: 'Apple', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/apple.jpg', aiHint: 'apple fruit', slug: 'apple', unoptimized: true },
  { name: 'Banana', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/banana.jpg', aiHint: 'banana fruit', slug: 'banana', unoptimized: true },
  { name: 'Orange', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/orange.jpg', aiHint: 'orange fruit', slug: 'orange', unoptimized: true },
  { name: 'Mango', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/mango.jpg', aiHint: 'mango fruit', slug: 'mango', unoptimized: true },
  { name: 'Grapes', imageUrl: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxncmFwZXN8ZW58MHx8fHwxNzQ4MjQ0NzE2fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'grapes fruit', slug: 'grapes' },
  { name: 'Strawberry', imageUrl: 'https://images.unsplash.com/photo-1568966299181-bb7282cc84f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzdHJhd2JlcnJ5fGVufDB8fHx8MTc0ODI0NDc0Mnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'strawberry fruit', slug: 'strawberry' },
  { name: 'Pineapple', imageUrl: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwaW5lYXBwbGV8ZW58MHx8fHwxNzQ4MjQ3NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'pineapple fruit', slug: 'pineapple' },
  { name: 'Watermelon', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHx3YXRlcm1lbG9ufGVufDB8fHx8MTc0ODI0NzY1Nnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'watermelon fruit', slug: 'watermelon' },
  { name: 'Pomegranate', imageUrl: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxwb21lZ3JhbmF0ZXxlbnwwfHx8fDE3NDgyNDc4Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'pomegranate fruit', slug: 'pomegranate' },
  { name: 'Kiwi', imageUrl: 'https://images.unsplash.com/photo-1610917040803-1fccf9623064?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxraXdpfGVufDB8fHx8MTc0ODI0NzczNXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'kiwi fruit', slug: 'kiwi' },
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


