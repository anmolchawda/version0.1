// src/app/(app)/yojna/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function YojnaPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <ScrollText className="mr-3 h-7 w-7" />
            Yojna (Schemes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Information about agricultural schemes and yojnas will be listed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
