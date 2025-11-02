'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { auth, db, doc, setDoc, serverTimestamp } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, getAdditionalUserInfo, sendEmailVerification, type User as FirebaseUser } from 'firebase/auth';

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
  const [isFinalizing, setIsFinalizing] = useState(false); // New state to show a "waiting" message
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('onAuthSuccess signal received from Android. Waiting for AuthProvider...');
      setIsGoogleLoading(false); // Stop the original Google spinner
      setIsFinalizing(true);     // Show a new "Finalizing..." message
      // We do nothing else. We just wait.
      // The onAuthStateChanged listener in AuthProvider is the source of truth
      // and will eventually fire, see the logged-in user, and redirect to /feed.
    };

    (window as any).onAuthSuccess = handleAuthSuccess;
    return () => {
      delete (window as any).onAuthSuccess;
    };
  }, []);

  const handleGoogleLogin = () => {
    const androidInterface = (window as any).Android;
    if (androidInterface && typeof androidInterface.requestGoogleSignIn === 'function') {
      console.log("Requesting native Google Sign-In...");
      setIsGoogleLoading(true);
      androidInterface.requestGoogleSignIn();
      return;
    }
    // Web fallback can go here...
    console.warn("Android native interface not found. Using web flow.");
  };

  // The rest of your functions (handleSubmit, etc.) are fine and don't need changes.
  // ...

  if (isFinalizing) {
    return (
      <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Login Successful</CardTitle>
          <CardDescription>Finalizing your session...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

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
        {/* ... Rest of your JSX ... */}
      </CardContent>
      {/* ... CardFooter ... */}
    </Card>
  );
}

