
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Attempt to read the API key from the environment variables.
// The .env file should be loaded by src/ai/dev.ts for local Genkit development.
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'development') {
  // This console.warn will appear in the terminal where `npm run genkit:dev` or `npm run genkit:watch` is running.
  console.warn(
    `\n🔴🔴🔴 WARNING: Gemini API Key is Missing 🔴🔴🔴\n` +
    `It seems the GOOGLE_API_KEY or GEMINI_API_KEY is not set in your environment.\n` +
    `Please create or update the .env file in the root of your project with:\n\n` +
    `  GOOGLE_API_KEY=YOUR_ACTUAL_API_KEY\n` +
    `  OR\n` +
    `  GEMINI_API_KEY=YOUR_ACTUAL_API_KEY\n\n` +
    `You can obtain an API key from Google AI Studio: https://aistudio.google.com/app/apikey\n` +
    `After adding the key to .env, remember to RESTART your Genkit development server (e.g., 'npm run genkit:dev').\n`
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      // Explicitly pass the apiKey. If it's undefined, the plugin will
      // throw an error, but we've provided a warning above for development.
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model for text generation
});
