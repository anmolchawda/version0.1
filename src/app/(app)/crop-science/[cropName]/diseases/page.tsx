// src/app/(app)/crop-science/[cropName]/diseases/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldAlert, Leaf } from "lucide-react"; // Leaf can be a generic icon for the items

interface Disease {
  id: string;
  name: string;
  description: string; // Keep for potential detail view later
  imageUrl: string;
  aiHint: string;
}

const allDiseasesData: Disease[] = [
  {
    id: 't-disease1',
    name: 'Early Blight',
    description: 'Caused by the fungus Alternaria solani. Appears as dark, concentric lesions on lower leaves. Can defoliate plants and reduce yield.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'tomato early blight',
  },
  {
    id: 't-disease2',
    name: 'Late Blight',
    description: 'Caused by Phytophthora infestans. Rapidly destroys leaves, stems, and fruit. Thrives in cool, moist conditions.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'tomato late blight',
  },
  {
    id: 't-disease3',
    name: 'Septoria Leaf Spot',
    description: 'Caused by Septoria lycopersici. Small, circular spots with dark borders and lighter centers on leaves. Leads to yellowing and leaf drop.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'leaf spot',
  },
  {
    id: 't-disease4',
    name: 'Fusarium Wilt',
    description: 'Fungal disease that causes yellowing and wilting, often on one side of the plant. Vascular tissues become discolored.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'plant wilt disease',
  },
  {
    id: 't-disease5',
    name: 'Powdery Mildew',
    description: 'Fungal disease appearing as white, powdery spots on leaves and stems. Can reduce photosynthesis and plant vigor.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'powdery mildew',
  },
];

const getDiseasesForCrop = (cropSlug: string): Disease[] => {
  if (cropSlug === 'tomato') {
    return allDiseasesData.filter(disease => disease.id.startsWith('t-'));
  }
  return [
    { 
      id: 'gen-disease1', 
      name: 'General Disease Info', 
      description: `Detailed disease information for ${cropSlug.replace('-', ' ')} is being updated. Check common issues like blights and wilts.`, 
      imageUrl: 'https://placehold.co/600x400.png',
      aiHint: 'plant disease'
    }
  ];
};

export default function DiseasesPage() {
  const params = useParams();
  const router = useRouter();
  
  const cropNameParam = params.cropName;
  const cropSlug = typeof cropNameParam === 'string' ? cropNameParam : '';
  const cropDisplayName = cropSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const diseases = getDiseasesForCrop(cropSlug);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
          <ShieldAlert className="mr-2 h-7 w-7 text-primary" /> 
          Diseases for {cropDisplayName}
        </h1>
      </div>
      
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Common Diseases</CardTitle>
          <CardDescription>
            Learn about common diseases affecting {cropDisplayName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {diseases.length > 0 ? (
            <div className="space-y-3"> {/* Changed from grid to space-y for list view */}
              {diseases.map((disease) => (
                <Card 
                  key={disease.id} 
                  className="overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg p-3 cursor-pointer"
                  onClick={() => { /* Placeholder for navigation to detail page if needed later */ }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden shrink-0">
                      <Image
                        src={disease.imageUrl}
                        alt={disease.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={disease.aiHint}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-md sm:text-lg font-semibold text-primary">{disease.name}</h3>
                      {/* Description removed from list view */}
                    </div>
                    {/* "Learn More" button removed from list view */}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No specific disease information available for {cropDisplayName} at this time.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
