// src/app/(app)/crop-science/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FlaskConical, ListChecks, Loader2, AlertTriangle } from "lucide-react";

interface CropDataItem {
  id: string;
  name: string;
  type: string;
  impact: string;
  controlMeasure: string;
  // Add other potential fields from your CSV here
  [key: string]: string; // To accommodate any other columns
}

export default function CropSciencePage() {
  const [cropData, setCropData] = useState<CropDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/crop-data');
        if (!response.ok) {
          let errorDetails = `Failed to fetch data: ${response.statusText} (status: ${response.status})`;
          try {
            // Try to parse as JSON, it might contain a specific error message
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.details || JSON.stringify(errorData);
          } catch (jsonError) {
            // If response is not JSON (e.g., HTML error page), use the text content
            const textError = await response.text();
            // Limit the length of HTML error to keep the message manageable
            errorDetails = `Server responded with an error. Response: ${textError.substring(0, 500)}...`;
          }
          throw new Error(errorDetails);
        }
        const data: CropDataItem[] = await response.json();
        setCropData(data);
      } catch (e: any) {
        console.error("Error fetching crop data:", e);
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <FlaskConical className="mr-3 h-7 w-7 text-primary" />
            Crop Science Hub
          </CardTitle>
          <CardDescription>
            Explore data related to crop science, agronomy, and best farming practices, sourced from our data file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Loading crop data...</p>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                The data below is dynamically loaded from the <code>public/crop-data.csv</code> file via an API.
              </p>
              <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                <ListChecks className="mr-2 h-6 w-6" />
                Crop Issues & Management
              </h3>
              {cropData.length > 0 ? (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Issue Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Impact Level</TableHead>
                        <TableHead>Control Measures</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cropData.map((item) => (
                        <TableRow key={item.id || item.name}> {/* Use name as fallback key if id is missing */}
                          <TableCell className="font-medium">{item.name || 'N/A'}</TableCell>
                          <TableCell>{item.type || 'N/A'}</TableCell>
                          <TableCell>{item.impact || 'N/A'}</TableCell>
                          <TableCell>{item.controlMeasure || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                 <p className="text-sm text-muted-foreground mt-4 text-center">
                  No crop science data found in the CSV file or the file is empty.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
