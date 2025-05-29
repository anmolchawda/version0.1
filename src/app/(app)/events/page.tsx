// src/app/(app)/events/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <CalendarDays className="mr-3 h-7 w-7" />
            Events
          </CardTitle>
          <CardDescription>
            Discover upcoming agricultural events, workshops, and exhibitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Events Calendar Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Information about relevant agricultural events will be listed here. Check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
