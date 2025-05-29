
// src/app/(app)/crop-science/[cropName]/diseases/[diseaseName]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldAlert, Loader2, AlertTriangle } from "lucide-react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader, 
  DialogTitle as RadixDialogTitle, 
} from "@/components/ui/dialog";

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

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  const openImageInModal = (url: string) => {
    setModalImageUrl(url);
    setIsImageModalOpen(true);
  };

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
        console.log("DiseaseDetailPage - Params:", { cropNameParam, diseaseNameParam });
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
  console.log("DiseaseDetailPage - Derived name for conditional check:", name);
  
  let imageUrl = diseaseDetails.IMAGE_URL;
  let aiHint = diseaseDetails.AI_HINT || (cropNameParam === 'tomato' ? 'tomato disease' : 'plant disease');
  const isTomatoDisease = cropNameParam === 'tomato' && diseaseDetails["TOMATO PEST AND DISEASES"];

  if (isTomatoDisease && name === "Early Blight (Alternaria solani)") {
    imageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight%202.JPG?alt=media&token=55816d31-ddd3-45dc-85ac-571fceba877f";
    aiHint = 'tomato early blight';
    console.log("DiseaseDetailPage - Override for Early Blight applied. ImageURL:", imageUrl);
  } else if (isTomatoDisease && name === "Late Blight (Phytophthora infestans)") {
    imageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight%202.JPG?alt=media&token=55816d31-ddd3-45dc-85ac-571fceba877f";
    aiHint = 'tomato late blight';
    console.log("DiseaseDetailPage - Override for Late Blight applied. ImageURL:", imageUrl);
  }


  if (!imageUrl) {
    imageUrl = `https://placehold.co/600x400.png?text=${name ? name.replace(/\s+/g, '+').substring(0,10) : 'Disease'}`;
  }
  console.log("DiseaseDetailPage - Final imageUrl for <Image>:", imageUrl);
  
  const renderDetailItem = (label: string, value: string | undefined | null) => {
    if (!value) return null;
    const paragraphs = String(value).split(/\n{2,}/); 
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-md text-primary mb-1">{label}:</h4>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap text-muted-foreground text-sm mb-1.5 last:mb-0">
            {paragraph.split('\n').map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {line}
                {lineIndex < paragraph.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>
    );
  };


  return (
    <>
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-0 inline-flex items-center text-primary hover:text-primary/80 -ml-2">
            <ChevronLeft className="mr-2 h-5 w-5" /> Back
        </Button>
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-card pt-4 pb-3 px-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-primary text-center">
              {name || "Disease Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <button
              type="button"
              onClick={() => imageUrl && openImageInModal(imageUrl)}
              className="relative w-full aspect-video bg-muted overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer block group"
              aria-label={`View image for ${name || 'Disease'}`}
              disabled={!imageUrl}
            >
                {imageUrl && (
                  <Image
                      src={imageUrl}
                      alt={name || 'Disease image'}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={aiHint}
                      unoptimized={imageUrl.startsWith('https://firebasestorage.googleapis.com') || imageUrl.startsWith('https://storage.googleapis.com') || imageUrl.startsWith('https://placehold.co')}
                      className="transition-transform duration-300 group-hover:scale-105"
                  />
                )}
            </button>
            
            <div className="p-4 space-y-3">
                {isTomatoDisease ? (
                <>
                    {renderDetailItem("Causing Agent", diseaseDetails["CAUSING AGENT"])}
                    {renderDetailItem("Favourable Climate", diseaseDetails["FAVOURABLE CLIMATE"])}
                    {renderDetailItem("Symptoms", diseaseDetails["SYMPTOMS"])}
                    {renderDetailItem("Management", diseaseDetails["MANAGEMENT"])}
                </>
                ) : (
                <p className="text-sm text-muted-foreground">{diseaseDetails.description || "No further details available."}</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {modalImageUrl && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogOverlay className="bg-black/60 backdrop-blur-sm fixed inset-0 z-[51]" />
          <DialogContent className="p-2 max-w-3xl w-auto bg-transparent border-none shadow-none flex items-center justify-center z-[52] outline-none">
            <DialogHeader className="sr-only">
                <RadixDialogTitle>Enlarged image for {name || 'disease'}</RadixDialogTitle>
            </DialogHeader>
            <div className="relative aspect-auto max-h-[85vh] max-w-[85vw]">
              <Image
                src={modalImageUrl}
                alt={`Enlarged image for ${name || 'disease'}`}
                layout="intrinsic"
                width={1200} 
                height={800} 
                objectFit="contain"
                className="rounded-lg"
                unoptimized={modalImageUrl.startsWith('https://firebasestorage.googleapis.com') || modalImageUrl.startsWith('https://storage.googleapis.com') || modalImageUrl.startsWith('https://placehold.co')}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
      
    

    