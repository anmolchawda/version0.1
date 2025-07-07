"use client"

import * as React from "react"
import { DayPicker, type DayProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { mockEventsData, type MockEvent } from "@/data/events"
import { isSameDay, format } from "date-fns"
import { ScrollArea } from "./scroll-area"

type CalendarEvent = MockEvent

const SvgIcon = ({ svgString }: { svgString: string }) => {
  if (!svgString || typeof svgString !== 'string') return null;
  return <div className="h-5 w-5 mr-3 shrink-0 text-primary" dangerouslySetInnerHTML={{ __html: svgString }} />;
};

export function CalendarWithEventModal() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [selectedDateEvents, setSelectedDateEvents] = React.useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setEvents(mockEventsData);
    setLoading(false);
  }, [])

  const handleDateClick = (date: Date) => {
    const matches = events.filter(e => isSameDay(e.date, date));
    if (matches.length > 0) {
      setSelectedDateEvents(matches)
      setSelectedDate(date);
      setOpen(true)
    }
  }

  const eventDatesSet = React.useMemo(() => {
    const dates = new Set<string>();
    events.forEach(e => {
        dates.add(format(e.date, 'yyyy-MM-dd'));
    });
    return dates;
  }, [events]);

  const EventDay = (props: DayProps) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const hasEvent = eventDatesSet.has(dateStr);
    
    return (
      <button 
        type="button"
        onClick={() => handleDateClick(props.date)}
        className={cn(
            "h-9 w-9 p-0 text-sm flex items-center justify-center rounded-full relative",
            hasEvent ? "has-event-dot font-bold text-foreground cursor-pointer hover:bg-accent/50" : "text-muted-foreground",
            "focus-within:relative focus-within:z-20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
      >
        {props.date.getDate()}
      </button>
    );
  }

  if (loading) return <p className="text-center text-sm text-muted-foreground">Loading calendar...</p>

  return (
    <>
      <DayPicker
        showOutsideDays
        fixedWeeks
        components={{ Day: EventDay }}
        classNames={{
          root: "p-3 border rounded-lg shadow-inner bg-muted/20",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-base font-medium text-primary",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative",
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">
              Events for {selectedDate ? format(selectedDate, "PPP") : ""}
            </DialogTitle>
             <DialogDescription className="sr-only">
               List of events on this date.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] -mx-4">
            <div className="space-y-3 mt-4 px-6">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="border p-3 rounded-md bg-card flex items-start">
                   {event.icon && <SvgIcon svgString={event.icon} />}
                  <div className="flex-grow">
                    <p className="font-semibold">{event.title}</p>
                    {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
                    {event.description && <p className="text-sm mt-1">{event.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
