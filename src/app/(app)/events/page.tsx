// src/app/(app)/events/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, MapPin } from "lucide-react";
import { format, isSameDay, startOfDay } from 'date-fns';

import * as eventsData from '@/data/events';

// Helper component to render SVG strings safely
const SvgIcon = ({ svgString }: { svgString: string }) => {
  if (!svgString || typeof svgString !== 'string') return null;
  // This is safe because the SVG strings are static and controlled within the app.
  return <div dangerouslySetInnerHTML={{ __html: svgString }} />;
};

const today = new Date();

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<eventsData.MockEvent[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = eventsData.mockEventsData.filter(event => isSameDay(event.date, selectedDate));
      setEventsForSelectedDate(filtered);
    } else {
      setEventsForSelectedDate([]);
    }
  }, [selectedDate]);

  const eventDays = useMemo(() => {
    const dates = eventsData.mockEventsData.map(event => startOfDay(event.date));
    // Return unique dates
    return dates.filter((date, index, self) =>
      index === self.findIndex((d) => isSameDay(d, date))
    );
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
        <CardContent className="flex flex-col items-center gap-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border shadow-sm bg-card p-3"
            initialFocus
            month={selectedDate}
            onMonthChange={setSelectedDate}
            modifiers={{ hasEvent: eventDays }}
            modifiersStyles={{
              hasEvent: {
                color: 'hsl(var(--primary))',
                fontWeight: 'bold'
              }
            }}
          />
          <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Events for: {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
            </h3>
            <ScrollArea className="h-[300px] w-full pr-3">
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {eventsForSelectedDate.map(event => (
                    <Card key={event.id} className="p-4 shadow-sm hover:shadow-md transition-shadow bg-muted/30">
                      <div className="flex items-start space-x-3">
                        {event.icon && <div className="mt-1"><SvgIcon svgString={event.icon} /></div>}
                        <div>
                          <h4 className="font-semibold text-primary">{event.title}</h4>
                          {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                          {event.location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">
                  No events scheduled for {selectedDate ? format(selectedDate, "PPP") : "this date"}.
                </p>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
