
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Use Google AI plugin

// Use the user-provided API key directly.
const apiKey = "AIzaSyD0CsuilbchETSvOwpBHlcu4FjF6eE7sa0";

export const ai = genkit({
  plugins: [
    googleAI({
      // Explicitly pass the apiKey.
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-pro-latest', // Default model for text generation, changed from 2.5-pro to 1.5-pro-latest per previous request.
});

// Removed the previous logic that checked for GOOGLE_API_KEY or GEMINI_API_KEY in environment variables
// and the associated console warning, as the API key is now hardcoded as per user request.
// Ensure this key is secured if this code moves to a production environment.
// For production, using environment variables is generally recommended.
