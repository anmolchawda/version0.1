// src/app/(app)/settings/language/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface Language {
  code: string;
  englishName: string;
  nativeName: string;
}

const mainLanguages: Language[] = [
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hne', englishName: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी' },
  { code: 'mr', englishName: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'gu', englishName: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', englishName: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', englishName: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা' },
];

const englishLanguage: Language = { code: 'en', englishName: 'English', nativeName: 'English' };

const allSupportedLanguages = [...mainLanguages, englishLanguage];
const DEFAULT_LANG_CODE = 'en';

export default function LanguageSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANG_CODE);
  const [showReloadDialog, setShowReloadDialog] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage && allSupportedLanguages.some(lang => lang.code === storedLanguage)) {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    localStorage.setItem('selectedAppLanguage', value);
    const selectedLangInfo = allSupportedLanguages.find(l => l.code === value);
    toast({
      title: "Language Preference Saved",
      description: `App language set to ${selectedLangInfo?.englishName || value}. Reload for changes to take full effect.`,
    });
    setShowReloadDialog(true); // Show the reload dialog
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="shadow-xl rounded-xl p-4 sm:p-6">
          <CardHeader className="relative pt-2 pb-6 px-0 sm:px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="absolute left-0 top-1/2 -translate-y-1/2 sm:left-0 h-9 w-9"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <CardTitle className="text-center w-full">
              <span className="block text-3xl font-bold text-foreground">भाषा चुनें</span>
              <span className="block text-xl font-semibold text-primary mt-1">SELECT LANGUAGE</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-2">
            <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange} className="space-y-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {mainLanguages.map((lang) => (
                  <Label
                    key={lang.code}
                    htmlFor={`lang-${lang.code}`}
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer text-center transition-colors min-h-[80px]
                      ${selectedLanguage === lang.code ? 'border-primary ring-2 ring-primary bg-primary/10 shadow-md' : 'border-input hover:bg-muted/50'}`}
                  >
                    <span className="text-sm sm:text-base font-medium text-foreground">{lang.nativeName}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">({lang.englishName})</span>
                    <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} className="sr-only" />
                  </Label>
                ))}
              </div>

              <div className="flex justify-center">
                <Label
                  htmlFor={`lang-${englishLanguage.code}`}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer text-center transition-colors min-h-[80px] w-full max-w-xs sm:max-w-sm
                    ${selectedLanguage === englishLanguage.code ? 'border-primary ring-2 ring-primary bg-primary/10 shadow-md' : 'border-input hover:bg-muted/50'}`}
                >
                  <span className="text-sm sm:text-base font-medium text-foreground">{englishLanguage.nativeName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">({englishLanguage.englishName})</span>
                  <RadioGroupItem value={englishLanguage.code} id={`lang-${englishLanguage.code}`} className="sr-only" />
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reload Recommended</AlertDialogTitle>
            <AlertDialogDescription>
              For the new language settings to fully apply across the application, a page reload is recommended.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReloadDialog(false)}>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleReload}>Reload Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
