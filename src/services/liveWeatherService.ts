import { CityLocation, PersonalizedWeatherFeed } from '../types';
import { getWeatherDataForCity } from '../data/mockWeatherData';

// WMO Weather interpretation codes
function decodeWmoWeather(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
  if (code === 1) return { condition: 'Mainly Clear', icon: '🌤️' };
  if (code === 2) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { condition: 'Overcast', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Fog & Mist', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { condition: 'Snow Flurries', icon: '❄️' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Showers', icon: '🌧️' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };
  return { condition: 'Fair Weather', icon: '🌤️' };
}

// Convert US AQI to descriptive status
function getAqiStatus(aqi: number): { status: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe'; advisory: string } {
  if (aqi <= 50) return { status: 'Good', advisory: 'Air quality is satisfactory and poses little or no risk.' };
  if (aqi <= 100) return { status: 'Moderate', advisory: 'Air quality is acceptable; sensitive groups should consider masking.' };
  if (aqi <= 200) return { status: 'Poor', advisory: 'Air quality is poor; reduce prolonged outdoor exertion.' };
  if (aqi <= 300) return { status: 'Very Poor', advisory: 'Respiratory discomfort likely; wear an N95 mask outdoors.' };
  return { status: 'Severe', advisory: 'Health emergency conditions. Avoid all outdoor physical activities.' };
}

export async function fetchLiveWeatherData(
  city: CityLocation,
  isOffline = false
): Promise<{ feed: PersonalizedWeatherFeed; isLive: boolean }> {
  const cacheKey = `mausam_live_cache_${city.lat.toFixed(2)}_${city.lon.toFixed(2)}`;

  // If offline, check cache first
  if (isOffline && typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return { feed: parsed.feed, isLive: false };
      } catch {
        // Fallback
      }
    }
    return { feed: getWeatherDataForCity(city), isLive: false };
  }

  try {
    // 1. Fetch live Open-Meteo weather forecast for location
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

    // 2. Fetch live Open-Meteo Air Quality (PM2.5, PM10, US AQI)
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=pm10,pm2_5,us_aqi&timezone=auto`;

    // Parallel fetch with 4s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { signal: controller.signal }).catch(() => null),
      fetch(aqiUrl, { signal: controller.signal }).catch(() => null)
    ]);
    clearTimeout(timeoutId);

    if (!weatherRes || !weatherRes.ok) {
      throw new Error('Weather API unreachable');
    }

    const weatherJson = await weatherRes.json();
    const aqiJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

    // Base fallback feed to merge with
    const baseFeed = getWeatherDataForCity(city);

    const current = weatherJson.current || {};
    const daily = weatherJson.daily || {};

    const liveTemp = Math.round(current.temperature_2m ?? baseFeed.currentTempC);
    const liveFeelsLike = Math.round(current.apparent_temperature ?? baseFeed.feelsLikeC);
    const liveHumidity = Math.round(current.relative_humidity_2m ?? baseFeed.humidityPercentage);
    const liveWindSpeed = Math.round(current.wind_speed_10m ?? baseFeed.windSpeedKmph);
    const liveWeatherCode = current.weather_code ?? 0;
    const { condition, icon } = decodeWmoWeather(liveWeatherCode);

    // Live AQI
    const aqiVal = Math.round(aqiJson?.current?.us_aqi ?? baseFeed.health.aqi.current);
    const pm25Val = Math.round(aqiJson?.current?.pm2_5 ?? baseFeed.health.aqi.pm25);
    const pm10Val = Math.round(aqiJson?.current?.pm10 ?? baseFeed.health.aqi.pm10);
    const { status: aqiStatus, advisory: aqiAdvisory } = getAqiStatus(aqiVal);

    // Live UV Index
    const liveUv = Math.round(daily.uv_index_max?.[0] ?? baseFeed.health.uvIndex.current);

    // Merge into real-time personalized feed
    const liveFeed: PersonalizedWeatherFeed = {
      ...baseFeed,
      currentTempC: liveTemp,
      feelsLikeC: liveFeelsLike,
      condition,
      icon,
      humidityPercentage: liveHumidity,
      windSpeedKmph: liveWindSpeed,
      health: {
        ...baseFeed.health,
        aqi: {
          ...baseFeed.health.aqi,
          current: aqiVal,
          status: aqiStatus,
          dominantPollutant: pm25Val > pm10Val ? 'PM2.5' : 'PM10',
          pm25: pm25Val,
          pm10: pm10Val
        },
        uvIndex: {
          ...baseFeed.health.uvIndex,
          current: liveUv
        },
        advisories: [
          aqiAdvisory,
          ...baseFeed.health.advisories.slice(1)
        ]
      },
      fitness: {
        ...baseFeed.fitness,
        wind: {
          ...baseFeed.fitness.wind,
          speedKmph: liveWindSpeed,
          gustKmph: Math.round(liveWindSpeed * 1.3),
          impactOnCycling: liveWindSpeed > 20 ? 'Challenging Gusts' : 'Calm'
        },
        hydrationMultiplier: liveTemp > 32 ? '1.5x fluid replacement' : '1.0x baseline',
        recoveryIndex: liveTemp > 30 ? 'Electrolyte replacement required' : 'Standard hydration'
      },
      parent: {
        ...baseFeed.parent,
        schoolHours: {
          ...baseFeed.parent.schoolHours,
          morningDropOff: {
            ...baseFeed.parent.schoolHours.morningDropOff,
            tempC: liveTemp - 2,
            condition
          },
          afternoonPickUp: {
            ...baseFeed.parent.schoolHours.afternoonPickUp,
            tempC: liveTemp + 2
          }
        }
      }
    };

    // Cache to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ feed: liveFeed, timestamp: Date.now() })
        );
      } catch {
        // Quota safety
      }
    }

    return { feed: liveFeed, isLive: true };
  } catch (err) {
    console.warn('Falling back to local cached weather data:', err);

    // Try reading cache
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return { feed: parsed.feed, isLive: false };
        } catch {
          // ignore
        }
      }
    }

    return { feed: getWeatherDataForCity(city), isLive: false };
  }
}
