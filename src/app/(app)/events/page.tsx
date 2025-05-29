// src/app/(app)/events/page.tsx
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, MapPin, Dot } from "lucide-react";
import { format, isSameDay, addDays, startOfMonth } from 'date-fns';

interface MockEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  icon?: ReactNode;
}

const today = new Date();
const monthStart = startOfMonth(today);

const mockEventsData: MockEvent[] = [
  {
    id: 'evt1',
    date: addDays(monthStart, 2),
    title: 'Krishi Mela 2025 (Local)',
    description: 'Annual agricultural fair showcasing new farming techniques and products. Networking opportunities for farmers.',
    location: 'District Ground, Raipur',
    icon: <CalendarDays className="h-4 w-4 text-primary" />
  },
  {
    id: 'evt2',
    date: addDays(monthStart, 7),
    title: 'Organic Farming Workshop',
    description: 'Hands-on workshop on organic pest control and soil enrichment methods.',
    location: 'Community Hall, Bilaspur',
    icon: <Leaf className="h-4 w-4 text-green-500" />
  },
  {
    id: 'evt3',
    date: addDays(monthStart, 7), // Same day as workshop
    title: 'Evening Kisan Goshti',
    description: 'Discussion forum for farmers to share experiences and challenges.',
    location: 'Panchayat Bhavan, Arang',
    icon: <Users className="h-4 w-4 text-blue-500" />
  },
  {
    id: 'evt4',
    date: addDays(monthStart, 15),
    title: 'Advanced Irrigation Techniques Seminar',
    description: 'Learn about drip irrigation, sprinklers, and water conservation in farming.',
    location: 'Agricultural University Auditorium, Raipur',
    icon: <Droplets className="h-4 w-4 text-sky-500" />
  },
  {
    id: 'evt5',
    date: addDays(monthStart, 22),
    title: 'Livestock Health Camp',
    description: 'Free health check-ups and vaccinations for livestock.',
    location: 'Veterinary Hospital, Dhamtari',
    icon: <HeartPulse className="h-4 w-4 text-red-500" />
  },
];

// Helper components for icons if not already globally available
const Leaf = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10zM4 13c0-3.9 2.6-7.3 6-8.7A4.9 4.9 0 0 1 12 4a5 5 0 0 1 5 5v0H4z" />
  </svg>
);
const Users = ({ className }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const Droplets = ({ className }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.5 8.55 8 7.34 8 6.02 8 3.8 6.2 2 4 2s-4 1.8-4 4.02c0 1.32.57 2.53 1.7 3.29S0 11.13 0 12.3C0 14.47 1.8 16.3 4 16.3c.33 0 .66-.04 1-.1.3.04.6.1.9.1Z"/>
    <path d="M12.56 20.3A10 10 0 0 0 22 12.3c0-1.43-.68-2.79-1.7-3.54C18.17 10.4 20 11.32 20 12.3c0 2.2-1.8 4-4 4-.47 0-.9-.1-1.3-.26-.34.1-.7.2-1.14.2"/>
    <path d="M10.36 14.3c.2-.8.9-1.3 1.74-1.3.9 0 1.6.5 1.8 1.2.5-.3.9-.7.9-1.2 0-1.1-.9-2-2-2s-2 .9-2 2c0 .5.4.9.86 1.2"/>
    <path d="m12.52 4.8-.42.6"/>
    <path d="m10.96 3.32.82 1.24"/>
    <path d="m10.08 5.74.42.6"/>
    <path d="m7.52 3.2.82 1.24"/>
    <path d="m7.08 5.22.42.6"/>
    <path d="m4.52 2.9.82 1.24"/>
    <path d="m4.08 4.72.42.6"/>
  </svg>
);
const HeartPulse = ({ className }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    <path d="M12.2 10.6a2.5 2.5 0 0 1 3.6.4L19 14.5l.8-1.3A2.5 2.5 0 0 1 23.4 14"/>
  </svg>
);

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<MockEvent[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = mockEventsData.filter(event => isSameDay(event.date, selectedDate));
      setEventsForSelectedDate(filtered);
    } else {
      setEventsForSelectedDate([]);
    }
  }, [selectedDate]);

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
        <CardContent className="flex flex-col md:flex-row gap-6">
          <div className="flex justify-center md:justify-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-sm bg-card p-3"
              initialFocus
              month={selectedDate}
              onMonthChange={setSelectedDate} // Allows month navigation to update selected date context
            />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Events for: {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
            </h3>
            <ScrollArea className="h-[300px] pr-3">
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {eventsForSelectedDate.map(event => (
                    <Card key={event.id} className="p-4 shadow-sm hover:shadow-md transition-shadow bg-muted/30">
                      <div className="flex items-start space-x-3">
                        {event.icon && <div className="mt-1">{event.icon}</div>}
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

    