
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, Save, Loader2, Wheat } from 'lucide-react';

export function AddCropForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!cropName || !quantity || !price || !location) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (Crop Name, Quantity, Price, Location).',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    const cropData = {
      cropName,
      variety,
      quantity,
      price,
      location,
      description,
      imageFile, 
      listedDate: new Date().toISOString(),
    };
    console.log('Submitting crop:', cropData);
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Crop Listed!',
      description: `${cropName} has been successfully listed in the Mandi.`,
    });

    setIsSubmitting(false);
    router.push('/mandi'); 
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center">
        <Wheat className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-3xl font-bold text-primary">List Your Crop in Mandi</CardTitle>
        <CardDescription>Share details about your produce to reach buyers.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cropName" className="text-base font-medium">Crop Name <span className="text-destructive">*</span></Label>
              <Input
                id="cropName"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g., Organic Tomatoes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variety" className="text-base font-medium">Variety (Optional)</Label>
              <Input
                id="variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g., Heirloom, Roma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-medium">Quantity <span className="text-destructive">*</span></Label>
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 100 kg, 50 dozen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-base font-medium">Price <span className="text-destructive">*</span></Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., ₹25/kg, $3/dozen"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium">Location (City, State) <span className="text-destructive">*</span></Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Nashik, Maharashtra"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details like farming practices, harvest date, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUploadField" className="text-base font-medium">Crop Photo (Optional)</Label>
            <div className={`
              mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed 
              rounded-md group hover:border-primary transition-colors
              ${imagePreviewUrl ? 'border-primary' : 'border-input'}
            `}>
              <div className="space-y-1 text-center">
                {imagePreviewUrl ? (
                  <div className="relative mx-auto mb-4 h-48 w-auto max-w-md group">
                    <Image
                      src={imagePreviewUrl}
                      alt="Crop preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md"
                      data-ai-hint="crop product"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7 z-10"
                      onClick={removeImage}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                <div className="flex text-sm text-muted-foreground group-hover:text-primary transition-colors justify-center">
                  <Label
                    htmlFor="imageUpload"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  >
                    <span>Upload a file</span>
                    <Input
                      id="imageUpload"
                      name="imageUpload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                  </Label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <Button type="submit" className="w-full text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSubmitting ? 'Listing Crop...' : 'List This Crop'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
