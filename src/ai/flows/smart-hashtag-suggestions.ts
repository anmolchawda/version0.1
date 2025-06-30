// src/ai/flows/smart-hashtag-suggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant hashtags for farmer's posts based on image and text content.
 *
 * - suggestHashtags - A function that takes post content and an image as input and returns a list of suggested hashtags.
 * - SuggestHashtagsInput - The input type for the suggestHashtags function.
 * - SuggestHashtagsOutput - The return type for the suggestHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHashtagsInputSchema = z.object({
  postText: z
    .string()
    .describe('The text content of the farmer\'s post.'),
  postImage: z
    .string()
    .describe(
      "A photo related to the farmer's post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .optional(), // Making the image optional
});

export type SuggestHashtagsInput = z.infer<typeof SuggestHashtagsInputSchema>;

const SuggestHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe('An array of suggested hashtags for the post.'),
});

export type SuggestHashtagsOutput = z.infer<typeof SuggestHashtagsOutputSchema>;

export async function suggestHashtags(input: SuggestHashtagsInput): Promise<SuggestHashtagsOutput> {
  return suggestHashtagsFlow(input);
}

const suggestHashtagsPrompt = ai.definePrompt({
  name: 'suggestHashtagsPrompt',
  model: 'googleai/gemini-1.5-flash-latest', // Explicitly use the Flash model to avoid rate limits
  input: {schema: SuggestHashtagsInputSchema},
  output: {schema: SuggestHashtagsOutputSchema},
  prompt: `You are a social media expert specializing in agriculture. Given the following post text and image (if available), suggest relevant hashtags to increase its visibility and engagement.  Return ONLY an array of hashtags. Do not include any surrounding text or explanation.

Post Text: {{{postText}}}

{{#if postImage}}
Post Image: {{media url=postImage}}
{{/if}}

Hashtags:`,
});

const suggestHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestHashtagsFlow',
    inputSchema: SuggestHashtagsInputSchema,
    outputSchema: SuggestHashtagsOutputSchema,
  },
  async input => {
    const {output} = await suggestHashtagsPrompt(input);
    return output!;
  }
);
