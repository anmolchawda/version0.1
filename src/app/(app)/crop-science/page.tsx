// src/app/(app)/crop-science/page.tsx
'use client'; // Make it a client component

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical } from "lucide-react"; // Leaf import removed as it's not used

interface CropInfo {
  name: string;
  imageUrl: string;
  aiHint: string;
}

const commonCrops: CropInfo[] = [
  // Vegetables
  { name: 'Tomato', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Tomato', aiHint: 'tomato vegetable' },
  { name: 'Potato', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Potato', aiHint: 'potato vegetable' },
  { name: 'Onion', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Onion', aiHint: 'onion vegetable' },
  { name: 'Carrot', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Carrot', aiHint: 'carrot vegetable' },
  { name: 'Broccoli', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Broccoli', aiHint: 'broccoli vegetable' },
  { name: 'Spinach', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Spinach', aiHint: 'spinach leaves' },
  { name: 'Bell Pepper', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Bell+Pepper', aiHint: 'bell pepper' },
  { name: 'Cucumber', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Cucumber', aiHint: 'cucumber vegetable' },
  { name: 'Lettuce', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Lettuce', aiHint: 'lettuce leaves' },
  { name: 'Eggplant', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Eggplant', aiHint: 'eggplant vegetable' },
  // Fruits
  { name: 'Apple', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Apple', aiHint: 'apple fruit' },
  { name: 'Banana', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Banana', aiHint: 'banana fruit' },
  { name: 'Orange', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Orange', aiHint: 'orange fruit' },
  { name: 'Mango', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Mango', aiHint: 'mango fruit' },
  { name: 'Grapes', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Grapes', aiHint: 'grapes fruit' },
  { name: 'Strawberry', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Strawberry', aiHint: 'strawberry fruit' },
  { name: 'Pineapple', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Pineapple', aiHint: 'pineapple fruit' },
  { name: 'Watermelon', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Watermelon', aiHint: 'watermelon fruit' },
  { name: 'Pomegranate', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Pomegranate', aiHint: 'pomegranate fruit' },
  { name: 'Kiwi', imageUrl: 'https://placehold.co/200x200/FFFFFF/4A4A4A.png?text=Kiwi', aiHint: 'kiwi fruit' },
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
                <Card key={crop.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
                  <div className="aspect-square bg-card flex items-center justify-center p-2">
                    <Image
                      src={crop.imageUrl}
                      alt={crop.name}
                      width={150}
                      height={150}
                      className="object-contain rounded-md"
                      data-ai-hint={crop.aiHint}
                    />
                  </div>
                  <div className="p-3 text-center bg-muted/30">
                    <p className="font-semibold text-sm text-foreground truncate">{crop.name}</p>
                  </div>
                </Card>
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
