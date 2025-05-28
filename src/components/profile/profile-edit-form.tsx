
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderUser, placeholderStates, placeholderCities } from '@/lib/placeholders'; // For initial data
import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock current user for initial form data
const MOCK_CURRENT_USER_ID = '1';
const initialUser = getPlaceholderUser(MOCK_CURRENT_USER_ID) || ({} as User);

export function ProfileEditForm() {
  const [username, setUsername] = useState(initialUser.username || '');
  const [name, setName] = useState(initialUser.name || '');
  const [bio, setBio] = useState(initialUser.bio || '');
  // const [location, setLocation] = useState(initialUser.location || ''); // Replaced by dropdowns
  const [produceInput, setProduceInput] = useState((initialUser.produce || []).join(', '));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(initialUser.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [selectedStateCode, setSelectedStateCode] = useState<string>('');
  const [selectedCityValue, setSelectedCityValue] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Attempt to pre-fill state and city if initialUser.location exists and is parsable
    // This is a simplified parsing, might need to be more robust for real-world variations
    if (initialUser.location) {
      const parts = initialUser.location.split(',').map(p => p.trim());
      if (parts.length === 2) {
        const cityName = parts[0];
        const stateIdentifier = parts[1]; // Could be code or full name

        const foundState = placeholderStates.find(
          s => s.value.toLowerCase() === stateIdentifier.toLowerCase() || s.label.toLowerCase() === stateIdentifier.toLowerCase()
        );

        if (foundState) {
          setSelectedStateCode(foundState.value);
          const citiesForState = placeholderCities[foundState.value as keyof typeof placeholderCities] || [];
          setAvailableCities(citiesForState);
          
          const foundCity = citiesForState.find(
            c => c.label.toLowerCase() === cityName.toLowerCase() || c.value.toLowerCase() === cityName.toLowerCase()
          );
          if (foundCity) {
            setSelectedCityValue(foundCity.value);
          }
        }
      }
    }
  }, []);


  useEffect(() => {
    if (selectedStateCode) {
      setAvailableCities(placeholderCities[selectedStateCode as keyof typeof placeholderCities] || []);
    } else {
      setAvailableCities([]);
    }
    setSelectedCityValue(''); // Reset city when state changes
  }, [selectedStateCode]);


  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    
    let locationString = initialUser.location || ''; // Default to original if not changed
    if (selectedStateCode && selectedCityValue) {
      const stateLabel = placeholderStates.find(s => s.value === selectedStateCode)?.label;
      const cityLabel = (placeholderCities[selectedStateCode as keyof typeof placeholderCities] || []).find(c => c.value === selectedCityValue)?.label;
      if (cityLabel && stateLabel) {
        locationString = `${cityLabel}, ${stateLabel}`;
      } else if (stateLabel) { // Only state selected
        locationString = stateLabel;
      } else {
        locationString = ''; // If selections are invalid or cleared
      }
    } else if (selectedStateCode) { // Only state selected
        const stateLabel = placeholderStates.find(s => s.value === selectedStateCode)?.label;
        locationString = stateLabel || '';
    } else {
      // If no new selection, retain original or set to empty if it was never set
      // For this simulation, if no selection, we can imply user wants to clear it or keep original
      // If we want to explicitly clear if untouched, set locationString = '';
      // For now, it will default to initialUser.location unless changed.
      // If we want to set to empty if dropdowns were interacted with then cleared:
      // locationString = ''; // if selectedStateCode and selectedCityValue are empty after interaction
    }


    const updatedProfile = {
      username,
      name,
      bio,
      location: locationString,
      produce: produceInput.split(',').map(p => p.trim()).filter(p => p),
      avatarUrl: avatarPreviewUrl, 
      avatarFile: avatarFile, 
    };
    
    console.log('Updating profile:', updatedProfile);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="avatarUpload" className="text-base font-medium">Profile Photo</Label>
            <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={avatarPreviewUrl || `https://placehold.co/96x96.png?text=${username.charAt(0) || 'U'}`} alt={username} data-ai-hint="person farmer" />
                <AvatarFallback className="text-3xl">{username.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Input 
                        id="avatarUpload" 
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 2MB. Click to upload.</p>
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
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself and your farm" rows={4} className="resize-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="state" className="text-base font-medium">State</Label>
                <Select value={selectedStateCode} onValueChange={setSelectedStateCode}>
                    <SelectTrigger id="state">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {placeholderStates.map(state => (
                            <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-medium">City</Label>
                <Select value={selectedCityValue} onValueChange={setSelectedCityValue} disabled={!selectedStateCode || availableCities.length === 0}>
                    <SelectTrigger id="city">
                        <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="">None</SelectItem>
                        {availableCities.map(city => (
                            <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                        ))}
                         {availableCities.length === 0 && selectedStateCode && <SelectItem value="no-cities" disabled>No cities listed for this state</SelectItem>}
                    </SelectContent>
                </Select>
            </div>
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
