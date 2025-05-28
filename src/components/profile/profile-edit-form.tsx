
'use client';

import { useState, type FormEvent, useEffect, type ChangeEvent } from 'react';
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

const NO_STATE_VALUE = "--no-state--";
const NO_CITY_VALUE = "--no-city--";

export function ProfileEditForm() {
  const [username, setUsername] = useState(initialUser.username || '');
  const [name, setName] = useState(initialUser.name || '');
  const [bio, setBio] = useState(initialUser.bio || '');
  const [produceInput, setProduceInput] = useState((initialUser.produce || []).join(', '));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(initialUser.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [selectedStateCode, setSelectedStateCode] = useState<string>(''); // Can be '' for placeholder, or a valid state code, or NO_STATE_VALUE
  const [selectedCityValue, setSelectedCityValue] = useState<string>('');  // Can be '' for placeholder, or a valid city code, or NO_CITY_VALUE
  const [availableCities, setAvailableCities] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let prefillStateCode = ''; 
    let prefillCityValue = ''; 

    if (initialUser.location) {
      const parts = initialUser.location.split(',').map(p => p.trim());
      if (parts.length >= 1) { 
        const stateIdentifier = parts.length === 1 ? parts[0] : parts[1]; 
        const cityName = parts.length === 2 ? parts[0] : undefined;

        const foundState = placeholderStates.find(
          s => s.value.toLowerCase() === stateIdentifier.toLowerCase() || s.label.toLowerCase() === stateIdentifier.toLowerCase()
        );

        if (foundState) {
          prefillStateCode = foundState.value;
          const citiesForState = placeholderCities[foundState.value as keyof typeof placeholderCities] || [];
          // Intentionally set availableCities here so it's ready if prefillStateCode is valid
          setAvailableCities(citiesForState); 
          
          if (cityName) {
            const foundCity = citiesForState.find(
              c => c.label.toLowerCase() === cityName.toLowerCase() || c.value.toLowerCase() === cityName.toLowerCase()
            );
            if (foundCity) {
              prefillCityValue = foundCity.value;
            }
          }
        }
      }
    }
    setSelectedStateCode(prefillStateCode);
    setSelectedCityValue(prefillCityValue);
  }, []);


  useEffect(() => {
    if (selectedStateCode && selectedStateCode !== NO_STATE_VALUE) {
      setAvailableCities(placeholderCities[selectedStateCode as keyof typeof placeholderCities] || []);
    } else {
      setAvailableCities([]);
    }
    // City value is reset when state changes (handled in state Select's onValueChange)
  }, [selectedStateCode]);


  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    
    let locationString = ''; 
    
    const finalSelectedStateCode = selectedStateCode === NO_STATE_VALUE ? '' : selectedStateCode;
    const finalSelectedCityValue = selectedCityValue === NO_CITY_VALUE ? '' : selectedCityValue;

    if (finalSelectedStateCode) {
      const stateLabel = placeholderStates.find(s => s.value === finalSelectedStateCode)?.label;
      if (stateLabel) {
        if (finalSelectedCityValue) {
          const cityLabel = (placeholderCities[finalSelectedStateCode as keyof typeof placeholderCities] || []).find(c => c.value === finalSelectedCityValue)?.label;
          if (cityLabel) {
            locationString = `${cityLabel}, ${stateLabel}`;
          } else {
            locationString = stateLabel; 
          }
        } else {
          locationString = stateLabel; 
        }
      }
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
    // Simulate API call
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
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 2MB.</p>
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
                <Select 
                  value={selectedStateCode} 
                  onValueChange={(value) => {
                    setSelectedStateCode(value);
                    setSelectedCityValue(''); // Reset city when state changes
                  }}
                >
                    <SelectTrigger id="state">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={NO_STATE_VALUE}>None</SelectItem>
                        {placeholderStates.map(state => (
                            <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-medium">City</Label>
                <Select 
                  value={selectedCityValue} 
                  onValueChange={setSelectedCityValue} 
                  disabled={!selectedStateCode || selectedStateCode === NO_STATE_VALUE || availableCities.length === 0}
                >
                    <SelectTrigger id="city">
                        <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value={NO_CITY_VALUE}>None</SelectItem>
                        {availableCities.map(city => (
                            <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                        ))}
                         {availableCities.length === 0 && selectedStateCode && selectedStateCode !== NO_STATE_VALUE && <SelectItem value="no-cities" disabled>No cities listed for this state</SelectItem>}
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
