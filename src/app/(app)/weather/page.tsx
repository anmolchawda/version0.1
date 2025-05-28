// src/app/(app)/weather/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, MapPin, CloudSun, Sun, Cloud, CloudRain, Wind, Thermometer, Droplets } from "lucide-react";
import { format, addDays } from 'date-fns';

interface WeatherData {
  locationName: string;
  temperature: string;
  condition: string;
  conditionIcon: JSX.Element;
  humidity: string;
  wind: string;
  sunrise: string;
  sunset: string;
  forecast: ForecastDay[];
}

interface ForecastDay {
  day: string;
  date: string; // Display date, e.g., "MMM d"
  isoDate: string; // URL-friendly date, e.g., "yyyy-MM-dd"
  icon: JSX.Element;
  tempHigh: string;
  tempLow: string;
  condition: string;
}

const getMockWeatherData = (lat: number, lon: number): WeatherData => {
  const conditions = [
    { name: "Sunny", icon: <Sun className="h-10 w-10 text-yellow-500" /> },
    { name: "Partly Cloudy", icon: <CloudSun className="h-10 w-10 text-sky-500" /> },
    { name: "Cloudy", icon: <Cloud className="h-10 w-10 text-gray-500" /> },
    { name: "Rainy", icon: <CloudRain className="h-10 w-10 text-blue-500" /> },
  ];
  const randomCondition = () => conditions[Math.floor(Math.random() * conditions.length)];

  const forecastDays: ForecastDay[] = [];
  const today = new Date();
  for (let i = 1; i <= 10; i++) {
    const forecastDate = addDays(today, i);
    const dayCondition = randomCondition();
    forecastDays.push({
      day: format(forecastDate, "EEE"), // e.g., Mon, Tue
      date: format(forecastDate, "MMM d"), // e.g., May 29
      isoDate: format(forecastDate, "yyyy-MM-dd"),
      icon: React.cloneElement(dayCondition.icon, {className: "h-7 w-7"}),
      tempHigh: `${28 + Math.floor(Math.random() * 8)}°C`,
      tempLow: `${20 + Math.floor(Math.random() * 7)}°C`,
      condition: dayCondition.name,
    });
  }
  const currentCondition = randomCondition();

  return {
    locationName: `Weather for Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)} (Mock Data - India Focus)`,
    temperature: `${25 + Math.floor(Math.random() * 10)}°C`,
    condition: currentCondition.name,
    conditionIcon: currentCondition.icon,
    humidity: `${50 + Math.floor(Math.random() * 30)}%`,
    wind: `${5 + Math.floor(Math.random() * 15)} km/h`,
    sunrise: "6:05 AM",
    sunset: "6:45 PM",
    forecast: forecastDays,
  };
};

export default function WeatherPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationAndWeather = () => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        const mockData = getMockWeatherData(latitude, longitude);
        setWeatherData(mockData);
        setIsLoading(false);
      },
      (err) => {
        let errorMsg = "Unable to retrieve your location. ";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg += "Location permission denied.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg += "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            errorMsg += "The request to get user location timed out.";
            break;
          default:
            errorMsg += "An unknown error occurred.";
            break;
        }
        setError(errorMsg + " Please ensure location services are enabled for your browser and this site.");
        setIsLoading(false);
      }
    );
  };
  
  useEffect(() => {
    fetchLocationAndWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const renderWeatherContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Fetching location and weather...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold text-center">Error Fetching Weather</p>
          <p className="text-sm text-center mt-2">{error}</p>
          <Button onClick={fetchLocationAndWeather} className="mt-6">Try Again</Button>
        </div>
      );
    }

    if (!weatherData) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <p>Weather data is currently unavailable.</p>
          <Button onClick={fetchLocationAndWeather} className="mt-4">Fetch Weather</Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <CardDescription className="text-center text-sm text-muted-foreground -mt-2">
          {weatherData.locationName}
        </CardDescription>

        {/* Current Weather */}
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-primary/20 via-card to-accent/10">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="text-6xl font-bold text-primary">{weatherData.temperature}</div>
            <div className="flex items-center space-x-2">
              {React.cloneElement(weatherData.conditionIcon, { className: "h-8 w-8" })}
              <p className="text-xl text-foreground">{weatherData.condition}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm w-full max-w-xs pt-3">
              <div className="flex items-center justify-start space-x-1.5">
                <Droplets className="h-4 w-4 text-primary" />
                <span>Humidity: {weatherData.humidity}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                <Wind className="h-4 w-4 text-primary" />
                <span>Wind: {weatherData.wind}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                <Sun className="h-4 w-4 text-yellow-400" /> 
                <span>Sunrise: {weatherData.sunrise}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                 <CloudSun className="h-4 w-4 text-orange-400" /> 
                <span>Sunset: {weatherData.sunset}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">10-Day Forecast</h3>
          <div className="flex overflow-x-auto space-x-3 pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {weatherData.forecast.map((day) => (
              <Link key={day.isoDate} href={`/weather/detail/${day.isoDate}`} passHref>
                <Card 
                  className="p-3 shadow-md rounded-lg min-w-[140px] sm:min-w-[160px] flex-shrink-0 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                >
                  <CardTitle className="text-sm font-medium mb-1">{day.day}</CardTitle>
                  <p className="text-xs text-muted-foreground mb-1.5">{day.date}</p>
                  <div className="flex items-center justify-center mb-1">
                     {day.icon}
                  </div>
                  <p className="text-base font-semibold text-center">{day.tempHigh} / <span className="text-muted-foreground">{day.tempLow}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5 text-center truncate">{day.condition}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
         <p className="text-xs text-center text-muted-foreground pt-4">
            Weather data is illustrative. For accurate forecasts, please use a dedicated weather service. This feature is intended for India.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <CloudSun className="mr-3 h-7 w-7" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderWeatherContent()}
        </CardContent>
      </Card>
    </div>
  );
}
