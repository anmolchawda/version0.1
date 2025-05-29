
// src/app/(app)/crop-science/[cropName]/diseases/[diseaseName]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldAlert, Loader2, AlertTriangle } from "lucide-react";
import Image from 'next/image';

interface DiseaseDataItem {
  NAME?: string;
  IMAGE_URL?: string;
  AI_HINT?: string;
  "TOMATO PEST AND DISEASES"?: string;
  "CAUSING AGENT"?: string;
  "FAVOURABLE CLIMATE"?: string;
  "SYMPTOMS"?: string;
  "MANAGEMENT"?: string;
  [key: string]: any;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGrbyhJ85nt_dMLSnTt3JHC-WJ3Ll9C3HiQ8N-Eo7fyYuBPek6lAX2L75fFj30KOrsww/exec";

export default function DiseaseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const cropNameParam = params.cropName as string;
  const diseaseNameParam = decodeURIComponent(params.diseaseName as string);
  const cropDisplayName = cropNameParam.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [diseaseDetails, setDiseaseDetails] = useState<DiseaseDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiseaseDetails = async () => {
      if (!diseaseNameParam) {
        setError("Disease name not provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(APPS_SCRIPT_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        let allItems: DiseaseDataItem[] = [];

        if (Array.isArray(data)) {
          allItems = data;
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
                allItems = data[dataArrayKey];
            } else if (Object.values(data).every(val => typeof val === 'object' && val !== null)) {
                allItems = Object.values(data) as DiseaseDataItem[];
            } else {
               throw new Error("Fetched data format is not a recognized array or object containing an array.");
            }
        } else {
          throw new Error("Fetched data format is not as expected.");
        }
        
        const foundDisease = allItems.find(item => 
          (cropNameParam === 'tomato' && item["TOMATO PEST AND DISEASES"] === diseaseNameParam) || 
          (item.NAME === diseaseNameParam) 
        );
        
        if (foundDisease) {
          setDiseaseDetails(foundDisease);
        } else {
          setError(`Details for "${diseaseNameParam}" not found for ${cropDisplayName}.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (cropNameParam && diseaseNameParam) {
        fetchDiseaseDetails();
    }
  }, [cropNameParam, diseaseNameParam, cropDisplayName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading disease details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Error Loading Details</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!diseaseDetails) {
    return (
       <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
        <p className="text-center text-muted-foreground py-10">Disease details not found.</p>
      </div>
    );
  }
  
  const name = cropNameParam === 'tomato' ? diseaseDetails["TOMATO PEST AND DISEASES"] : diseaseDetails.NAME;
  const imageUrl = diseaseDetails.IMAGE_URL || `https://placehold.co/600x400.png?text=${name ? name.replace(/\s+/g, '+').substring(0,10) : 'Disease'}`;
  const aiHint = diseaseDetails.AI_HINT || 'plant disease';

  return (
    <div className="space-y-6">
       <Button variant="ghost" onClick={() => router.back()} className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
          <ChevronLeft className="mr-2 h-5 w-5" /> Back to Diseases List for {cropDisplayName}
        </Button>
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-primary">
            <ShieldAlert className="mr-3 h-6 sm:h-7 w-6 sm:w-7" />
            {name || "Disease Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-sm">
          {cropNameParam === 'tomato' && diseaseDetails["TOMATO PEST AND DISEASES"] ? (
            <>
              <div className="relative w-full h-60 bg-muted rounded-md overflow-hidden mb-4">
                  <Image
                      src={imageUrl}
                      alt={name || 'Disease image'}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={aiHint}
                      unoptimized={imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('https://storage.googleapis.com')}
                  />
              </div>
              <p><strong>Causing Agent:</strong> {diseaseDetails["CAUSING AGENT"] || "N/A"}</p>
              <p><strong>Favourable Climate:</strong> {diseaseDetails["FAVOURABLE CLIMATE"] || "N/A"}</p>
              <div className="space-y-1"> 
                <h4 className="font-semibold mt-2 mb-1 text-primary">Symptoms:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">{diseaseDetails["SYMPTOMS"] || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold mt-2 mb-1 text-primary">Management:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">{diseaseDetails["MANAGEMENT"] || "N/A"}</p>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h5 className="font-semibold text-md text-primary mb-2">More Images of Symptoms/Effects:</h5>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-1/2 aspect-video bg-muted rounded-md overflow-hidden">
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight.JPG?alt=media&token=6000b4ec-c6e4-4798-995f-1dc37859a6ab"
                        alt={`${name || 'Disease'} symptom - E&L Blight`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="tomato blight"
                        unoptimized={true}
                    />
                  </div>
                  <div className="relative w-full sm:w-1/2 aspect-video bg-muted rounded-md overflow-hidden">
                    <Image
                        src={`https://placehold.co/400x300.png?text=Affected+Part`}
                        alt={`${name || 'Disease'} affected plant part`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="affected plant"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
             <>
                <div className="relative w-full h-60 bg-muted rounded-md overflow-hidden mb-4">
                    <Image
                        src={imageUrl}
                        alt={name || 'Disease image'}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={aiHint}
                        unoptimized={imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('https://storage.googleapis.com')}
                    />
                </div>
                <p>{diseaseDetails.description || "No further details available."}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
