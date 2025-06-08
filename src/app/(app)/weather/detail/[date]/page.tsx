
// src/app/(app)/weather/detail/[date]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, CloudSun, Thermometer, Wind, Droplets, Sun, CloudRain, Cloud, 
  Sunrise, Sunset, Moon, CloudMoon, CloudDrizzle, CloudLightning, CloudSnow, CloudFog,
  Loader2, AlertTriangle, MapPin
} from "lucide-react";
import { format, parseISO, fromUnixTime, isSameDay } from 'date-fns';
import React, { useState, useEffect, useCallback } from 'react';

const OPENWEATHERMAP_API_KEY = "f771ba6953523ed0706f829f70e2d063";
const DEFAULT_LATITUDE = 21.2514; // Raipur Latitude
const DEFAULT_LONGITUDE = 81.6296; // Raipur Longitude

interface WeatherLocation {
  latitude: number;
  longitude: number;
}

interface HourlyForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
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
  };
  visibility: number;
  pop: number; // Probability of precipitation
  dt_txt: string;
}

interface TransformedHourlyForecast {
  time: string;
  temp: string;
  condition: string;
  icon: JSX.Element;
  feelsLike: string;
  humidity: string;
  wind: string;
  pop: string;
}

interface DayDetails {
  locationName: string;
  country: string;
  sunrise: string;
  sunset: string;
  // We might add aggregated daily min/max temp here if needed
}

const getWeatherIcon = (iconCode: string, sizeClass = "h-5 w-5"): JSX.Element => {
  switch (iconCode) {
    case "01d": return <Sun className={`${sizeClass} text-yellow-400`} />;
    case "01n": return <Moon className={`${sizeClass} text-blue-300`} />;
    case "02d": return <CloudSun className={`${sizeClass} text-sky-500`} />;
    case "02n": return <CloudMoon className={`${sizeClass} text-sky-400`} />;
    case "03d": case "03n": return <Cloud className={`${sizeClass} text-gray-400`} />;
    case "04d": case "04n": return <Cloud className={`${sizeClass} text-gray-500`} />;
    case "09d": case "09n": return <CloudDrizzle className={`${sizeClass} text-blue-400`} />;
    case "10d": return <CloudRain className={`${sizeClass} text-blue-500`} />;
    case "10n": return <CloudRain className={`${sizeClass} text-blue-400`} />;
    case "11d": case "11n": return <CloudLightning className={`${sizeClass} text-yellow-500`} />;
    case "13d": case "13n": return <CloudSnow className={`${sizeClass} text-blue-300`} />;
    case "50d": case "50n": return <CloudFog className={`${sizeClass} text-gray-400`} />;
    default: return <CloudSun className={`${sizeClass} text-sky-500`} />;
  }
};

