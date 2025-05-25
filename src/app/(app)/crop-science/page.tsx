
// src/app/(app)/crop-science/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function CropSciencePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FlaskConical className="mr-3 h-6 w-6 text-primary" />
            Crop Science
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Information and resources related to crop science, agronomy, and best farming practices will be available here.
            Explore topics like soil health, plant nutrition, pest and disease management, and innovative agricultural technologies.
          </p>
          {/* Placeholder for more content */}
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              We are working on bringing you detailed information on Crop Science.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
