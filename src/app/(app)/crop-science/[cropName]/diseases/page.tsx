
// src/app/(app)/crop-science/[cropName]/diseases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldAlert, Leaf, Loader2, AlertTriangle } from "lucide-react";

interface DiseaseDataItem {
  // General fields
  NAME?: string;
  IMAGE_URL?: string;
  AI_HINT?: string;

  // Tomato-specific fields
  "TOMATO PEST AND DISEASES"?: string;
  "CAUSING AGENT"?: string;
  "FAVOURABLE CLIMATE"?: string;
  "SYMPTOMS"?: string;
  "MANAGEMENT"?: string;

  [key: string]: any; // To accommodate other potential fields
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGrbyhJ85nt_dMLSnTt3JHC-WJ3Ll9C3HiQ8N-Eo7fyYuBPek6lAX2L75fFj30KOrsww/exec";

export default function DiseasesPage() {
  const params = useParams();
  const router = useRouter();
  
  const cropNameParam = params.cropName;
  const cropSlug = typeof cropNameParam === 'string' ? cropNameParam : '';
  const cropDisplayName = cropSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [diseasesData, setDiseasesData] = useState<DiseaseDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(APPS_SCRIPT_URL); 
        if (!response.ok) {
          let errorText = `Failed to fetch data: ${response.status} ${response.statusText}`;
          try {
            const body = await response.text(); 
            errorText += `\nResponse body (first 500 chars): ${body.substring(0, 500)}`; 
          } catch (e) { /* Ignore error reading body */ }
          throw new Error(errorText);
        }
        
        const data = await response.json();
        
        let processedData: DiseaseDataItem[] = [];

        if (Array.isArray(data)) {
          processedData = data; 
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
                processedData = data[dataArrayKey];
            } else if (Object.values(data).every(val => typeof val === 'object' && val !== null)) {
                processedData = Object.values(data) as DiseaseDataItem[];
            } else {
               throw new Error("Fetched data format is not a recognized array or object containing an array of items.");
            }
        } else {
          throw new Error("Fetched data format is not as expected (expected an array or an object with a top-level array property).");
        }
        
        // Filter out items that don't have a valid name field for the current crop type
        processedData = processedData.filter(item => 
          (cropSlug === 'tomato' && item && typeof item["TOMATO PEST AND DISEASES"] === 'string' && item["TOMATO PEST AND DISEASES"].trim() !== '') ||
          (cropSlug !== 'tomato' && item && typeof item.NAME === 'string' && item.NAME.trim() !== '')
        );

        if (processedData.length === 0 && ((Array.isArray(data) && data.length > 0) || (typeof data === 'object' && Object.keys(data).length > 0))) {
            console.warn("Data was fetched, but all items were filtered out. Check if relevant identifying properties (NAME or TOMATO PEST AND DISEASES for tomatoes) exist and are non-empty strings in your Apps Script output items.");
        }
        
        setDiseasesData(processedData);

      } catch (err) {
        console.error("Fetch error in DiseasesPage:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
        setDiseasesData([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cropSlug]);

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
            Learn about common diseases affecting {cropDisplayName}. Data sourced live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Loading disease data...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-destructive">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error Loading Data</p>
              <p className="text-sm text-center whitespace-pre-wrap">{error}</p>
            </div>
          )}
          {!isLoading && !error && diseasesData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No specific disease information available for {cropDisplayName} at this time.</p>
          )}
          {!isLoading && !error && diseasesData.length > 0 && (
            <div className="space-y-3">
              {diseasesData.map((disease, index) => {
                const diseaseName = cropSlug === 'tomato' ? disease["TOMATO PEST AND DISEASES"] : disease.NAME;
                if (!diseaseName) return null; // Skip rendering if no valid name

                const imageUrl = disease.IMAGE_URL || `https://placehold.co/100x100.png?text=${diseaseName.charAt(0)}`;
                const aiHint = disease.AI_HINT || (cropSlug === 'tomato' ? 'tomato disease' : 'plant disease');

                return (
                  <Link
                    href={`/crop-science/${cropSlug}/diseases/${encodeURIComponent(diseaseName)}`}
                    key={diseaseName || `disease-${index}`}
                  >
                    <Card className="p-3 flex items-center space-x-4 hover:bg-muted/50 cursor-pointer rounded-lg shadow-sm transition-shadow">
                      <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0">
                        <Image
                          src={imageUrl}
                          alt={diseaseName}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={aiHint}
                          unoptimized={imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('https://storage.googleapis.com')}
                        />
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-md text-primary">{diseaseName}</CardTitle>
                        {cropSlug === 'tomato' && (
                          <p className="text-xs text-muted-foreground uppercase mt-1">TOMATO</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
