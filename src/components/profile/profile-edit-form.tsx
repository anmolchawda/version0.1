
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

export function ProfileEditForm() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUserType | null>(null);
  const [profileData, setProfileData] = useState<Partial<AppUserType>>({}); // Use partial for initial state

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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsLoadingData(true);
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
            // User document doesn't exist in Firestore, use auth data as fallback
            const defaultUsername = user.email?.split('@')[0] || `user_${user.uid.substring(0,6)}`;
            setUsername(defaultUsername);
            setName(user.displayName || defaultUsername);
            setBio(''); // No bio from auth
            setLocation(''); // No location from auth
            setProduceInput(''); // No produce from auth
            setAvatarPreviewUrl(user.photoURL || '');
            setProfileData({ // Set a minimal profileData
              id: user.uid,
              username: defaultUsername,
              name: user.displayName || defaultUsername,
              avatarUrl: user.photoURL || '',
            });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
          // Fallback to auth data if Firestore fetch fails
          const defaultUsernameOnError = user.email?.split('@')[0] || `user_err_${user.uid.substring(0,6)}`;
          setUsername(defaultUsernameOnError);
          setName(user.displayName || defaultUsernameOnError);
          setAvatarPreviewUrl(user.photoURL || '');
           setProfileData({
              id: user.uid,
              username: defaultUsernameOnError,
              name: user.displayName || defaultUsernameOnError,
              avatarUrl: user.photoURL || '',
            });
        } finally {
          setIsLoadingData(false);
        }
      } else {
        // No user logged in, or logged out
        setFirebaseUser(null);
        setProfileData({});
        setIsLoadingData(false);
        // Optionally redirect to login or show a message
        // router.push('/login');
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
      setAvatarFile(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string); // This will be a data URI
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

    // TODO: In a real app, if avatarFile is set, upload it to Firebase Storage
    // and get the downloadURL to save in Firestore.
    // For this iteration, we'll save the avatarPreviewUrl (which might be a data URI if changed locally,
    // or the existing URL if not). A real implementation needs storage upload.
    let finalAvatarUrl = profileData.avatarUrl; // Start with existing or auth URL
    if (avatarFile && avatarPreviewUrl?.startsWith('data:')) { 
        // This indicates a new local file was selected.
        // Ideally, upload avatarFile to Firebase Storage here and get its URL.
        // For now, we'll just use the data URI for preview, but this isn't scalable for DB.
        // For this exercise, if a new file is picked, we'll simulate by just acknowledging it.
        // In a real scenario, you'd replace `avatarPreviewUrl` with the actual storage URL.
        // For now, let's assume `avatarPreviewUrl` could be the (simulated) new URL.
        finalAvatarUrl = avatarPreviewUrl; 
        console.log("Avatar changed, would upload new file:", avatarFile.name);
        // For a real app: finalAvatarUrl = await uploadImageToStorage(avatarFile);
    } else if (avatarPreviewUrl && !avatarPreviewUrl.startsWith('data:')) {
        // Existing URL from Firestore or Auth, no new file selected.
        finalAvatarUrl = avatarPreviewUrl;
    }


    const updatedProfileData: AppUserType = {
      id: firebaseUser.uid,
      username: username.trim() || firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.substring(0,6)}`,
      name: name.trim() || firebaseUser.displayName || '',
      bio: bio.trim(),
      location: location.trim(),
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      // If avatarFile exists, it means a new image was selected.
      // Ideally, upload avatarFile to Firebase Storage and get the URL.
      // For now, if avatarFile is present, use avatarPreviewUrl (which is a data URI).
      // If no new file, use existing profileData.avatarUrl or firebaseUser.photoURL.
      avatarUrl: finalAvatarUrl,
      // Counts should be managed by backend logic (e.g. Cloud Functions) or separate updates
      followersCount: profileData.followersCount || 0,
      followingCount: profileData.followingCount || 0,
      postCount: profileData.postCount || 0,
    };

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, updatedProfileData, { merge: true }); // Use merge to avoid overwriting counts if not managed here
      
      setProfileData(updatedProfileData); // Update local state to reflect saved data

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
                        {/* Use avatarPreviewUrl for the src */}
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
                    <p className="text-xs text-muted-foreground mt-1">
                        Click photo to change.
                        <br />
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
    
