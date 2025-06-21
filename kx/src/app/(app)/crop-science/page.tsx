
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

// Ensure public HTTP(S) URLs are used for images. gs:// URIs are not web-accessible.
const commonCrops: CropInfo[] = [
  // Vegetables
  { name: 'Tomato', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Ftomato.jpeg?alt=media&token=136ee0f6-09d9-4b74-93e3-f2ac07e14dc7', aiHint: 'tomato white-background', slug: 'tomato' },
  { name: 'Potato', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fpotato.jpg?alt=media&token=f973faf2-6976-4d9a-9e2e-3c4c7e2bbc3b', aiHint: 'potato vegetable', slug: 'potato' },
  { name: 'Onion', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FONION.jpeg?alt=media&token=110b1e81-e150-4353-ad3f-ccdb45efb616', aiHint: 'onion vegetable', slug: 'onion' },
  { name: 'Carrot', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcarrot.jpg?alt=media&token=570b5735-ea6b-45fb-91db-5fa6c95ec198', aiHint: 'carrot vegetable', slug: 'carrot' },
  { name: 'Broccoli', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FBROCCOLI.jpg?alt=media&token=1ea3e09d-cbbc-44be-885f-d7a1a60c7281', aiHint: 'broccoli vegetable', slug: 'broccoli' },
  { name: 'Spinach', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fspinach.jpg?alt=media&token=52fb4f22-f1fd-48c3-ac07-4f428f6465c5', aiHint: 'spinach leaves', slug: 'spinach' },
  { name: 'Bell Pepper', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fred-yellow-capsicum.jpg?alt=media&token=3b9abff7-8775-4667-b07c-395730736ca9', aiHint: 'bell pepper', slug: 'bell-pepper' },
  { name: 'Cucumber', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcucumber.jpeg?alt=media&token=54866db4-6209-46c1-89cd-829464f11a1f', aiHint: 'cucumber vegetable', slug: 'cucumber' },
  { name: 'Lettuce', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Flettuce.jpg?alt=media&token=985c9c4d-b70e-481b-b895-3813af119730', aiHint: 'lettuce leaves', slug: 'lettuce' },
  { name: 'Eggplant', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbrinjal.jpg?alt=media&token=e295fae9-efde-4729-af3c-d45eefa0e02d', aiHint: 'eggplant vegetable', slug: 'eggplant' },
  { name: 'Beans', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2FBeans.jpeg?alt=media&token=07738d31-ae7b-4c9d-9a7e-9c5795dba540', aiHint: 'beans vegetable', slug: 'beans' },
  { name: 'Bottle Gourd', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbottle%20gourd.jpeg?alt=media&token=64b61099-5ddc-4078-9beb-72072fb519f2', aiHint: 'bottle gourd', slug: 'bottle-gourd' },
  { name: 'Bitter Gourd', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbitter%20gourd.jpeg?alt=media&token=6b10f15d-2e24-4218-ade6-3c3b62ef1360', aiHint: 'bitter gourd', slug: 'bitter-gourd' },
  { name: 'Cabbage', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcabbage.jpeg?alt=media&token=2b30d09d-0c37-4ae7-b93e-fc0039797af8', aiHint: 'cabbage vegetable', slug: 'cabbage' },
  { name: 'Cauliflower', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fcauliflower.jpeg?alt=media&token=0d5f65bf-1b70-4f91-b481-d1d908a43d57', aiHint: 'cauliflower vegetable', slug: 'cauliflower' },
  { name: 'Radish', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fradish.jpeg?alt=media&token=13b67f66-6f4f-4728-abc2-cfff0791b615', aiHint: 'radish vegetable', slug: 'radish' },
  { name: 'Ridge Gourd', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fridge%20gourd.jpeg?alt=media&token=8f73c6e4-35f7-412f-87de-1d2ff5458af7', aiHint: 'ridge gourd', slug: 'ridge-gourd' },
  { name: 'Drumstick', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fdrumstick.jpeg?alt=media&token=52131ddc-5d08-4b78-9ce1-0b7e4c5bcb5b', aiHint: 'drumstick vegetable', slug: 'drumstick' },
  { name: 'Okra', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fokra.jpeg?alt=media&token=cbaf3db6-17e4-4d44-9375-a360f85a5953', aiHint: 'okra vegetable', slug: 'okra' },
  { name: 'Chilli', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fchilli.jpeg?alt=media&token=9033d81e-2ff3-40fd-ba5f-b41e392009c1', aiHint: 'chilli pepper', slug: 'chilli' },
  // Fruits
  { name: 'Apple', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fapple.jpg?alt=media&token=c5f86e8e-c19f-4aba-8289-7f4bed2c5332', aiHint: 'apple fruit', slug: 'apple' },
  { name: 'Banana', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fbanana.jpg?alt=media&token=6228109c-9358-4c7c-bffd-51be0c5bc914', aiHint: 'banana fruit', slug: 'banana' },
  { name: 'Orange', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Forange.jpg?alt=media&token=6be8b4b0-12d8-4813-b0a8-62eb64d75429', aiHint: 'orange fruit', slug: 'orange' },
  { name: 'Mango', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fmango.jpg?alt=media&token=afec0169-ee02-434c-b22b-0c0993f38464', aiHint: 'mango fruit', slug: 'mango' },
  { name: 'Grapes', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fgrapes.jpg?alt=media&token=51c9eda6-60f4-4955-a065-b60e70ed2858', aiHint: 'grapes fruit', slug: 'grapes' },
  { name: 'Strawberry', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fstrawberry.jpg?alt=media&token=f4ac25be-1ef3-4020-804a-fa4563471c67', aiHint: 'strawberry fruit', slug: 'strawberry' },
  { name: 'Pineapple', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fpineapple.jpg?alt=media&token=e6323018-a82a-477b-a31f-c4979146baed', aiHint: 'pineapple fruit', slug: 'pineapple' },
  { name: 'Watermelon', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fwatermelon.jpg?alt=media&token=d4f5d05f-08b3-4127-a94d-4f7fd2670f73', aiHint: 'watermelon fruit', slug: 'watermelon' },
  { name: 'Pomegranate', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fpomegranade.jpg?alt=media&token=b64e3d98-71e9-4299-a579-100ec8d66d90', aiHint: 'pomegranate fruit', slug: 'pomegranate' },
  { name: 'Kiwi', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Crop%20images%2Fkiwi.jpg?alt=media&token=5c9a822d-ec0f-4dee-86b1-99eb4a109bd5', aiHint: 'kiwi fruit', slug: 'kiwi' },
];

export default function CropSciencePage() {
  // This detailed sizes prop is good for multi-column grids.
  const imageSizes = `
    (max-width: 639px) calc(45vw - 16px), 
    (max-width: 767px) calc(30vw - 16px), 
    (max-width: 1023px) calc(22vw - 16px), 
    (max-width: 1279px) calc(18vw - 16px), 
    250px
  `;

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
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-md max-h-full max-w-full"
                        data-ai-hint={crop.aiHint}
                        sizes={imageSizes} // Using the detailed sizes prop
                        onError={(e) => {
                          console.error(`Error loading image for ${crop.name}: ${crop.imageUrl}`, e.target);
                          // Optionally, you could set a fallback image source here
                          // e.currentTarget.srcset = "https://placehold.co/250x250.png?text=Error";
                          // e.currentTarget.src = "https://placehold.co/250x250.png?text=Error";
                        }}
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

// Added a comment to ensure file change is detected if content is identical.
