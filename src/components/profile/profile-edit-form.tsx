'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderUser } from '@/lib/placeholders'; // For initial data
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

// Mock current user for initial form data
const MOCK_CURRENT_USER_ID = '1';
const initialUser = getPlaceholderUser(MOCK_CURRENT_USER_ID) || {} as User;


export function ProfileEditForm() {
  const [username, setUsername] = useState(initialUser.username || '');
  const [name, setName] = useState(initialUser.name || '');
  const [bio, setBio] = useState(initialUser.bio || '');
  const [location, setLocation] = useState(initialUser.location || '');
  const [produceInput, setProduceInput] = useState((initialUser.produce || []).join(', '));
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const updatedProfile = {
      username,
      name,
      bio,
      location,
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      avatarUrl,
    };
    
    // Simulate API call
    console.log('Updating profile:', updatedProfile);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Edit Profile</CardTitle>
        <CardDescription>Update your personal and farming information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || `https://placehold.co/80x80.png?text=${username.charAt(0) || 'U'}`} alt={username} data-ai-hint="person farmer" />
              <AvatarFallback>{username.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input 
                id="avatarUrl" 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png" 
              />
               <p className="text-xs text-muted-foreground">Or upload (feature not implemented)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself and your farm" rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Sunnyvale, CA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="produce">Main Produce (comma-separated)</Label>
              <Input id="produce" value={produceInput} onChange={(e) => setProduceInput(e.target.value)} placeholder="e.g., Tomatoes, Corn, Apples" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto ml-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
