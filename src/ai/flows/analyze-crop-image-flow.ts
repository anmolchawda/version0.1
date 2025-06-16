// src/ai/flows/analyze-crop-image-flow.ts
'use server';
/**
 * @fileOverview A Genkit flow for analyzing crop images to detect diseases, nutrient deficiencies, insects, and weeds.
 *
 * - analyzeCropImage - A function that takes an image data URI and returns an analysis.
 * - AnalyzeCropImageInput - The input type for the analyzeCropImage function.
 * - AnalyzeCropImageOutput - The return type for the analyzeCropImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCropImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCropImageInput = z.infer<typeof AnalyzeCropImageInputSchema>;

const AnalysisDetailsSchema = z.object({
  detected: z.boolean().describe('Whether this specific issue was detected.'),
  name: z.string().optional().describe('The common name of the detected issue (e.g., "Powdery Mildew", "Nitrogen Deficiency", "Aphids", "Dandelion").'),
  description: z.string().optional().describe('A brief description of the issue and potential visual signs.'),
  confidence: z.string().optional().describe('Confidence level of detection (e.g., High, Medium, Low).')
});

const AnalyzeCropImageOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether or not the AI confidently identifies a plant in the image.'),
  plantTypeGuess: z.string().optional().describe('A guess of the plant type if identifiable (e.g., "Tomato plant", "Corn stalk").'),
  diseaseAnalysis: AnalysisDetailsSchema.describe('Analysis for plant diseases.'),
  nutrientDeficiencyAnalysis: AnalysisDetailsSchema.describe('Analysis for nutrient deficiencies.'),
  insectAnalysis: AnalysisDetailsSchema.describe('Analysis for insect presence.'),
  weedAnalysis: AnalysisDetailsSchema.describe('Analysis for weed presence.'),
  overallAssessment: z.string().describe("A brief overall assessment of the plant's health condition based on the image findings, or a statement if no plant is detected or issues found."),
  suggestions: z.array(z.string()).optional().describe("Brief, actionable suggestions if issues are detected (e.g., 'Consider applying a fungicide', 'Check soil pH', 'Manual weeding recommended').")
});
export type AnalyzeCropImageOutput = z.infer<typeof AnalyzeCropImageOutputSchema>;

export async function analyzeCropImage(input: AnalyzeCropImageInput): Promise<AnalyzeCropImageOutput> {
  return analyzeCropImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCropImagePrompt',
  model: 'googleai/gemini-1.5-flash-latest', 
  input: {schema: AnalyzeCropImageInputSchema},
  output: {schema: AnalyzeCropImageOutputSchema},
  prompt: `You are an expert agricultural AI specializing in plant health analysis from images, utilizing comprehensive agricultural knowledge.
Analyze the provided image: {{media url=imageDataUri}}

Follow these steps for your analysis:
1.  Determine if the image primarily contains a plant. Set 'isPlant' accordingly.
2.  If it is a plant, try to guess the 'plantTypeGuess'. If unsure, state "Unknown plant type".
3.  Carefully examine the plant for signs of common diseases. Populate 'diseaseAnalysis'. Include 'name', 'description', and 'confidence' if a disease is detected.
4.  Examine the plant for common visual signs of nutrient deficiencies (e.g., yellowing leaves, stunted growth). Populate 'nutrientDeficiencyAnalysis'. Include 'name', 'description', and 'confidence' if a deficiency is suspected.
5.  Look for any visible insects or signs of insect damage. Populate 'insectAnalysis'. Include 'name', 'description', and 'confidence' if insects are detected.
6.  Examine the image for common weeds that might be competing with the plant or present in the vicinity. Populate 'weedAnalysis'. Include 'name', 'description', and 'confidence' if weeds are detected.
7.  Provide an 'overallAssessment' of the plant's condition. If no plant is detected, state that. If a plant is detected but appears healthy, state that. Otherwise, summarize the findings.
8.  If issues (including significant weed presence that might impact the main plant) are detected, provide 1-2 brief, actionable 'suggestions'. Consider suggestions related to weed management if applicable.

Return your analysis strictly in the specified JSON output format.
If no specific issue (disease, deficiency, insect, weed) is detected for a category, set 'detected' to false and omit 'name', 'description', and 'confidence' for that category.
`,
});

const analyzeCropImageFlow = ai.defineFlow(
  {
    name: 'analyzeCropImageFlow',
    inputSchema: AnalyzeCropImageInputSchema,
    outputSchema: AnalyzeCropImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI analysis failed to produce an output.");
    }
    return output;
  }
);
