
// src/app/(app)/crop-science/[cropName]/diseases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldAlert, Loader2, AlertTriangle } from "lucide-react";

interface DiseaseDataItem {
  // General fields
  NAME?: string;
  IMAGE_URL?: string;
  AI_HINT?: string;
  PHOTOS?: string;

  // Tomato-specific fields
  "TOMATO PEST AND DISEASES"?: string;
  "CAUSING AGENT"?: string;
  "FAVOURABLE CLIMATE"?: string;
  "SYMPTOMS"?: string;
  "MANAGEMENT"?: string;

  [key: string]: string | undefined; // Assuming other potential fields are strings
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
      if (!cropSlug) {
        setError("Crop name not specified in URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(APPS_SCRIPT_URL); 
        if (!response.ok) {
          let errorText = `Failed to fetch data from ${APPS_SCRIPT_URL}: ${response.status} ${response.statusText}`;
          try {
            const body = await response.text(); // ignore is unused here
            errorText += `\nResponse body (first 500 chars): ${body.substring(0, 500)}`; // ignore is unused here
          } catch (ignore) { /* Ignore error reading body */ }
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
        
        processedData = processedData.filter(item => 
          item && 
          (
            (cropSlug === 'tomato' && typeof item["TOMATO PEST AND DISEASES"] === 'string' && item["TOMATO PEST AND DISEASES"].trim() !== '') ||
            (cropSlug !== 'tomato' && typeof item.NAME === 'string' && item.NAME.trim() !== '')
          )
        );

        if (processedData.length === 0 && ((Array.isArray(data) && data.length > 0) || (typeof data === 'object' && Object.keys(data).length > 0))) {
            // console.warn("[DiseasesPage] Data was fetched, but all items were filtered out. Check if relevant identifying properties (NAME or 'TOMATO PEST AND DISEASES' for tomatoes) exist and are non-empty strings in your Apps Script output items. Current cropSlug:", cropSlug);
        }
        
        setDiseasesData(processedData);

      } catch (err) {
        let detailedErrorMessage = `An unknown error occurred while fetching data from the disease information service. URL: ${APPS_SCRIPT_URL}`;
        if (err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch")) {
            detailedErrorMessage = `Network error: Failed to fetch data from ${APPS_SCRIPT_URL}. Please check your internet connection and ensure the service URL is correct and accessible.`;
        } else if (err instanceof Error) {
            detailedErrorMessage = `Error fetching data: ${err.message}. URL: ${APPS_SCRIPT_URL}`;
        }
        // console.error("[DiseasesPage] Fetch error:", detailedErrorMessage, err);
        setError(detailedErrorMessage);
        setDiseasesData([]); 
      } finally {
        setIsLoading(false); 
      }
    };

    if (cropSlug) {
        fetchData();
    } else {
        setError("Crop name not specified in URL.");
        setIsLoading(false);
    }
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
                // --- Start of Diagnostic Logging ---
                // Uncomment for debugging
                // console.log("[DiseasesPage] Item data from sheet:", JSON.stringify(disease)); 
                // --- End of Diagnostic Logging ---

                const diseaseName = cropSlug === 'tomato' ? disease["TOMATO PEST AND DISEASES"] : disease.NAME;
                if (!diseaseName) {
                  // Uncomment for debugging
                  // console.warn("[DiseasesPage] Item skipped due to missing disease name:", JSON.stringify(disease));
                  return null;
                }

                const normalizedDiseaseName = String(diseaseName).trim().toLowerCase();
                // --- Diagnostic Log ---
                // Uncomment for debugging
                // console.log(`[DiseasesPage] Processing Disease: Original='${diseaseName}', Normalized='${normalizedDiseaseName}', CropSlug='${cropSlug}'`);
                // ---

                let imageUrl: string;
                let aiHint: string;
                let unoptimizedImage = false;


                if (cropSlug === 'tomato' && normalizedDiseaseName === "early blight (alternaria solani)") {
                  imageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight.JPG?alt=media&token=6000b4ec-c6e4-4798-995f-1dc37859a6ab";
                  aiHint = 'tomato early blight';
                  unoptimizedImage = true; 
                } else if (cropSlug === 'tomato' && normalizedDiseaseName === "anthracnose (colletotrichum spp.)") {
                  imageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FAnthracnose%204.jpg?alt=media&token=d181c8e5-dd78-4ada-8f2b-4826f21ffc66";
                  aiHint = 'tomato anthracnose';
                  unoptimizedImage = true;
                } else if (cropSlug === 'tomato' && normalizedDiseaseName.includes("spotted wilt virus")) { 
                  // --- Diagnostic Log ---
                  // Uncomment for debugging
                  // console.log("[DiseasesPage] SUCCESS: Matched 'tomato spotted wilt virus' (using .includes). Applying specific image.");
                  // ---
                  imageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FSpotted%20wilt%202.jpg?alt=media&token=906856b4-44bf-4f34-ae1a-562f8f6dca04AC";
                  aiHint = 'tomato spotted_wilt_virus';
                  unoptimizedImage = true;
                } else if (cropSlug === 'tomato' && disease["PHOTOS"]) {
                  imageUrl = disease["PHOTOS"];
                  aiHint = disease.AI_HINT || 'tomato disease';
                  unoptimizedImage = imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('https://storage.googleapis.com');
                } else if (disease.IMAGE_URL) {
                  imageUrl = disease.IMAGE_URL;
                  aiHint = disease.AI_HINT || (cropSlug === 'tomato' ? 'tomato disease' : 'plant disease');
                  unoptimizedImage = imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('https://storage.googleapis.com');
                } else {
                  imageUrl = `https://placehold.co/100x100.png?text=${diseaseName.charAt(0)}`;
                  aiHint = (cropSlug === 'tomato' ? 'tomato disease' : 'plant disease');
                  unoptimizedImage = true;
                }

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
                          unoptimized={unoptimizedImage}
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
    

