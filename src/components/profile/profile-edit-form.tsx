
'use client';

import { useState, type FormEvent, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Camera } from 'lucide-react';
import { auth, db, storage, ref, uploadBytes, getDownloadURL } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User as FirebaseUserType } from 'firebase/auth';
import type { User as AppUserType } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';

export function ProfileEditForm() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUserType | null>(null);
  const [profileData, setProfileData] = useState<Partial<AppUserType>>({});
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [produceInput, setProduceInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not initialized. Profile form will not function.");
      setIsLoadingData(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsLoadingData(true);
        if (!db) {
          toast({ title: t('errorToastTitle'), description: "Database not available.", variant: "destructive" });
          setIsLoadingData(false);
          return;
        }
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const fetchedData = userDocSnap.data() as AppUserType;
            setProfileData(fetchedData);
            setUsername(fetchedData.username || user.email?.split('@')[0] || '');
            setName(fetchedData.name || user.displayName || '');
            setBio(fetchedData.bio || '');
            setLocation(fetchedData.location || '');
            setPhoneNumber(fetchedData.phoneNumber || '');
            setProduceInput((fetchedData.produce || []).join(', '));
            setAvatarPreviewUrl(fetchedData.avatarUrl || user.photoURL || '');
            setIsNewUser(!fetchedData.profileSetupComplete);
          } else {
            // New user, pre-fill from auth if available
            setIsNewUser(true);
            const defaultUsername = user.email?.split('@')[0] || `user_${user.uid.substring(0, 6)}`;
            setUsername(defaultUsername);
            setName(user.displayName || '');
            setAvatarPreviewUrl(user.photoURL || '');
            setProfileData({ id: user.uid, username: defaultUsername, name: user.displayName || undefined, avatarUrl: user.photoURL || undefined });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          toast({ title: t('errorToastTitle'), description: "Could not load profile data.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setFirebaseUser(null);
        setProfileData({});
        setIsLoadingData(false);
        router.push('/login'); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [toast, t, router]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: t('toastImageTooLargeTitle'), description: 'Please select an image smaller than 2MB.', variant: "destructive" });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!firebaseUser || !db) {
      toast({ title: t('toastNotAuthenticatedTitle'), description: t('toastNotAuthenticatedDescription'), variant: "destructive" });
      return;
    }
    if (!username.trim()) {
        toast({ title: 'Username Required', description: 'Please enter a username.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);

    let finalAvatarUrl = profileData.avatarUrl || firebaseUser.photoURL || '';
    if (avatarFile && storage) {
      try {
        const avatarRef = ref(storage, `avatars/${firebaseUser.uid}/${avatarFile.name}`);
        await uploadBytes(avatarRef, avatarFile);
        finalAvatarUrl = await getDownloadURL(avatarRef);
      } catch (error) {
          console.error("Error uploading avatar:", error);
          toast({ title: 'Avatar Upload Failed', description: 'Could not upload your new profile picture. Please try again.', variant: 'destructive' });
          setIsSubmitting(false);
          return;
      }
    }

    const updatedProfileData: AppUserType = {
      ...profileData, // Keep existing data like follower counts
      id: firebaseUser.uid,
      username: username.trim(),
      name: name.trim(),
      email: firebaseUser.email || '',
      bio: bio.trim(),
      location: location.trim(),
      phoneNumber: phoneNumber.trim(),
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      avatarUrl: finalAvatarUrl,
      profileSetupComplete: true, // Mark as complete
      createdAt: profileData.createdAt || serverTimestamp(), // Set timestamp only on creation
    };

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, updatedProfileData, { merge: true });
      setProfileData(updatedProfileData);

      toast({
        title: t('toastProfileUpdatedTitle'),
        description: isNewUser ? 'Welcome to KrishiX! You can now explore the app.' : t('toastProfileUpdatedDescription'),
      });
      router.push('/'); // Redirect to feed after successful setup/update
    } catch (error) {
      console.error("Error updating profile in Firestore:", error);
      toast({ title: t('toastUpdateFailedTitle'), description: error instanceof Error ? error.message : t('toastUpdateFailedDescription'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading profile...</span></div>;
  }

  const avatarInitialDisplay = (name || username || 'U').charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isNewUser && (
        <div className="p-4 bg-primary/10 border-l-4 border-primary text-primary-foreground rounded-r-lg">
          <h3 className="font-bold">Welcome to KrishiX!</h3>
          <p className="text-sm">Please complete your profile to continue.</p>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-base font-medium">{t('profilePhotoLabel')}</Label>
        <div className="flex items-center space-x-4">
          <Label htmlFor="avatarUpload" className="relative group rounded-full cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <Avatar className="h-24 w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
              <AvatarImage src={avatarPreviewUrl || `https://placehold.co/96x96.png?text=${avatarInitialDisplay}`} alt={name || username} data-ai-hint="person farmer" />
              <AvatarFallback className="text-3xl">{avatarInitialDisplay}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </Label>
          <div className="flex flex-col">
            <Input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatarUpload')?.click()}>
              {t('changePhotoButton')}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">{t('imageUploadHelperText')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-base font-medium">{t('usernameLabel')} <span className="text-destructive">*</span></Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('usernamePlaceholder')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium">{t('fullNameLabel')}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('fullNamePlaceholder')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-base font-medium">{t('bioLabel')}</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('bioPlaceholder')} rows={3} className="resize-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium">{t('locationLabel')}</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('locationPlaceholder')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-base font-medium">{t('phoneNumberLabel')}</Label>
          <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={t('phoneNumberPlaceholderOptional')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="produce" className="text-base font-medium">{t('produceLabel')}</Label>
        <Input id="produce" value={produceInput} onChange={(e) => setProduceInput(e.target.value)} placeholder={t('producePlaceholder')} />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 text-base" disabled={isSubmitting || isLoadingData}>
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {isSubmitting ? t('savingChangesButton') : t('saveChangesButton')}
        </Button>
      </div>
    </form>
  );
}
