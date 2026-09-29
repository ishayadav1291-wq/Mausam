export type PersonaId =
  | 'health'
  | 'fitness'
  | 'beach'
  | 'traveller'
  | 'parent'
  | 'agriculture'
  | 'commuter'
  | 'events';

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'bn';

export interface PersonaMeta {
  id: PersonaId;
  name: string;
  nativeName: string;
  icon: string;
  tagline: string;
  description: string;
  color: string;
  accentBg: string;
  borderAccent: string;
}

export interface CityLocation {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  isCoastal?: boolean;
  isHilly?: boolean;
}

export interface SavedLocationItem {
  id: string;
  label: string;
  cityName: string;
  lat: number;
  lon: number;
  category: 'home' | 'college' | 'office' | 'travel' | 'gym' | 'park' | 'custom';
  icon?: string;
  createdAt: string;
}

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

export interface UserPreferences {
  userId: string;
  language: LanguageCode;
  selectedPersonas: PersonaId[]; // Max 3
  primaryPersona: PersonaId;
  savedLocations: SavedLocationItem[];
  severeWeatherAlerts: boolean;
  temperatureUnit: 'C' | 'F';
  updatedAt: string;
}

// Health Persona Data
export interface HealthData {
  aqi: {
    current: number;
    status: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
    color: string;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    healthImpact: string;
    graph24h: { time: string; aqi: number }[];
    dominantPollutant?: string;
  };
  pollen: {
    level: 'Low' | 'Moderate' | 'High' | 'Very High';
    dominantType: string;
    allergyRisk: 'Minimal' | 'Mild' | 'High' | 'Severe';
    recommendation: string;
  };
  uvIndex: {
    current: number;
    status: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
    peakStart: string;
    peakEnd: string;
    recommendation: string;
  };
  humidity: {
    value: number;
    status: 'Dry' | 'Ideal' | 'Humid' | 'Oppressive';
    comfortIndex: string;
  };
  advisories: string[];
}

// Fitness Persona Data
export interface FitnessData {
  bestRunningHours: {
    morningWindow: string;
    eveningWindow: string;
    idealRating: 'Optimal' | 'Good' | 'Moderate' | 'Avoid';
    rationale: string;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    goldenHourMorning: string;
    goldenHourEvening: string;
  };
  wind: {
    speedKmph: number;
    direction: string;
    gustKmph: number;
    impactOnCycling: 'Headwind Noticeable' | 'Calm' | 'Challenging Gusts' | 'Tailwind Support';
  };
  heatAlert: {
    active: boolean;
    heatIndexC: number;
    warningLevel: 'Safe' | 'Caution' | 'Extreme Caution' | 'Danger';
    hydrationReminder: string;
  };
  hourlyTempTrend: { time: string; temp: number; feelsLike: number }[];
  hydrationMultiplier?: string;
  recoveryIndex?: string;
  activityRatings: {
    activity: 'Running' | 'Cycling' | 'Outdoor Yoga' | 'Brisk Walking';
    score: number; // 1-10
    bestTime: string;
    badge: 'Best' | 'Good' | 'Fair';
  }[];
}

// Beach & Surfers Data
export interface BeachData {
  beachName: string;
  seaCondition: 'Calm' | 'Moderate' | 'Choppy' | 'Rough' | 'Very Rough';
  flagStatus: 'Green' | 'Yellow' | 'Red';
  flagMeaning: string;
  tides: {
    nextHighTide: string;
    nextLowTide: string;
    highTideHeightM: number;
    lowTideHeightM: number;
    chart: { time: string; heightM: number }[];
  };
  wave: {
    heightM: number;
    heightFt: number;
    swellDirection: string;
    swellPeriodSec: number;
    surfingSuitability: 'Excellent' | 'Good' | 'Beginner Only' | 'Hazardous';
  };
  waterTemperatureC: number;
  safetyScore: number; // 1-10
  beachAdvisories: string[];
}

// Travelers Data
export interface TravelerData {
  savedDestinations: {
    id: string;
    city: string;
    country: string;
    tempC: number;
    condition: string;
    icon: string;
    rainProbability: number;
    alert?: string;
  }[];
  flightWeatherAlerts: {
    airportCode: string;
    airportName: string;
    severity: 'Normal' | 'Advisory' | 'Delay Risk' | 'Severe Warning';
    alertText: string;
  }[];
  packingSuggestions: {
    destination: string;
    category: 'Essential' | 'Clothing' | 'Weather Gear' | 'Health';
    item: string;
    reason: string;
  }[];
}

