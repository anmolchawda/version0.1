
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
import { auth, db, doc, setDoc, serverTimestamp } from '@/lib/firebase'; // Firebase Auth
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, getAdditionalUserInfo, sendEmailVerification } from 'firebase/auth';

// Simple Google G logo SVG
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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'The passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    if (!auth || !db) {
        toast({ title: "Signup Disabled", description: "Firebase is not configured correctly.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        username: username.trim(),
        email: user.email,
        name: '',
        avatarUrl: '',
        createdAt: serverTimestamp(),
        languageSelected: false,
        profileSetupComplete: false,
        followersCount: 0,
        followingCount: 0,
        postCount: 0
      });

      await sendEmailVerification(userCredential.user);
      
      setSignupSuccess(true); // Update UI to show verification message

    } catch (error: any) {
      console.error('Signup error:', error.code, error.message);
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    if (!auth) {
        toast({ title: "Signup Disabled", description: "Firebase is not configured correctly.", variant: "destructive"});
        setIsGoogleLoading(false);
        return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Let the app layout's auth state listener and gatekeeper handle redirection.
      router.push('/');
    } catch (error: any) {
      console.error('Google Sign-up error:', error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: 'Sign-up Cancelled',
          description: 'The Google sign-up window was closed.',
        });
      } else {
        toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
      }
    } finally {
        setIsGoogleLoading(false);
    }
  };

  if (signupSuccess) {
    return (
       <Card className="w-full max-w-md shadow-2xl rounded-xl">
        <CardHeader className="text-center">
            <MailCheck className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl font-bold text-primary">Verify Your Email</CardTitle>
            <CardDescription>
                We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Please click the link to activate your account.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">
            Once you've verified, you can log in. You may need to check your spam folder.
          </p>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/login">Go to Login Page</Link>
            </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Join KrishiX</CardTitle>
        <CardDescription>Create your account and connect with farmers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full py-3 text-base" 
          onClick={handleGoogleSignup}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          <span className="ml-2">{isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}</span>
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="FarmerJoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••• (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
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
