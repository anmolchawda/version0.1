
// src/app/(app)/weather/detail/[date]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CloudSun, Thermometer, Wind, Droplets, Sun, CloudRain, Cloud, Sunrise, Sunset, Moon } from "lucide-react";
import { format, parseISO } from 'date-fns';
import React from 'react';

// This page will continue to use MOCK data.
// Integrating live 3-hourly data for a specific day from the forecast API
// would require passing significant data or re-fetching strategies.

interface MockHourlyForecast {
  time: string;
  temp: string;
  condition: string;
  icon: JSX.Element;
}

interface MockDetailedDayData {
  condition: string;
  temp: string; // Could be average, or just a representative temp
  feelsLike: string;
  humidity: string;
  wind: string;
  pressure: string;
  uvIndex: string;
  precipitationChance: string;
  sunrise: string;
  sunset: string;
  hourlyForecast: MockHourlyForecast[];
}

const getMockDetailedDataForDate = (dateStr: string): MockDetailedDayData => {
  // Simple mock, doesn't actually use the date to vary data much.
  const isWeekend = ['Sat', 'Sun'].includes(format(parseISO(dateStr), 'EEE'));
  return {
    condition: isWeekend ? "Sunny" : "Partly Cloudy",
    temp: isWeekend ? "32°C" : "30°C",
    feelsLike: isWeekend ? "33°C" : "32°C",
    humidity: `${50 + Math.floor(Math.random() * 20)}%`,
    wind: `${10 + Math.floor(Math.random() * 10)} km/h ${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]}`,
    pressure: `${1005 + Math.floor(Math.random() * 10)} hPa`,
    uvIndex: ["Low", "Moderate", "High", "Very High"][Math.floor(Math.random() * 4)],
    precipitationChance: `${Math.floor(Math.random() * 5) * 10}%`, // 0-40%
    sunrise: "6:08 AM",
    sunset: "6:50 PM",
    hourlyForecast: [
      { time: "07:00 AM", temp: "26°C", condition: "Clear", icon: <Sun className="h-5 w-5 text-yellow-400"/> },
      { time: "10:00 AM", temp: "29°C", condition: "Partly Cloudy", icon: <CloudSun className="h-5 w-5 text-sky-500"/> },
      { time: "01:00 PM", temp: "31°C", condition: "Sunny", icon: <Sun className="h-5 w-5 text-yellow-500"/> },
      { time: "04:00 PM", temp: "30°C", condition: "Clouds Gathering", icon: <Cloud className="h-5 w-5 text-gray-500"/> },
      { time: "07:00 PM", temp: "27°C", condition: "Clear Night", icon: <Moon className="h-5 w-5 text-blue-300"/> },
    ]
  };
};


export default function WeatherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.date as string; 

  let formattedDate = "N/A";
  let pageTitleDate = "Weather Details";
  if (dateParam) {
    try {
      const parsed = parseISO(dateParam);
      formattedDate = format(parsed, "EEEE, MMMM d, yyyy");
      pageTitleDate = format(parsed, "MMMM d");
    } catch (error) {
      console.error("Error parsing date:", dateParam, error);
    }
  }
  
  const mockDetailedWeatherData = getMockDetailedDataForDate(dateParam || new Date().toISOString().split('T')[0]);


  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
        <ChevronLeft className="mr-2 h-5 w-5" /> Back to Forecast
      </Button>
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-primary">
            <CloudSun className="mr-3 h-6 sm:h-7 w-6 sm:w-7" />
            Weather Details
          </CardTitle>
          <CardDescription className="text-sm sm:text-md">
            Forecast for: {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-foreground">{mockDetailedWeatherData.temp}</p>
            <p className="text-lg text-muted-foreground capitalize">{mockDetailedWeatherData.condition}</p>
            <p className="text-sm text-muted-foreground">Feels like: {mockDetailedWeatherData.feelsLike}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <Droplets className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-muted-foreground">Humidity</p>
                <p className="font-semibold">{mockDetailedWeatherData.humidity}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <Wind className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-muted-foreground">Wind</p>
                <p className="font-semibold">{mockDetailedWeatherData.wind}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <Thermometer className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-muted-foreground">Pressure</p>
                <p className="font-semibold">{mockDetailedWeatherData.pressure}</p>
              </div>
            </div>
             <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <Sun className="h-5 w-5 mr-2 text-yellow-500" />
              <div>
                <p className="text-muted-foreground">UV Index</p>
                <p className="font-semibold">{mockDetailedWeatherData.uvIndex}</p>
              </div>
            </div>
             <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
              <div>
                <p className="text-muted-foreground">Precipitation</p>
                <p className="font-semibold">{mockDetailedWeatherData.precipitationChance}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted/50 rounded-lg sm:col-span-1"> {/* Adjusted for 3 col layout */}
               {/* Placeholder for another detail or empty */}
            </div>
          </div>

           <div className="grid grid-cols-2 gap-4 text-sm pt-2">
             <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <Sunrise className="h-5 w-5 mr-2 text-orange-400" />
                <div>
                  <p className="text-muted-foreground">Sunrise</p>
                  <p className="font-semibold">{mockDetailedWeatherData.sunrise}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <Sunset className="h-5 w-5 mr-2 text-orange-600" />
                <div>
                  <p className="text-muted-foreground">Sunset</p>
                  <p className="font-semibold">{mockDetailedWeatherData.sunset}</p>
                </div>
              </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold my-4 text-primary">Hourly Overview for {pageTitleDate} (Mock)</h3>
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {mockDetailedWeatherData.hourlyForecast.map((hour, index) => (
                <Card key={index} className="p-3 shadow-sm rounded-lg min-w-[100px] flex-shrink-0 text-center">
                  <p className="text-xs font-medium">{hour.time}</p>
                  <div className="my-1 flex justify-center">{hour.icon}</div>
                  <p className="text-sm font-semibold">{hour.temp}</p>
                  <p className="text-xs text-muted-foreground capitalize truncate">{hour.condition}</p>
                </Card>
              ))}
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Detailed weather information is illustrative and uses mock data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

