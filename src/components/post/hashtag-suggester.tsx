
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { suggestHashtags, type SuggestHashtagsOutput } from '@/ai/flows/smart-hashtag-suggestions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HashtagSuggesterProps {
  postText: string;
  postImageDataUri?: string;
  onSuggestionClick: (hashtag: string) => void;
  className?: string;
}

export function HashtagSuggester({
  postText,
  postImageDataUri,
  onSuggestionClick,
  className,
}: HashtagSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!postText && !postImageDataUri) {
      setSuggestions([]);
      setHasFetched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasFetched(true);

    try {
      const input = postImageDataUri ? { postText, postImage: postImageDataUri } : { postText };
      const result: SuggestHashtagsOutput = await suggestHashtags(input);
      setSuggestions(result.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`));
    } catch (e) {
      console.error("Error fetching hashtag suggestions:", e);
      setError("Failed to load suggestions.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [postText, postImageDataUri]);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Suggesting hashtags...</span>
      </div>
    );
  }

  if (error) {
    return <p className={`text-xs sm:text-sm text-destructive ${className}`}>{error}</p>;
  }

  if (hasFetched && suggestions.length === 0 && !isLoading) {
     return (
      <div className={className}>
        <Button onClick={fetchSuggestions} variant="outline" size="sm" className="mb-2">
          <Sparkles className="mr-2 h-4 w-4" />
          Suggest Hashtags
        </Button>
        <p className="text-xs sm:text-sm text-muted-foreground">No suggestions found. Try different content or add manually.</p>
      </div>
    );
  }


  return (
    <div className={className}>
      <Button onClick={fetchSuggestions} variant="outline" size="sm" className="mb-2">
         <Sparkles className="mr-2 h-4 w-4" />
         Suggest Hashtags
      </Button>
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium text-foreground">AI Suggested Hashtags:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => onSuggestionClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
