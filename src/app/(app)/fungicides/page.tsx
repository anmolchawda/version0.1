
// src/app/(app)/fungicides/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { SprayCan, Loader2, AlertTriangle, Search, ListChecks } from "lucide-react";

interface FungicideItem {
  "TRADE NAME ": string;
  "COMPANY": string;
  "TECHNICAL NAME": string;
  "FRAC GROUP": string; // Changed from FRAC CODE
  "CLASS/FAMILY CONTROL": string;
  "S/C": string;
  "TL/OVI": string;
  "TARGET ": string; // Note the trailing space
  "DOSE": string;
  [key: string]: any; 
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5fW9-cuZpEhXsiz2riv4CwVUr78-hREC5wINice9F2I0UVgHQDEzE_RHmnh_YfQw_GA/exec";

export default function FungicidesPage() {
  const [fungicidesData, setFungicidesData] = useState<FungicideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
            errorText += `\nResponse body: ${body.substring(0, 500)}`; 
          } catch (e) {
            // Ignore error reading body
          }
          throw new Error(errorText);
        }
        
        const data = await response.json();
        console.log("Fetched raw data from Apps Script:", data); 

        if (Array.isArray(data)) {
          setFungicidesData(data);
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            // Attempt to find a top-level property that is an array
            const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
                console.log(`Found data in nested key: ${dataArrayKey}`);
                setFungicidesData(data[dataArrayKey]);
            } else {
                // Fallback: if the object's values are all objects (like a list from Firebase Realtime DB)
                console.warn("Fetched data is an object but no array found. Trying Object.values if it's a flat object used as a list.", data);
                if (Object.values(data).every(val => typeof val === 'object' && val !== null)) {
                  setFungicidesData(Object.values(data) as FungicideItem[]);
                } else {
                   throw new Error("Fetched data format is not a recognized array or object containing an array.");
                }
            }
        } else {
          console.warn("Fetched data is not an array or a recognizable object. Please check Apps Script output.", data);
          throw new Error("Fetched data format is not as expected (expected an array or an object with a top-level array property).");
        }
      } catch (err) {
        console.error("Fetch error in FungicidesPage:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFungicides = useMemo(() => {
    if (!searchTerm.trim()) {
      return fungicidesData;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return fungicidesData.filter(item => {
      return (
        String(item["TRADE NAME "] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["COMPANY"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["TECHNICAL NAME"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["FRAC GROUP"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["CLASS/FAMILY CONTROL"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["S/C"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["TL/OVI"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["TARGET "] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["DOSE"] || '').toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [searchTerm, fungicidesData]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <SprayCan className="mr-3 h-7 w-7" />
            Fungicides Information
          </CardTitle>
          <CardDescription>
            Browse and search fungicide details fetched from our database.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Trade Name, Company, Target, etc..."
              className="w-full pl-10 py-2 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Loading fungicide data...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-destructive">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Error Loading Data</p>
              <p className="text-sm text-center whitespace-pre-wrap">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Please ensure the Google Apps Script URL is correct, deployed, and returns data in the expected JSON array format. Check the browser console for more details.
              </p>
            </div>
          )}
          {!isLoading && !error && fungicidesData.length > 0 && filteredFungicides.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">No fungicides found matching "{searchTerm}".</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}
          {!isLoading && !error && fungicidesData.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">No fungicide data available at the moment.</p>
              <p className="text-sm">This could be because the source is empty or not providing data in the expected format. Check console logs for the fetched data structure.</p>
            </div>
          )}
          {!isLoading && !error && filteredFungicides.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFungicides.map((item, index) => {
                // console.log(`Rendering item ${index}: TRADENAME - '${item["TRADE NAME "]}', FRAC GROUP - '${item["FRAC GROUP"]}' (type: ${typeof item["FRAC GROUP"]})`);
                return (
                  <Card key={item["TRADE NAME "] || index} className="shadow-md rounded-lg hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 bg-muted/30">
                      <CardTitle className="text-lg text-primary">{item["TRADE NAME "] || "N/A"}</CardTitle>
                      <CardDescription>{item["COMPANY"] || "N/A"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm space-y-1.5">
                      <p><strong>Technical Name:</strong> {item["TECHNICAL NAME"] || "N/A"}</p>
                      <p><strong>FRAC Group:</strong> {item["FRAC GROUP"] || "N/A"}</p>
                      <p><strong>Class/Family:</strong> {item["CLASS/FAMILY CONTROL"] || "N/A"}</p>
                      <p><strong>S/C:</strong> {item["S/C"] || "N/A"}</p>
                      <p><strong>TL/OVI:</strong> {item["TL/OVI"] || "N/A"}</p>
                      <p><strong>Target:</strong> {item["TARGET "] || "N/A"}</p>
                      <p><strong>Dose:</strong> {item["DOSE"] || "N/A"}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

