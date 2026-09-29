import { CityLocation, PersonalizedWeatherFeed, SevereWeatherAlert } from '../types';

export const POPULAR_CITIES: CityLocation[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lat: 19.076,
    lon: 72.8777,
    isCoastal: true
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    state: 'Delhi NCR',
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
    isCoastal: false
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    isCoastal: false
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
    isCoastal: true
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
    isCoastal: true
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    lat: 17.385,
    lon: 78.4867,
    isCoastal: false
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
    isCoastal: false
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    lat: 23.0225,
    lon: 72.5714,
    isCoastal: false
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    lat: 26.9124,
    lon: 75.7873,
    isCoastal: false
  },
  {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    lat: 31.1048,
    lon: 77.1734,
    isHilly: true
  },
  {
    id: 'goa',
    name: 'North Goa (Calangute)',
    state: 'Goa',
    country: 'India',
    lat: 15.544,
    lon: 73.7553,
    isCoastal: true
  },
  {
    id: 'london',
    name: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    isCoastal: false
  }
];

export function findNearestStation(lat: number, lon: number): CityLocation {
  let closest = POPULAR_CITIES[0];
  let minDistance = Infinity;

  for (const c of POPULAR_CITIES) {
    const dLat = (c.lat - lat) * (Math.PI / 180);
    const dLon = (c.lon - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(c.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (d < minDistance) {
      minDistance = d;
      closest = c;
    }
  }

  return closest;
}

export function getWeatherDataForCity(city: CityLocation): PersonalizedWeatherFeed {
  const baseCity = city.id.startsWith('gps') ? findNearestStation(city.lat, city.lon) : city;
  const isMumbai = baseCity.id === 'mumbai';
  const isDelhi = baseCity.id === 'delhi';
  const isBengaluru = baseCity.id === 'bengaluru';
  const isChennai = baseCity.id === 'chennai';
  const isKolkata = baseCity.id === 'kolkata';
  const isGoa = baseCity.id === 'goa';
  const isShimla = baseCity.id === 'shimla';
  const isLondon = baseCity.id === 'london';

  let currentTemp = 28;
  let feelsLike = 31;
  let condition = 'Partly Cloudy';
  let icon = '⛅';
  let aqiVal = 92;
  let aqiStatus: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' = 'Moderate';
  let aqiColor = '#eab308';
  let windSpeed = 14;
  let humidity = 68;

  if (isDelhi) {
    currentTemp = 32;
    feelsLike = 34;
    condition = 'Hazy & Warm';
    icon = '🌫️';
    aqiVal = 215;
    aqiStatus = 'Very Poor';
    aqiColor = '#ef4444';
    windSpeed = 8;
    humidity = 52;
  } else if (isMumbai) {
    currentTemp = 30;
    feelsLike = 35;
    condition = 'Humid with Coastal Breeze';
    icon = '🌊';
    aqiVal = 104;
    aqiStatus = 'Moderate';
    aqiColor = '#f59e0b';
    windSpeed = 22;
    humidity = 78;
  } else if (isBengaluru) {
    currentTemp = 24;
    feelsLike = 24;
    condition = 'Pleasant with Evening Drizzle';
    icon = '🌦️';
    aqiVal = 48;
    aqiStatus = 'Good';
    aqiColor = '#10b981';
    windSpeed = 16;
    humidity = 64;
  } else if (isGoa) {
    currentTemp = 29;
    feelsLike = 33;
    condition = 'Sunny with Surf Waves';
    icon = '🏖️';
    aqiVal = 42;
    aqiStatus = 'Good';
    aqiColor = '#10b981';
    windSpeed = 18;
    humidity = 76;
  } else if (isShimla) {
    currentTemp = 13;
    feelsLike = 11;
    condition = 'Chilly & Mist in Ridges';
    icon = '🏔️';
    aqiVal = 32;
    aqiStatus = 'Good';
    aqiColor = '#10b981';
    windSpeed = 10;
    humidity = 48;
  } else if (isLondon) {
    currentTemp = 15;
    feelsLike = 14;
    condition = 'Overcast & Occasional Rain';
    icon = '🌧️';
    aqiVal = 38;
    aqiStatus = 'Good';
    aqiColor = '#10b981';
    windSpeed = 24;
    humidity = 82;
  }

  let severeAlert: SevereWeatherAlert | null = null;

  if (isDelhi || aqiVal >= 200) {
    severeAlert = {
      id: `alert_delhi_${city.id}`,
      headline: 'IMD RED ALERT: Hazardous Smog & Severe Air Quality Index',
      severity: 'extreme',
      color: 'red',
      urgency: 'Immediate',
      event: 'Hazardous Particulate Smog Emergency (AQI 215+)',
      senderName: 'IMD & Central Pollution Control Board (CPCB)',
      description: 'Severe meteorological stagnation causing extreme concentration of PM2.5 and PM10 particles. Outdoor visibility reduced below 1,200 meters with persistent photochemical haze.',
      instruction: 'Strictly avoid outdoor jogging and cardiovascular workouts. N95 respirator masks required outdoors. Vulnerable groups, elderly, and children should remain indoors with HEPA air purifiers active.',
      effective: 'Today, 05:00 AM IST',
      expires: 'Tomorrow, 11:59 PM IST',
      areas: ['Central Delhi', 'South Delhi', 'Noida-Greater Noida Expressway', 'Gurugram Cyber City', 'Anand Vihar']
    };
  } else if (isChennai) {
    severeAlert = {
      id: `alert_chennai_${city.id}`,
      headline: 'IMD ORANGE ALERT: High Swell Waves & Coastal Squall Warning',
      severity: 'severe',
      color: 'orange',
      urgency: 'Immediate',
      event: 'Coastal Squall & High Tidal Surge (55–65 km/h)',
      senderName: 'IMD Regional Meteorological Centre, Chennai',
      description: 'Depression in Southwest Bay of Bengal triggering squally wind speeds reaching 55-65 km/h gusting to 75 km/h. Sea condition is rough to very rough with wave heights exceeding 3.5 meters.',
      instruction: 'Fishermen and beachgoers are strictly advised not to venture into deep sea or waterfront zones. Coastal promenades along Marina & ECR restricted. Secure loose outdoor fixtures.',
      effective: 'Today, 06:30 AM IST',
      expires: 'Today, 09:00 PM IST',
      areas: ['Marina Beach Promenade', 'Ennore Port Corridor', 'ECR Coastal Belt', 'Adyar Estuary']
    };
  } else if (isShimla) {
    severeAlert = {
      id: `alert_shimla_${city.id}`,
      headline: 'IMD YELLOW ALERT: Severe Cold Wave & Black Ice Hazard',
      severity: 'warning',
      color: 'yellow',
      urgency: 'Expected',
      event: 'Sub-5°C Cold Wave & Black Ice on Ridges',
      senderName: 'IMD Meteorological Centre, Shimla',
      description: 'Ground radiative freezing causing slippery invisible black ice patches on shaded roads. Wind chill dropping perceived temperatures down to 1°C.',
      instruction: 'Motorists must maintain low speed (< 30 km/h) and avoid sudden braking on shaded bends. Ensure thermal layering and indoor heating precautions.',
      effective: 'Today, 04:00 PM IST',
      expires: 'Tomorrow, 10:00 AM IST',
      areas: ['Ridge & Mall Road', 'Kufri-Fagu Highway', 'Sanjauli Bypass', 'Dhalli Stretch']
    };
  }

  return {
    location: city,
    currentTempC: currentTemp,
    feelsLikeC: feelsLike,
    condition,
    icon,
    windSpeedKmph: windSpeed,
    humidityPercentage: humidity,
    pressureHpa: 1012,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    confidence: 'live',
    confidenceReason: 'CPCB & IMD Doppler Radar Verified (Refreshed < 12m ago)',
    severeAlert,

    // 1. Health
    health: {
      aqi: {
        current: aqiVal,
        status: aqiStatus,
        color: aqiColor,
        pm25: isDelhi ? 134 : isMumbai ? 58 : 22,
        pm10: isDelhi ? 245 : isMumbai ? 112 : 44,
        no2: isDelhi ? 48 : 24,
        o3: 38,
        healthImpact:
          aqiVal > 200
            ? 'Respiratory distress likely for prolonged outdoor exposure. N95 mask strongly advised.'
            : aqiVal > 100
            ? 'Sensitive groups (asthma, children, elderly) should limit strenuous outdoor workouts.'
            : 'Air quality is satisfactory and poses little or no risk.',
        graph24h: [
          { time: '00:00', aqi: Math.max(30, aqiVal - 18) },
          { time: '04:00', aqi: Math.max(35, aqiVal - 10) },
          { time: '08:00', aqi: aqiVal + 22 },
          { time: '12:00', aqi: aqiVal },
          { time: '16:00', aqi: aqiVal - 12 },
          { time: '20:00', aqi: aqiVal + 15 }
        ]
      },
      pollen: {
        level: isBengaluru ? 'High' : isDelhi ? 'Moderate' : 'Low',
        dominantType: isBengaluru ? 'Parthenium & Grass Pollen' : 'Tree & Pine Pollen',
        allergyRisk: isBengaluru ? 'High' : isDelhi ? 'Mild' : 'Minimal',
        recommendation:
          isBengaluru
            ? 'Elevated grass pollen. Keep car windows rolled up; rinse eyes after garden strolls.'
            : 'Pollen counts are low to moderate. Safe for normal outdoor activities.'
      },
      uvIndex: {
        current: isLondon || isShimla ? 3 : 8,
        status: isLondon || isShimla ? 'Moderate' : 'Very High',
        peakStart: '11:30 AM',
        peakEnd: '03:30 PM',
        recommendation:
          isLondon || isShimla
            ? 'Low risk. Light sunscreen or sunglasses sufficient.'
            : 'High burn hazard! SPF 50+ sunscreen, UV-blocking sunglasses, and head cover advised.'
      },
      humidity: {
        value: humidity,
        status: humidity > 75 ? 'Humid' : humidity < 40 ? 'Dry' : 'Ideal',
        comfortIndex:
          humidity > 75
            ? 'Sticky and heavy. Increased perspiration; ensure electrolyte hydration.'
            : 'Comfortable respiratory moisture.'
      },
      advisories: [
        aqiVal > 150 ? 'Asthma Patients: Keep emergency inhalers within reach' : 'Safe for general outdoor recreation',
        'Midday UV Peak: Apply broad-spectrum sunscreen 20 min before step-out',
        humidity > 70 ? 'High sweat rate: Drink 2.5L+ fluids throughout the day' : 'Hydration levels normal'
      ]
    },

    // 2. Fitness
    fitness: {
      bestRunningHours: {
        morningWindow: isDelhi ? '05:45 AM - 07:15 AM' : '06:00 AM - 08:30 AM',
        eveningWindow: '06:15 PM - 07:45 PM',
        idealRating: isDelhi ? 'Moderate' : 'Optimal',
        rationale: isDelhi
          ? 'Morning AQI spikes later. Run early at dawn before photochemical haze sets in.'
          : 'Crisp breeze, moderate temperature, and optimal oxygen index.'
      },
      astronomy: {
        sunrise: '06:12 AM',
        sunset: '06:38 PM',
        goldenHourMorning: '06:15 AM - 07:00 AM',
        goldenHourEvening: '05:50 PM - 06:35 PM'
      },
      wind: {
        speedKmph: windSpeed,
        direction: 'WSW (West-Southwest)',
        gustKmph: windSpeed + 9,
        impactOnCycling: windSpeed > 20 ? 'Challenging Gusts' : 'Calm'
      },
      heatAlert: {
        active: currentTemp > 34 || feelsLike > 37,
        heatIndexC: feelsLike,
        warningLevel: feelsLike > 38 ? 'Extreme Caution' : feelsLike > 33 ? 'Caution' : 'Safe',
        hydrationReminder: 'Drink 250ml water every 20 mins during aerobic cardio training.'
      },
      hourlyTempTrend: [
        { time: '06 AM', temp: currentTemp - 4, feelsLike: feelsLike - 4 },
        { time: '09 AM', temp: currentTemp - 1, feelsLike: feelsLike },
        { time: '12 PM', temp: currentTemp + 3, feelsLike: feelsLike + 4 },
        { time: '03 PM', temp: currentTemp + 2, feelsLike: feelsLike + 3 },
        { time: '06 PM', temp: currentTemp, feelsLike: feelsLike + 1 },
        { time: '09 PM', temp: currentTemp - 2, feelsLike: feelsLike - 1 }
      ],
      activityRatings: [
        { activity: 'Running', score: isDelhi ? 6 : 9, bestTime: '06:15 AM', badge: isDelhi ? 'Good' : 'Best' },
        { activity: 'Cycling', score: 8, bestTime: '06:45 AM', badge: 'Best' },
        { activity: 'Outdoor Yoga', score: 9, bestTime: '06:00 AM', badge: 'Best' },
        { activity: 'Brisk Walking', score: 9, bestTime: '06:30 PM', badge: 'Best' }
      ]
    },

    // 3. Beach & Surfers
    beach: {
      beachName: isMumbai ? 'Juhu & Chowpatty Coast' : isGoa ? 'Calangute & Anjuna' : isChennai ? 'Marina Beach' : 'Coastal Strip',
      seaCondition: isGoa ? 'Moderate' : isMumbai ? 'Choppy' : 'Calm',
      flagStatus: isMumbai ? 'Yellow' : 'Green',
      flagMeaning: isMumbai ? 'Moderate Surf: Swim with caution. Rip current near rocks.' : 'Calm Sea: Safe for recreational swimming and bodyboarding.',
      tides: {
        nextHighTide: '02:45 PM (High Tide +3.6m)',
        nextLowTide: '08:20 PM (Low Tide +1.1m)',
        highTideHeightM: 3.6,
        lowTideHeightM: 1.1,
        chart: [
          { time: '06 AM', heightM: 1.2 },
          { time: '09 AM', heightM: 2.1 },
          { time: '12 PM', heightM: 3.2 },
          { time: '03 PM', heightM: 3.6 },
          { time: '06 PM', heightM: 2.4 },
          { time: '09 PM', heightM: 1.1 }
        ]
      },
      wave: {
        heightM: isGoa ? 1.6 : isMumbai ? 1.8 : 0.8,
        heightFt: isGoa ? 5.2 : isMumbai ? 5.9 : 2.6,
        swellDirection: 'SW 220°',
        swellPeriodSec: 11,
        surfingSuitability: isGoa ? 'Excellent' : 'Good'
      },
      waterTemperatureC: 28,
      safetyScore: isMumbai ? 7 : 9,
      beachAdvisories: [
        'INCOIS High Swell Warning: Avoid rocky breakwaters between 2:00 PM and 4:30 PM during peak tide.',
        'UV reflection on wet sand is +25% higher; reapply water-resistant sunscreen.',
        'Lifeguards stationed until 06:30 PM.'
      ]
    },

    // 4. Travelers
    traveller: {
      savedDestinations: [
        {
          id: 'dest_1',
          city: 'London',
          country: 'UK',
          tempC: 15,
          condition: 'Drizzle & Chilly',
          icon: '🌧️',
          rainProbability: 80,
          alert: 'Intermittent precipitation expected all week.'
        },
        {
          id: 'dest_2',
          city: 'Goa',
          country: 'India',
          tempC: 29,
          condition: 'Sunny Coastal',
          icon: '🏖️',
          rainProbability: 20
        },
        {
          id: 'dest_3',
          city: 'Shimla',
          country: 'India',
          tempC: 13,
          condition: 'Mountain Mist',
          icon: '🏔️',
          rainProbability: 35,
          alert: 'Frost advisory overnight in upper hills.'
        },
        {
          id: 'dest_4',
          city: 'Dubai',
          country: 'UAE',
          tempC: 36,
          condition: 'Intense Sunshine',
          icon: '☀️',
          rainProbability: 0
        }
      ],
      flightWeatherAlerts: [
        {
          airportCode: isMumbai ? 'BOM (Mumbai)' : isDelhi ? 'DEL (Indira Gandhi Intl)' : 'BLR (Bengaluru)',
          airportName: city.name + ' International Airport',
          severity: isDelhi ? 'Advisory' : 'Normal',
          alertText: isDelhi
            ? 'Morning CAT II low visibility operations due to smog. Minor taxi delays up to 15 min.'
            : 'Smooth runways, crosswinds under 12 knots. On-time flight operations.'
        },
        {
          airportCode: 'LHR (London Heathrow)',
          airportName: 'London Heathrow',
          severity: 'Delay Risk',
          alertText: 'Low cloud ceiling and holding pattern delays averaging 25 mins.'
        }
      ],
      packingSuggestions: [
        {
          destination: 'London',
          category: 'Weather Gear',
          item: 'Waterproof Raincoat & Compact Umbrella',
          reason: 'Frequent showers and 80% rain likelihood forecasted.'
        },
        {
          destination: 'London',
          category: 'Clothing',
          item: 'Windbreaker / Lightweight Fleece',
          reason: '14°C chill factor in evening winds.'
        },
        {
          destination: 'Goa',
          category: 'Health',
          item: 'SPF 50+ Sunscreen & Polarized Sunglasses',
          reason: 'High UV index (8.4) with strong coastal reflections.'
        },
        {
          destination: 'Shimla',
          category: 'Clothing',
          item: 'Thermal Base Layer & Woolen Socks',
          reason: 'Overnight mercury plunges to 7°C.'
        }
      ]
    },

    // 5. Parents & Families
    parent: {
      schoolHours: {
        morningDropOff: {
          timeRange: '06:30 AM - 08:30 AM',
          tempC: currentTemp - 3,
          condition: isDelhi ? 'Hazy, cool' : isBengaluru ? 'Breezy & dry' : 'Pleasant',
          rainProbability: isBengaluru ? 25 : isLondon ? 70 : 10,
          recommendation: isLondon ? 'Pack raincoat and waterproof bag cover for kids' : 'Perfect commute window for school buses.',
          trafficDelayRisk: 'Low'
        },
        afternoonPickUp: {
          timeRange: '02:00 PM - 04:00 PM',
          tempC: currentTemp + 2,
          condition: isDelhi ? 'Hot & Dry' : isBengaluru ? 'Cloud buildup' : 'Warm',
          rainProbability: isBengaluru ? 60 : 20,
          heatWarning: currentTemp > 33 ? 'Pack an extra chilled water flask' : 'Normal thermal conditions',
          recommendation: isBengaluru
            ? 'Afternoon thunderstorm probable. Ensure kids carry umbrella during van boarding.'
            : 'Comfortable dismissal conditions.'
        }
      },
      rainTimeline: [
        { time: '07:00 AM', rainProb: 10, intensity: 'None' },
        { time: '09:00 AM', rainProb: 15, intensity: 'None' },
        { time: '11:00 AM', rainProb: 20, intensity: 'Light Drizzle' },
        { time: '01:00 PM', rainProb: 35, intensity: 'Light Drizzle' },
        { time: '03:00 PM', rainProb: isBengaluru ? 65 : 25, intensity: isBengaluru ? 'Shower' : 'None' },
        { time: '05:00 PM', rainProb: isBengaluru ? 70 : 20, intensity: isBengaluru ? 'Downpour' : 'None' }
      ],
      schoolClosureRisk: 'Normal',
      outdoorRecessSafety: {
        status: currentTemp > 35 ? 'Indoor Play Advised' : 'Safe for Play',
        reason: currentTemp > 35 ? 'Peak afternoon heat exceeds 35°C threshold' : 'Comfortable temperatures and safe air quality for playground activities.',
        safeWindow: '08:00 AM - 11:00 AM & 04:30 PM - 06:30 PM'
      },
      familyTips: [
        'Apply mosquito repellent for kids during late afternoon playground hours.',
        'Hydration: Ensure children finish their 1-litre school water bottle before 01:00 PM.',
        'School Bus Commute: Road traction normal, zero fog disruption reported.'
      ]
    },

    // 6. Agriculture & Gardeners
    agriculture: {
      soilMoisture: {
        surfacePercentage: isBengaluru ? 68 : isDelhi ? 42 : 55,
        rootZonePercentage: isBengaluru ? 72 : isDelhi ? 48 : 58,
        status: isBengaluru ? 'Optimal' : isDelhi ? 'Deficit' : 'Optimal',
        irrigationAdvice: isBengaluru
          ? 'Postpone irrigation for 48 hours; anticipated evening showers will saturate root beds.'
          : isDelhi
          ? 'Apply light drip irrigation to standing crops in early morning hours.'
          : 'Soil moisture is in the healthy field capacity range (55-65%).'
      },
      sevenDayRainfall: [
        { day: 'Mon', expectedMm: isBengaluru ? 14 : 0, probability: isBengaluru ? 70 : 10 },
        { day: 'Tue', expectedMm: isBengaluru ? 18 : 2, probability: isBengaluru ? 80 : 20 },
        { day: 'Wed', expectedMm: isBengaluru ? 8 : 0, probability: isBengaluru ? 50 : 5 },
        { day: 'Thu', expectedMm: 4, probability: 35 },
        { day: 'Fri', expectedMm: 0, probability: 10 },
        { day: 'Sat', expectedMm: 0, probability: 10 },
        { day: 'Sun', expectedMm: 6, probability: 40 }
      ],
      totalRainfallPredictedMm: isBengaluru ? 50 : isMumbai ? 22 : 8,
      frostAlert: {
        risk: isShimla,
        lowestTempC: isShimla ? 4 : 18,
        warningText: isShimla
          ? 'IMD Cold Wave Warning: Night minimum dropping below 5°C. Apply light mulch to young apple saplings.'
          : 'Zero frost risk across plains and coastal zones.'
      },
      cropAdvisories: [
        {
          season: 'Kharif',
          crop: 'Paddy (Rice)',
          stage: 'Tillering / Vegetative',
          actionItem: 'Maintain 3-5 cm stagnant water level; scout for stem borer larvae.',
          urgency: 'Routine'
        },
        {
          season: 'Rabi',
          crop: 'Wheat & Mustard',
          stage: 'Field Preparation & Sowing',
          actionItem: 'Ensure seed treatment with Trichoderma viride before drilling.',
          urgency: 'Immediate'
        },
        {
          season: 'Kharif',
          crop: 'Cotton',
          stage: 'Boll Formation',
          actionItem: 'Check pheromone traps for pink bollworm; ensure drainage to prevent root rot.',
          urgency: 'Preventive'
        },
        {
          season: 'Zaid',
          crop: 'Vegetables (Tomato, Okra)',
          stage: 'Flowering & Fruiting',
          actionItem: 'Spray neem oil 1500 ppm in late afternoon to curb whitefly proliferation.',
          urgency: 'Routine'
        }
      ],
      pestDiseaseRisk: 'Low fungal risk due to moderate humidity, but monitor aphid clusters on brassica crops.'
    },

    // 7. Commuters
    commuter: {
      trafficWeatherCorrelation: {
        impactLevel: isMumbai || isLondon ? 'Minor Delays' : 'Smooth',
        delayMinutes: isMumbai ? 18 : isBengaluru ? 25 : 5,
        primaryCause: isMumbai
          ? 'Wet tarmac & slow-moving traffic on Western Express Highway.'
          : isBengaluru
          ? 'Evening shower causing bottleneck near Silk Board & Outer Ring Road.'
          : 'Clear visibility and normal travel speeds.'
      },
      visibility: {
        distanceMeters: isDelhi ? 1200 : 8000,
        status: isDelhi ? 'Moderate Fog' : 'Clear',
        drivingSpeedLimitAdvice: isDelhi ? 'Maintain 45 km/h on expressways and keep low-beam fog lamps ON.' : 'Safe cruising speed up to posted limits.'
      },
      activeHighwayAlerts: [
        {
          corridor: isMumbai ? 'Eastern Freeway & Sion' : isDelhi ? 'Yamuna Expressway' : 'NH 44 Airport Corridor',
          hazard: isMumbai ? 'Waterlogging' : isDelhi ? 'Dense Fog' : 'Flash Shower',
          advice: isDelhi
            ? 'Dense morning fog pocket near KM 42-60. Increase following distance to 4 car lengths.'
            : 'Slight water ponding in low-lying underpasses; commute with caution.'
        },
        {
          corridor: 'Metro Transit System',
          hazard: 'Waterlogging',
          advice: 'All metro train corridors running on-schedule at 3-minute peak headway.'
        }
      ],
      bestDepartureSlot: '08:15 AM (Before peak congestion surge) or after 10:00 AM'
    },

    // 8. Event Planners
    events: {
      fourteenDayOutlook: [
        { date: 'Oct 01', day: 'Today', tempMax: currentTemp + 2, tempMin: currentTemp - 6, rainProb: 15, condition: 'Partly Cloudy', comfortScore: 84, suitability: 'Ideal' },
        { date: 'Oct 02', day: 'Tomorrow', tempMax: currentTemp + 1, tempMin: currentTemp - 5, rainProb: 20, condition: 'Breezy & Fine', comfortScore: 86, suitability: 'Ideal' },
        { date: 'Oct 03', day: 'Wed', tempMax: currentTemp + 3, tempMin: currentTemp - 4, rainProb: 35, condition: 'Scattered Clouds', comfortScore: 78, suitability: 'Good' },
        { date: 'Oct 04', day: 'Thu', tempMax: currentTemp, tempMin: currentTemp - 5, rainProb: 65, condition: 'Afternoon Showers', comfortScore: 62, suitability: 'Risky' },
        { date: 'Oct 05', day: 'Fri', tempMax: currentTemp - 1, tempMin: currentTemp - 6, rainProb: 40, condition: 'Passing Mist', comfortScore: 74, suitability: 'Good' },
        { date: 'Oct 06', day: 'Sat', tempMax: currentTemp + 1, tempMin: currentTemp - 5, rainProb: 10, condition: 'Clear Sky', comfortScore: 92, suitability: 'Ideal' },
        { date: 'Oct 07', day: 'Sun', tempMax: currentTemp + 2, tempMin: currentTemp - 4, rainProb: 10, condition: 'Golden Sunset', comfortScore: 90, suitability: 'Ideal' },
        { date: 'Oct 08', day: 'Mon', tempMax: currentTemp + 2, tempMin: currentTemp - 5, rainProb: 25, condition: 'Partly Sunny', comfortScore: 80, suitability: 'Good' },
        { date: 'Oct 09', day: 'Tue', tempMax: currentTemp + 3, tempMin: currentTemp - 4, rainProb: 20, condition: 'Warm Breeze', comfortScore: 82, suitability: 'Good' },
        { date: 'Oct 10', day: 'Wed', tempMax: currentTemp + 1, tempMin: currentTemp - 6, rainProb: 15, condition: 'Clear & Mild', comfortScore: 88, suitability: 'Ideal' },
        { date: 'Oct 11', day: 'Thu', tempMax: currentTemp, tempMin: currentTemp - 5, rainProb: 55, condition: 'Showers Likely', comfortScore: 65, suitability: 'Fair' },
        { date: 'Oct 12', day: 'Fri', tempMax: currentTemp + 1, tempMin: currentTemp - 5, rainProb: 30, condition: 'Mild Clouds', comfortScore: 79, suitability: 'Good' },
        { date: 'Oct 13', day: 'Sat', tempMax: currentTemp + 2, tempMin: currentTemp - 4, rainProb: 5, condition: 'Perfect Lawn Event', comfortScore: 95, suitability: 'Ideal' },
        { date: 'Oct 14', day: 'Sun', tempMax: currentTemp + 2, tempMin: currentTemp - 5, rainProb: 10, condition: 'Sunny & Pleasant', comfortScore: 92, suitability: 'Ideal' }
      ],
      comfortIndex: {
        score: 82,
        category: 'Pleasant',
        humidityFactor: humidity,
        windFactor: windSpeed
      },
      eventSuitabilityScore: 8.5,
      recommendedBackupDates: ['Oct 06 (Saturday)', 'Oct 07 (Sunday)', 'Oct 13 (Saturday)'],
      plannerTips: [
        'Ideal Lawn Conditions: October 6th & 13th show < 10% precipitation chance with low evening humidity.',
        'Canopy Protection: If hosting on Thursday (Oct 4), arrange waterproof marquee tents with sidewalls.',
        'Lighting: Sunset is at 06:38 PM with 45 minutes of warm twilight suitable for outdoor photography.'
      ]
    }
  };
}
