'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, MailCheck } from 'lucide-react';

// Import all necessary Firebase functions
import { auth, db, doc, getDoc, writeBatch, serverTimestamp } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9.02v3.481h4.844a4.14 4.14 0 01-1.796 2.725v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.624z" fill="#4285F4"/>
      <path d="M9.02 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.863-2.993.863-2.31 0-4.264-1.567-4.962-3.658H1.057v2.332A8.997 8.997 0 009.02 18z" fill="#34A853"/>
      <path d="M4.003 10.742a5.23 5.23 0 010-3.484V4.926H1.057a8.997 8.997 0 000 8.148L4.003 10.743z" fill="#FBBC05"/>
      <path d="M9.02 3.58C10.329 3.58 11.507 4.03 12.44 4.926l2.582-2.582C13.48.891 11.434 0 9.02 0A8.997 8.997 0 001.057 4.926l2.946 2.332c.698-2.09 2.652-3.658 4.962-3.658z" fill="#EA4335"/>
    </g>
  </svg>
);

export function SignupForm() {
  // Form State
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState('');

  // Hooks
  const { toast } = useToast();
  const router = useRouter();

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(''); // Clear previous errors on a new submission

    if (password !== confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    
    if (!auth || !db) {
        toast({ title: "Signup Disabled", description: "Firebase not configured.", variant: "destructive"});
        return;
    }

    setIsLoading(true);

    try {
      // 1. Check if the desired username is already taken
      const finalUsername = username.trim().toLowerCase();
      const usernameDocRef = doc(db, 'usernames', finalUsername);
      const usernameDocSnap = await getDoc(usernameDocRef);

      if (usernameDocSnap.exists()) {
        setError('This username is already taken. Please choose another.');
        setIsLoading(false);
        return;
      }
      
      // 2. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // 3. Use a batch write to save user data to Firestore atomically
      const batch = writeBatch(db);
      const userDocRef = doc(db, 'users', newUser.uid);

      batch.set(userDocRef, {
        id: newUser.uid,
        username: finalUsername,
        email: newUser.email,
        displayName: displayName.trim() || finalUsername, // Fallback to username if display name is empty
        photoURL: '', // New email users start with no photo
        createdAt: serverTimestamp(),
        profileSetupComplete: true, // Mark profile as complete
        languageSelected: false,
        followersCount: 0,
        followingCount: 0,
        postCount: 0
      });
      
      // Also create the public username record
      batch.set(usernameDocRef, { userId: newUser.uid });
      
      await batch.commit();

      // 4. Send the verification email
      await sendEmailVerification(newUser);
      
      // 5. Show the success screen
      setSignupSuccess(true);

    } catch (error: any) {
      console.error('Email Signup Error:', error.code, error.message);
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // A. Check for the native Android interface for Google Sign-In
    if (window.Android && typeof window.Android.requestGoogleSignup === 'function') {
        console.log("Requesting native Google SIGNUP...");
        setIsGoogleLoading(true);
        window.Android.requestGoogleSignup();
        // The native layer is now responsible for the sign-in flow.
        return;
    }
    
    // B. Fallback to the web-based popup flow
    console.warn("Android native interface not found. Using web flow for SIGNUP.");
    setIsGoogleLoading(true);
    
    if (!auth) {
        toast({ title: "Signup Disabled", description: "Firebase not configured.", variant: "destructive"});
        setIsGoogleLoading(false);
        return;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // IMPORTANT: After a successful Google Sign-In, you should have logic
      // in your AuthContext or a global listener that checks if the user is new.
      // If they are new, it should redirect them to a "finalize-profile" page.
      // For now, we redirect to the home page as a default.
      router.push('/');
    } catch (error: any) {
      console.error('Google Sign-up Error:', error.code, error.message);
      // Don't show an error toast if the user simply closes the popup
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: 'Google Signup Failed', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // RENDER LOGIC
  
  // 1. If email signup was successful, show the "Verify Your Email" message.
  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold text-primary">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            Please click the link to activate your account. You may need to check your spam folder.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/login">Proceed to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 2. Otherwise, show the main signup form.
  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Join KrishiX</CardTitle>
        <CardDescription>Create your account to connect with farmers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Signup Button */}
        <Button variant="outline" className="w-full py-3 text-base" onClick={handleGoogleSignup} disabled={isLoading || isGoogleLoading}>
          {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo />}
          <span className="ml-2">{isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}</span>
        </Button>

        {/* Separator */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
          </div>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" type="text" placeholder="Anmol Chawda" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required disabled={isLoading || isGoogleLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="anmolchawda" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading || isGoogleLoading} />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isGoogleLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="•••••••• (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} />
          </div>
          <Button type="submit" className="w-full text-lg py-3 mt-2 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || isGoogleLoading}>
             {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
            {isLoading ? 'Creating Account...' : 'Sign Up with Email'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link href="/login">Log in</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
