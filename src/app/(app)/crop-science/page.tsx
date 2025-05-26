
// src/app/(app)/crop-science/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function CropSciencePage() {
  // IMPORTANT: Replace this URL with your actual AppSheet app's embed URL
  const appSheetEmbedUrl = "YOUR_APPSHEET_APP_EMBED_URL_HERE";

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <FlaskConical className="mr-3 h-7 w-7 text-primary" />
            Crop Science Hub
          </CardTitle>
          <CardDescription>
            Explore interactive tools and data related to crop science, agronomy, and best farming practices powered by our integrated AppSheet application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appSheetEmbedUrl === "YOUR_APPSHEET_APP_EMBED_URL_HERE" ? (
            <div className="mt-8 p-6 border-2 border-dashed border-destructive/50 rounded-lg text-center bg-destructive/5">
              <p className="text-lg font-semibold text-destructive-foreground">AppSheet App Not Configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please update the <code className="bg-muted px-1 py-0.5 rounded text-xs">appSheetEmbedUrl</code> in <code className="bg-muted px-1 py-0.5 rounded text-xs">src/app/(app)/crop-science/page.tsx</code> with your AppSheet application's embed URL to display it here.
              </p>
            </div>
          ) : (
            <div className="aspect-video w-full mt-4 rounded-lg overflow-hidden border shadow-inner">
              <iframe
                src={appSheetEmbedUrl}
                width="100%"
                height="100%" // Will be controlled by aspect-video parent
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Crop Science AppSheet Application"
              ></iframe>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Having trouble viewing the app? Ensure you have access and that the embed URL is correct.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
