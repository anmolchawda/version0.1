// src/app/(app)/irac-frac-codes/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";

export default function IracFracCodePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Code2 className="mr-3 h-6 w-6 text-primary" />
            IRAC/FRAC Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Learn about Insecticide Resistance Action Committee (IRAC) and Fungicide Resistance Action Committee (FRAC) codes to help manage resistance.
          </p>
          {/* Placeholder for more content */}
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Detailed information on IRAC and FRAC codes will be provided here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
