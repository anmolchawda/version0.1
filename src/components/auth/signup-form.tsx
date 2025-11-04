'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/useLoading';
import { Loader2, UserPlus, MailCheck } from 'lucide-react';
import { auth, db, doc, getDoc, setDoc, serverTimestamp, writeBatch } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

// Import the context hooks to make the component "smart"
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9.02v3.481h4.844a4.14 4.14 0 01-1.796 2.725v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.624z" fill="#4285F4"/><path d="M9.02 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.863-2.993.863-2.31 0-4.264-1.567-4.962-3.658H1.057v2.332A8.997 8.997 0 009.02 18z" fill="#34A853"/><path d="M4.003 10.742a5.23 5.23 0 010-3.484V4.926H1.057a8.997 8.997 0 000 8.148L4.003 10.743z" fill="#FBBC05"/><path d="M9.02 3.58C10.329 3.58 11.507 4.03 12.44 4.926l2.582-2.582C13.48.891 11.434 0 9.02 0A8.997 8.997 0 001.057 4.926l2.946 2.332c.698-2.09 2.652-3.658 4.962-3.658z" fill="#EA4335"/></g></svg>
);

export function SignupForm() {
  // === CONTEXT HOOKS (CORRECTED) ===
  const { user } = useAuth(); // No longer provides `isLoading`
  const { isProfileLoading } = useProfile();
  const router = useRouter();
  const { toast } = useToast();

  // === FORM STATE ===
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // === UI AND ERROR STATE ===
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { isLoading: isGoogleLoading, startLoading: startGoogleLoading, stopLoading: stopGoogleLoading } = useLoading();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill the form for new Google users.
  useEffect(() => {
    if (user && user.email) {
      setDisplayName(user.displayName || '');
      setEmail(user.email);
      const suggestedUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      setUsername(suggestedUsername);
    }
  }, [user]);

  // Handler for Email/Password submission
  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    startLoading();
    setError('');

    try {
      const usernameDocRef = doc(db, 'usernames', username.toLowerCase());
      const usernameDocSnap = await getDoc(usernameDocRef);
      if (usernameDocSnap.exists()) {
        setError('This username is already taken.');
        stopLoading();
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const batch = writeBatch(db);
      const userDocRef = doc(db, 'users', newUser.uid);

      batch.set(userDocRef, {
        id: newUser.uid,
        username: username.trim().toLowerCase(),
        email: newUser.email,
        displayName: displayName || username,
        photoURL: '',
        createdAt: serverTimestamp(),
        profileSetupComplete: true,
        languageSelected: false,
        followersCount: 0,
        followingCount: 0,
        postCount: 0
      });
      batch.set(usernameDocRef, { userId: newUser.uid });
      await batch.commit();
      await sendEmailVerification(newUser);
      setSignupSuccess(true);
    } catch (error: any) {
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } finally {
      stopLoading();
    }
  };

  // Handler for the "Sign Up with Google" button
  const handleGoogleSignup = async () => {
    if (window.Android && typeof window.Android.requestGoogleSignup === 'function') {
        console.log("Requesting native Google SIGNUP...");
        startGoogleLoading();
        window.Android.requestGoogleSignup();
        return;
    }
    console.warn("Android native interface not found. Using web flow for SIGNUP.");
    startGoogleLoading();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
      }
    } finally {
      stopGoogleLoading();
    }
  };
  
  // Handler for when a NEW GOOGLE USER finalizes their profile
  const handleFinalizeGoogleSignup = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    startLoading();
    setError('');

    const batch = writeBatch(db);
    const userDocRef = doc(db, 'users', user.uid);
    const usernameDocRef = doc(db, 'usernames', username.toLowerCase());

    try {
        const usernameDocSnap = await getDoc(usernameDocRef);
        if (usernameDocSnap.exists()) {
            setError('This username is already taken. Please choose another.');
            stopLoading();
            return;
        }

        batch.set(userDocRef, {
            id: user.uid,
            username: username.toLowerCase().trim(),
            displayName: displayName,
            photoURL: user.photoURL || '',
            email: user.email,
            createdAt: serverTimestamp(),
            profileSetupComplete: true,
            languageSelected: false,
            followersCount: 0,
            followingCount: 0,
            postCount: 0
        });
        batch.set(usernameDocRef, { userId: user.uid });
        await batch.commit();
        
        toast({ title: "Welcome!", description: "Your profile has been created." });
        router.replace('/settings/language');
    } catch (err) {
        toast({ title: "Signup Failed", description: "Could not save your profile.", variant: "destructive"});
        stopLoading();
    }
  };
  
  // === RENDER LOGIC (CORRECTED) ===

  // The main loading check now only depends on isProfileLoading.
  if (isProfileLoading) {
    return <Loader2 className="mx-auto my-12 h-10 w-10 animate-spin" />;
  }

  // After a successful email signup, show the verification message
  if (signupSuccess) {
    return (
       <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center"><MailCheck className="mx-auto h-12 w-12 text-primary mb-4" /><CardTitle className="text-2xl font-bold text-primary">Verify Your Email</CardTitle><CardDescription>We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>.</CardDescription></CardHeader>
        <CardContent><p className="text-sm text-center text-muted-foreground">Please click the link to activate your account. You may need to check your spam folder.</p></CardContent>
        <CardFooter><Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"><Link href="/login">Proceed to Login</Link></Button></CardFooter>
      </Card>
    );
  }
  
  // If user is authenticated (e.g., via Google) but needs to complete their profile, show this form
  if (user) {
    return (
        <Card className="w-full max-w-md shadow-2xl rounded-xl">
          <CardHeader className="text-center"><CardTitle className="text-3xl font-bold text-primary">One Last Step...</CardTitle><CardDescription>Confirm your details and choose a unique username.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleFinalizeGoogleSignup} className="space-y-6">
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={user.email || ''} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label htmlFor="displayName">Display Name</Label><Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="e.g., anmolchawda" value={username} onChange={(e) => setUsername(e.target.value)} required />
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              </div>
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}><UserPlus className="mr-2 h-5 w-5"/>{isLoading ? 'Saving...' : 'Complete Signup'}</Button>
            </form>
          </CardContent>
        </Card>
    )
  }

  // Default view: Full signup form for new, unauthenticated users
  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl">
      <CardHeader className="text-center"><CardTitle className="text-3xl font-bold text-primary">Join KrishiX</CardTitle><CardDescription>Create your account to connect with farmers.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full py-3 text-base" onClick={handleGoogleSignup} disabled={isLoading || isGoogleLoading}>{isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo />}<span className="ml-2">{isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}</span></Button>
        <div className="relative my-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with email</span></div></div>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
           <div className="space-y-2"><Label htmlFor="displayName-full">Display Name</Label><Input id="displayName-full" type="text" placeholder="Anmol Chawda" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required disabled={isLoading || isGoogleLoading} /></div>
           <div className="space-y-2"><Label htmlFor="username-full">Username</Label><Input id="username-full" type="text" placeholder="anmolchawda" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading || isGoogleLoading} /></div>
           <div className="space-y-2"><Label htmlFor="email-full">Email</Label><Input id="email-full" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isGoogleLoading} /></div>
           <div className="space-y-2"><Label htmlFor="password-full">Password</Label><Input id="password-full" type="password" placeholder="•••••••• (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} /></div>
           <div className="space-y-2"><Label htmlFor="confirmPassword-full">Confirm Password</Label><Input id="confirmPassword-full" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} /></div>
           <Button type="submit" className="w-full text-lg py-3 mt-2 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || isGoogleLoading}>{isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}{isLoading ? 'Creating Account...' : 'Sign Up with Email'}</Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <p className="text-sm text-muted-foreground">Already have an account?{' '}<Button variant="link" asChild className="p-0 h-auto text-primary"><Link href="/login">Log in</Link></Button></p>
      </CardFooter>
    </Card>
  );
}
