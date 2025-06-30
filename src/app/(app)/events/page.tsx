// src/app/(app)/events/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from 'date-fns';
import * as eventsData from '@/data/events';
import { useMemo } from "react";

// Helper component to render SVG strings safely
const SvgIcon = ({ svgString }: { svgString: string }) => {
  if (!svgString || typeof svgString !== 'string') return null;
  // This is safe because the SVG strings are static and controlled within the app.
  return <div dangerouslySetInnerHTML={{ __html: svgString }} />;
};

export default function EventsPage() {

  const groupedEvents = useMemo(() => {
    // First, sort events by date to ensure they appear chronologically
    const sortedEvents = [...eventsData.mockEventsData].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Then, group them by month
    return sortedEvents.reduce((acc, event) => {
      const month = format(event.date, 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {} as Record<string, eventsData.MockEvent[]>);
  }, []);

  const monthOrder = useMemo(() => Object.keys(groupedEvents), [groupedEvents]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <CalendarDays className="mr-3 h-7 w-7" />
            Upcoming Events
          </CardTitle>
          <CardDescription>
            Discover agricultural events, workshops, and exhibitions.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {monthOrder.length > 0 ? (
        <div className="space-y-8">
          {monthOrder.map(month => (
            <div key={month}>
              <h2 className="text-xl font-semibold text-foreground mb-3 pl-1">{month}</h2>
              <div className="space-y-3">
                {groupedEvents[month].map(event => (
                  <Card key={event.id} className="p-4 shadow-sm hover:shadow-md transition-shadow bg-card">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-2 w-16 h-16 text-center shrink-0">
                         <span className="text-2xl font-bold text-primary">{format(event.date, "dd")}</span>
                         <span className="text-xs font-medium text-muted-foreground uppercase">{format(event.date, "MMM")}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-primary">{event.title}</h3>
                        {event.description && <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>}
                        {event.location && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5" /> {event.location}
                          </p>
                        )}
                      </div>
                       {event.icon && (
                         <div className="hidden sm:block mt-1">
                            <SvgIcon svgString={event.icon} />
                         </div>
                       )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
         <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
                <p>No upcoming events scheduled at this time.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
