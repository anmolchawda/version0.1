
// src/app/(app)/weather/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { 
  Loader2, AlertTriangle, CloudSun, Sun, Cloud, CloudRain, Wind, Droplets,
  Moon, CloudMoon, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Sunrise, Sunset, MapPin, Thermometer, Search, LocateFixed
} from "lucide-react";
import { format, fromUnixTime, parseISO } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  locationName: string;
  country: string;
  temperature: string;
  condition: string;
  conditionIcon: JSX.Element;
  humidity: string;
  wind: string;
  sunrise: string;
  sunset: string;
  feelsLike: string;
  pressure: string;
  visibility?: string;
}

interface ForecastListItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  dt_txt: string;
}

interface DailyForecast {
  isoDate: string;
  dayName: string;
  dateStr: string;
  tempMin: string;
  tempMax: string;
  condition: string;
  conditionIcon: JSX.Element;
}

interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}


const OPENWEATHERMAP_API_KEY = "f771ba6953523ed0706f829f70e2d063";
const DEFAULT_LATITUDE = 21.2514; // Raipur Latitude
const DEFAULT_LONGITUDE = 81.6296; // Raipur Longitude
const DEFAULT_LOCATION_NAME = "Raipur, Chhattisgarh";

const getWeatherIcon = (iconCode: string, sizeClass = "h-6 w-6"): JSX.Element => {
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
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedDefaultLocation, setUsedDefaultLocation] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [currentDisplayLocation, setCurrentDisplayLocation] = useState<string>(DEFAULT_LOCATION_NAME);
  const { toast } = useToast();

  const processForecastData = (forecastList: ForecastListItem[]): DailyForecast[] => {
    const dailyData: { [date: string]: { temps: number[], icons: string[], conditions: string[] } } = {};
    forecastList.forEach(item => {
      const date = format(fromUnixTime(item.dt), "yyyy-MM-dd");
      if (!dailyData[date]) {
        dailyData[date] = { temps: [], icons: [], conditions: [] };
      }
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].icons.push(item.weather[0].icon);
      dailyData[date].conditions.push(item.weather[0].description);
    });
    
    const processedForecast: DailyForecast[] = [];
    Object.keys(dailyData).slice(0, 5).forEach(date => {
      const dayInfo = dailyData[date];
      const tempMin = Math.round(Math.min(...dayInfo.temps));
      const tempMax = Math.round(Math.max(...dayInfo.temps));
      const representativeIcon = dayInfo.icons[Math.floor(dayInfo.icons.length / 2)] || dayInfo.icons[0];
      const representativeCondition = dayInfo.conditions[Math.floor(dayInfo.conditions.length / 2)] || dayInfo.conditions[0];
      
      processedForecast.push({
        isoDate: date,
        dayName: format(parseISO(date), "EEE"),
        dateStr: format(parseISO(date), "MMM d"),
        tempMin: `${tempMin}°C`,
        tempMax: `${tempMax}°C`,
        condition: representativeCondition,
        conditionIcon: getWeatherIcon(representativeIcon, "h-5 w-5"),
      });
    });
    return processedForecast;
  };

  const fetchWeather = useCallback(async (latitude: number, longitude: number, locationName?: string) => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setDailyForecast([]);

    try {
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch weather: ${response.status} ${errorData.message || response.statusText}`);
      }
      const data = await response.json();

      if (!data.list || data.list.length === 0 || !data.city) {
        throw new Error("Weather data from API is incomplete or in an unexpected format.");
      }

      const firstForecast = data.list[0];
      const displayLocName = locationName || data.city.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
      const displayCountry = data.city.country || '';
      setCurrentDisplayLocation(displayCountry ? `${displayLocName}, ${displayCountry}` : displayLocName);

      const transformedCurrentData: WeatherData = {
        locationName: displayLocName,
        country: displayCountry,
        temperature: `${Math.round(firstForecast.main.temp)}°C`,
        condition: firstForecast.weather[0].description,
        conditionIcon: getWeatherIcon(firstForecast.weather[0].icon, "h-10 w-10"),
        humidity: `${firstForecast.main.humidity}%`,
        wind: `${Math.round(firstForecast.wind.speed * 3.6)} km/h`,
        sunrise: format(fromUnixTime(data.city.sunrise), "h:mm a"),
        sunset: format(fromUnixTime(data.city.sunset), "h:mm a"),
        feelsLike: `${Math.round(firstForecast.main.feels_like)}°C`,
        pressure: `${firstForecast.main.pressure} hPa`,
        visibility: `${(firstForecast.visibility / 1000).toFixed(1)} km`,
      };
      setWeatherData(transformedCurrentData);
      setDailyForecast(processForecastData(data.list));
      setUsedDefaultLocation(latitude === DEFAULT_LATITUDE && longitude === DEFAULT_LONGITUDE);

    } catch (err) {
      console.error("Error fetching weather data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching weather.";
      setError(errorMessage);
      toast({ title: "Weather Error", description: errorMessage, variant: "destructive"});
      if (!usedDefaultLocation && !(latitude === DEFAULT_LATITUDE && longitude === DEFAULT_LONGITUDE)) { // Avoid re-fetching default if it also failed
        setUsedDefaultLocation(true);
        setCurrentDisplayLocation(DEFAULT_LOCATION_NAME);
        fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, "Raipur");
      }
    } finally {
      setIsLoading(false);
      setIsSearchingLocation(false);
    }
  }, [usedDefaultLocation, toast]); // Removed fetchWeather from deps as it's defined outside and causes infinite loop if used directly
  
  const fetchUserGeolocationAndWeather = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setDailyForecast([]);
    setUsedDefaultLocation(false);
    setCurrentDisplayLocation("Fetching location...");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Showing weather for Raipur.");
      setCurrentDisplayLocation(DEFAULT_LOCATION_NAME);
      fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, "Raipur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude); // Name will be fetched from API
      },
      (err) => {
        let errorMsg = "Unable to retrieve your location. ";
        switch (err.code) {
          case err.PERMISSION_DENIED: errorMsg += "Location permission denied."; break;
          case err.POSITION_UNAVAILABLE: errorMsg += "Location information is unavailable."; break;
          case err.TIMEOUT: errorMsg += "The request to get user location timed out."; break;
          default: errorMsg += "An unknown error occurred."; break;
        }
        setError(errorMsg + " Showing weather for Raipur.");
        setCurrentDisplayLocation(DEFAULT_LOCATION_NAME);
        fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, "Raipur");
      }
    );
  }, [fetchWeather]);
  
  useEffect(() => {
    fetchUserGeolocationAndWeather();
  }, [fetchUserGeolocationAndWeather]); 

  const handleLocationSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!locationSearchTerm.trim()) {
      toast({ title: "Empty Search", description: "Please enter a location name.", variant: "destructive" });
      return;
    }
    setIsSearchingLocation(true);
    setError(null);
    try {
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationSearchTerm)}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;
      const response = await fetch(geocodeUrl);
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
      }
      const geoData: GeocodingResult[] = await response.json();
      if (geoData.length === 0) {
        throw new Error(`Location "${locationSearchTerm}" not found.`);
      }
      const { lat, lon, name, country, state } = geoData[0];
      const searchedLocationName = state ? `${name}, ${state}` : name;
      fetchWeather(lat, lon, searchedLocationName);
      setLocationSearchTerm(''); // Clear search input after successful search
    } catch (err) {
      console.error("Error in location search:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during location search.";
      setError(errorMessage);
      toast({ title: "Search Error", description: errorMessage, variant: "destructive" });
      setIsSearchingLocation(false);
    }
  };


  const renderWeatherContent = () => {
    if (isLoading && !isSearchingLocation) { // Show initial loading only if not also search loading
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Fetching location and weather...</p>
        </div>
      );
    }
    if (isSearchingLocation) {
         return (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Searching for {locationSearchTerm}...</p>
            </div>
        );
    }


    if (error && !weatherData && !isLoading) { // Show main error if no data and not loading
      return (
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold text-center">Error Fetching Weather</p>
          <p className="text-sm text-center mt-2 whitespace-pre-wrap">{error}</p>
          <Button onClick={fetchUserGeolocationAndWeather} className="mt-6">Try Current Location</Button>
        </div>
      );
    }

    if (!weatherData && !isLoading) { // No data and not loading (e.g. after a failed search that didn't fallback)
      return (
        <div className="text-center py-10 text-muted-foreground">
          <p>Weather data is currently unavailable for {currentDisplayLocation}.</p>
          <Button onClick={fetchUserGeolocationAndWeather} className="mt-4">Use Current Location</Button>
        </div>
      );
    }
    
    // If weatherData exists, render it, even if there was a non-critical error (like geolocation fail but default loaded)
    if (weatherData) {
      return (
        <div className="space-y-4">
          <CardDescription className="text-center text-sm text-muted-foreground -mt-2 capitalize flex items-center justify-center">
             <MapPin className="h-4 w-4 mr-1 text-primary" /> 
             {currentDisplayLocation}
          </CardDescription>
          {error && usedDefaultLocation && ( // Show specific error if default was used due to an issue
            <Card className="bg-yellow-50 border-yellow-300 text-yellow-700 p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                <p className="text-xs">{error}</p>
              </div>
            </Card>
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
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span>Pressure: {weatherData.pressure}</span>
                </div>
                {weatherData.visibility && (
                  <div className="flex items-center justify-start space-x-1.5">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye text-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Visibility: {weatherData.visibility}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {dailyForecast.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-primary">5-Day Forecast</h3>
              <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {dailyForecast.map((day) => (
                  <Link key={day.isoDate} href={`/weather/detail/${day.isoDate}`} passHref>
                    <Card className="p-3 shadow-sm rounded-lg min-w-[120px] sm:min-w-[140px] flex-shrink-0 text-center cursor-pointer hover:shadow-md transition-shadow bg-card hover:bg-muted/50">
                      <p className="text-xs font-semibold">{day.dayName}</p>
                      <p className="text-xs text-muted-foreground">{day.dateStr}</p>
                      <div className="my-1.5 flex justify-center">{day.conditionIcon}</div>
                      <p className="text-sm font-semibold">{day.tempMax} / {day.tempMin}</p>
                      <p className="text-xs text-muted-foreground capitalize truncate">{day.condition}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Weather data provided by OpenWeatherMap.
          </p>
        </div>
      );
    }
    return null; // Fallback, should be covered by other conditions
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center text-2xl font-bold text-primary">
              <CloudSun className="mr-3 h-7 w-7" />
              Weather Information
            </CardTitle>
            <Button onClick={fetchUserGeolocationAndWeather} variant="outline" size="sm" disabled={isLoading || isSearchingLocation} className="shrink-0">
              <LocateFixed className="mr-2 h-4 w-4"/> Use Current Location
            </Button>
          </div>
           <form onSubmit={handleLocationSearch} className="mt-4 flex gap-2 items-center">
            <Input 
              type="text"
              value={locationSearchTerm}
              onChange={(e) => setLocationSearchTerm(e.target.value)}
              placeholder="Search city name (e.g., London, New York)"
              className="flex-grow"
              disabled={isSearchingLocation || isLoading}
            />
            <Button type="submit" disabled={isSearchingLocation || isLoading || !locationSearchTerm.trim()} className="bg-accent hover:bg-accent/80">
              {isSearchingLocation ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {renderWeatherContent()}
        </CardContent>
      </Card>
    </div>
  );
}
