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

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8NYr35qrJfrHGgWWQWZIGIOssHLZtW1ukcoGWFXcI/exec";

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
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setFungicidesData(data);
        } else {
          // If your Apps Script returns an object with a specific key for the data array, adjust here.
          // For example, if it returns { "data": [...] }, you might use data.data
          console.warn("Fetched data is not an array. Please check Apps Script output.", data);
          // Attempt to find an array within the data if it's structured differently
          const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
          if (dataArrayKey) {
            setFungicidesData(data[dataArrayKey]);
          } else {
            throw new Error("Fetched data format is not as expected (expected an array).");
          }
        }
      } catch (err) {
        console.error("Error fetching fungicide data:", err);
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
              <p className="text-sm text-center">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Please ensure the data source is correctly configured and accessible.
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
              {fungicidesData.map((item, index) => (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
