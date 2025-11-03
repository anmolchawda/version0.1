// src/components/auth/login-form.tsx

'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';



const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9.02v3.481h4.844a4.14 4.14 0 01-1.796 2.725v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.624z" fill="#4285F4"/><path d="M9.02 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.863-2.993.863-2.31 0-4.264-1.567-4.962-3.658H1.057v2.332A8.997 8.997 0 009.02 18z" fill="#34A853"/><path d="M4.003 10.742a5.23 5.23 0 010-3.484V4.926H1.057a8.997 8.997 0 000 8.148L4.003 10.743z" fill="#FBBC05"/><path d="M9.02 3.58C10.329 3.58 11.507 4.03 12.44 4.926l2.582-2.582C13.48.891 11.434 0 9.02 0A8.997 8.997 0 001.057 4.926l2.946 2.332c.698-2.09 2.652-3.658 4.962-3.658z" fill="#EA4335"/></g></svg>
);

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const { isLoading: isAuthLoading } = useAuth(); // Get loading state from AuthProvider

  const handleGoogleLogin = async () => {
    // This logic remains the same. It tries to call the native function if it exists.
    if (window.Android && typeof window.Android.requestGoogleLoginIn === 'function') {
        console.log("Requesting native Google Login...");
        setIsGoogleLoading(true);
        window.Android.requestGoogleLoginIn();
        // We do NOT expect a response back. The webview will be reloaded by the native app on success.
        return;
    }
    
    // Web fallback for testing in a desktop browser.
    console.warn("Android native interface not found. Using web flow.");
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // The AuthProvider will handle the redirect on its own.
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      }
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The AuthProvider will handle the redirect on its own.
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLocalIsLoading(false);
    }
  };

  // While the main AuthProvider is initializing, show a loader.
  if (isAuthLoading) {
    return <Loader2 className="mx-auto my-12 h-10 w-10 animate-spin" />;
  }

  // Render the full login form.
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
          disabled={localIsLoading || isGoogleLoading}
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
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={localIsLoading || isGoogleLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={localIsLoading || isGoogleLoading} />
          </div>
          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={localIsLoading || isGoogleLoading}>
            {localIsLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
            {localIsLoading ? 'Logging In...' : 'Log In'}
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
