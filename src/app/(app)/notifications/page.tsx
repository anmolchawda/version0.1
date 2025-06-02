
// src/app/(app)/notifications/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BellRing, Construction } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <BellRing className="mr-3 h-7 w-7" />
            Notifications
          </CardTitle>
          <CardDescription>
            Updates and alerts from KrishiX.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center min-h-[200px] flex flex-col items-center justify-center">
            <Construction className="h-16 w-16 text-muted-foreground/70 mb-4" />
            <p className="text-lg font-semibold text-foreground">Notifications Page Coming Soon!</p>
            <p className="text-sm text-muted-foreground mt-1">
              This section will display your latest notifications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
