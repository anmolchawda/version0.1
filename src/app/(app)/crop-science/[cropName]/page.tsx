
// src/app/(app)/crop-science/[cropName]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bug, Virus, Leaf, FlaskConical } from "lucide-react"; // Using Virus for Diseases

interface ManagementOption {
  title: string;
  description: string;
  icon: JSX.Element;
  linkPath: string; // e.g., 'pests', 'diseases'
}

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const cropNameParam = params.cropName;
  // Decode and capitalize the crop name for display
  const cropName = cropNameParam ? decodeURIComponent(cropNameParam as string).split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Crop';

  const managementOptions: ManagementOption[] = [
    {
      title: "Pest Management",
      description: `Learn about common pests affecting ${cropName} and how to manage them effectively.`,
      icon: <Bug className="h-10 w-10 text-primary mb-3" />,
      linkPath: 'pests',
    },
    {
      title: "Disease Control",
      description: `Identify and control common diseases that can impact your ${cropName} harvest.`,
      icon: <Virus className="h-10 w-10 text-primary mb-3" />,
      linkPath: 'diseases',
    },
    {
      title: "Nutrient Deficiencies",
      description: `Diagnose and correct nutrient deficiencies to ensure healthy ${cropName} growth.`,
      icon: <Leaf className="h-10 w-10 text-primary mb-3" />, // Or Droplets, ThermometerSnowflake
      linkPath: 'nutrient-deficiencies',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
          <FlaskConical className="mr-2 h-7 w-7 text-primary" />
          {cropName} - Management
        </h1>
      </div>
      
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle>Explore Options for {cropName}</CardTitle>
          <CardDescription>
            Select a category below to learn more about managing pests, diseases, and nutrient deficiencies for {cropName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {managementOptions.map((option) => (
              <Link key={option.title} href={`/crop-science/${cropNameParam}/${option.linkPath}`} passHref>
                 <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col items-center justify-center p-6 rounded-lg">
                  {option.icon}
                  <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                  <CardDescription className="text-sm">{option.description}</CardDescription>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    