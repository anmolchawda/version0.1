
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
  { value: 'equipments', label: 'Equipments' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'fungicides', label: 'Fungicides' },
  { value: 'mulching', label: 'Mulching' },
];

const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (imageFiles.length + newFiles.length > MAX_IMAGES) {
        toast({
          title: 'Maximum Images Reached',
          description: `You can upload a maximum of ${MAX_IMAGES} images.`,
          variant: 'destructive',
        });
        return;
      }
      setImageFiles(prev => [...prev, ...newFiles]);

      const newUrlPromises = newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(newUrlPromises).then(newUrls => {
        setImagePreviewUrls(prev => [...prev, ...newUrls]);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current) {
      // Best we can do is reset the input value. Re-selecting files is the only way to re-populate it.
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
    if (imageFiles.length < MIN_IMAGES) {
      toast({
        title: 'More Images Required',
        description: `Please upload at least ${MIN_IMAGES} images to list your item.`,
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
      imageFiles, 
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
      <CardHeader className="relative flex justify-center items-center border-b py-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 h-9 w-9"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center text-center">
          <PackagePlus className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-1" />
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary">List New Item in Mandi</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Share details about your product or equipment to reach buyers.</CardDescription>
        </div>
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
            <Label htmlFor="imageUploadField" className="text-base font-medium">Item Photos (Min. {MIN_IMAGES}, Max. {MAX_IMAGES}) <span className="text-destructive">*</span></Label>
            <div className={`
              mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed 
              rounded-md group hover:border-primary transition-colors
              ${imagePreviewUrls.length > 0 ? 'border-primary' : 'border-input'}
            `}>
              <div className="space-y-1 text-center w-full">
                {imagePreviewUrls.length === 0 && (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex text-sm text-muted-foreground group-hover:text-primary transition-colors justify-center">
                      <Label
                        htmlFor="imageUpload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      >
                        <span>Upload files</span>
                        <Input
                          id="imageUpload"
                          name="imageUpload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                          multiple
                        />
                      </Label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </>
                )}
                 {imagePreviewUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                          <Image
                            src={url}
                            alt={`Item preview ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                            data-ai-hint="product agriculture item"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-6 w-6 z-10"
                            onClick={() => removeImage(index)}
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                       {imageFiles.length < MAX_IMAGES && (
                         <Label htmlFor="imageUpload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary">
                            <UploadCloud className="h-8 w-8"/>
                            <span className="text-xs mt-1 text-center">Add more</span>
                         </Label>
                       )}
                    </div>
                  )}
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
