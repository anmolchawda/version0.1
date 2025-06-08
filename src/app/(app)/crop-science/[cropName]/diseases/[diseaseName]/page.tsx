
// src/app/(app)/crop-science/[cropName]/diseases/[diseaseName]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
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
  PHOTOS?: string; // For additional images
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
  
  const [diseaseDetails, setDiseaseDetails] = useState<DiseaseDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // State for derived main image properties
  const [mainImageUrl, setMainImageUrl] = useState<string | undefined>(undefined);
  const [mainImageAiHint, setMainImageAiHint] = useState<string>('plant disease');
  const [mainImageUnoptimized, setMainImageUnoptimized] = useState<boolean>(true);

  // State for additional images
  const [additionalImagesData, setAdditionalImagesData] = useState<{url: string, hint: string, unoptimized: boolean}[]>([]);

  const openImageInModal = (url: string) => {
    setModalImageUrl(url);
    setIsImageModalOpen(true);
  };

  // Effect 1: Fetch disease details
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
        
        const cropDisplayNameForError = cropNameParam.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const foundDisease = allItems.find(item => 
          (cropNameParam === 'tomato' && String(item["TOMATO PEST AND DISEASES"])?.trim().toLowerCase() === diseaseNameParam.trim().toLowerCase()) || 
          (String(item.NAME)?.trim().toLowerCase() === diseaseNameParam.trim().toLowerCase()) 
        );
        
        if (foundDisease) {
          setDiseaseDetails(foundDisease);
        } else {
          setError(`Details for "${diseaseNameParam}" not found for ${cropDisplayNameForError}.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (cropNameParam && diseaseNameParam) {
        fetchDiseaseDetails();
    }
  }, [cropNameParam, diseaseNameParam]);
  
  // Effect 2: Determine main image URL and properties based on fetched details and params
  useEffect(() => {
    if (diseaseDetails) {
      let determinedImageUrl: string | undefined;
      let determinedAiHint: string = diseaseDetails.AI_HINT || (cropNameParam === 'tomato' ? 'tomato disease' : 'plant disease');
      let determinedUnoptimized = false;

      const isTomatoCrop = cropNameParam === 'tomato';
      const normalizedDiseaseNameFromUrl = diseaseNameParam.trim().toLowerCase();
      const nameFromSheet = cropNameParam === 'tomato' ? diseaseDetails["TOMATO PEST AND DISEASES"] : diseaseDetails.NAME;
      const normalizedNameFromSheet = nameFromSheet ? String(nameFromSheet).trim().toLowerCase() : "";

      if (isTomatoCrop && (normalizedDiseaseNameFromUrl.includes("septoria leaf spot") || normalizedNameFromSheet.includes("septoria leaf spot"))) {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FSeptoria%20Leaf%20Spot.JPG?alt=media&token=54198675-7740-4dbf-a833-721e6bd6439f";
        determinedAiHint = 'tomato septoria_leaf_spot';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && (normalizedDiseaseNameFromUrl.includes("powdery mildew") || normalizedNameFromSheet.includes("powdery mildew"))) {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FPowdery%20Mildew.jpg?alt=media&token=370bdfd1-4fba-4bde-8dc2-04e97079210d";
        determinedAiHint = 'tomato powdery_mildew';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedDiseaseNameFromUrl === "anthracnose (colletotrichum spp.)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FAnthracnose%204.jpg?alt=media&token=d181c8e5-dd78-4ada-8f2b-4826f21ffc66";
        determinedAiHint = 'tomato anthracnose';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedDiseaseNameFromUrl === "tomato spotted wilt virus") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FSpotted%20wilt%202.jpg?alt=media&token=906856b4-44bf-4f34-ae1a-562f8f6dca04AC";
        determinedAiHint = 'tomato spotted_wilt_virus';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet.includes("damping off")) {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FDamping%20Off.png?alt=media&token=df712817-9522-448b-86d8-1eacd75f68f1";
        determinedAiHint = 'tomato damping_off seedling';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "early blight (alternaria solani)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight.JPG?alt=media&token=6000b4ec-c6e4-4798-995f-1dc37859a6ab";
        determinedAiHint = 'tomato early_blight';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "late blight (phytophthora infestans)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FE%26L%20Blight%202.JPG?alt=media&token=55816d31-ddd3-45dc-85ac-571fceba877f";
        determinedAiHint = 'tomato late_blight';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "tomato mosaic virus") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FMosiac%20virus.png?alt=media&token=733cf2fb-fa72-40af-9aba-c9b65bd2018a";
        determinedAiHint = 'tomato mosaic_virus';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "tomato yellow leaf curl virus (tylcv)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FYellow%20Leaf%20curl%20virus%202.JPG?alt=media&token=3c81aa7f-565e-4a64-ae04-4533ba91aa10";
        determinedAiHint = 'tomato yellow_leaf_curl';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "fusarium wilt (fusarium oxysporum)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FFusarium%20Wilt.jpeg?alt=media&token=7b64a066-3f48-49b2-8f60-15f6d9c69c45";
        determinedAiHint = 'tomato fusarium_wilt';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "verticillium wilt (verticillium dahliae)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FVerticillium%20Wilt.jpeg?alt=media&token=ce09fcd6-e8cd-4cfc-8855-d429fe1498eb";
        determinedAiHint = 'tomato verticillium_wilt';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "bacterial speck and bacterial spot (pseudomonas syringae)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FBacterial%20Spot.JPG?alt=media&token=6bcdc7c2-88bd-4610-bd65-ca47f66b19a5";
        determinedAiHint = 'tomato bacterial_spot';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet === "gray mold (botrytis cinerea)") {
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FGray%20Mold.jpeg?alt=media&token=e4594a8a-41f6-4252-af42-03281f3eb117";
        determinedAiHint = 'tomato gray_mold';
        determinedUnoptimized = true;
      } else if (isTomatoCrop && normalizedNameFromSheet.includes("spotted wilt virus")) { 
        determinedImageUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/Tomato%20Diseases%2FTomato%20Disease%20images%2FSpotted%20wilt%202.jpg?alt=media&token=906856b4-44bf-4f34-ae1a-562f8f6dca04AC";
        determinedAiHint = 'tomato spotted_wilt_virus';
        determinedUnoptimized = true;
      }
      else if (diseaseDetails.IMAGE_URL && typeof diseaseDetails.IMAGE_URL === 'string') {
        determinedImageUrl = diseaseDetails.IMAGE_URL;
        determinedUnoptimized = determinedImageUrl.startsWith('https://firebasestorage.googleapis.com') || determinedImageUrl.startsWith('https://storage.googleapis.com');
      }

      if (!determinedImageUrl) {
        determinedImageUrl = `https://placehold.co/600x400.png`;
        determinedAiHint = diseaseDetails.AI_HINT || 'plant disease'; // diseaseDetails is checked, so this is safe
        determinedUnoptimized = true;
      }
      setMainImageUrl(determinedImageUrl);
      setMainImageAiHint(determinedAiHint);
      setMainImageUnoptimized(determinedUnoptimized);
    } else {
      // If diseaseDetails is null (e.g., initial load, error), set defaults
      setMainImageUrl(`https://placehold.co/600x400.png`);
      setMainImageAiHint('plant disease');
      setMainImageUnoptimized(true);
    }
  }, [diseaseDetails, cropNameParam, diseaseNameParam]);

  // Effect 3: Determine additional images
  useEffect(() => {
    if (diseaseDetails && mainImageUrl) {
      const tempAdditionalImages = [];
      const photosUrl = diseaseDetails.PHOTOS;

      if (photosUrl && typeof photosUrl === 'string' && photosUrl !== mainImageUrl) {
        tempAdditionalImages.push({
          url: photosUrl,
          hint: diseaseDetails.AI_HINT || 'affected plant detail',
          unoptimized: photosUrl.startsWith('https://firebasestorage.googleapis.com') || photosUrl.startsWith('https://storage.googleapis.com')
        });
      } else {
        tempAdditionalImages.push({
          url: 'https://placehold.co/200x150.png',
          hint: 'affected leaf',
          unoptimized: true
        });
      }

      tempAdditionalImages.push({
        url: 'https://placehold.co/200x150.png',
        hint: 'affected plant overall',
        unoptimized: true
      });
      tempAdditionalImages.push({
        url: 'https://placehold.co/200x150.png',
        hint: 'disease progress',
        unoptimized: true
      });
      
      setAdditionalImagesData(tempAdditionalImages.slice(0,3));
    } else {
         setAdditionalImagesData([
            { url: 'https://placehold.co/200x150.png', hint: 'affected leaf', unoptimized: true },
            { url: 'https://placehold.co/200x150.png', hint: 'affected plant overall', unoptimized: true },
            { url: 'https://placehold.co/200x150.png', hint: 'disease progress', unoptimized: true },
        ].slice(0,3));
    }
  }, [diseaseDetails, mainImageUrl]);
  
  // Conditional returns (MUST BE AFTER ALL HOOKS)
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
  
  const nameForDisplay = cropNameParam === 'tomato' ? diseaseDetails["TOMATO PEST AND DISEASES"] : diseaseDetails.NAME;
  const cropDisplayNameForTitle = cropNameParam.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
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
              {nameForDisplay || "Disease Details"}
            </CardTitle>
             <CardDescription className="text-center text-xs text-muted-foreground">
              {cropDisplayNameForTitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <button
              type="button"
              onClick={() => mainImageUrl && openImageInModal(mainImageUrl)}
              className="relative w-full aspect-video bg-muted overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer block group"
              aria-label={`View image for ${nameForDisplay || 'Disease'}`}
              disabled={!mainImageUrl}
            >
                {mainImageUrl && (
                  <Image
                      src={mainImageUrl}
                      alt={nameForDisplay || 'Disease image'}
                      fill
                      style={{ objectFit: "cover" }}
                      data-ai-hint={mainImageAiHint}
                      unoptimized={mainImageUnoptimized}
                      className="transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 600px"
                  />
                )}
            </button>
            
            <div className="p-4 space-y-3">
                {cropNameParam === 'tomato' && diseaseDetails["TOMATO PEST AND DISEASES"] ? ( 
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

        {additionalImagesData.length > 0 && (
          <Card className="shadow-md rounded-xl">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-md font-semibold text-primary">
                Additional Images
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 p-3">
              {additionalImagesData.map((imgData, index) => (
                <button
                  key={`additional-img-${index}`}
                  type="button"
                  onClick={() => openImageInModal(imgData.url)}
                  className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
                  aria-label={`View additional image ${index + 1}`}
                >
                  <Image
                    src={imgData.url}
                    alt={`Additional image ${index + 1} of ${nameForDisplay || 'disease'}`}
                    fill
                    style={{ objectFit: "cover" }}
                    data-ai-hint={imgData.hint}
                    unoptimized={imgData.unoptimized} 
                    className="transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 30vw, 200px"
                  />
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {modalImageUrl && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogOverlay className="bg-black/60 backdrop-blur-sm fixed inset-0 z-[51]" />
          <DialogContent className="p-2 max-w-3xl w-auto bg-transparent border-none shadow-none flex items-center justify-center z-[52] outline-none">
            <DialogHeader className="sr-only">
                <RadixDialogTitle>Enlarged image for {nameForDisplay || 'disease'}</RadixDialogTitle>
            </DialogHeader>
            <div className="relative aspect-auto max-h-[85vh] max-w-[85vw]">
              <Image
                src={modalImageUrl}
                alt={`Enlarged image for ${nameForDisplay || 'disease'}`}
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
    

