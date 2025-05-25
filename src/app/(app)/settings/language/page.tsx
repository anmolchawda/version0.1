
// src/app/(app)/settings/language/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Globe, CheckCircle } from "lucide-react";

interface Language {
  code: string;
  englishName: string;
  nativeName: string;
}

const supportedLanguages: Language[] = [
  { code: 'en', englishName: 'English', nativeName: 'English' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', englishName: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', englishName: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', englishName: 'Malayalam', nativeName: 'മലയാളം' },
];

const DEFAULT_LANG_CODE = 'en';

export default function LanguageSettingsPage() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANG_CODE);
  const [initialLanguage, setInitialLanguage] = useState<string>(DEFAULT_LANG_CODE);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedAppLanguage');
    if (storedLanguage && supportedLanguages.some(lang => lang.code === storedLanguage)) {
      setSelectedLanguage(storedLanguage);
      setInitialLanguage(storedLanguage);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSaveChanges = () => {
    localStorage.setItem('selectedAppLanguage', selectedLanguage);
    setInitialLanguage(selectedLanguage); // Update the initial state to reflect save
    toast({
      title: "Language Preference Saved",
      description: `App language set to ${supportedLanguages.find(l => l.code === selectedLanguage)?.englishName}. Full app translation is a feature for future development.`,
    });
    // In a real app, you might trigger a context update or a page reload if necessary
    // For now, we'll just save and show a toast.
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <Globe className="mr-3 h-7 w-7" />
            Select Display Language
          </CardTitle>
          <CardDescription>
            Choose the language for your FARMDOCC experience. Full app translation will be rolled out progressively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange}>
            {supportedLanguages.map((lang) => (
              <Label
                key={lang.code}
                htmlFor={`lang-${lang.code}`}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                  ${selectedLanguage === lang.code ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'border-border'}`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{lang.englishName}</span>
                  <span className="text-sm text-muted-foreground">{lang.nativeName}</span>
                </div>
                <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} className="h-5 w-5" />
              </Label>
            ))}
          </RadioGroup>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveChanges} 
              disabled={selectedLanguage === initialLanguage}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