// Parents & Families Data
export interface ParentData {
  schoolHours: {
    morningDropOff: {
      timeRange: string;
      tempC: number;
      condition: string;
      rainProbability: number;
      recommendation: string;
      trafficDelayRisk: 'Low' | 'Medium' | 'High';
    };
    afternoonPickUp: {
      timeRange: string;
      tempC: number;
      condition: string;
      rainProbability: number;
      heatWarning: string;
      recommendation: string;
    };
  };
  rainTimeline: { time: string; rainProb: number; intensity: 'None' | 'Light Drizzle' | 'Shower' | 'Downpour' }[];
  schoolClosureRisk: 'Normal' | 'Monitor Forecast' | 'Potential Alert' | 'Emergency Advisory';
  outdoorRecessSafety: {
    status: 'Safe for Play' | 'Shade Recommended' | 'Indoor Play Advised';
    reason: string;
    safeWindow: string;
  };
  familyTips: string[];
}

// Agriculture & Gardeners Data
export interface AgricultureData {
  soilMoisture: {
    surfacePercentage: number;
    rootZonePercentage: number;
    status: 'Deficit' | 'Optimal' | 'Saturated' | 'Waterlogged';
    irrigationAdvice: string;
  };
  sevenDayRainfall: {
    day: string;
    expectedMm: number;
    probability: number;
  }[];
  totalRainfallPredictedMm: number;
  frostAlert: {
    risk: boolean;
    lowestTempC: number;
    warningText: string;
  };
  cropAdvisories: {
    season: 'Kharif' | 'Rabi' | 'Zaid';
    crop: string;
    stage: string;
    actionItem: string;
    urgency: 'Routine' | 'Immediate' | 'Preventive';
  }[];
  pestDiseaseRisk: string;
}

// Commuters Data
export interface CommuterData {
  trafficWeatherCorrelation: {
    impactLevel: 'Smooth' | 'Minor Delays' | 'Heavy Congestion' | 'Gridlock Warning';
    delayMinutes: number;
    primaryCause: string;
  };
  visibility: {
    distanceMeters: number;
    status: 'Clear' | 'Moderate Fog' | 'Dense Fog' | 'Hazardous Smog';
    drivingSpeedLimitAdvice: string;
  };
  activeHighwayAlerts: {
    corridor: string;
    hazard: 'Waterlogging' | 'Dense Fog' | 'Strong Crosswinds' | 'Flash Shower';
    advice: string;
  }[];
  bestDepartureSlot: string;
}

// Event Planners Data
export interface EventPlannerData {
  fourteenDayOutlook: {
    date: string;
    day: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    condition: string;
    comfortScore: number; // 0-100
    suitability: 'Ideal' | 'Good' | 'Fair' | 'Risky';
  }[];
  comfortIndex: {
    score: number; // 0-100
    category: 'Splendid & Breezy' | 'Pleasant' | 'Humid & Sticky' | 'Overheated';
    humidityFactor: number;
    windFactor: number;
  };
  eventSuitabilityScore: number; // 1-10
  recommendedBackupDates: string[];
  plannerTips: string[];
}

export interface SevereWeatherAlert {
  id: string;
  headline: string;
  severity: 'warning' | 'severe' | 'extreme'; // Yellow / Orange / Red
  color: 'yellow' | 'orange' | 'red';
  urgency: 'Immediate' | 'Expected' | 'Future';
  event: string;
  senderName: string;
  description: string;
  instruction: string;
  effective: string;
  expires: string;
  areas: string[];
}

// Complete Weather Feed per location
export interface PersonalizedWeatherFeed {
  location: CityLocation;
  currentTempC: number;
  feelsLikeC: number;
  condition: string;
  icon: string;
  windSpeedKmph: number;
  humidityPercentage: number;
  pressureHpa: number;
  lastUpdated: string;
  confidence: 'live' | 'estimated';
  confidenceReason: string;
  severeAlert?: SevereWeatherAlert | null;
  health: HealthData;
  fitness: FitnessData;
  beach: BeachData;
  traveller: TravelerData;
  parent: ParentData;
  agriculture: AgricultureData;
  commuter: CommuterData;
  events: EventPlannerData;
}
