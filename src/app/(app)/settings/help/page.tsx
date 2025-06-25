
// src/app/(app)/settings/help/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function HelpSettingsPage() {
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
            <HelpCircle className="mr-3 h-7 w-7" />
            Help & Support
          </CardTitle>
          <CardDescription>
            Find answers to your questions and get support for FARMDOCC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Content Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              This section will provide help articles, FAQs, and contact information for support.
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm">For immediate assistance, you can also check our community forums (link to be added) or contact us at <a href="mailto:support@example.com" className="text-accent hover:underline">support@farmdocc.example.com</a> (placeholder).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
