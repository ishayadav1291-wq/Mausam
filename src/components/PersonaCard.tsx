import React from 'react';
import { PersonaId, PersonalizedWeatherFeed, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Heart,
  Activity,
  Waves,
  Compass,
  Shield,
  Navigation,
  Sprout,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface PersonaCardProps {
  personaId: PersonaId;
  isPrimary: boolean;
  weather: PersonalizedWeatherFeed;
  lang: LanguageCode;
  onOpenDetail: (personaId: PersonaId) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  personaId,
  isPrimary,
  weather,
  lang,
  onOpenDetail
}) => {
  const t = TRANSLATIONS[lang];
  const personaText = t.personas[personaId];

  // Specific clean visuals & typography matching reference video frame 0:12
  const getPersonaData = () => {
    switch (personaId) {
      case 'health':
        return {
          title: lang === 'hi' ? 'वायु गुणवत्ता एवं पराबैंगनी सुरक्षा रिपोर्ट' : 'Air Quality & UV',
          subtitle: lang === 'hi' ? 'क्योंकि आप स्वास्थ्य का अनुसरण करते हैं' : 'Because you follow Health',
          valueBadge: (
            <span className="text-xs font-bold text-amber-600">
              {weather.health.aqi.current} AQI
            </span>
          ),
          body:
            lang === 'hi'
              ? 'हवा में मध्यम सुधार है। संवेदनशील लोग बाहर जाते समय N95 मास्क पहनें।'
              : 'Air is moderate. Mask suggested if sensitive to dust.',
          icon: <Heart className="w-5 h-5 text-emerald-500" />,
          iconBg: 'bg-emerald-50 border-emerald-100'
        };

      case 'fitness':
        return {
          title: lang === 'hi' ? 'व्यायाम हेतु अनुकूल समय व तापीय सूचकांक' : 'Workout Hours',
          subtitle: lang === 'hi' ? 'क्योंकि आप फिटनेस का अनुसरण करते हैं' : 'Because you follow Fitness',
          valueBadge: (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              06:00 - 08:30 AM
            </span>
          ),
          body:
            lang === 'hi'
              ? 'सुबह 6:00 से 8:30 बजे के बीच दौड़ने के लिए मौसम आदर्श रहेगा।'
              : 'Best to run between 6:00 and 8:30 AM.',
          icon: <Activity className="w-5 h-5 text-amber-500" />,
          iconBg: 'bg-amber-50 border-amber-100'
        };

      case 'traveller':
        return {
          title: lang === 'hi' ? 'ऋतु आधारित मौसम व यात्रा जोखिम सूचकांक' : 'Travel Weather',
          subtitle: lang === 'hi' ? 'क्योंकि आप यात्रा का अनुसरण करते हैं' : 'Because you follow Travel',
          valueBadge: (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Low
            </span>
          ),
          body:
            lang === 'hi'
              ? 'हल्के सूती कपड़े और एक कॉम्पैक्ट छाता साथ रखें।'
              : 'Carry light clothing and a compact umbrella.',
          icon: <Compass className="w-5 h-5 text-purple-500" />,
          iconBg: 'bg-purple-50 border-purple-100'
        };

      case 'beach':
        return {
          title: lang === 'hi' ? 'तटीय लहरें व समुद्री मौसम' : 'Beach & Wave Index',
          subtitle: lang === 'hi' ? 'क्योंकि आप समुद्र तट का अनुसरण करते हैं' : 'Because you follow Beach',
          valueBadge: (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Tide: {weather.beach.tides.highTideHeightM}m
            </span>
          ),
          body:
            lang === 'hi'
              ? 'समुद्र में मध्यम लहरें हैं। तैराकी केवल निर्दिष्ट सुरक्षित क्षेत्रों में ही करें।'
              : 'Gentle coastal surf. Safe for beach walking and authorized water recreation.',
          icon: <Waves className="w-5 h-5 text-blue-500" />,
          iconBg: 'bg-blue-50 border-blue-100'
        };

      case 'parent':
        return {
          title: lang === 'hi' ? 'स्कूल आवागमन व वर्षा चेतावनी' : 'Family & School Commute',
          subtitle: lang === 'hi' ? 'क्योंकि आप परिवार का अनुसरण करते हैं' : 'Because you follow Family',
          valueBadge: (
            <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              Normal
            </span>
          ),
          body:
            lang === 'hi'
              ? 'दोपहर को स्कूल वापसी के समय धूप तेज रहेगी, पानी की अतिरिक्त बोतल साथ दें।'
              : 'Comfortable commute window; safe UV playground conditions.',
          icon: <Shield className="w-5 h-5 text-pink-500" />,
          iconBg: 'bg-pink-50 border-pink-100'
        };

      case 'commuter':
        return {
          title: lang === 'hi' ? 'मार्ग दृश्यता व यातायात संवेदी स्थिति' : 'Commute & Highway Visibility',
          subtitle: lang === 'hi' ? 'क्योंकि आप दैनिक आवागमन का अनुसरण करते हैं' : 'Because you follow Commute',
          valueBadge: (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +{weather.commuter.trafficWeatherCorrelation.delayMinutes} min
            </span>
          ),
          body:
            lang === 'hi'
              ? 'एक्सप्रेसवे पर दृश्यता सामान्य है। यातायात सुचारू रूप से चल रहा है।'
              : 'Normal transit conditions. Expressway traffic index is clear.',
          icon: <Navigation className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-50 border-blue-100'
        };

      case 'agriculture':
        return {
          title: lang === 'hi' ? 'मृदा नमी व कृषि परामर्श' : 'Farming & Soil Moisture',
          subtitle: lang === 'hi' ? 'क्योंकि आप कृषि का अनुसरण करते हैं' : 'Because you follow Farming',
          valueBadge: (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Moisture {weather.agriculture.soilMoisture.surfacePercentage}%
            </span>
          ),
          body:
            lang === 'hi'
              ? `आईसीएआर सलाह: ${weather.agriculture.cropAdvisories[0]?.actionItem}`
              : `ICAR Advisory: ${weather.agriculture.cropAdvisories[0]?.actionItem}`,
          icon: <Sprout className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-100'
        };

      case 'events':
        return {
          title: lang === 'hi' ? 'खुले मैदान में आयोजन मौसम सूचकांक' : 'Event Comfort Index',
          subtitle: lang === 'hi' ? 'क्योंकि आप आयोजन का अनुसरण करते हैं' : 'Because you follow Events',
          valueBadge: (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {weather.events.eventSuitabilityScore}/10
            </span>
          ),
          body:
            lang === 'hi'
              ? 'खुले मैदान के कार्यक्रमों के लिए मौसम अनुकूल रहेगा। वर्षा की संभावना कम है।'
              : 'Optimal outdoor conditions with pleasant temperatures and low rain risk.',
          icon: <Calendar className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-100'
        };
    }
  };

  const data = getPersonaData();

  return (
    <div
      onClick={() => onOpenDetail(personaId)}
      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Left Icon with subtle rounded background */}
        <div className={`p-2.5 rounded-2xl border shrink-0 ${data.iconBg}`}>
          {data.icon}
        </div>

        {/* Center Details matching video frame 0:13 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {data.title}
              </h3>
              {isPrimary && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-blue-600 text-white tracking-wider shrink-0">
                  MAIN
                </span>
              )}
            </div>

            {data.valueBadge}
          </div>

          <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
            {data.subtitle}
          </div>

          <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
            {data.body}
          </p>
        </div>

        {/* Right Arrow Chevron */}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
      </div>
    </div>
  );
};
