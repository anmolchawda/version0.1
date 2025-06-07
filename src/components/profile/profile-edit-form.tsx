
'use client';

import { useState, type FormEvent, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Camera } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; // Firebase auth and db
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore functions
import type { User as FirebaseUserType } from 'firebase/auth'; // Firebase Auth User type
import type { User as AppUserType } from '@/types'; // Your app's User type
import { MOCK_USER_ID, getPlaceholderUser } from '@/lib/placeholders'; // Import MOCK_USER_ID and getPlaceholderUser

export function ProfileEditForm() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUserType | null>(null);
  const [profileData, setProfileData] = useState<Partial<AppUserType>>({}); 

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [produceInput, setProduceInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>('');
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If in mock mode (auth is null from firebase.ts)
    if (!auth) {
      console.log("[ProfileEditForm] MOCK_DATA mode: Simulating auth and loading mock profile.");
      const mockProfile = getPlaceholderUser(MOCK_USER_ID);
      if (mockProfile) {
        // Simulate a FirebaseUser object structure
        const mockFbUser: FirebaseUserType = {
          uid: mockProfile.id,
          email: mockProfile.email || `${mockProfile.username}@example.com`,
          displayName: mockProfile.name || mockProfile.username,
          photoURL: mockProfile.avatarUrl || null,
          emailVerified: true, isAnonymous: false, metadata: {}, providerData: [], providerId: 'mock',
          refreshToken: '', tenantId: null, delete: async () => {}, getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any), reload: async () => {}, toJSON: () => ({}),
        };
        setFirebaseUser(mockFbUser);
        setProfileData(mockProfile); // This will be the full AppUserType structure from placeholders
        setUsername(mockProfile.username || '');
        setName(mockProfile.name || '');
        setBio(mockProfile.bio || '');
        setLocation(mockProfile.location || '');
        setProduceInput((mockProfile.produce || []).join(', '));
        setAvatarPreviewUrl(mockProfile.avatarUrl || '');
      } else {
        toast({ title: "Error", description: "Mock user data not found.", variant: "destructive" });
      }
      setIsLoadingData(false);
      return () => {}; // No Firebase listener to unsubscribe from in mock mode
    }

    // Real Firebase Auth logic (auth is not null)
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsLoadingData(true);
        if (!db) { // Should not happen if auth is not null, but a safeguard
             console.error("[ProfileEditForm] Auth is available, but DB is null. Cannot fetch Firestore profile.");
             setIsLoadingData(false);
             toast({ title: "Configuration Error", description: "Cannot load profile.", variant: "destructive" });
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
            setProduceInput((fetchedData.produce || []).join(', '));
            setAvatarPreviewUrl(fetchedData.avatarUrl || user.photoURL || '');
          } else {
            const defaultUsername = user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`;
            setUsername(defaultUsername);
setName(user.displayName || defaultUsername);
            setAvatarPreviewUrl(user.photoURL || '');
            setProfileData({ id: user.uid, username: defaultUsername, name: user.displayName || defaultUsername, avatarUrl: user.photoURL || undefined });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
          const defaultUsernameOnError = user.email?.split('@')[0] || `user_err_${user.uid.substring(0,6)}`;
          setUsername(defaultUsernameOnError);
          setName(user.displayName || defaultUsernameOnError);
          setAvatarPreviewUrl(user.photoURL || '');
          setProfileData({ id: user.uid, username: defaultUsernameOnError, name: user.displayName || defaultUsernameOnError, avatarUrl: user.photoURL || undefined });
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setFirebaseUser(null);
        setProfileData({});
        setIsLoadingData(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!firebaseUser) {
      toast({ title: "Not Authenticated", description: "Please log in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    let finalAvatarUrl = avatarPreviewUrl || firebaseUser.photoURL || '';
    if (avatarFile) {
      console.log("Avatar changed, would upload new file:", avatarFile.name);
      // For a real app: finalAvatarUrl = await uploadImageToStorage(avatarFile);
      // For mock or if data URI is acceptable for your Firestore structure temporarily:
      finalAvatarUrl = avatarPreviewUrl || ''; 
    }

    const updatedProfileData: AppUserType = {
      id: firebaseUser.uid,
      username: username.trim() || firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.substring(0,6)}`,
      name: name.trim() || firebaseUser.displayName || '',
      email: firebaseUser.email || '', // Persist email
      bio: bio.trim(),
      location: location.trim(),
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      avatarUrl: finalAvatarUrl,
      followersCount: profileData.followersCount || 0,
      followingCount: profileData.followingCount || 0,
      postCount: profileData.postCount || 0,
      profileSetupComplete: profileData.profileSetupComplete || true, // Assume setup if editing
    };

    // If in mock mode (db is null from firebase.ts)
    if (!db) {
      console.log("[ProfileEditForm] MOCK_DATA mode: Simulating profile update.");
      setProfileData(updatedProfileData); // Update local state
      toast({
        title: 'Profile Updated (Mock)',
        description: 'Your profile information has been "saved".',
      });
      setIsSubmitting(false);
      return;
    }
    
    // Real Firebase logic (db is not null)
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, updatedProfileData, { merge: true }); 
      setProfileData(updatedProfileData); 

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      console.error("Error updating profile in Firestore:", error);
      toast({ title: "Update Failed", description: "Could not save profile changes.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading profile...</span></div>;
  }

  if (!firebaseUser && !isLoadingData) {
     return <div className="text-center py-10"><p className="text-muted-foreground">Please log in to edit your profile.</p></div>;
  }
  
  const avatarInitialDisplay = (name || username || 'U').charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
            <Label className="text-base font-medium">Profile Photo</Label>
            <div className="flex items-center space-x-4">
                <Label 
                  htmlFor="avatarUpload" 
                  className="relative group rounded-full cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                >
                    <Avatar className="h-24 w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
                        <AvatarImage src={avatarPreviewUrl || `https://placehold.co/96x96.png?text=${avatarInitialDisplay}`} alt={name || username} data-ai-hint="person farmer" />
                        <AvatarFallback className="text-3xl">{avatarInitialDisplay}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                </Label>
                <div className="flex flex-col">
                    <Input
                        id="avatarUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                     <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatarUpload')?.click()}>
                        Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 2MB.
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-medium">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your unique username" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"/>
        </div>
        </div>

        <div className="space-y-2">
        <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself and your farm" rows={3} className="resize-none" />
        </div>

        <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium">Location (City, State)</Label>
            <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Raipur, Chhattisgarh"
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="produce" className="text-base font-medium">Main Produce (comma-separated)</Label>
            <Input id="produce" value={produceInput} onChange={(e) => setProduceInput(e.target.value)} placeholder="e.g., Tomatoes, Corn, Apples" />
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 text-base" disabled={isSubmitting || isLoadingData}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
        </div>
    </form>
  );
}
    
