
// src/app/(app)/insecticides/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "lucide-react";

export default function InsecticidesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Bug className="mr-3 h-6 w-6 text-primary" />
            Insecticides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Explore various insecticides, their modes of action, target pests, and best practices for integrated pest management (IPM).
          </p>
          {/* Placeholder for more content */}
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Information on insecticides and pest control strategies will be available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
