
// src/app/(app)/ai-features/page.tsx
'use client';

import { useState, type ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Brain, UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle, Leaf, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { analyzeCropImage, type AnalyzeCropImageOutput } from '@/ai/flows/analyze-crop-image-flow';
import { useTranslations } from '@/hooks/useTranslations';
import type { TranslationKey } from '@/hooks/useTranslations';

// Simple SVG for a weed icon (example)
const WeedIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 22s2-4 4-4 2 4 4 4 2-4 4-4 2 4 4 4"/><path d="M20 14V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1m0 0v4m-4-3v6M4 18V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);


export default function AiFeaturesPage() {
  const { t } = useTranslations();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCropImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limit file size (e.g., 4MB)
        toast({
          title: t('toastImageTooLargeTitle'),
          description: t('toastImageTooLargeDescription'),
          variant: "destructive",
        });
        removeImage();
        return;
      }
      setImageFile(file);
      setAnalysisResult(null); // Reset previous results
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreviewUrl(dataUri);
        setImageDataUri(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageDataUri(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageDataUri) {
      toast({
        title: t('toastNoImageSelectedTitle'),
        description: t('toastNoImageSelectedDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeCropImage({ imageDataUri });
      setAnalysisResult(result);
    } catch (e) {
      console.error("Error analyzing crop image:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred during analysis.");
      toast({
        title: t('toastAnalysisFailedTitle'),
        description: t('toastAnalysisFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const AnalysisDetailCard = ({ titleKey, data, icon }: { titleKey: TranslationKey, data: { detected: boolean, name?: string, description?: string, confidence?: string }, icon: React.ReactNode }) => {
    if (!data) return null;
    const translatedTitle = t(titleKey);
    return (
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            {icon}
            <span className="ml-2">{translatedTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.detected ? (
            <>
              <p className="font-semibold text-destructive">{data.name || "Issue Detected"}</p>
              {data.description && <p className="text-sm text-muted-foreground mt-1">{data.description}</p>}
              {data.confidence && <p className="text-xs text-muted-foreground mt-1">Confidence: {data.confidence}</p>}
            </>
          ) : (
            <p className="text-sm text-primary">{t('aiAnalysisDetailNoIssueDetected', { issue: translatedTitle.toLowerCase() })}</p>
          )}
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Brain className="mr-3 h-8 w-8 text-primary" />
            {t('aiCropHealthAnalyzerTitle')}
          </CardTitle>
          <CardDescription>
            {t('aiCropHealthAnalyzerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="cropImage" className="text-base font-medium">{t('aiUploadCropImageLabel')}</Label>
            <div className={`
              mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed 
              rounded-md group hover:border-primary transition-colors
              ${imagePreviewUrl ? 'border-primary bg-muted/20' : 'border-input'}
            `}>
              <div className="space-y-1 text-center">
                {imagePreviewUrl ? (
                  <div className="relative mx-auto mb-2 h-48 w-auto max-w-xs group">
                    <Image
                      src={imagePreviewUrl}
                      alt="Crop preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full h-7 w-7 z-10"
                      onClick={removeImage}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                 <div className="flex text-sm text-muted-foreground group-hover:text-primary transition-colors justify-center items-center">
                  <Label
                    htmlFor="cropImage"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 py-1 px-2"
                  >
                    <span>{imagePreviewUrl ? t('aiChangeImageButton') : t('aiUploadAnImageButton')}</span>
                    <Input
                      id="cropImage"
                      name="cropImage"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      disabled={isLoading}
                    />
                  </Label>
                </div>
                {!imagePreviewUrl && <p className="text-xs text-muted-foreground">{t('aiImageFormatsAcceptedWithLimit')}</p>}
              </div>
            </div>
          </div>

          {imageFile && (
            <Button onClick={handleAnalyzeClick} disabled={isLoading || !imageFile} className="w-full text-lg py-3 bg-accent hover:bg-accent/90">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {isLoading ? t('aiAnalyzingButton') : t('aiAnalyzeImageButton')}
            </Button>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">{t('aiAnalyzingImageText')}</p>
              <p className="text-sm">{t('aiAnalyzingWaitText')}</p>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('aiAnalysisErrorAlertTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analysisResult && !isLoading && !error && (
            <Card className="mt-6 bg-background shadow-inner">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{t('aiAnalysisResultsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!analysisResult.isPlant ? (
                  <Alert>
                    <Leaf className="h-4 w-4" />
                    <AlertTitle>{t('aiObjectIdentificationTitle')}</AlertTitle>
                    <AlertDescription>{t('aiObjectNotIdentifiedDescription')}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert variant="default" className="border-primary/30 bg-primary/5">
                       <CheckCircle className="h-4 w-4 text-primary" />
                      <AlertTitle className="text-primary">{t('aiPlantIdentifiedTitle')}</AlertTitle>
                      <AlertDescription>
                        {analysisResult.plantTypeGuess || t('aiPlantIdentifiedDefaultDescription')}
                      </AlertDescription>
                    </Alert>
                    
                    <AnalysisDetailCard titleKey="aiAnalysisDetailDiseaseTitle" data={analysisResult.diseaseAnalysis} icon={<Leaf className="text-red-500" />} />
                    <AnalysisDetailCard titleKey="aiAnalysisDetailNutrientTitle" data={analysisResult.nutrientDeficiencyAnalysis} icon={<Leaf className="text-yellow-500" />} />
                    <AnalysisDetailCard titleKey="aiAnalysisDetailInsectTitle" data={analysisResult.insectAnalysis} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bug text-orange-500"><path d="M12 20h-4a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"/><path d="M12 20v-4"/><path d="M12 20h4"/><path d="m19 16-3-4"/><path d="m5 16 3-4"/><path d="M16 4h-2"/><path d="M8 4H6"/><path d="M12 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2Z"/><path d="M16 10h0"/><path d="M8 10h0"/></svg>} />
                    <AnalysisDetailCard titleKey="aiAnalysisDetailWeedTitle" data={analysisResult.weedAnalysis} icon={<WeedIcon className="text-lime-600 h-5 w-5" />} />


                    <Card className="bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{t('aiOverallAssessmentTitle')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{analysisResult.overallAssessment}</p>
                      </CardContent>
                    </Card>

                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                       <Card className="bg-accent/10 border-accent">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-accent-foreground">{t('aiSuggestionsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {analysisResult.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
