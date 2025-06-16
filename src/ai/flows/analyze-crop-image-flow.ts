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
  plantTypeGuess: z.string().optional().describe('A guess of the plant type if identifiable (e.g., "Tomato plant", "Corn stalk", "Dandelion"). This could be a crop or a weed.'),
  diseaseAnalysis: AnalysisDetailsSchema.describe('Analysis for plant diseases on the primary plant subject.'),
  nutrientDeficiencyAnalysis: AnalysisDetailsSchema.describe('Analysis for nutrient deficiencies on the primary plant subject.'),
  insectAnalysis: AnalysisDetailsSchema.describe('Analysis for insect presence on the primary plant subject.'),
  weedAnalysis: AnalysisDetailsSchema.describe('Analysis for weed presence. If the primary plant subject is a weed, this describes that weed. If the primary subject is a crop, this describes competing weeds.'),
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
2.  If 'isPlant' is true, try to guess its type in 'plantTypeGuess'. This could be a crop (e.g., "Tomato plant") or a weed (e.g., "Dandelion"). If unsure, state "Unknown plant type".
3.  If 'plantTypeGuess' identifies a **crop plant** as the primary subject:
    a.  Carefully examine this crop plant for signs of common diseases. Populate 'diseaseAnalysis'.
    b.  Examine this crop plant for common visual signs of nutrient deficiencies. Populate 'nutrientDeficiencyAnalysis'.
    c.  Look for any visible insects or signs of insect damage on this crop plant. Populate 'insectAnalysis'.
    d.  Examine the image for any *other* weeds present that might be competing with this crop plant or are in the vicinity. Populate 'weedAnalysis' with details of these other weeds. If no other weeds are detected, set 'weedAnalysis.detected' to false.
4.  If 'plantTypeGuess' identifies a **weed** as the primary plant subject:
    a.  Set 'weedAnalysis.detected' to true.
    b.  Populate 'weedAnalysis.name' with the identified weed's name (which should match 'plantTypeGuess').
    c.  Populate 'weedAnalysis.description' with a description of this primary weed, its characteristics, and common impact.
    d.  Assess this primary weed for any observable diseases, nutrient issues, or insect presence, and populate 'diseaseAnalysis', 'nutrientDeficiencyAnalysis', and 'insectAnalysis' accordingly. If none are observed on the weed itself, set 'detected' to false for those categories related to the weed.
5.  For all analysis categories (disease, nutrient, insect, weed): If an issue is detected, include 'name', 'description', and 'confidence'. If no specific issue is detected for a category (e.g., no diseases on the primary plant, or no competing weeds if the primary is a crop), set 'detected' to false for that category and omit 'name', 'description', and 'confidence'.
6.  Provide an 'overallAssessment'. If no plant is detected, state that. If 'plantTypeGuess' is a crop plant, assess its health. If 'plantTypeGuess' is a weed, the assessment can focus on its identification and potential impact.
7.  Provide 1-2 brief, actionable 'suggestions'. If the primary subject is a crop plant with issues, suggest remedies. If the primary subject is a weed, suggestions might include identification confirmation, control methods, or its ecological role if relevant. If competing weeds are found with a crop, suggest weed management.

Return your analysis strictly in the specified JSON output format.
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
