import React, { useState } from 'react';
import { PersonaId, PersonalizedWeatherFeed, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  X,
  HeartPulse,
  Flame,
  Waves,
  Plane,
  Baby,
  Sprout,
  Car,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase
} from 'lucide-react';

interface PersonaDetailModalProps {
  personaId: PersonaId;
  weather: PersonalizedWeatherFeed;
  lang: LanguageCode;
  onClose: () => void;
}

export const PersonaDetailModal: React.FC<PersonaDetailModalProps> = ({
  personaId,
  weather,
  lang,
  onClose
}) => {
  const t = TRANSLATIONS[lang];
  const personaText = t.personas[personaId];

  // State for interactive packing checklist in Traveler view
  const [packingList, setPackingList] = useState([
    { id: 1, item: 'Carry a raincoat in London (80% rain likelihood)', done: true },
    { id: 2, item: 'Compact Windproof Umbrella', done: false },
    { id: 3, item: 'SPF 50+ Sunscreen & Polarized Sunglasses (Goa)', done: false },
    { id: 4, item: 'Fleece Windbreaker & Thermal Innerwear (Shimla)', done: false },
    { id: 5, item: 'Waterproof Phone Pouch for Coastal Excursions', done: true }
  ]);

  const togglePackingItem = (id: number) => {
    setPackingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const [activeSeason, setActiveSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif');
  const [schoolShift, setSchoolShift] = useState<'morning' | 'afternoon'>('morning');

  // Header background theme per persona
  const getHeaderTheme = () => {
    switch (personaId) {
      case 'health':
        return 'from-emerald-700 via-emerald-600 to-teal-700';
      case 'fitness':
        return 'from-orange-600 via-amber-600 to-orange-700';
      case 'beach':
        return 'from-cyan-700 via-cyan-600 to-blue-700';
      case 'traveller':
        return 'from-purple-700 via-purple-600 to-indigo-700';
      case 'parent':
        return 'from-pink-700 via-pink-600 to-rose-700';
      case 'commuter':
        return 'from-blue-700 via-indigo-600 to-slate-800';
      case 'agriculture':
        return 'from-lime-700 via-emerald-700 to-teal-800';
      case 'events':
        return 'from-amber-600 via-orange-600 to-yellow-600';
    }
  };

  const getPersonaIcon = () => {
    switch (personaId) {
      case 'health': return <HeartPulse className="w-6 h-6 text-white" />;
      case 'fitness': return <Flame className="w-6 h-6 text-white" />;
      case 'beach': return <Waves className="w-6 h-6 text-white" />;
      case 'traveller': return <Plane className="w-6 h-6 text-white" />;
      case 'parent': return <Baby className="w-6 h-6 text-white" />;
      case 'commuter': return <Car className="w-6 h-6 text-white" />;
      case 'agriculture': return <Sprout className="w-6 h-6 text-white" />;
      case 'events': return <CalendarCheck className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-hidden bg-slate-50 text-slate-800 rounded-3xl shadow-2xl flex flex-col border border-slate-200">
        {/* Vibrant Gradient Header matching video frame 0:21 */}
        <div className={`bg-gradient-to-r ${getHeaderTheme()} p-5 text-white relative`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shrink-0">
                {getPersonaIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-white leading-tight">
                    {personaText.name}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                    {lang === 'hi' ? 'प्राथमिक श्रेणी' : 'Primary Focus'}
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium mt-1">
                  {weather.location.name}, {weather.location.state} • {personaText.cardTitle || personaText.tagline}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explainability Chip & Live Tag */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/20 text-xs">
            <span className="bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-medium">
              {t.becauseYouFollow} <strong>{personaText.name}</strong>
            </span>
            <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-white flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t.liveBadge}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* ================= PERSONA 1: HEALTH ================= */}
          {personaId === 'health' && (
            <div className="space-y-3.5">
              {/* Recommendation Callout */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1">
                  Air & Health Recommendation
                </span>
                <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                  Air is moderate ({weather.health.aqi.current} AQI). Mask suggested if sensitive to dust or morning smog.
                </p>
              </div>

              {/* Simplified Hourly AQI */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800">
                    Hourly Air Quality
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {weather.health.aqi.current} AQI • {weather.health.aqi.status}
                  </span>
                </div>

                {/* Clean, Simple Hourly Pills */}
                <div className="grid grid-cols-6 gap-1.5 text-center">
                  {[
                    { time: 'Now', aqi: weather.health.aqi.current, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { time: '1 PM', aqi: 88, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { time: '2 PM', aqi: 82, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { time: '3 PM', aqi: 76, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { time: '4 PM', aqi: 72, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { time: '5 PM', aqi: 68, color: 'text-emerald-600', dot: 'bg-emerald-500' }
                  ].map((slot, i) => (
                    <div
                      key={i}
                      className="py-2.5 px-1 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-[11px] text-slate-400 font-medium">{slot.time}</span>
                      <span className={`text-base font-extrabold ${slot.color}`}>{slot.aqi}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${slot.dot}`} />
                    </div>
                  ))}
                </div>

                {/* Simple 1-line Particulate Matter Summary */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                  <span>PM2.5: <strong className="text-slate-800">{weather.health.aqi.pm25} µg/m³</strong></span>
                  <span>•</span>
                  <span>PM10: <strong className="text-slate-800">{weather.health.aqi.pm10} µg/m³</strong></span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">Low Irritant</span>
                </div>
              </div>

              {/* Simplified Pollen Summary */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 mb-2.5">
                  Pollen & Allergy Index
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Grass Pollen</span>
                    <span className="text-xs font-bold text-amber-600 mt-0.5 block">Moderate</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Tree Pollen</span>
                    <span className="text-xs font-bold text-emerald-600 mt-0.5 block">Low</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block font-medium">Fungal Spores</span>
                    <span className="text-xs font-bold text-emerald-600 mt-0.5 block">Low</span>
                  </div>
                </div>
              </div>

              {/* Health Guidelines & Precautions */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Health Guidelines & Precautions
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Morning smog concentrations are highest between <strong>6:00 AM - 8:00 AM</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>High UV radiation: Wear SPF 30+ sunscreen if outdoors over 20 minutes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Respiratory vulnerability: Asthmatic patients keep rescue inhalers accessible.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= PERSONA 2: FITNESS ================= */}
          {personaId === 'fitness' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Optimal Exercise Windows
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                    <span className="text-[11px] text-slate-500 block font-medium">Morning Running Window</span>
                    <span className="text-sm font-bold text-orange-700 block mt-1">
                      {weather.fitness.bestRunningHours.morningWindow}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Optimal Air Index</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 block font-medium">Evening Slot</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1">
                      {weather.fitness.bestRunningHours.eveningWindow}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Cooling Breeze</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Activity Suitability (1-10 Scale)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {weather.fitness.activityRatings.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{act.activity}</span>
                      <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {act.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs text-xs text-slate-700 space-y-1.5">
                <p>🌅 <strong>Sunrise:</strong> {weather.fitness.astronomy.sunrise} • <strong>Sunset:</strong> {weather.fitness.astronomy.sunset}</p>
                <p>💨 <strong>Wind Speed:</strong> {weather.fitness.wind.speedKmph} km/h • {weather.fitness.wind.impactOnCycling}</p>
                <p>💧 <strong>Hydration:</strong> {weather.fitness.heatAlert.hydrationReminder}</p>
              </div>
            </div>
          )}

          {/* ================= PERSONA 3: COMMUTER ================= */}
          {personaId === 'commuter' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Traffic & Weather Delay Index
                  </h4>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    +{weather.commuter.trafficWeatherCorrelation.delayMinutes} mins delay
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {weather.commuter.trafficWeatherCorrelation.primaryCause}
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  🚦 <strong>Suggested Departure Slot:</strong> {weather.commuter.bestDepartureSlot}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Road Visibility & Highway Hazards
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Atmospheric Visibility:</span>
                    <strong className="text-slate-900">{weather.commuter.visibility.distanceMeters} m ({weather.commuter.visibility.status})</strong>
                  </div>
                  <p className="text-slate-600">{weather.commuter.visibility.drivingSpeedLimitAdvice}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= PERSONA 4: BEACH ================= */}
          {personaId === 'beach' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Tide & Surf Parameters
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                    <span className="text-[11px] text-slate-500 block">Next High Tide</span>
                    <strong className="text-sm text-cyan-800 mt-1 block">{weather.beach.tides.nextHighTide.split('(')[0]}</strong>
                    <span className="text-[10px] text-cyan-700">Peak {weather.beach.tides.highTideHeightM}m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Wave Height & Swell</span>
                    <strong className="text-sm text-slate-900 mt-1 block">{weather.beach.wave.heightM}m ({weather.beach.wave.heightFt}ft)</strong>
                    <span className="text-[10px] text-slate-500">Period {weather.beach.wave.swellPeriodSec}s</span>
                  </div>
                </div>
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700">
                  ⚐ <strong>Lifeguard Flag:</strong> {weather.beach.flagStatus} Flag ({weather.beach.flagMeaning})
                </div>
              </div>
            </div>
          )}

          {/* ================= PERSONA 5: TRAVELER ================= */}
          {personaId === 'traveller' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Interactive Smart Packing Checklist
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Context-aware suggestions based on London rain, Goa beach, and Shimla mountain forecasts:
                </p>
                <div className="space-y-2.5">
                  {packingList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => togglePackingItem(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-colors shadow-2xs ${
                        item.done
                          ? 'bg-purple-50/70 border-purple-200 text-purple-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs pr-3 leading-relaxed">{item.item}</span>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${item.done ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'}`}>
                        {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= PERSONA 6: PARENT ================= */}
          {personaId === 'parent' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  School Hours Weather Outlook
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Morning Drop (6-9 AM)</span>
                    <strong className="text-sm text-pink-800 mt-1 block">{weather.parent.schoolHours.morningDropOff.tempC}°C</strong>
                    <span className="text-[10px] text-pink-700">{weather.parent.schoolHours.morningDropOff.rainProbability}% Rain • {weather.parent.schoolHours.morningDropOff.recommendation}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Pick-Up (2-4 PM)</span>
                    <strong className="text-sm text-amber-800 mt-1 block">{weather.parent.schoolHours.afternoonPickUp.tempC}°C</strong>
                    <span className="text-[10px] text-amber-700">{weather.parent.schoolHours.afternoonPickUp.rainProbability}% Rain • Extra water bottle</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PERSONA 7: AGRICULTURE ================= */}
          {personaId === 'agriculture' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Soil Moisture & 7-Day Rainfall
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <p>Surface Soil Moisture: <strong>{weather.agriculture.soilMoisture.surfacePercentage}% ({weather.agriculture.soilMoisture.status})</strong></p>
                  <p>Cumulative 7-Day Rainfall: <strong>{weather.agriculture.totalRainfallPredictedMm} mm</strong></p>
                  <p className="p-2 rounded-lg bg-lime-50 border border-lime-200 text-lime-900 mt-2">
                    🌾 <strong>ICAR Advisory:</strong> {weather.agriculture.cropAdvisories[0]?.actionItem}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= PERSONA 8: EVENTS ================= */}
          {personaId === 'events' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Outdoor Event Suitability Score
                </h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-black text-amber-600">{weather.events.eventSuitabilityScore} / 10</span>
                  <span className="text-xs text-slate-500 font-medium">Comfort Index {weather.events.comfortIndex.score}/100</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{weather.events.plannerTips[0]}</p>
                <span className="text-[11px] font-bold text-slate-500 block">Recommended Backup Dates:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {weather.events.recommendedBackupDates.map((d, i) => (
                    <span key={i} className="text-xs font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                      ⭐ {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Official Attributions matching video */}
          <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
            Official Attributions: Central Pollution Control Board (CPCB) & IMD
          </div>
        </div>

        {/* Modal Bottom Close Button matching video */}
        <div className="p-3 bg-white border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Back to Home Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
