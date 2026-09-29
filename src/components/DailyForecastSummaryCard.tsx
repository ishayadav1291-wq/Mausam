import React from 'react';
import { PersonaId, PersonalizedWeatherFeed, LanguageCode } from '../types';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Activity,
  Waves,
  Compass,
  Shield,
  Sprout,
  Navigation,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';

interface DailyForecastSummaryCardProps {
  primaryPersona: PersonaId;
  weather: PersonalizedWeatherFeed;
  cityName: string;
  lang: LanguageCode;
  onOpenDetail: (personaId: PersonaId) => void;
  onChangePersona?: () => void;
}

export const DailyForecastSummaryCard: React.FC<DailyForecastSummaryCardProps> = ({
  primaryPersona,
  weather,
  cityName,
  lang,
  onOpenDetail,
  onChangePersona
}) => {
  // Generate human-readable, one-sentence weather outlook tailored to primary persona
  const getSentenceOutlook = (): { sentence: string; highlight: string; metricBadge: string } => {
    const isHi = lang === 'hi';
    const city = cityName.split(',')[0].trim();
    const temp = `${weather.currentTempC}°C`;
    const cond = weather.condition.toLowerCase();

    switch (primaryPersona) {
      case 'health': {
        const aqi = weather.health.aqi.current;
        const status = weather.health.aqi.status;
        if (isHi) {
          return {
            sentence: `${city} में ${temp} और ${status} वायु गुणवत्ता (${aqi} AQI) के साथ ${cond} मौसम रहेगा; संवेदनशील व्यक्तियों को दोपहर में बाहरी गतिविधियां सीमित रखनी चाहिए।`,
            highlight: `${status} वायु गुणवत्ता (${aqi} AQI)`,
            metricBadge: `🫁 ${aqi} AQI · ${status}`
          };
        }
        return {
          sentence: `Expect ${cond} skies at ${temp} with an AQI of ${aqi} (${status}), so ${
            aqi > 150
              ? 'sensitive groups should wear an N95 mask and limit prolonged outdoor exertion.'
              : aqi > 100
              ? 'outdoor air is moderate; keep intense exertion to the morning hours.'
              : 'air quality is clean and favorable for outdoor activities all day.'
          }`,
          highlight: `${aqi} AQI (${status})`,
          metricBadge: `🫁 ${aqi} AQI · ${status}`
        };
      }

      case 'fitness': {
        const window = weather.fitness.bestRunningHours.morningWindow;
        const rating = weather.fitness.bestRunningHours.idealRating;
        if (isHi) {
          return {
            sentence: `${city} में सुबह ${window} के बीच ${temp} पर बाहरी दौड़ व कसरत के लिए परिस्थितियां सर्वाधिक अनुकूल रहेंगी।`,
            highlight: `${window} सर्वोत्तम समय`,
            metricBadge: `🏃 ${window} · ${rating}`
          };
        }
        return {
          sentence: `Your prime outdoor training window in ${city} is ${window} with ${temp} temperatures and ${rating.toLowerCase()} conditions before midday heat builds.`,
          highlight: `${window} (${rating})`,
          metricBadge: `🏃 ${window} · ${rating}`
        };
      }

      case 'beach': {
        const sea = weather.beach.seaCondition;
        const swell = weather.beach.wave.heightM;
        const tide = weather.beach.tides.nextHighTide;
        if (isHi) {
          return {
            sentence: `तटीय क्षेत्रों में ${sea} समुद्र और ${swell}मी तरंगों के साथ ${tide} पर उच्च ज्वार का अनुमान है; तटवर्ती सैर के लिए दिन सामान्य रहेगा।`,
            highlight: `${sea} समुद्र (${swell}m)`,
            metricBadge: `🌊 ${sea} · ${swell}m swell`
          };
        }
        return {
          sentence: `Coastal waters in ${city} feature ${sea.toLowerCase()} conditions with ${swell}m swells and high tide at ${tide}, offering ${
            weather.beach.flagStatus === 'Red'
              ? 'rough waters requiring caution away from open surf.'
              : 'safe conditions for beachside walks and approved watersports.'
          }`,
          highlight: `${sea} Waters`,
          metricBadge: `🌊 ${sea} · ${swell}m Swell`
        };
      }

      case 'traveller': {
        const feels = `${weather.feelsLikeC}°C`;
        if (isHi) {
          return {
            sentence: `${city} में ${temp} (महसूस ${feels}) के साथ यात्रा अनुकूल रहेगी; हल्के सूती कपड़े और एक कॉम्पैक्ट छाता साथ रखना सुरक्षित रहेगा।`,
            highlight: `यात्रा अनुकूल (${temp})`,
            metricBadge: `🧳 ${temp} · ${weather.condition}`
          };
        }
        return {
          sentence: `Comfortable travel weather ahead in ${city} at ${temp} (feels like ${feels}) with low weather turbulence, making light layers and a compact umbrella ideal for your itinerary.`,
          highlight: `Comfortable ${temp}`,
          metricBadge: `🧳 ${temp} · Feels ${feels}`
        };
      }

      case 'parent': {
        const dropTemp = `${weather.parent.schoolHours.morningDropOff.tempC}°C`;
        const dropCond = weather.parent.schoolHours.morningDropOff.condition;
        if (isHi) {
          return {
            sentence: `सुबह स्कूल के समय ${city} में ${dropTemp} पर ${dropCond} मौसम रहेगा और बच्चों के खुले खेल के लिए दिन सुरक्षित है।`,
            highlight: `स्कूल अनुकूल (${dropTemp})`,
            metricBadge: `🎒 ${dropTemp} · Safe Outings`
          };
        }
        return {
          sentence: `School drop-off in ${city} will be smooth at ${dropTemp} with ${dropCond.toLowerCase()} skies, providing a mild, safe environment for playground activities.`,
          highlight: `Mild & Safe (${dropTemp})`,
          metricBadge: `🎒 ${dropTemp} · Playground Safe`
        };
      }

      case 'agriculture': {
        const moisture = weather.agriculture.soilMoisture.surfacePercentage;
        if (isHi) {
          return {
            sentence: `खेतों में ${moisture}% मृदा नमी और ${weather.humidityPercentage}% आर्द्रता के साथ आज सुबह फसल छिड़काव व सिंचाई के लिए परिस्थितियां उपयुक्त हैं।`,
            highlight: `${moisture}% मृदा नमी`,
            metricBadge: `🌱 ${moisture}% Soil Moisture`
          };
        }
        return {
          sentence: `Adequate soil moisture at ${moisture}% combined with ${weather.humidityPercentage}% humidity provides favorable morning hours for field maintenance and targeted irrigation.`,
          highlight: `${moisture}% Soil Moisture`,
          metricBadge: `🌱 ${moisture}% Moisture`
        };
      }

      case 'commuter': {
        const visKm = (weather.commuter.visibility.distanceMeters / 1000).toFixed(1);
        const flow = weather.commuter.trafficWeatherCorrelation.impactLevel;
        if (isHi) {
          return {
            sentence: `${city} में ${visKm} किमी दृश्यता और ${flow.toLowerCase()} प्रवाह के साथ आज आवागमन सुगम रहने की उम्मीद है।`,
            highlight: `${visKm} किमी दृश्यता`,
            metricBadge: `🚗 ${visKm} km Vis · ${flow}`
          };
        }
        return {
          sentence: `Clear roadway visibility of ${visKm} km and dry corridor conditions point to ${flow.toLowerCase()} transit for your daily commute across ${city}.`,
          highlight: `${visKm} km Visibility`,
          metricBadge: `🚗 ${flow} · ${visKm} km`
        };
      }

      case 'events': {
        const score = weather.events.eventSuitabilityScore;
        const comfort = weather.events.comfortIndex.category;
        if (isHi) {
          return {
            sentence: `खुले मैदान में आयोजनों के लिए ${score}/10 अनुकूलता सूचकांक और ${comfort.toLowerCase()} शाम के साथ बाहरी कार्यक्रम योजना सुरक्षित है।`,
            highlight: `${score}/10 आयोजन अनुकूलता`,
            metricBadge: `🎪 ${score}/10 Suitability`
          };
        }
        return {
          sentence: `Outdoor gatherings enjoy an event rating of ${score}/10 with ${comfort.toLowerCase()} evening air and minimal precipitation likelihood in ${city}.`,
          highlight: `${score}/10 Suitability`,
          metricBadge: `🎪 ${score}/10 Rating`
        };
      }

      default: {
        return {
          sentence: `Expect ${cond} skies at ${temp} with winds at ${weather.windSpeedKmph} km/h throughout ${city}.`,
          highlight: `${temp} · ${weather.condition}`,
          metricBadge: `⛅ ${temp}`
        };
      }
    }
  };

  const { sentence, metricBadge } = getSentenceOutlook();

  // Persona metadata icon & badges
  const getPersonaIcon = () => {
    switch (primaryPersona) {
      case 'health':
        return <Heart className="w-4 h-4 text-emerald-600" />;
      case 'fitness':
        return <Activity className="w-4 h-4 text-amber-600" />;
      case 'beach':
        return <Waves className="w-4 h-4 text-blue-600" />;
      case 'traveller':
        return <Compass className="w-4 h-4 text-purple-600" />;
      case 'parent':
        return <Shield className="w-4 h-4 text-rose-600" />;
      case 'agriculture':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'commuter':
        return <Navigation className="w-4 h-4 text-indigo-600" />;
      case 'events':
        return <Calendar className="w-4 h-4 text-pink-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  const personaLabel =
    primaryPersona.charAt(0).toUpperCase() + primaryPersona.slice(1);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/90 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-blue-300">
      {/* Subtle background ambient blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-indigo-400/10 blur-xl pointer-events-none" />

      {/* Header Row: Title + Primary Persona Focus Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
              <span>{lang === 'hi' ? 'दैनिक पूर्वानुमान सारांश' : 'Daily Forecast Summary'}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                Today
              </span>
            </h3>
          </div>
        </div>

        {/* Persona Tag */}
        <div className="flex items-center gap-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs text-[10px] font-bold text-slate-700">
            {getPersonaIcon()}
            <span>{personaLabel} Focus</span>
          </div>
          {onChangePersona && (
            <button
              type="button"
              onClick={onChangePersona}
              className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Change primary focus"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Feature: One-Sentence Human-Readable Outlook */}
      <div className="relative pl-3.5 border-l-2 border-blue-500 py-0.5 mb-3.5">
        <p className="text-xs sm:text-[13px] text-slate-800 font-semibold leading-relaxed tracking-normal">
          {sentence}
        </p>
      </div>

      {/* Bottom Micro-Metrics & Deep-Dive Action */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
        {/* Quick Micro-Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-slate-700 font-bold shadow-2xs">
            {weather.icon} {weather.currentTempC}°C
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-slate-700 font-bold shadow-2xs">
            {metricBadge}
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-slate-500 font-medium shadow-2xs">
            💨 {weather.windSpeedKmph} km/h
          </span>
        </div>

        {/* 1-Tap Action to open full persona details */}
        <button
          type="button"
          onClick={() => onOpenDetail(primaryPersona)}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <span>{lang === 'hi' ? 'विस्तार देखें' : 'View Details'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
