// src/app/(app)/crop-science/[cropName]/pests/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BugAnt } from "lucide-react"; // Using BugAnt for Pests section

interface Pest {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  aiHint: string;
  // Add other relevant fields like scientific name, control methods, etc.
}

// Mock data - in a real app, this would come from a database or CMS
const allPestsData: Pest[] = [
  {
    id: 't-pest1',
    name: 'Tomato Hornworm',
    description: 'Large green caterpillars with a "horn" on their rear. They can defoliate tomato plants quickly. Often found on leaves and stems.',
    imageUrl: 'https://placehold.co/600x400.png?text=Tomato+Hornworm',
    aiHint: 'caterpillar pest',
  },
  {
    id: 't-pest2',
    name: 'Aphids',
    description: 'Small, pear-shaped insects that cluster on new growth and the undersides of leaves. They suck sap and can transmit diseases.',
    imageUrl: 'https://placehold.co/600x400.png?text=Aphids',
    aiHint: 'aphids greenfly',
  },
  {
    id: 't-pest3',
    name: 'Whiteflies',
    description: 'Tiny, white, moth-like insects that fly up in clouds when disturbed. They feed on plant sap, causing yellowing and wilting.',
    imageUrl: 'https://placehold.co/600x400.png?text=Whiteflies',
    aiHint: 'whitefly insect',
  },
  {
    id: 't-pest4',
    name: 'Spider Mites',
    description: 'Tiny arachnids, difficult to see without magnification. They cause stippling on leaves and can create fine webs.',
    imageUrl: 'https://placehold.co/600x400.png?text=Spider+Mites',
    aiHint: 'spider mite',
  },
  {
    id: 't-pest5',
    name: 'Cutworms',
    description: 'Caterpillars that live in the soil and emerge at night to chew through the stems of young plants at ground level.',
    imageUrl: 'https://placehold.co/600x400.png?text=Cutworm',
    aiHint: 'cutworm larva',
  },
  // Add more pests for tomatoes or other crops
];

// Function to get pests for a specific crop (slug)
const getPestsForCrop = (cropSlug: string): Pest[] => {
  // For now, we'll assume all pests in allPestsData are for 'tomato'
  // In a real app, you'd filter based on cropSlug or have a mapping
  if (cropSlug === 'tomato') {
    return allPestsData.filter(pest => pest.id.startsWith('t-')); // Example: tomato pests start with 't-'
  }
  // Return a generic list or empty if no specific pests for that crop
  return [
    { 
      id: 'gen-pest1', 
      name: 'General Pest Info', 
      description: `Detailed pest information for ${cropSlug.replace('-', ' ')} is being updated. Check common pests like aphids and caterpillars.`, 
      imageUrl: 'https://placehold.co/600x400.png?text=Pest+Info',
      aiHint: 'insect pest'
    }
  ];
};


export default function PestsPage() {
  const params = useParams();
  const router = useRouter();
  
  const cropNameParam = params.cropName;
  const cropSlug = typeof cropNameParam === 'string' ? cropNameParam : '';
  const cropDisplayName = cropSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const pests = getPestsForCrop(cropSlug);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
          <BugAnt className="mr-2 h-7 w-7 text-primary" /> 
          Pests for {cropDisplayName}
        </h1>
      </div>
      
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Common Pests</CardTitle>
          <CardDescription>
            Learn about common pests affecting {cropDisplayName} and how to identify them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pests.map((pest) => (
                <Card key={pest.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-lg flex flex-col">
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={pest.imageUrl}
                      alt={pest.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={pest.aiHint}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{pest.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-4">{pest.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 mt-auto">
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No specific pest information available for {cropDisplayName} at this time.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
