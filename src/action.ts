// src/app/actions.ts

'use server'; // This is CRUCIAL. It marks all functions in this file as Server Actions.

import {
  analyzeCropImage,
  type AnalyzeCropImageInput,
} from '@/ai/flows/analyze-crop-image-flow'; // Import your actual AI flow
import { z } from 'zod';

// We create a schema for the form data we expect from the client.
const FormSchema = z.object({
  imageDataUri: z.string().min(1, 'Image data is required.'),
});

// This is the function your client will call. It runs ONLY on the server.
export async function analyzeImageOnServer(
  // The 'prevState' is for use with the useFormState hook, we can ignore it for now.
  prevState: { message: string },
  formData: FormData
) {
  // 1. Get the image data from the form data sent by the client.
  const validatedFields = FormSchema.safeParse({
    imageDataUri: formData.get('imageDataUri'),
  });

  // 2. If the data isn't valid, return an error.
  if (!validatedFields.success) {
    return {
      message: 'Invalid image data submitted.',
    };
  }

  // 3. Prepare the input for your Genkit flow.
  const flowInput: AnalyzeCropImageInput = {
    imageDataUri: validatedFields.data.imageDataUri,
  };

  try {
    console.log('Server Action: Running AI analysis flow...');
    // 4. Run the actual Genkit flow safely on the server.
    const analysisResult = await analyzeCropImage(flowInput);
    console.log('Server Action: AI analysis successful.');

    // 5. Return the result to the client.
    // The result MUST be a plain, serializable object.
    return {
      message: 'Success',
      data: analysisResult,
    };
  } catch (e) {
    console.error('Error during AI flow execution:', e);
    return { message: 'An error occurred during image analysis.' };
  }
}
