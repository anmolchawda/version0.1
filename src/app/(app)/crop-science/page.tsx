
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
  { name: 'Tomato', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/tomato%201.jpeg', aiHint: 'tomato white-background', slug: 'tomato', unoptimized: true },
  { name: 'Potato', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/potato.jpg', aiHint: 'potato vegetable', slug: 'potato', unoptimized: true },
  { name: 'Onion', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FONION.jpeg?alt=media&token=110b1e81-e150-4353-ad3f-ccdb45efb616', aiHint: 'onion vegetable', slug: 'onion', unoptimized: true },
  { name: 'Carrot', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcarrot.jpg?alt=media&token=570b5735-ea6b-45fb-91db-5fa6c95ec198', aiHint: 'carrot vegetable', slug: 'carrot', unoptimized: true },
  { name: 'Broccoli', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FBROCCOLI.jpg?alt=media&token=1ea3e09d-cbbc-44be-885f-d7a1a60c7281', aiHint: 'broccoli vegetable', slug: 'broccoli', unoptimized: true },
  { name: 'Spinach', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/spinach.jpg', aiHint: 'spinach leaves', slug: 'spinach', unoptimized: true },
  { name: 'Bell Pepper', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fred-yellow-capsicum.jpg?alt=media&token=3b9abff7-8775-4667-b07c-395730736ca9', aiHint: 'bell pepper', slug: 'bell-pepper', unoptimized: true },
  { name: 'Cucumber', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcucumber.jpeg?alt=media&token=54866db4-6209-46c1-89cd-829464f11a1f', aiHint: 'cucumber vegetable', slug: 'cucumber', unoptimized: true },
  { name: 'Lettuce', imageUrl: 'https://images.unsplash.com/photo-1622943495354-f49d2964094c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8bGV0dHVjZXxlbnwwfHx8fDE3NDgyMzk5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'lettuce leaves', slug: 'lettuce' },
  { name: 'Eggplant', imageUrl: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxlZ2dwbGFudHxlbnwwfHx8fDE3NDgyNDAwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'eggplant vegetable', slug: 'eggplant' },
  { name: 'Beans', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FBeans.jpeg?alt=media&token=07738d31-ae7b-4c9d-9a7e-9c5795dba540', aiHint: 'beans vegetable', slug: 'beans', unoptimized: true },
  { name: 'Bottle Gourd', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbottle%20gourd.jpeg?alt=media&token=64b61099-5ddc-4078-9beb-72072fb519f2', aiHint: 'bottle gourd', slug: 'bottle-gourd', unoptimized: true },
  { name: 'Bitter Gourd', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbitter%20gourd.jpeg?alt=media&token=6b10f15d-2e24-4218-ade6-3c3b62ef1360', aiHint: 'bitter gourd', slug: 'bitter-gourd', unoptimized: true },
  { name: 'Cabbage', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcabbage.jpeg?alt=media&token=2b30d09d-0c37-4ae7-b93e-fc0039797af8', aiHint: 'cabbage vegetable', slug: 'cabbage', unoptimized: true },
  { name: 'Cauliflower', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcauliflower.jpeg?alt=media&token=0d5f65bf-1b70-4f91-b481-d1d908a43d57', aiHint: 'cauliflower vegetable', slug: 'cauliflower', unoptimized: true },
  { name: 'Radish', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/radish.jpeg', aiHint: 'radish vegetable', slug: 'radish', unoptimized: true },
  { name: 'Ridge Gourd', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/ridge%20gourd.jpeg', aiHint: 'ridge gourd', slug: 'ridge-gourd', unoptimized: true },
  { name: 'Drumstick', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fdrumstick.jpeg?alt=media&token=52131ddc-5d08-4b78-9ce1-0b7e4c5bcb5b', aiHint: 'drumstick vegetable', slug: 'drumstick', unoptimized: true },
  { name: 'Okra', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/okra.jpeg', aiHint: 'okra vegetable', slug: 'okra', unoptimized: true },
  { name: 'Chilli', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Chilli', aiHint: 'chilli pepper', slug: 'chilli', unoptimized: true },
  // Fruits
  { name: 'Apple', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fapple.jpg?alt=media&token=c5f86e8e-c19f-4aba-8289-7f4bed2c5332', aiHint: 'apple fruit', slug: 'apple', unoptimized: true },
  { name: 'Banana', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbanana.jpg?alt=media&token=6228109c-9358-4c7c-bffd-51be0c5bc914', aiHint: 'banana fruit', slug: 'banana', unoptimized: true },
  { name: 'Orange', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/orange.jpg', aiHint: 'orange fruit', slug: 'orange', unoptimized: true },
  { name: 'Mango', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/mango.jpg', aiHint: 'mango fruit', slug: 'mango', unoptimized: true },
  { name: 'Grapes', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/grapes.jpg', aiHint: 'grapes fruit', slug: 'grapes', unoptimized: true },
  { name: 'Strawberry', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/strawberry%20(1).jpg', aiHint: 'strawberry fruit', slug: 'strawberry', unoptimized: true },
  { name: 'Pineapple', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/pineapple.jpg', aiHint: 'pineapple fruit', slug: 'pineapple', unoptimized: true },
  { name: 'Watermelon', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/watermelon.jpg', aiHint: 'watermelon fruit', slug: 'watermelon', unoptimized: true },
  { name: 'Pomegranate', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/pomegranade.jpg', aiHint: 'pomegranate fruit', slug: 'pomegranate', unoptimized: true },
  { name: 'Kiwi', imageUrl: 'https://storage.cloud.google.com/imagesoffarmdocc/crop%20images/kiwi.jpg', aiHint: 'kiwi fruit', slug: 'kiwi', unoptimized: true },
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
// Updated image for Apple and Banana
// Updated image for Onion
// Updated image for Broccoli
// Updated image for Beans
// Updated image for Carrot
// Updated image for Spinach
// Updated image for Bottle Gourd
// Updated image for Bitter Gourd
// Updated image for Cabbage
// Updated image for Cauliflower
// Updated image for Radish
// Updated image for Ridge Gourd
// Updated image for Drumstick
// Updated image for Okra
// Updated image for Orange
// Updated image for Mango
// Updated image for Grapes
// Updated image for Strawberry
// Updated image for Pineapple
// Updated image for Watermelon
// Updated image for Pomegranate
// Updated image for Kiwi
// Removed placeholder image from GCS
// Updated image for Bell Pepper with Firebase Storage URL
// Updated image for Carrot with Firebase Storage URL
// Updated image for Cauliflower with Firebase Storage URL
// Added Chilli to the crop list
// Updated image for Cucumber with Firebase Storage URL
// Updated image for Drumstick with new Firebase Storage URL
