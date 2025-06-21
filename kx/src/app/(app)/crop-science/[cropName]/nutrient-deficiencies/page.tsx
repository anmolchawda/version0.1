
// src/app/(app)/crop-science/[cropName]/nutrient-deficiencies/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Leaf, Loader2 } from "lucide-react";

interface Deficiency {
  id: string;
  name: string;
  description: string; // Keep for potential detail view later
  imageUrl: string;
  aiHint: string;
}

const allDeficienciesData: Deficiency[] = [
  {
    id: 't-def1',
    name: 'Nitrogen Deficiency',
    description: 'Older leaves turn pale green or yellow, starting from the tips. Stunted growth. Younger leaves may remain green.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant nitrogen deficiency',
  },
  {
    id: 't-def2',
    name: 'Phosphorus Deficiency',
    description: 'Plants are stunted with dark green or purplish leaves, especially on the underside. Leaf tips may look burnt.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant phosphorus deficiency',
  },
  {
    id: 't-def3',
    name: 'Potassium Deficiency',
    description: 'Yellowing or browning (necrosis) along the edges of older leaves. Leaf curling may occur. Weak stems.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant potassium deficiency',
  },
  {
    id: 't-def4',
    name: 'Magnesium Deficiency',
    description: 'Interveinal chlorosis (yellowing between veins) on older leaves, while veins remain green. Leaves may become brittle.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant magnesium deficiency',
  },
  {
    id: 't-def5',
    name: 'Calcium Deficiency',
    description: 'Blossom-end rot in fruits (common in tomatoes). Young leaves may be distorted or hooked. Growing points may die.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant calcium deficiency',
  },
  {
    id: 't-def6',
    name: 'Iron Deficiency',
    description: 'Interveinal chlorosis on new, young leaves, with veins remaining green. Severe cases can turn entire leaves yellow or white.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant iron deficiency',
  }
];

const getDeficienciesForCrop = (cropSlug: string): Deficiency[] => {
  if (cropSlug === 'tomato') {
    return allDeficienciesData.filter(deficiency => deficiency.id.startsWith('t-'));
  }
  // Generic fallback
  return [
    { 
      id: 'gen-def1', 
      name: 'General Deficiency Info', 
      description: `Detailed nutrient deficiency information for ${cropSlug.replace('-', ' ')} is being updated. Check for common issues like N, P, K deficiencies.`, 
      imageUrl: 'https://placehold.co/600x400.png',
      aiHint: 'plant nutrient deficiency'
    }
  ];
};

export default function NutrientDeficienciesPage() {
  const params = useParams();
  const router = useRouter();
  
  const cropNameParam = params.cropName;

  if (!cropNameParam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading deficiency information...</p>
      </div>
    );
  }

  const cropSlug = typeof cropNameParam === 'string' ? cropNameParam : '';
  const cropDisplayName = cropSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const deficiencies = getDeficienciesForCrop(cropSlug);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
          <Leaf className="mr-2 h-7 w-7 text-primary" /> 
          Nutrient Deficiencies in {cropDisplayName}
        </h1>
      </div>
      
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Common Deficiencies</CardTitle>
          <CardDescription>
            Identify common nutrient deficiencies affecting {cropDisplayName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deficiencies.length > 0 ? (
            <div className="space-y-3">
              {deficiencies.map((deficiency) => (
                <Card 
                  key={deficiency.id} 
                  className="overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg p-3 cursor-pointer"
                  // onClick={() => { /* Placeholder for navigation to detail page if needed later */ }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden shrink-0">
                      <Image
                        src={deficiency.imageUrl}
                        alt={deficiency.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={deficiency.aiHint}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-md sm:text-lg font-semibold text-primary">{deficiency.name}</h3>
                      {/* Description removed from list view to keep it clean. Can be added to a detail page. */}
                    </div>
                    {/* "Learn More" button removed from list view to keep it clean */}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No specific nutrient deficiency information available for {cropDisplayName} at this time.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
