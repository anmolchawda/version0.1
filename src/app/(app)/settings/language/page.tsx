// src/app/(app)/settings/language/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useSidebarContext } from '@/hooks/useSidebarContext';
import { db, doc, setDoc, getDoc } from '@/lib/firebase';


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
  { code: 'bho', englishName: 'Bhojpuri', nativeName: 'भोजपुरी' },
];

const englishLanguage: Language = { code: 'en', englishName: 'English', nativeName: 'English' };

const allSupportedLanguages = [...mainLanguages, englishLanguage];
const DEFAULT_LANG_CODE = 'en';

export default function LanguageSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { authUserId } = useSidebarContext();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANG_CODE);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      const storedLanguage = localStorage.getItem('selectedAppLanguage');
      if (storedLanguage && allSupportedLanguages.some(lang => lang.code === storedLanguage)) {
        setSelectedLanguage(storedLanguage);
      }

      if (authUserId && db) {
        try {
          const userDocRef = doc(db, 'users', authUserId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().profileSetupComplete) {
            setIsProfileComplete(true);
          } else {
            setIsProfileComplete(false);
          }
        } catch (error) {
          console.error("Error fetching user status:", error);
          toast({ title: 'Error', description: 'Could not load user data.', variant: 'destructive' });
        }
      }
      setIsLoadingData(false);
    };

    fetchInitialData();
  }, [authUserId, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSaving || isLoadingData) return;
    
    setIsSaving(true);
    localStorage.setItem('selectedAppLanguage', selectedLanguage);
    
    if (authUserId && db) {
      try {
        const userDocRef = doc(db, 'users', authUserId);
        
        await setDoc(userDocRef, {
            languageSelected: true,
            languagePreference: selectedLanguage,
        }, { merge: true });
        
        if (isProfileComplete) {
            toast({
              title: "Language Updated",
              description: `Your language preference has been saved.`,
            });
            router.push('/feed');
        } else {
            router.push('/settings/account');
        }

      } catch (error) {
        console.error("Error updating user language preference:", error);
        toast({
            title: 'Error',
            description: 'Could not save your language selection. Please try again.',
            variant: 'destructive',
        });
        setIsSaving(false);
      }
    } else {
        toast({
          title: 'Error',
          description: 'Could not save preference. User not logged in.',
          variant: 'destructive'
        });
        setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <Card className="shadow-xl rounded-xl p-4 sm:p-6">
            <CardHeader className="relative pt-2 pb-6 px-0 sm:px-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="absolute left-0 top-1/2 -translate-y-1/2 sm:left-0 h-9 w-9"
                aria-label="Go back"
                disabled={isSaving}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <CardTitle className="text-center w-full">
                <span className="block text-3xl font-bold text-foreground">भाषा चुनें</span>
                <span className="block text-xl font-semibold text-primary mt-1">SELECT LANGUAGE</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-2 relative">
              {isSaving && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">Saving...</p>
                  </div>
              )}
              <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage} className="space-y-0" disabled={isSaving}>
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
             <CardFooter className="pt-8 px-0 sm:px-2">
                <Button type="submit" className="w-full text-lg py-3 bg-accent hover:bg-accent/90" disabled={isSaving || isLoadingData}>
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
                  Continue
                </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
  );
}
