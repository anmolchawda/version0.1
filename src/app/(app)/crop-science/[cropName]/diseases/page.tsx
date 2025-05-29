// src/app/(app)/crop-science/[cropName]/diseases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldAlert, Leaf, Loader2, AlertTriangle } from "lucide-react";

interface DiseaseDataItem {
  NAME: string; // Assuming the Apps Script returns a 'NAME' field
  DESCRIPTION?: string; // Optional description
  IMAGE_URL?: string; // Optional image URL from script
  AI_HINT?: string; // Optional AI hint for image
  // Add other fields as returned by your Apps Script
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
        console.log("Fetched raw data from Apps Script for diseases:", JSON.stringify(data, null, 2));
        
        let processedData: DiseaseDataItem[] = [];

        if (Array.isArray(data)) {
          processedData = data.filter(item => item && typeof item.NAME === 'string' && item.NAME.trim() !== '');
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
                console.log(`Data found in nested key: ${dataArrayKey}`);
                processedData = data[dataArrayKey].filter((item: any) => item && typeof item.NAME === 'string' && item.NAME.trim() !== '');
            } else if (Object.values(data).every(val => typeof val === 'object' && val !== null)) {
                console.log("Data seems to be an object of objects. Processing values.");
                processedData = Object.values(data).filter((item: any) => item && typeof item.NAME === 'string' && item.NAME.trim() !== '') as DiseaseDataItem[];
            } else {
               console.error("Unrecognized data structure:", data);
               throw new Error("Fetched data format is not a recognized array or object containing an array of items with a valid NAME property.");
            }
        } else {
          console.error("Data is not an array or suitable object:", data);
          throw new Error("Fetched data format is not as expected (expected an array or an object with a top-level array property).");
        }
        
        if (processedData.length === 0 && Array.isArray(data) && data.length > 0) {
            console.warn("Data was an array, but all items were filtered out. Check if 'NAME' property exists and is a non-empty string in your Apps Script output items.");
        } else if (processedData.length === 0 && typeof data === 'object' && Object.keys(data).length > 0) {
            console.warn("Data was an object, but processing resulted in an empty list. Check data structure and 'NAME' property.");
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

    // TODO: Consider passing cropSlug to Apps Script if it can filter by crop
    // For now, it fetches all data and assumes it's relevant or user will filter if search is added.
    fetchData();
  }, [cropSlug]); // Re-fetch if cropSlug changes, though currently not used in API call

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
              {diseasesData.map((disease, index) => (
                <Card 
                  key={disease.NAME || `disease-${index}`} // Use NAME as key if unique, otherwise index
                  className="overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg p-3 cursor-pointer"
                  // onClick={() => { /* Placeholder for navigation to detail page if needed later */ }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden shrink-0">
                      <Image
                        src={disease.IMAGE_URL || `https://placehold.co/200x200.png?text=${disease.NAME ? disease.NAME.charAt(0) : 'D'}`}
                        alt={disease.NAME || 'Disease image'}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={disease.AI_HINT || 'plant disease'}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-md sm:text-lg font-semibold text-primary">{disease.NAME || "Unknown Disease"}</h3>
                      {/* For now, description is not shown in this list view to keep it clean */}
                      {/* disease.DESCRIPTION && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{disease.DESCRIPTION}</p> */}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
