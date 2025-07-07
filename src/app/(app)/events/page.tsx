// src/app/(app)/events/page.tsx
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, MapPin, ListChecks } from "lucide-react";
import { format } from 'date-fns';
import { mockEventsData } from '@/data/events';
import { CalendarWithEventModal } from "@/components/ui/calendar";

// Helper component to render SVG strings safely
const SvgIcon = ({ svgString }: { svgString: string }) => {
  if (!svgString || typeof svgString !== 'string') return null;
  // This is safe because the SVG strings are static and controlled within the app.
  return <div dangerouslySetInnerHTML={{ __html: svgString }} />;
};

export default function EventsPage() {

  const eventDates = useMemo(() => {
    return mockEventsData.map(event => event.date);
  }, []);

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
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 items-start">
          <div className="w-full flex justify-center md:justify-start">
            <CalendarWithEventModal /> {/* Removed unsupported props */}
          </div>
          <div className="w-full space-y-3">
             <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                Events {/* Updated heading */}
             </h2>
             {/* The event list and "No events" message will be handled by CalendarWithEventModal's modal */}
             <div className="text-center text-muted-foreground pt-10 flex flex-col items-center">
                 <ListChecks className="h-12 w-12 mb-4 text-gray-400" />
                 <p>Select a date on the calendar to see events.</p> {/* Updated message */}
             </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .has-event-dot {
          position: relative;
        }
        .has-event-dot:after {
          content: '';
          position: absolute;\n          bottom: 6px;\n          left: 50%;\n          transform: translateX(-50%);\n          width: 5px;\n          height: 5px;\n          border-radius: 50%;\n          background-color: hsl(var(--primary));\n        }\n        .rdp-day_selected.has-event-dot:after {\n          background-color: hsl(var(--primary-foreground));\n        }\n      `}</style>

    </div>
  );
}
