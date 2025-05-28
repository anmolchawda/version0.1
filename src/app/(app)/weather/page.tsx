// src/app/(app)/weather/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun } from "lucide-react";

export default function WeatherPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <CloudSun className="mr-3 h-7 w-7" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
            <p className="text-lg font-semibold">Weather Details Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Check back later for local weather forecasts and agricultural advisories.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
