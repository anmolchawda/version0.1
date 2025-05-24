
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added for redirection
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

// Simple Google G logo SVG (same as login-form)
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Added for Google button
  const { toast } = useToast();
  const router = useRouter(); // Added for redirection

  const handleSignup = (method: 'email' | 'google') => {
    if (method === 'email') {
      if (password !== confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'The passwords do not match. Please try again.',
          variant: 'destructive',
        });
        return Promise.reject(new Error('Password mismatch'));
      }
      setIsLoading(true);
    } else {
      setIsGoogleLoading(true);
    }

    // Simulate API call
    console.log(`Signing up with ${method}:`, { username, email, password });
    return new Promise(resolve => setTimeout(resolve, 1500)).then(() => {
      localStorage.setItem('isMockAuthenticated', 'true'); // Simulate authentication
      toast({
        title: `Signup Successful via ${method}! (Simulated)`,
        description: `Welcome to FARMDOCC, ${username || 'Google User'}!`,
      });
      if (method === 'email') {
        setIsLoading(false);
      } else {
        setIsGoogleLoading(false);
      }
      router.push('/'); // Redirect to the main feed page
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleSignup('email').catch(() => setIsLoading(false)); // Ensure loading state is reset on error
  };

  const handleGoogleSignup = async () => {
    await handleSignup('google');
  };

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Join FARMDOCC</CardTitle>
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
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          {isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}
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
              disabled={isGoogleLoading}
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
              disabled={isGoogleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isGoogleLoading}
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
              disabled={isGoogleLoading}
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

    