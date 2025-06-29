
// src/components/profile/setup-profile-form.tsx
'use client';

import { useState, type FormEvent, useEffect, type ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Camera, UserCheck } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUserType } from 'firebase/auth';
import type { User as AppUserType } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';

export function SetupProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUserType | null>(null);
  
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [produceInput, setProduceInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(undefined);
  
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { t } = useTranslations();


  useEffect(() => {
    const unsubscribe = auth!.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        // Pre-fill with any existing auth data
        setUsername(user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`);
        setName(user.displayName || '');
        setAvatarPreviewUrl(user.photoURL || undefined);
        
        if (!db) {
          console.error("[SetupProfileForm] DB instance is null. Cannot check existing profile.");
          setIsLoadingAuth(false);
          return;
        }
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        // This check prevents existing users from seeing the setup page
        if (userDocSnap.exists() && userDocSnap.data()?.profileSetupComplete) {
          router.replace('/'); 
        }
      } else {
        router.replace('/login'); 
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = "Username is required.";
    else if (username.trim().length < 3) errors.username = "Username must be at least 3 characters.";
    if (!bio.trim()) errors.bio = "Bio is required.";
    if (!location.trim()) errors.location = "Location is required.";
    if (!avatarPreviewUrl && !avatarFile) errors.avatar = "Profile photo is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Image Too Large", description: "Please select an image smaller than 2MB.", variant: "destructive" });
        setFormErrors(prev => ({ ...prev, avatar: "Image too large (max 2MB)."}));
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (formErrors.avatar) setFormErrors(prev => ({ ...prev, avatar: ''})); 
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !firebaseUser) {
      if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "User not found. Please try logging in again.", variant: "destructive"});
      } else {
        toast({ title: "Validation Error", description: "Please fill all mandatory fields correctly.", variant: "destructive"});
      }
      return;
    }
    setIsSubmitting(true);

    let finalAvatarUrl = avatarPreviewUrl || firebaseUser.photoURL || '';

    if (avatarFile) {
      console.log("New avatar selected, would upload:", avatarFile.name);
      // In a real app, upload avatarFile to Firebase Storage and get finalAvatarUrl
      // For now, we'll use the data URI from avatarPreviewUrl
      finalAvatarUrl = avatarPreviewUrl || ''; 
    }

    const profileDataToSave: AppUserType = {
      id: firebaseUser.uid,
      username: username.trim(),
      name: name.trim() || username.trim(),
      email: firebaseUser.email ?? '',
      bio: bio.trim(),
      location: location.trim(),
      phoneNumber: phoneNumber.trim(),
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      avatarUrl: finalAvatarUrl,
      profileSetupComplete: true, // This is the crucial flag
      createdAt: serverTimestamp(),
      followersCount: 0,
      followingCount: 0,
      postCount: 0,
    };

    if (!db) {
        console.error("[SetupProfileForm] DB instance is null. Cannot save profile.");
        toast({ title: "Configuration Error", description: "Could not save profile. Database not available.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, profileDataToSave, { merge: true }); 
      
      toast({
        title: 'Profile Setup Complete!',
        description: 'Welcome to KrishiX! Redirecting to your feed...',
      });
      router.push('/');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Setup Failed", description: "Could not save profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth || !firebaseUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  const avatarInitialDisplay = (name || username || 'U').charAt(0).toUpperCase();

  return (
    <Card className="w-full max-w-lg shadow-2xl rounded-xl">
      <CardHeader className="text-center">
        <UserCheck className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Setup Your Profile</CardTitle>
        <CardDescription>Complete your profile to join the KrishiX community. Fields marked with <span className="text-destructive">*</span> are required.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 p-4 sm:p-6">
          
          <div className="space-y-2">
            <Label className="text-base font-medium">Profile Photo <span className="text-destructive">*</span></Label>
            <div className="flex items-center space-x-4">
              <Label 
                htmlFor="avatarUpload" 
                className="relative group rounded-full cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              >
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={avatarPreviewUrl || `https://placehold.co/96x96.png?text=${avatarInitialDisplay}`} alt={name || username} data-ai-hint="person farmer initial"/>
                  <AvatarFallback className="text-3xl sm:text-4xl">{avatarInitialDisplay}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </Label>
              <div className="flex flex-col">
                <Input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} ref={fileInputRef} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choose Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 2MB.</p>
              </div>
            </div>
            {formErrors.avatar && <p className="text-xs text-destructive mt-1">{formErrors.avatar}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username <span className="text-destructive">*</span></Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your unique username" />
              {formErrors.username && <p className="text-xs text-destructive mt-1">{formErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name (optional)" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base font-medium">Bio <span className="text-destructive">*</span></Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself and your farm" rows={3} className="resize-none" />
            {formErrors.bio && <p className="text-xs text-destructive mt-1">{formErrors.bio}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium">Location (City, State) <span className="text-destructive">*</span></Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Raipur, Chhattisgarh" />
                {formErrors.location && <p className="text-xs text-destructive mt-1">{formErrors.location}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base font-medium">{t('phoneNumberLabel')}</Label>
                <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={t('phoneNumberPlaceholderOptional')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="produce" className="text-base font-medium">Main Produce (comma-separated)</Label>
            <Input id="produce" value={produceInput} onChange={(e) => setProduceInput(e.target.value)} placeholder="e.g., Tomatoes, Corn, Apples (optional)" />
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6">
          <Button type="submit" className="w-full text-base sm:text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting || isLoadingAuth}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Continue'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
