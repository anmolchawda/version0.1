// src/app/(app)/irac-code/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";

export default function IracCodePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Code2 className="mr-3 h-6 w-6 text-primary" />
            IRAC Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Learn about Insecticide Resistance Action Committee (IRAC) codes.
          </p>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Detailed information on IRAC codes will be provided here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
