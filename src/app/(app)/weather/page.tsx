
// src/app/(app)/weather/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, AlertTriangle, CloudSun, Sun, Cloud, CloudRain, Wind, Droplets,
  Moon, CloudMoon, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Sunrise, Sunset, MapPin
} from "lucide-react";
import { format, fromUnixTime } from 'date-fns';

interface WeatherData {
  locationName: string;
  temperature: string;
  condition: string;
  conditionIcon: JSX.Element;
  humidity: string;
  wind: string;
  sunrise: string;
  sunset: string;
  feelsLike: string;
  pressure: string;
  visibility: string;
}

const OPENWEATHERMAP_API_KEY = "f771ba6953523ed0706f829f70e2d063"; 
const DEFAULT_LATITUDE = 21.2514; // Raipur Latitude
const DEFAULT_LONGITUDE = 81.6296; // Raipur Longitude
const DEFAULT_LOCATION_NAME = "Raipur, Chhattisgarh";

const getWeatherIcon = (iconCode: string, sizeClass = "h-10 w-10"): JSX.Element => {
  switch (iconCode) {
    case "01d": return <Sun className={`${sizeClass} text-yellow-500`} />;
    case "01n": return <Moon className={`${sizeClass} text-blue-300`} />;
    case "02d": return <CloudSun className={`${sizeClass} text-sky-500`} />;
    case "02n": return <CloudMoon className={`${sizeClass} text-sky-400`} />;
    case "03d": case "03n": return <Cloud className={`${sizeClass} text-gray-500`} />;
    case "04d": case "04n": return <Cloud className={`${sizeClass} text-gray-600`} />;
    case "09d": case "09n": return <CloudDrizzle className={`${sizeClass} text-blue-500`} />;
    case "10d": return <CloudRain className={`${sizeClass} text-blue-600`} />;
    case "10n": return <CloudRain className={`${sizeClass} text-blue-500`} />;
    case "11d": case "11n": return <CloudLightning className={`${sizeClass} text-yellow-400`} />;
    case "13d": case "13n": return <CloudSnow className={`${sizeClass} text-blue-300`} />;
    case "50d": case "50n": return <CloudFog className={`${sizeClass} text-gray-400`} />;
    default: return <CloudSun className={`${sizeClass} text-sky-500`} />;
  }
};

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedDefaultLocation, setUsedDefaultLocation] = useState(false);

  const fetchWeather = useCallback(async (latitude: number, longitude: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch weather: ${response.status} ${errorData.message || response.statusText}`);
      }
      const data = await response.json();

      if (!data.weather || !data.main || !data.wind || !data.sys) {
        throw new Error("Weather data from API is incomplete.");
      }

      const transformedData: WeatherData = {
        locationName: data.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
        temperature: `${Math.round(data.main.temp)}°C`,
        condition: data.weather[0].description,
        conditionIcon: getWeatherIcon(data.weather[0].icon),
        humidity: `${data.main.humidity}%`,
        wind: `${Math.round(data.wind.speed * 3.6)} km/h`, // m/s to km/h
        sunrise: format(fromUnixTime(data.sys.sunrise), "h:mm a"),
        sunset: format(fromUnixTime(data.sys.sunset), "h:mm a"),
        feelsLike: `${Math.round(data.main.feels_like)}°C`,
        pressure: `${data.main.pressure} hPa`,
        visibility: `${(data.visibility / 1000).toFixed(1)} km`,
      };
      setWeatherData(transformedData);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching weather.");
      // Fallback to default location if API call fails for any reason
      if (!usedDefaultLocation) { // Avoid infinite loop if default location also fails
        console.log("API fetch failed, attempting default location: Raipur");
        setUsedDefaultLocation(true); // Mark that we've tried the default
        fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
      }
    } finally {
      setIsLoading(false);
    }
  }, [usedDefaultLocation]); // Add usedDefaultLocation to dependency array
  
  const fetchLocationAndWeather = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setUsedDefaultLocation(false); // Reset default location flag

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Showing weather for Raipur.");
      setUsedDefaultLocation(true);
      fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
      setIsLoading(false); // Already handled by fetchWeather
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
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
        setError(errorMsg + " Showing weather for Raipur.");
        setUsedDefaultLocation(true);
        fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        // setIsLoading(false) will be handled by fetchWeather
      }
    );
  }, [fetchWeather]);
  
  useEffect(() => {
    fetchLocationAndWeather();
  }, [fetchLocationAndWeather]); 

  const renderWeatherContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Fetching location and weather...</p>
        </div>
      );
    }

    if (error && !weatherData) { // Show error only if no weather data is available (e.g. initial load with error)
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
      <div className="space-y-4">
        <CardDescription className="text-center text-sm text-muted-foreground -mt-2 capitalize flex items-center justify-center">
           <MapPin className="h-4 w-4 mr-1 text-primary" /> {usedDefaultLocation ? DEFAULT_LOCATION_NAME : weatherData.locationName}
        </CardDescription>
         {error && usedDefaultLocation && ( // Show specific error message if default location was used due to an error
          <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-700">
            <AlertTriangle className="h-4 w-4 !text-yellow-600" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-primary/20 via-card to-accent/10">
          <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-2">
            <div className="text-5xl sm:text-6xl font-bold text-primary">{weatherData.temperature}</div>
            <div className="flex items-center space-x-2">
              {React.cloneElement(weatherData.conditionIcon, { className: "h-7 w-7 sm:h-8 sm:w-8" })}
              <p className="text-lg sm:text-xl text-foreground capitalize">{weatherData.condition}</p>
            </div>
            <p className="text-xs text-muted-foreground">Feels like: {weatherData.feelsLike}</p>
            
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm w-full max-w-md pt-3">
              <div className="flex items-center justify-start space-x-1.5">
                <Droplets className="h-4 w-4 text-primary" />
                <span>Humidity: {weatherData.humidity}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                <Wind className="h-4 w-4 text-primary" />
                <span>Wind: {weatherData.wind}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                <Sunrise className="h-4 w-4 text-yellow-400" /> 
                <span>Sunrise: {weatherData.sunrise}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                 <Sunset className="h-4 w-4 text-orange-400" /> 
                <span>Sunset: {weatherData.sunset}</span>
              </div>
               <div className="flex items-center justify-start space-x-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gauge-circle text-primary"><path d="M15.8 2.9A10 10 0 0 0 8.2 2.9"/><path d="M12 12c-1.94 0-3.5-1.56-3.5-3.5S10.06 5 12 5s3.5 1.56 3.5 3.5S13.94 12 12 12z"/><path d="M12 12a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM7 12a5 5 0 0 1 5-5"/><path d="M12 22a5 5 0 0 0 5-5"/></svg>
                <span>Pressure: {weatherData.pressure}</span>
              </div>
              <div className="flex items-center justify-start space-x-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye text-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Visibility: {weatherData.visibility}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-center text-muted-foreground pt-2">
          Current weather data provided by OpenWeatherMap.
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
        <CardContent className="p-4 sm:p-6">
          {renderWeatherContent()}
        </CardContent>
      </Card>
    </div>
  );
}