export default function WeatherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.date as string; 

  const [hourlyForecasts, setHourlyForecasts] = useState<TransformedHourlyForecast[]>([]);
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<WeatherLocation | null>(null);
   const [usedDefaultLocation, setUsedDefaultLocation] = useState(false);


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
  
  const fetchWeatherDataForDate = useCallback(async (latitude: number, longitude: number, targetDateStr: string) => {
    setIsLoading(true);
    setError(null);
    setHourlyForecasts([]);
    setDayDetails(null);

    try {
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch weather: ${response.status} ${errorData.message || response.statusText}`);
      }
      const data = await response.json();

      if (!data.list || !data.city) {
        throw new Error("Weather data from API is incomplete or in an unexpected format.");
      }
      
      const targetDate = parseISO(targetDateStr);

      const relevantHourlyData = data.list.filter((item: HourlyForecastItem) => 
        isSameDay(fromUnixTime(item.dt), targetDate)
      );

      const transformedHourly: TransformedHourlyForecast[] = relevantHourlyData.map((item: HourlyForecastItem) => ({
        time: format(fromUnixTime(item.dt), "h:mm a"),
        temp: `${Math.round(item.main.temp)}°C`,
        condition: item.weather[0].description,
        icon: getWeatherIcon(item.weather[0].icon),
        feelsLike: `${Math.round(item.main.feels_like)}°C`,
        humidity: `${item.main.humidity}%`,
        wind: `${Math.round(item.wind.speed * 3.6)} km/h`, // m/s to km/h
        pop: `${Math.round(item.pop * 100)}%`,
      }));
      setHourlyForecasts(transformedHourly);

      setDayDetails({
        locationName: data.city.name,
        country: data.city.country,
        sunrise: format(fromUnixTime(data.city.sunrise), "h:mm a"),
        sunset: format(fromUnixTime(data.city.sunset), "h:mm a"),
      });

    } catch (err) {
      console.error("Error fetching detailed weather data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching detailed weather.");
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!dateParam) {
      setError("Date parameter is missing.");
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported. Showing default location weather (Raipur).");
      setUsedDefaultLocation(true);
      fetchWeatherDataForDate(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, dateParam);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setUsedDefaultLocation(false);
        fetchWeatherDataForDate(latitude, longitude, dateParam);
      },
      (geoError) => {
        let errorMsg = "Unable to retrieve your location. ";
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED: errorMsg += "Permission denied."; break;
          case geoError.POSITION_UNAVAILABLE: errorMsg += "Information unavailable."; break;
          case geoError.TIMEOUT: errorMsg += "Request timed out."; break;
          default: errorMsg += "Unknown error."; break;
        }
        setError(errorMsg + " Showing default location weather (Raipur).");
        setUsedDefaultLocation(true);
        setCurrentLocation({ latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE });
        fetchWeatherDataForDate(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, dateParam);
      }
    );
  }, [dateParam, fetchWeatherDataForDate]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading detailed weather...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold text-center">Error Loading Details</p>
          <p className="text-sm text-center whitespace-pre-wrap">{error}</p>
        </div>
      );
    }

    if (!dayDetails || hourlyForecasts.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <p>No detailed forecast available for this date.</p>
        </div>
      );
    }

    return (
      <>
        <CardDescription className="text-center text-sm text-muted-foreground -mt-2 mb-4 capitalize flex items-center justify-center">
           <MapPin className="h-4 w-4 mr-1 text-primary" /> 
           {usedDefaultLocation ? "Raipur, Chhattisgarh" : (() => {
              if (!dayDetails) return "Loading location...";
              
              const locNameTrimmed = dayDetails.locationName.trim();
              const countryCodeTrimmed = dayDetails.country.trim();

              if (!locNameTrimmed) return countryCodeTrimmed.toUpperCase() || "Unknown Location";
              if (!countryCodeTrimmed) return locNameTrimmed;
              
              const normLocName = locNameTrimmed.toLowerCase();
              const normCountryCode = countryCodeTrimmed.toLowerCase();

              // Check if locNameTrimmed already ends with the countryCode (potentially with a comma and/or space)
              // e.g. "City, CC" or "City CC" or "City, State, CC" or "City, State CC"
              if (normLocName.endsWith(normCountryCode)) {
                  const partBeforeCountry = normLocName.substring(0, normLocName.length - normCountryCode.length).trim();
                  if (partBeforeCountry.endsWith(",")) {
                      return locNameTrimmed; // e.g. locName is "City, CC"
                  } else if (partBeforeCountry === "" && normLocName === normCountryCode) {
                      return locNameTrimmed; // locName is just "CC"
                  } else if (partBeforeCountry.length > 0 && !partBeforeCountry.endsWith(",")){
                      // This handles cases like "City CC" -> returns "City CC"
                      // or if locName is "City, State CC"
                      return locNameTrimmed;
                  }
              }
              // If not cleanly ending or country code not obviously part of it, append.
              return `${locNameTrimmed}, ${countryCodeTrimmed.toUpperCase()}`;
           })()}
        </CardDescription>
        {usedDefaultLocation && error && !error.includes("Date parameter is missing.") && (
            <Card className="bg-yellow-50 border-yellow-300 text-yellow-700 p-3 mb-4">
                <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                <p className="text-xs">{error.replace(" Showing default location weather (Raipur).", "")}</p>
                </div>
            </Card>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
            <Sunrise className="h-6 w-6 mr-3 text-orange-400" />
            <div>
                <p className="text-muted-foreground">Sunrise</p>
                <p className="font-semibold text-base">{dayDetails.sunrise}</p>
            </div>
            </div>
            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
            <Sunset className="h-6 w-6 mr-3 text-orange-600" />
            <div>
                <p className="text-muted-foreground">Sunset</p>
                <p className="font-semibold text-base">{dayDetails.sunset}</p>
            </div>
            </div>
        </div>
        
        <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Hourly Forecast for {pageTitleDate}</h3>
            {hourlyForecasts.length > 0 ? (
            <div className="flex overflow-x-auto space-x-3 pb-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent -mx-1 px-1">
                {hourlyForecasts.map((hour, index) => (
                <Card key={index} className="p-3 shadow-sm rounded-lg min-w-[120px] flex-shrink-0 text-center bg-card hover:bg-muted/50">
                    <p className="text-sm font-medium">{hour.time}</p>
                    <div className="my-1.5 flex justify-center">{React.cloneElement(hour.icon, { className: "h-7 w-7" })}</div>
                    <p className="text-lg font-semibold">{hour.temp}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate" title={hour.condition}>{hour.condition}</p>
                    <p className="text-xs text-muted-foreground">Feels: {hour.feelsLike}</p>
                    <p className="text-xs text-blue-500"><Droplets className="inline h-3 w-3 mr-0.5" />{hour.pop}</p>
                </Card>
                ))}
            </div>
            ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hourly data for this day.</p>
            )}
        </div>
        <p className="text-xs text-center text-muted-foreground pt-6">
            Weather data provided by OpenWeatherMap.
        </p>
      </>
    );
  };


  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-0 inline-flex items-center text-primary hover:text-primary/80">
        <ChevronLeft className="mr-2 h-5 w-5" /> Back to Forecast
      </Button>
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-primary">
            <CloudSun className="mr-3 h-6 sm:h-7 w-6 sm:w-7" />
            Detailed Forecast
          </CardTitle>
          <CardDescription className="text-sm sm:text-md">
            3-Hourly breakdown for: {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

