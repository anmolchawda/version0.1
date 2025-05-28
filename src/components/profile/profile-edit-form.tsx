
'use client';

import { useState, type FormEvent, useEffect, type ChangeEvent } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderUser, placeholderStates, placeholderCities } from '@/lib/placeholders';
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Camera } from 'lucide-react'; // Added Camera icon
import { cn } from '@/lib/utils';

// Mock current user for initial form data
const MOCK_CURRENT_USER_ID = '1';

export function ProfileEditForm() {
  const [initialUser, setInitialUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [produceInput, setProduceInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const user = getPlaceholderUser(MOCK_CURRENT_USER_ID);
    if (user) {
      setInitialUser(user);
      setUsername(user.username || '');
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setProduceInput((user.produce || []).join(', '));
      setAvatarPreviewUrl(user.avatarUrl || '');
    }
  }, []);

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
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const updatedProfile = {
      username,
      name,
      bio,
      location: location.trim(),
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      avatarUrl: avatarPreviewUrl, // In a real app, this would be the URL after upload
      avatarFile: avatarFile, // This would be sent to the backend
    };

    console.log('Updating profile:', updatedProfile);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    setIsSubmitting(false);
  };

  if (!initialUser) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
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
            <p className="text-xs text-muted-foreground mt-1">
              Provide your city and state. Dynamic suggestions are not available for this field.
            </p>
        </div>

        <div className="space-y-2">
            <Label htmlFor="produce" className="text-base font-medium">Main Produce (comma-separated)</Label>
            <Input id="produce" value={produceInput} onChange={(e) => setProduceInput(e.target.value)} placeholder="e.g., Tomatoes, Corn, Apples" />
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 text-base" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
        </div>
    </form>
  );
}
    
