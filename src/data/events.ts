// src/data/events.ts

import { addDays, startOfMonth } from 'date-fns';

export interface MockEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  location?: string;
  icon?: string; // Changed type to string
}

const today = new Date();
const monthStart = startOfMonth(today);

export const mockEventsData: MockEvent[] = [
  {
    id: 'evt1',
    date: addDays(monthStart, 2),
    title: 'Krishi Mela 2025 (Local)',
    description: 'Annual agricultural fair showcasing new farming techniques and products. Networking opportunities for farmers.',
    location: 'District Ground, Raipur',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M7 10h10"/><path d="M15 22v-4a2 2 0 0 1 2-2h4"/></svg>' // SVG as string
  },
  {
    id: 'evt2',
    date: addDays(monthStart, 7),
    title: 'Organic Farming Workshop',
    description: 'Hands-on workshop on organic pest control and soil enrichment methods.',
    location: 'Community Hall, Bilaspur',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-500"><path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10zM4 13c0-3.9 2.6-7.3 6-8.7A4.9 4.9 0 0 1 12 4a5 5 0 0 1 5 5v0H4z" /></svg>' // SVG as string
  },
  {
    id: 'evt3',
    date: addDays(monthStart, 7), // Same day as workshop
    title: 'Evening Kisan Goshti',
    description: 'Discussion forum for farmers to share experiences and challenges.',
    location: 'Panchayat Bhavan, Arang',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' // SVG as string
  },
  {
    id: 'evt4',
    date: addDays(monthStart, 15),
    title: 'Advanced Irrigation Techniques Seminar',
    description: 'Learn about drip irrigation, sprinklers, and water conservation in farming.',
    location: 'Agricultural University Auditorium, Raipur',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-500"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.7-3.02C8.5 8.55 8 7.34 8 6.02 8 3.8 6.2 2 4 2s-4 1.8-4 4.02c0 1.32.57 2.53 1.7 3.29S0 11.13 0 12.3C0 14.47 1.8 16.3 4 16.3c.33 0 .66-.04 1-.1.3.04.6.1.9.1Z"/><path d="M12.56 20.3A10 10 0 0 0 22 12.3c0-1.43-.68-2.79-1.7-3.54C18.17 10.4 20 11.32 20 12.3c0 2.2-1.8 4-4 4-.47 0-.9-.1-1.3-.26-.34.1-.7.2-1.14.2"/><path d="M10.36 14.3c.2-.8.9-1.3 1.74-1.3.9 0 1.6.5 1.8 1.2.5-.3.9-.7.9-1.2 0-1.1-.9-2-2-2s-2 .9-2 2c0 .5.4.9.86 1.2"/><path d="m12.52 4.8-.42.6"/><path d="m10.96 3.32.82 1.24"/><path d="m10.08 5.74.42.6"/><path d="m7.52 3.2.82 1.24"/><path d="m7.08 5.22.42.6"/><path d="m4.52 2.9.82 1.24"/><path d="m4.08 4.72.42.6"/></svg>' // SVG as string
  },
  {
    id: 'evt5',
    date: addDays(monthStart, 22),
    title: 'Livestock Health Camp',
    description: 'Free health check-ups and vaccinations for livestock.',
    location: 'Veterinary Hospital, Dhamtari',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/><path d="M12.2 10.6a2.5 2.5 0 0 1 3.6.4L19 14.5l.8-1.3A2.5 2.5 0 0 1 23.4 14"/></svg>' // SVG as string
  },
];