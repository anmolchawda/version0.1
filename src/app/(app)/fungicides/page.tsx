
// src/app/(app)/fungicides/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SprayCan } from "lucide-react";

export default function FungicidesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <SprayCan className="mr-3 h-6 w-6 text-primary" />
            Fungicides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed information about different types of fungicides, their application, safety precautions, and effectiveness against various plant diseases.
          </p>
          {/* Placeholder for more content */}
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive fungicide guides and product information will be listed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
