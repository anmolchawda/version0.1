'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

// === IMPORTANT IMPORTS ===
import { useAuth } from '@/contexts/AuthContext'; // To get the authenticated user
import { useProfile } from '@/contexts/ProfileContext'; // To check if they are a new user
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function SignupForm() {
  // === CONTEXT HOOKS ===
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isNewUser } = useProfile(); // We use this to know if it's a Google new user

  const router = useRouter();
  const { toast } = useToast();

  // === COMPONENT STATE ===
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // === LOGIC ===

  // When the component loads, check if we have an authenticated user
  // from Google and pre-fill their details.
  useEffect(() => {
    if (user && isNewUser) {
      console.log("[SignupForm] Detected a new user from Google. Pre-filling details.");
      if (user.displayName) setDisplayName(user.displayName);
      if (user.email) {
        // Create a suggested username from the email
        const suggestedUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        setUsername(suggestedUsername);
      }
    }
  }, [user, isNewUser]);

  const handleFinalizeSignup = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast({ title: "Authentication Error", description: "User not found. Please try logging in again.", variant: "destructive"});
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    
    setLoading(true);
    setError('');

    const batch = writeBatch(db);
    const userDocRef = doc(db, 'users', user.uid);
    const usernameDocRef = doc(db, 'usernames', username.toLowerCase());

    try {
      // Final check for username uniqueness
      const usernameDocSnap = await getDoc(usernameDocRef);
      if (usernameDocSnap.exists()) {
        setError('This username is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      // Prepare the user profile data
      const userProfileData = {
        id: user.uid,
        username: username.toLowerCase(),
        displayName: displayName,
        photoURL: user.photoURL || '/images/default-avatar.png',
        email: user.email,
        createdAt: new Date(),
        // Add your other default fields
        profileSetupComplete: true,
        languageSelected: false,
        followersCount: 0,
        followingCount: 0,
        postCount: 0
      };
      
      // Add operations to the batch
      batch.set(userDocRef, userProfileData);
      batch.set(usernameDocRef, { userId: user.uid });

      // Commit the batch
      await batch.commit();

      toast({ title: 'Welcome!', description: 'Your profile has been created.' });
      
      // IMPORTANT: We use window.location.href to force a full app reload.
      // This ensures all contexts are reset with the new profile data.
      router.replace('/settings/language');
      window.location.href = '/settings/language';

    } catch (err: any) {
      console.error("Error during signup finalization:", err);
      toast({ title: 'Signup Failed', description: 'Could not create your profile. Please try again.', variant: 'destructive' });
      setLoading(false);
    }
  };

  // While contexts are loading, show a loader
  if (isAuthLoading) {
    return <Loader2 className="mx-auto my-12 h-10 w-10 animate-spin" />;
  }

  // If there's no user, they shouldn't be here.
  if (!user) {
     return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>Please log in to complete your profile.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild><Link href="/login">Go to Login</Link></Button>
            </CardContent>
        </Card>
     )
  }

  // === RENDER THE FORM ===
  // This is the single form for a new Google user to complete their profile.
  // We have removed the email/password/google buttons because the user is already authenticated.
  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">One Last Step...</CardTitle>
        <CardDescription>Confirm your details and choose a unique username.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFinalizeSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="e.g., anmolchawda" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} required />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {loading ? 'Saving...' : 'Complete Signup'}
          </Button>
        </form>
      </CardContent>
       <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
            By signing up, you agree to our Terms of Service.
        </p>
      </CardFooter>
    </Card>
  );
}
