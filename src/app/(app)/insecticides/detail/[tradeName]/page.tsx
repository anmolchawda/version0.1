
// src/app/(app)/insecticides/detail/[tradeName]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, AlertTriangle, Bug } from "lucide-react";

interface InsecticideItem {
  "TRADE NAME": string;
  "COMPANY": string;
  "TECHNICAL NAME": string;
  "IRAC GROUP": string;
  "S/C": string;
  "TL/OVI": string;
  "TARGET PEST": string;
  "DOSE": string;
  [key: string]: any; 
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0n3BY-ZJRPSL-NbPHBrnFGlalSgEdpbH9Mvd6kPzJcRASmBCmzZOc0aQ8pt-j-7gHSQ/exec";

export default function InsecticideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeName = decodeURIComponent(params.tradeName as string);

  const [insecticide, setInsecticide] = useState<InsecticideItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsecticideDetails = async () => {
      if (!tradeName) {
        setError("Insecticide trade name not provided.");
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
        let allItems: InsecticideItem[] = [];
        
        if (Array.isArray(data)) {
          allItems = data;
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
                allItems = data[dataArrayKey];
            } else if (Object.values(data).every(val => typeof val === 'object' && val !== null)) {
                allItems = Object.values(data) as InsecticideItem[];
            } else {
               throw new Error("Fetched data format is not a recognized array or object containing an array.");
            }
        } else {
          throw new Error("Fetched data format is not as expected.");
        }
        
        const foundInsecticide = allItems.find(item => String(item["TRADE NAME"]) === tradeName);
        
        if (foundInsecticide) {
          setInsecticide(foundInsecticide);
        } else {
          setError(`Insecticide with trade name "${tradeName}" not found.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsecticideDetails();
  }, [tradeName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading insecticide details...</p>
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

  if (!insecticide) {
    return (
       <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
        <p className="text-center text-muted-foreground py-10">Insecticide details not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <Button variant="ghost" onClick={() => router.back()} className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
          <ChevronLeft className="mr-2 h-5 w-5" /> Back to Insecticides List
        </Button>
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <Bug className="mr-3 h-7 w-7" />
            {String(insecticide["TRADE NAME"] || "N/A")}
          </CardTitle>
          <CardDescription className="text-md">
            Company: {String(insecticide["COMPANY"] || "N/A")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <p><strong>Technical Name:</strong> {String(insecticide["TECHNICAL NAME"] || "N/A")}</p>
            <p><strong>IRAC Group:</strong> {String(insecticide["IRAC GROUP"] || "N/A")}</p>
            <p><strong>S/C:</strong> {String(insecticide["S/C"] || "N/A")}</p>
            <p><strong>TL/OVI:</strong> {String(insecticide["TL/OVI"] || "N/A")}</p>
            <p><strong>Dose:</strong> {String(insecticide["DOSE"] || "N/A")}</p>
          </div>
          <div className="pt-2">
             <p><strong>Target Pest:</strong> {String(insecticide["TARGET PEST"] || "N/A")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
