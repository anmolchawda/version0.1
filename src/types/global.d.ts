// src/types/global.d.ts

// This file defines all the functions that our native Android app
// might make available on the window object.

declare global {
    interface Window {
      Android?: {
        [x: string]: any;
        // This is the one we use for login.
        requestGoogleSignIn: () => void;
  
        // These might be used elsewhere in your app.
        // If you are no longer using them, you can safely delete them.
        startNativeGoogleSignIn?: () => void;
        onWebAppReady?: () => void;
      };
    }
  }
  
  // This empty export is needed to make TypeScript treat this as a module.
  export {};
  