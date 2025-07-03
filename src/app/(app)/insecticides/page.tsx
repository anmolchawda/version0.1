
// src/app/(app)/insecticides/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bug, Loader2, AlertTriangle, Search, ListChecks } from "lucide-react";

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

export default function InsecticidesPage() {
  const [insecticidesData, setInsecticidesData] = useState<InsecticideItem[]>([]);
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
        
        let rawItems: any[] = [];
        if (Array.isArray(data)) {
          rawItems = data;
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            const dataArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (dataArrayKey && Array.isArray(data[dataArrayKey])) {
                rawItems = data[dataArrayKey];
            } else if (Object.values(data).every(val => typeof val === 'object' && val !== null)) {
                rawItems = Object.values(data);
            } else {
               throw new Error("Fetched data format is not a recognized array or object containing an array.");
            }
        } else {
          throw new Error("Fetched data format is not as expected.");
        }
        setInsecticidesData(rawItems as InsecticideItem[]);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInsecticides = useMemo(() => {
    if (!searchTerm.trim()) {
      return insecticidesData;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return insecticidesData.filter(item => {
      return (
        String(item["TRADE NAME"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["COMPANY"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["TECHNICAL NAME"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["IRAC GROUP"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["S/C"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["TL/OVI"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["TARGET PEST"] || '').toLowerCase().includes(lowerSearchTerm) ||
        String(item["DOSE"] || '').toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [searchTerm, insecticidesData]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <Bug className="mr-3 h-7 w-7" />
            Insecticides Information
          </CardTitle>
          <CardDescription>
            Browse and search insecticide details. Click on an item for more details.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Trade Name, Company, Target Pest, etc..."
              className="w-full pl-10 py-2 rounded-lg"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Loading insecticide data...</p>
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
          {!isLoading && !error && insecticidesData.length > 0 && filteredInsecticides.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">No insecticides found matching "{searchTerm}".</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}
           {!isLoading && !error && insecticidesData.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">No insecticide data available at the moment.</p>
              <p className="text-sm">This could be because the source is empty or not providing data in the expected format.</p>
            </div>
          )}
          {!isLoading && !error && filteredInsecticides.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsecticides.map((item, index) => (
                <Link
                  href={`/insecticides/detail/${encodeURIComponent(String(item["TRADE NAME"] || `item-${index}`))}`}
                  key={String(item["TRADE NAME"] || `item-${index}`)}
                  passHref
                >
                  <Card className="shadow-md rounded-lg hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    <CardHeader className="pb-4 pt-4 bg-muted/20">
                      <CardTitle className="text-lg text-primary">{String(item["TRADE NAME"] || "N/A")}</CardTitle>
                      <CardDescription>{String(item["COMPANY"] || "N/A")}</CardDescription>
                    </CardHeader>
                    {/* Further details removed from list view, will be on detail page */}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
