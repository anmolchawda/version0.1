'use client';

import { useState, type FormEvent, useEffect, useCallback } from 'react'; // Import useCallback
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { auth, db, doc, setDoc, serverTimestamp } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, getAdditionalUserInfo, sendEmailVerification, signOut, type User as FirebaseUser } from 'firebase/auth';

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

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // ====================================================================
  // ▼▼▼ ANDROID LISTENER (RE-CORRECTED) ▼▼▼
  // ====================================================================
  useEffect(() => {
    const handleNativeSignInResult = (isSuccess: boolean, dataString?: string) => {
      console.log('Signal received from Android app!');
      // Use a callback with setIsGoogleLoading to ensure it gets the latest state setter
      setIsGoogleLoading(false);

      if (isSuccess && dataString) {
        try {
          const userData = JSON.parse(dataString);
          console.log('Login successful via Android. User data:', userData);
          
          // Force a page reload to make AuthProvider detect the new user state.
          window.location.reload();

        } catch (error) {
          console.error('Error processing data from Android:', error);
          toast({ title: 'Login Error', description: 'Could not process login data from the app.', variant: 'destructive' });
        }
      } else {
        console.error('Android app reported a login failure.');
        toast({ title: 'Login Failed', description: 'The sign-in process was cancelled or failed.', variant: 'destructive' });
      }
    };

    // This attaches the listener function to the window, so the Android app can call it.
    (window as any).onNativeGoogleSignInResult = handleNativeSignInResult;
    console.log('Android login listener has been set up.');

    // Cleanup function to remove the listener when you leave the login page.
    return () => {
      delete (window as any).onNativeGoogleSignInResult;
      console.log('Android login listener has been removed.');
    };
  }, [toast]); // Only depends on toast, which is stable.
  // ====================================================================
  // ▲▲▲ END OF THE LISTENER CODE BLOCK ▲▲▲
  // ====================================================================

  const handleResendVerification = async (user: FirebaseUser) => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      toast({
        title: "Verification Email Sent",
        description: `A new verification link has been sent to ${user.email}.`,
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error Sending Email",
        description: "Could not send verification email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (!auth) {
      toast({ title: "Login Disabled", description: "Firebase is not configured correctly.", variant: "destructive"});
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // The AuthProvider will handle the redirect automatically.
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
        } else {
            console.error('Login error:', error.code, error.message);
            toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Check if the code is running inside our Android app.
    const androidInterface = (window as any).Android;
    if (androidInterface && typeof androidInterface.requestGoogleSignIn === 'function') {
        console.log("Requesting native Google Sign-In...");
        setIsGoogleLoading(true);
        // Tell the Android app to start its native login flow.
        androidInterface.requestGoogleSignIn();
        return; // Stop and wait for the listener to get the result.
    }

    // If not in the Android app, use the normal web browser login flow.
    console.warn("Android native interface not found. Using web flow.");
    setIsGoogleLoading(true);
    if (!auth || !db) {
      toast({ title: "Login Disabled", description: "Firebase is not configured correctly.", variant: "destructive"});
      setIsGoogleLoading(false);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(userCredential);

      if (additionalInfo?.isNewUser) {
        const user = userCredential.user;
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            username: user.email?.split('@')[0] || `user_${user.uid.substring(0, 6)}`,
            name: user.displayName || '',
            avatarUrl: user.photoURL || '',
            createdAt: serverTimestamp(),
            languageSelected: false,
            profileSetupComplete: false,
            followersCount: 0,
            followingCount: 0,
            postCount: 0
        });
      }
      // The AuthProvider will handle the redirect.
    } catch (error: any) {
      console.error('Google Sign-in error:', error.code, error.message);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
        <CardDescription>Log in to continue to KrishiX.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          variant="outline" 
          className="w-full py-3 text-base" 
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleLogo />}
          <span className="ml-2">{isGoogleLoading ? 'Signing in...' : 'Log in with Google'}</span>
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isGoogleLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} />
          </div>
          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-0">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link href="/signup">Sign up</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

