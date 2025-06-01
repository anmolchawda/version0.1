
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HashtagSuggester } from './hashtag-suggester';
import { ImageUp, Send, Tag, X, Loader2, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CreatePostForm() {
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaDataUri, setMediaDataUri] = useState<string | undefined>(undefined);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtagInput, setCurrentHashtagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize router

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviewUrl(reader.result as string);
        setMediaDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElement.src);
          if (videoElement.duration > 60) {
            toast({
              title: "Video Too Long",
              description: "Please select a video that is 60 seconds or shorter.",
              variant: "destructive",
            });
            removeMedia();
          }
        }
        videoElement.src = URL.createObjectURL(file);
      } else {
        setMediaType(null);
         toast({
            title: "Unsupported File Type",
            description: "Please select an image or video file.",
            variant: "destructive",
          });
        removeMedia();
      }
    } else {
      removeMedia();
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaDataUri(undefined);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    if (!caption && !mediaFile) {
      toast({
        title: "Empty Post",
        description: "Please add a caption or an image/video to your post.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    console.log('Submitting post:', { caption, mediaFile, mediaType, hashtags, mediaDataUri });
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Post Created!",
      description: "Your post has been successfully shared.",
    });

    setCaption('');
    removeMedia();
    setHashtags([]);
    setCurrentHashtagInput('');
    router.push('/'); // Redirect to feed page
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-center text-primary">Create New Post</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-sm sm:text-base">Caption</Label>
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
            <Label className="text-sm sm:text-base">Image / Video (Optional)</Label>
            <div className={`
              mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed 
              rounded-md group hover:border-primary transition-colors border-input
            `}>
              <div className="space-y-1 text-center">
                <ImageUp className="mx-auto h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="flex text-xs sm:text-sm text-muted-foreground group-hover:text-primary transition-colors justify-center items-center">
                  <Label
                    htmlFor="mediaUploadField"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 py-1 px-2"
                  >
                    <span>Upload a file</span>
                    <Input
                      id="mediaUploadField"
                      name="mediaUploadField"
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      onChange={handleMediaChange}
                      ref={fileInputRef}
                    />
                  </Label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, MP4, WEBM. Max 10MB.</p>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-1">(Max 60 seconds for videos)</p>
            {mediaPreviewUrl && (
              <div className="relative mt-2 group">
                {mediaType === 'image' && (
                  <Image
                    src={mediaPreviewUrl}
                    alt="Media preview"
                    width={500}
                    height={300}
                    className="rounded-md object-cover aspect-video"
                    data-ai-hint="farm activity"
                  />
                )}
                {mediaType === 'video' && (
                   <div className="rounded-md object-cover aspect-video bg-muted flex items-center justify-center">
                    <video
                      src={mediaPreviewUrl}
                      controls
                      className="max-h-[300px] rounded-md"
                      data-ai-hint="farm video"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                  onClick={removeMedia}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove media</span>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags" className="text-sm sm:text-base">Hashtags</Label>
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
            postImageDataUri={mediaType === 'image' ? mediaDataUri : undefined}
            onSuggestionClick={handleSuggestedHashtagClick}
          />

        </CardContent>
        <CardFooter className="p-4 sm:p-6">
          <Button type="submit" className="w-full text-base sm:text-lg py-3 sm:py-3 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
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
