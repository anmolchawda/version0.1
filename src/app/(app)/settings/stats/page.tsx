
// src/app/(app)/settings/stats/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function StatsSettingsPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
        <Link href="/settings">
          <ChevronLeft className="mr-2 h-5 w-5" /> Back to Settings
        </Link>
      </Button>
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <BarChart3 className="mr-3 h-7 w-7" />
            Account Statistics
          </CardTitle>
          <CardDescription>
            View your activity and engagement statistics on KrishiX.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              This section will display your account statistics and insights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
