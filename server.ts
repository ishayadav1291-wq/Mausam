import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { POPULAR_CITIES, getWeatherDataForCity } from './src/data/mockWeatherData.ts';
import { PersonaId } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Helper to find city
  function resolveCity(lat?: any, lon?: any, cityName?: any) {
    if (cityName) {
      const match = POPULAR_CITIES.find(
        (c) => c.name.toLowerCase() === String(cityName).toLowerCase()
      );
      if (match) return match;
    }
    if (lat && lon) {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      // Find closest popular city
      let closest = POPULAR_CITIES[0];
      let minDistance = Number.MAX_VALUE;
      for (const c of POPULAR_CITIES) {
        const dist = Math.hypot(c.lat - latNum, c.lon - lonNum);
        if (dist < minDistance) {
          minDistance = dist;
          closest = c;
        }
      }
      return closest;
    }
    return POPULAR_CITIES[0];
  }

  // In-memory cache to prevent hitting rate limits
const mapsWeatherCache = new Map<string, { text: string; groundingMetadata: any; timestamp: number }>();
let isQuotaExhaustedCooldownUntil = 0;

function getLocalMapsWeatherGuidance(location: string, prompt: string) {
  const locLower = location.toLowerCase();
  const promptLower = prompt.toLowerCase();
  const city = POPULAR_CITIES.find(c => locLower.includes(c.name.toLowerCase())) || POPULAR_CITIES[0];
  const feed = getWeatherDataForCity(city);

  let guidanceText = '';
  const chunks: Array<{ maps?: { title: string; uri: string }; web?: { title: string; uri: string } }> = [];
  const queryEncoded = encodeURIComponent(`${city.name}`);

  if (promptLower.includes('park') || promptLower.includes('jog') || promptLower.includes('run') || promptLower.includes('walk') || promptLower.includes('fitness')) {
    if (city.id === 'mumbai') {
      guidanceText = `Best time for a run in Mumbai is ${feed.fitness.bestRunningHours.morningWindow} while temperatures are around ${feed.currentTempC - 2}°C. Recommended spots include Marine Drive Promenade and Shivaji Park for open breezes.`;
      chunks.push(
        { maps: { title: 'Marine Drive Promenade, Mumbai', uri: 'https://www.google.com/maps/search/?api=1&query=Marine+Drive+Promenade+Mumbai' } },
        { maps: { title: 'Shivaji Park, Dadar, Mumbai', uri: 'https://www.google.com/maps/search/?api=1&query=Shivaji+Park+Dadar+Mumbai' } }
      );
    } else if (city.id === 'delhi') {
      guidanceText = `Best time for a run in New Delhi is early morning between 06:00 AM - 07:30 AM before peak haze. Lodhi Garden and Nehru Park offer clean air pockets and paved tracks.`;
      chunks.push(
        { maps: { title: 'Lodhi Garden, New Delhi', uri: 'https://www.google.com/maps/search/?api=1&query=Lodhi+Garden+New+Delhi' } },
        { maps: { title: 'Nehru Park, Chanakyapuri', uri: 'https://www.google.com/maps/search/?api=1&query=Nehru+Park+Chanakyapuri+New+Delhi' } }
      );
    } else if (city.id === 'bengaluru') {
      guidanceText = `Great weather for outdoor workouts in Bengaluru (${feed.currentTempC}°C). Cubbon Park and Lalbagh Botanical Garden offer shaded, tree-lined running routes.`;
      chunks.push(
        { maps: { title: 'Cubbon Park, Bengaluru', uri: 'https://www.google.com/maps/search/?api=1&query=Cubbon+Park+Bengaluru' } },
        { maps: { title: 'Lalbagh Botanical Garden', uri: 'https://www.google.com/maps/search/?api=1&query=Lalbagh+Botanical+Garden+Bengaluru' } }
      );
    } else {
      guidanceText = `Good conditions for running in ${city.name} during ${feed.fitness.bestRunningHours.morningWindow}. Central municipal parks have clear footpaths with pleasant wind around ${feed.windSpeedKmph} km/h.`;
      chunks.push(
        { maps: { title: `${city.name} Central Public Park`, uri: `https://www.google.com/maps/search/?api=1&query=park+in+${queryEncoded}` } }
      );
    }
  } else if (promptLower.includes('rain') || promptLower.includes('umbrella') || promptLower.includes('shower')) {
    const rainProb = feed.parent.schoolHours.afternoonPickUp.rainProbability;
    guidanceText = rainProb > 35
      ? `Rain is likely in ${city.name} today (${rainProb}% probability). Carrying a compact umbrella is recommended.`
      : `No significant rain expected in ${city.name} today (${rainProb}% probability). Skies remain ${feed.condition.toLowerCase()} around ${feed.currentTempC}°C.`;
    chunks.push(
      { maps: { title: `${city.name} Doppler Weather Radar Station`, uri: `https://www.google.com/maps/search/?api=1&query=IMD+Radar+${queryEncoded}` } }
    );
  } else if (promptLower.includes('sun') || promptLower.includes('uv') || promptLower.includes('heat') || promptLower.includes('hot')) {
    guidanceText = `Current temperature in ${city.name} is ${feed.currentTempC}°C (feels like ${feed.feelsLikeC}°C) with UV index at ${feed.health.uvIndex.current} (${feed.health.uvIndex.status}). ${feed.health.uvIndex.current >= 6 ? 'Wear SPF 30+ sunscreen if you plan to be outdoors.' : 'Sun conditions are moderate today.'}`;
    chunks.push(
      { maps: { title: `${city.name} Shaded Public Corridors`, uri: `https://www.google.com/maps/search/?api=1&query=parks+in+${queryEncoded}` } }
    );
  } else if (promptLower.includes('air') || promptLower.includes('aqi') || promptLower.includes('smog') || promptLower.includes('pollution')) {
    guidanceText = `Air quality in ${city.name} is currently ${feed.health.aqi.current} AQI (${feed.health.aqi.status}). ${feed.health.aqi.current > 150 ? 'Sensitive groups should consider limiting prolonged outdoor cardio.' : 'Conditions are safe for regular outdoor activities.'}`;
    chunks.push(
      { maps: { title: `${city.name} Air Quality Station`, uri: `https://www.google.com/maps/search/?api=1&query=Air+Quality+Station+${queryEncoded}` } }
    );
  } else if (promptLower.includes('beach') || promptLower.includes('surf') || promptLower.includes('swim') || promptLower.includes('tide') || promptLower.includes('coast')) {
    guidanceText = `Coastline conditions in ${city.name} are ${feed.beach.seaCondition.toLowerCase()} with water at ${feed.beach.waterTemperatureC}°C and a ${feed.beach.flagStatus} flag (${feed.beach.flagMeaning.toLowerCase()}).`;
    chunks.push(
      { maps: { title: `${city.name} Coastline & Waterfront`, uri: `https://www.google.com/maps/search/?api=1&query=beach+in+${queryEncoded}` } }
    );
  } else if (promptLower.includes('traffic') || promptLower.includes('highway') || promptLower.includes('fog') || promptLower.includes('waterlog') || promptLower.includes('road') || promptLower.includes('commute')) {
    guidanceText = `Transit conditions in ${city.name} are normal with visibility at ${(feed.commuter.visibility.distanceMeters / 1000).toFixed(1)} km and minimal expected delays around +${feed.commuter.trafficWeatherCorrelation.delayMinutes} mins.`;
    chunks.push(
      { maps: { title: `${city.name} Arterial Corridors`, uri: `https://www.google.com/maps/search/?api=1&query=traffic+in+${queryEncoded}` } }
    );
  } else {
    guidanceText = `Current weather in ${city.name} is ${feed.currentTempC}°C and ${feed.condition.toLowerCase()} with ${feed.humidityPercentage}% humidity and ${feed.windSpeedKmph} km/h wind.`;
    chunks.push(
      { maps: { title: `${city.name} Weather Station`, uri: `https://www.google.com/maps/search/?api=1&query=IMD+Observatory+${queryEncoded}` } }
    );
  }

  return { text: guidanceText, groundingMetadata: { groundingChunks: chunks } };
}

  // 1. POST /api/feed (Personalized weather feed cards)
  app.post('/api/feed', (req, res) => {
    try {
      const { location, personas = ['health', 'fitness', 'beach'], language = 'en' } = req.body;
      const city = resolveCity(location?.lat, location?.lon, location?.city);
      const weatherFeed = getWeatherDataForCity(city);

      const cards = (personas as PersonaId[]).map((pid, idx) => {
        const isPrimary = idx === 0;
        return {
          persona: pid,
          is_primary: isPrimary,
          data: (weatherFeed as any)[pid],
          tip:
            pid === 'health'
              ? weatherFeed.health.advisories[0]
              : pid === 'fitness'
              ? weatherFeed.fitness.bestRunningHours.rationale
              : pid === 'beach'
              ? weatherFeed.beach.beachAdvisories[0]
              : pid === 'traveller'
              ? `Flight alert: ${weatherFeed.traveller.flightWeatherAlerts[0]?.alertText}`
              : pid === 'parent'
              ? weatherFeed.parent.familyTips[0]
              : pid === 'agriculture'
              ? weatherFeed.agriculture.cropAdvisories[0]?.actionItem
              : pid === 'commuter'
              ? `Departure slot: ${weatherFeed.commuter.bestDepartureSlot}`
              : weatherFeed.events.plannerTips[0],
          explainability: `Because you follow ${pid.charAt(0).toUpperCase() + pid.slice(1)}`,
          confidence: weatherFeed.confidence
        };
      });

      res.json({
        location: {
          city: city.name,
          state: city.state,
          country: city.country,
          coordinates: { lat: city.lat, lon: city.lon }
        },
        current_observation: {
          temperature_c: weatherFeed.currentTempC,
          feels_like_c: weatherFeed.feelsLikeC,
          condition: weatherFeed.condition,
          humidity: weatherFeed.humidityPercentage,
          wind_kmph: weatherFeed.windSpeedKmph
        },
        timestamp: new Date().toISOString(),
        cards
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. GET /api/health
  app.get('/api/health', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      health: feed.health,
      timestamp: new Date().toISOString()
    });
  });

  // 3. GET /api/fitness
  app.get('/api/fitness', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      fitness: feed.fitness,
      timestamp: new Date().toISOString()
    });
  });

  // 4. GET /api/beach
  app.get('/api/beach', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      beach: feed.beach,
      timestamp: new Date().toISOString()
    });
  });

  // 5. GET /api/traveller
  app.get('/api/traveller', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      traveller: feed.traveller,
      timestamp: new Date().toISOString()
    });
  });

  // 6. GET /api/parent
  app.get('/api/parent', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      parent: feed.parent,
      timestamp: new Date().toISOString()
    });
  });

  // 7. GET /api/commuter
  app.get('/api/commuter', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      commuter: feed.commuter,
      timestamp: new Date().toISOString()
    });
  });

  // 8. GET /api/agriculture
  app.get('/api/agriculture', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      agriculture: feed.agriculture,
      timestamp: new Date().toISOString()
    });
  });

  // 9. GET /api/events
  app.get('/api/events', (req, res) => {
    const city = resolveCity(req.query.lat, req.query.lon, req.query.city);
    const feed = getWeatherDataForCity(city);
    res.json({
      location: city,
      events: feed.events,
      timestamp: new Date().toISOString()
    });
  });

  // 10. POST /api/gemini/maps-weather (Maps Grounding with gemini-3.5-flash)
  app.post('/api/gemini/maps-weather', async (req, res) => {
    const { prompt, location = 'Mumbai' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check in-memory cache first to conserve API rate limits
    const cacheKey = `${location.toLowerCase().trim()}_${prompt.toLowerCase().trim()}`;
    const cached = mapsWeatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return res.json({ text: cached.text, groundingMetadata: cached.groundingMetadata });
    }

    // If quota was previously exhausted, return local maps guidance directly without throwing
    if (!ai || Date.now() < isQuotaExhaustedCooldownUntil) {
      const fallback = getLocalMapsWeatherGuidance(location, prompt);
      mapsWeatherCache.set(cacheKey, { text: fallback.text, groundingMetadata: fallback.groundingMetadata, timestamp: Date.now() });
      return res.json(fallback);
    }

    try {
      // Use gemini-3.8-flash as prescribed in the skill
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are Mausam AI, a helpful weather and location assistant for ${location}.
User query: "${prompt}".
CRITICAL: Respond in 1 to 2 short, crisp, natural sentences directly answering the user's weather question. Never use bullet points, raw markdown asterisks (**), or long headers. Keep it concise, friendly, and practical.`,
        config: {
          tools: [{ googleMaps: {} }]
        }
      });

      const text = response.text || '';
      const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata || {};

      // Cache successful response
      mapsWeatherCache.set(cacheKey, { text, groundingMetadata, timestamp: Date.now() });
      return res.json({ text, groundingMetadata });
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      console.warn('Gemini Maps API call failed or quota exceeded:', errMsg);

      // If quota exhausted (429), enter 10-minute cooldown to avoid hammering the API
      if (errMsg.includes('resource_exhausted') || errMsg.includes('quota') || errMsg.includes('429')) {
        isQuotaExhaustedCooldownUntil = Date.now() + 10 * 60 * 1000;
      }

      // Seamlessly serve instant, rich location-grounded guidance
      const localResult = getLocalMapsWeatherGuidance(location, prompt);
      mapsWeatherCache.set(cacheKey, { text: localResult.text, groundingMetadata: localResult.groundingMetadata, timestamp: Date.now() });
      return res.json(localResult);
    }
  });

  // Mount Vite or static dist
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Mausam Server running on port ${port}`);
  });
}

startServer();
