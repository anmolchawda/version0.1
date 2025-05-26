
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, Save, Loader2, PackagePlus, ChevronLeft } from 'lucide-react';

const itemCategories = [
  { value: 'crops', label: 'Crops' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'tractors', label: 'Tractors' },
  { value: 'farm_equipment', label: 'Farm Equipment' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'fungicides', label: 'Fungicides' },
  { value: 'mulching', label: 'Mulching' },
];

export function AddCropForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [details, setDetails] = useState('');
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
    if (!itemName || !selectedCategory || !quantity || !price || !location) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (Item Name, Category, Quantity, Price, Location).',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    const listingData = {
      itemName,
      category: selectedCategory,
      details,
      quantity,
      price,
      location,
      description,
      imageFile, 
      listedDate: new Date().toISOString(),
    };
    console.log('Submitting listing:', listingData);
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Item Listed!',
      description: `${itemName} has been successfully listed in the Mandi.`,
    });

    setIsSubmitting(false);
    router.push('/mandi'); 
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader className="relative flex items-center border-b pb-4 pt-4 pr-4 pl-2 sm:pl-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 mr-2"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center text-center flex-grow">
          <PackagePlus className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-1" />
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary">List New Item in Mandi</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Share details about your product or equipment to reach buyers.</CardDescription>
        </div>
        <div className="h-9 w-9 ml-2 sm:w-9"></div> {/* Spacer for balance */}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-base font-medium">Item Name <span className="text-destructive">*</span></Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Organic Tomatoes, Power Tiller"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium">Category <span className="text-destructive">*</span></Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details" className="text-base font-medium">Details / Specifications (Optional)</Label>
            <Input
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g., Heirloom, 50HP, 10kg bag"
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base font-medium">Quantity <span className="text-destructive">*</span></Label>
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 100 kg, 1 unit, 50 bags"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-base font-medium">Price <span className="text-destructive">*</span></Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., ₹25/kg, ₹50,000, $10/bag"
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
            <Label htmlFor="description" className="text-base font-medium">Further Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details like condition, age, farming practices, harvest date, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUploadField" className="text-base font-medium">Item Photo (Optional)</Label>
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
                      alt="Item preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md"
                      data-ai-hint="product item agriculture"
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
            {isSubmitting ? 'Listing Item...' : 'List This Item'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
