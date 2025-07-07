"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { isWithinInterval, format, startOfDay, endOfDay } from "date-fns"

type CalendarEvent = {
  id: string
  title: string
  description: string
  start: Date
  end: Date
}

export function CalendarWithEventModal() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [selectedDateEvents, setSelectedDateEvents] = React.useState<CalendarEvent[]>([])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "events"))
        const data = snapshot.docs.map(doc => {
          const d = doc.data()
          return {
            id: doc.id,
            title: d.title,
            description: d.description,
            start: d.start.toDate(),
            end: d.end.toDate(),
          } as CalendarEvent
        })
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleDateClick = (date: Date) => {
    const matches = events.filter(e =>
      isWithinInterval(date, {
        start: startOfDay(e.start),
        end: endOfDay(e.end),
      })
    )

    if (matches.length > 0) {
      setSelectedDateEvents(matches)
      setOpen(true)
    }
  }

  // Collect all individual days covered by events
  const allEventDates = events.flatMap(e => {
    const days: Date[] = []
    const cur = new Date(e.start)
    while (cur <= e.end) {
      days.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    return days
  })

  if (loading) return <p className="text-center text-sm text-muted-foreground">Loading calendar...</p>

  return (
    <>
      <DayPicker
        mode={"none" as any}
        showOutsideDays
        modifiers={{ event: allEventDates }}
        modifiersClassNames={{
          event: "bg-green-600 text-white font-bold rounded-full",
        }}
        classNames={{
          day: "h-9 w-9 p-0 text-sm flex items-center justify-center",
       }}
       dayContent={(date: Date) => {
          const hasEvent = allEventDates.some(
            d =>
              d.getDate() === date.getDate() &&
              d.getMonth() === date.getMonth() &&
              d.getFullYear() === date.getFullYear()
          )

          return (
            <div
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full",
                hasEvent ? "cursor-pointer font-bold text-primary" : "text-muted-foreground"
              )}
            >
              {date.getDate()}
            </div>
          )
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedDateEvents.length > 1
                ? `Events`
                : selectedDateEvents[0]?.title}
            </DialogTitle>
            {selectedDateEvents.length === 1 && (
              <DialogDescription className="mt-2 whitespace-pre-wrap text-sm">
                {selectedDateEvents[0]?.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedDateEvents.length > 1 && (
            <div className="space-y-4 mt-4">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="border p-3 rounded-md bg-gray-50">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(event.start, "MMM d")} – {format(event.end, "MMM d")}
                  </p>
                  <p className="text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
