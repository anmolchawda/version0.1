// src/app/(app)/weather/detail/[date]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CloudSun, Thermometer, Wind, Droplets } from "lucide-react";
import { format, parseISO } from 'date-fns';

export default function WeatherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.date as string; // This will be YYYY-MM-DD

  let formattedDate = "N/A";
  if (dateParam) {
    try {
      formattedDate = format(parseISO(dateParam), "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Error parsing date:", dateParam, error);
      // Keep formattedDate as "N/A" or set to a fallback
    }
  }
  
  // Placeholder data for the detailed view
  const mockDetailedWeatherData = {
    condition: "Partly Cloudy",
    temp: "30°C",
    feelsLike: "32°C",
    humidity: "60%",
    wind: "15 km/h NE",
    pressure: "1012 hPa",
    uvIndex: "High",
    precipitationChance: "10%",
    hourlyForecast: [
      { time: "10:00 AM", temp: "28°C", icon: <CloudSun className="h-5 w-5 text-sky-500"/> },
      { time: "01:00 PM", temp: "30°C", icon: <Sun className="h-5 w-5 text-yellow-500"/> },
      { time: "04:00 PM", temp: "29°C", icon: <CloudSun className="h-5 w-5 text-sky-500"/> },
      { time: "07:00 PM", temp: "26°C", icon: <Cloud className="h-5 w-5 text-gray-500"/> },
    ]
  };


  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
        <ChevronLeft className="mr-2 h-5 w-5" /> Back to Forecast
      </Button>
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-primary">
            <CloudSun className="mr-3 h-6 sm:h-7 w-6 sm:w-7" />
            Detailed Weather
          </CardTitle>
          <CardDescription className="text-sm sm:text-md">
            Forecast for: {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-foreground">{mockDetailedWeatherData.temp}</p>
            <p className="text-lg text-muted-foreground">{mockDetailedWeatherData.condition}</p>
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
          </div>
          
          <div>
            <h3 className="text-md font-semibold my-4 text-primary">Hourly Forecast (Mock)</h3>
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {mockDetailedWeatherData.hourlyForecast.map((hour, index) => (
                <Card key={index} className="p-3 shadow-sm rounded-lg min-w-[100px] flex-shrink-0 text-center">
                  <p className="text-xs font-medium">{hour.time}</p>
                  <div className="my-1 flex justify-center">{hour.icon}</div>
                  <p className="text-sm font-semibold">{hour.temp}</p>
                </Card>
              ))}
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Detailed weather information is illustrative. This is a placeholder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
