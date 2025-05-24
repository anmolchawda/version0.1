'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HashtagSuggester } from './hashtag-suggester';
import { ImageUp, Send, Tag, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CreatePostForm() {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | undefined>(undefined);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtagInput, setCurrentHashtagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
        setImageDataUri(reader.result as string); 
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
      setImageDataUri(undefined);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageDataUri(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleAddHashtag = (tag: string) => {
    const newTag = tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`;
    if (newTag.length > 1 && !hashtags.includes(newTag) && hashtags.length < 10) {
      setHashtags([...hashtags, newTag]);
    }
  };
  
  const handleCurrentHashtagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentHashtagInput(e.target.value);
  };

  const handleCurrentHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      if (currentHashtagInput.trim()) {
        handleAddHashtag(currentHashtagInput.trim());
        setCurrentHashtagInput('');
      }
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleSuggestedHashtagClick = (tag: string) => {
    handleAddHashtag(tag);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!caption && !imageFile) {
      toast({
        title: "Empty Post",
        description: "Please add a caption or an image to your post.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    console.log('Submitting post:', { caption, imageFile, hashtags, imageDataUri });
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Post Created!",
      description: "Your post has been successfully shared.",
    });
    
    // Reset form
    setCaption('');
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageDataUri(undefined);
    setHashtags([]);
    setCurrentHashtagInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Create New Post</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-base">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share what's happening on your farm..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUpload" className="text-base">Image (Optional)</Label>
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {imagePreviewUrl && (
              <div className="relative mt-2 group">
                <Image
                  src={imagePreviewUrl}
                  alt="Image preview"
                  width={500}
                  height={300}
                  className="rounded-md object-cover aspect-video"
                  data-ai-hint="farm activity"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags" className="text-base">Hashtags</Label>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <Input
                id="hashtags"
                type="text"
                value={currentHashtagInput}
                onChange={handleCurrentHashtagInputChange}
                onKeyDown={handleCurrentHashtagKeyDown}
                placeholder="Add tags (e.g., #organic)"
                className="flex-1"
              />
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="py-1 px-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <HashtagSuggester
            postText={caption}
            postImageDataUri={imageDataUri}
            onSuggestionClick={handleSuggestedHashtagClick}
            className="pt-2"
          />

        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {isSubmitting ? 'Posting...' : 'Share Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
