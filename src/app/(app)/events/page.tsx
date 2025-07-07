// src/app/(app)/events/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { CalendarWithEventModal } from "@/components/ui/calendar";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <CalendarDays className="mr-3 h-7 w-7" />
            Events Calendar
          </CardTitle>
          <CardDescription>
            Discover upcoming agricultural events, workshops, and exhibitions. Click on a date to see events.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-4">
          <CalendarWithEventModal />
        </CardContent>
      </Card>

      <style jsx global>{`
        .has-event-dot {
          position: relative;
        }
        .has-event-dot:after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
        }
        .rdp-day_selected.has-event-dot:after,
        .rdp-button:focus .has-event-dot:after,
        .rdp-button:active .has-event-dot:after
         {
          background-color: hsl(var(--primary-foreground));
        }
      `}</style>
    </div>
  );
}
