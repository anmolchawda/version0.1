
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
}

const commonCrops: CropInfo[] = [
  // Vegetables
  { name: 'Tomato', imageUrl: 'https://storage.googleapis.com/imagesoffarmdocc/crop%20images/tomato%201.jpeg', aiHint: 'tomato white-background', slug: 'tomato' },
  { name: 'Potato', imageUrl: 'https://images.unsplash.com/photo-1578594640334-b71fbed2a406?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cG90YXRvfGVufDB8fHx8MTc0ODIzOTAwNnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'potato vegetable', slug: 'potato' },
  { name: 'Onion', imageUrl: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmlvbnxlbnwwfHx8fDE3NDgyMzkzMzV8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'onion vegetable', slug: 'onion' },
  { name: 'Carrot', imageUrl: 'https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYXJyb3R8ZW58MHx8fHwxNzQ4MjM5Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'carrot vegetable', slug: 'carrot' },
  { name: 'Broccoli', imageUrl: 'https://images.unsplash.com/photo-1615485291234-9d694218aeb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8YnJvY29sbGl8ZW58MHx8fHwxNzQ4MjM5NTU0fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'broccoli vegetable', slug: 'broccoli' },
  { name: 'Spinach', imageUrl: 'https://images.unsplash.com/photo-1580910365203-91ea9115a319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzcGluYWNoJTIwbGVhdmVzfGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'spinach leaves', slug: 'spinach' },
  { name: 'Bell Pepper', imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxiZWxsJTIwcGVwcGVyfGVufDB8fHx8MTc0ODIzOTY4OHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'bell pepper', slug: 'bell-pepper' },
  { name: 'Cucumber', imageUrl: 'https://images.unsplash.com/photo-1587411768638-ec71f8e33b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjdWN1bWJlcnxlbnwwfHx8fDE3NDgyMzk4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'cucumber vegetable', slug: 'cucumber' },
  { name: 'Lettuce', imageUrl: 'https://images.unsplash.com/photo-1622943495354-f49d2964094c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8bGV0dHVjZXxlbnwwfHx8fDE3NDgyMzk5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'lettuce leaves', slug: 'lettuce' },
  { name: 'Eggplant', imageUrl: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxlZ2dwbGFudHxlbnwwfHx8fDE3NDgyNDAwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'eggplant vegetable', slug: 'eggplant' },
  // Fruits
  { name: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxhcHBsZSUyMGZydWl0fGVufDB8fHx8MTc0ODIzODcyOHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'apple fruit', slug: 'apple' },
  { name: 'Banana', imageUrl: 'https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8YmFuYW5hfGVufDB8fHx8MTc0ODI0MDM3Nnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'banana fruit', slug: 'banana' },
  { name: 'Orange', imageUrl: 'https://images.unsplash.com/photo-1609424572698-04d9d2e04954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8b3JhbmdlfGVufDB8fHx8MTc0ODI0NDY5OHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'orange fruit', slug: 'orange' },
  { name: 'Mango', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW5nb3xlbnwwfHx8fDE3NDgyNDc2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'mango fruit', slug: 'mango' },
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
    

    
