
// src/app/(app)/events/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, ListChecks } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import { mockEventsData } from '@/data/events';
import type { MockEvent } from '@/data/events';

// Helper component to render SVG strings safely
const SvgIcon = ({ svgString }: { svgString: string }) => {
  if (!svgString || typeof svgString !== 'string') return null;
  // This is safe because the SVG strings are static and controlled within the app.
  return <div dangerouslySetInnerHTML={{ __html: svgString }} />;
};

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const eventDates = useMemo(() => {
    return mockEventsData.map(event => event.date);
  }, []);

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return mockEventsData
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selectedDate]);

  useEffect(() => {
    // If no date is selected, or the selected date has no events,
    // find the next upcoming event and select its date.
    if ((!selectedDate || eventsForSelectedDate.length === 0) && eventDates.length > 0) {
      const today = new Date();
      const futureEvents = eventDates
        .filter(date => date >= today)
        .sort((a,b) => a.getTime() - b.getTime());
      
      if (futureEvents.length > 0) {
        setSelectedDate(futureEvents[0]);
      } else if (eventDates.length > 0) {
        // If no future events, select the last available event date
        setSelectedDate(eventDates[eventDates.length-1]);
      }
    }
    // We only want this effect to run once on mount to set an intelligent default date.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="rounded-md border shadow-sm bg-card"
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: 'has-event-dot' }}
            />
          </div>
          <div className="w-full space-y-3">
             <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                Events for: {selectedDate ? format(selectedDate, "PPP") : 'No date selected'}
             </h2>
             <ScrollArea className="h-72 pr-3">
                {eventsForSelectedDate.length > 0 ? (
                    <div className="space-y-3">
                        {eventsForSelectedDate.map(event => (
                            <Card key={event.id} className="p-3 shadow-sm hover:shadow-md transition-shadow bg-card/50">
                                <div className="flex items-start space-x-3">
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
                ) : (
                    <div className="text-center text-muted-foreground pt-10 flex flex-col items-center">
                        <ListChecks className="h-12 w-12 mb-4 text-gray-400" />
                        <p>No events scheduled for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : 'this day'}.</p>
                    </div>
                )}
             </ScrollArea>
          </div>
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
        .rdp-day_selected.has-event-dot:after {
          background-color: hsl(var(--primary-foreground));
        }
      `}</style>

    </div>
  );
}
    