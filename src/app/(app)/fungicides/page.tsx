// src/app/(app)/fungicides/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SprayCan, Loader2, AlertTriangle } from "lucide-react";

interface FungicideItem {
  TRADENAME: string;
  COMPANY: string;
  "TECHNICAL NAME": string;
  "FRAC CODE": string;
  "CLASS/FAMILY CONTROL": string;
  "S/C": string;
  "TL/OVI": string;
  TARGET: string;
  DOSE: string;
  // Add any other properties that might come from your sheet
  [key: string]: any; // Allow for other potential keys
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5fW9-cuZpEhXsiz2riv4CwVUr78-hREC5wINice9F2I0UVgHQDEzE_RHmnh_YfQw_GA/exec";

export default function FungicidesPage() {
  const [fungicidesData, setFungicidesData] = useState<FungicideItem[]>([]);
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
            errorText += `\nResponse body: ${body.substring(0, 500)}`; // Log part of the body if it's not JSON
          } catch (e) {
            // Ignore error reading body if it fails
          }
          throw new Error(errorText);
        }
        const data = await response.json();
        console.log("Fetched data from Apps Script:", data); // This is the crucial log

        if (Array.isArray(data)) {
          setFungicidesData(data);
        } else {
          console.warn("Fetched data is not an array. Please check Apps Script output.", data);
          // Attempt to find an array within the data if it's structured differently
          const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
          if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
            setFungicidesData(data[dataArrayKey]);
          } else {
            throw new Error("Fetched data format is not as expected (expected an array or an object with an array property).");
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <SprayCan className="mr-3 h-7 w-7" />
            Fungicides Information
          </CardTitle>
          <CardDescription>
            Browse fungicide details fetched from our database.
          </CardDescription>
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
                Please ensure the data source is correctly configured, publicly accessible, and returns data in the expected format.
              </p>
            </div>
          )}
          {!isLoading && !error && fungicidesData.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No fungicide data available at the moment.</p>
            </div>
          )}
          {!isLoading && !error && fungicidesData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fungicidesData.map((item, index) => {
                // Added log to inspect each item, especially TRADENAME
                console.log(`Rendering item ${index}: TRADENAME is '${item.TRADENAME}', Full item:`, item);
                return (
                  <Card key={item.TRADENAME || index} className="shadow-md rounded-lg hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 bg-muted/30">
                      <CardTitle className="text-lg text-primary">{item.TRADENAME || "N/A"}</CardTitle>
                      <CardDescription>{item.COMPANY || "N/A"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm space-y-1.5">
                      <p><strong>Technical Name:</strong> {item["TECHNICAL NAME"] || "N/A"}</p>
                      <p><strong>FRAC Code:</strong> {item["FRAC CODE"] || "N/A"}</p>
                      <p><strong>Class/Family:</strong> {item["CLASS/FAMILY CONTROL"] || "N/A"}</p>
                      <p><strong>S/C:</strong> {item["S/C"] || "N/A"}</p>
                      <p><strong>TL/OVI:</strong> {item["TL/OVI"] || "N/A"}</p>
                      <p><strong>Target:</strong> {item.TARGET || "N/A"}</p>
                      <p><strong>Dose:</strong> {item.DOSE || "N/A"}</p>
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
