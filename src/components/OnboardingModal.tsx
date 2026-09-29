import React, { useState } from 'react';
import { PersonaId, LanguageCode, CityLocation } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { POPULAR_CITIES, findNearestStation } from '../data/mockWeatherData';
import {
  X,
  Check,
  MapPin,
  Search,
  Navigation,
  Compass,
  Heart,
  Activity,
  Waves,
  Shield,
  Sprout,
  Calendar,
  Radar
} from 'lucide-react';

interface OnboardingModalProps {
  currentLanguage: LanguageCode;
  selectedPersonas: PersonaId[];
  selectedCity: CityLocation;
  isFirstTime?: boolean;
  onSave: (lang: LanguageCode, personas: PersonaId[], city: CityLocation) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentLanguage,
  selectedPersonas: initialPersonas,
  selectedCity: initialCity,
  isFirstTime = false,
  onSave,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(isFirstTime ? 1 : 2);
  const [lang, setLang] = useState<LanguageCode>(currentLanguage);
  const [personas, setPersonas] = useState<PersonaId[]>(initialPersonas);
  const [city, setCity] = useState<CityLocation>(initialCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const t = TRANSLATIONS[lang];

  // Specific 8 personas matching screenshots
  const personaCardsConfig: {
    id: PersonaId;
    title: string;
    sub: string;
    icon: React.ReactNode;
    iconBg: string;
  }[] = [
    {
      id: 'health',
      title: 'Health',
      sub: 'Air quality and UV levels.',
      icon: <Heart className="w-5 h-5 text-emerald-500" />,
      iconBg: 'bg-emerald-50 border-emerald-100'
    },
    {
      id: 'fitness',
      title: 'Fitness',
      sub: 'Workout and running hours.',
      icon: <Activity className="w-5 h-5 text-amber-500" />,
      iconBg: 'bg-amber-50 border-amber-100'
    },
    {
      id: 'beach',
      title: 'Beach',
      sub: 'Tides and wave height.',
      icon: <Waves className="w-5 h-5 text-blue-500" />,
      iconBg: 'bg-blue-50 border-blue-100'
    },
    {
      id: 'traveller',
      title: 'Travel',
      sub: 'Trip weather and packing.',
      icon: <Compass className="w-5 h-5 text-purple-500" />,
      iconBg: 'bg-purple-50 border-purple-100'
    },
    {
      id: 'parent',
      title: 'Family',
      sub: 'School commute and rain alerts.',
      icon: <Shield className="w-5 h-5 text-pink-500" />,
      iconBg: 'bg-pink-50 border-pink-100'
    },
    {
      id: 'commuter',
      title: 'Commute',
      sub: 'Road visibility and traffic.',
      icon: <Navigation className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100'
    },
    {
      id: 'agriculture',
      title: 'Farming',
      sub: 'Soil moisture and rain.',
      icon: <Sprout className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100'
    },
    {
      id: 'events',
      title: 'Events',
      sub: 'Outdoor comfort and rain chance.',
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100'
    }
  ];

  const togglePersona = (id: PersonaId) => {
    if (personas.includes(id)) {
      if (personas.length === 1) return; // Keep at least 1
      setPersonas(personas.filter((p) => p !== id));
    } else {
      if (personas.length < 3) {
        setPersonas([...personas, id]);
      }
    }
  };

  const handleFinish = () => {
    if (personas.length === 0) return;
    onSave(lang, personas, city);
    onClose();
  };

  const handleGpsDetect = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const nearest = findNearestStation(lat, lon);
          const gpsLoc: CityLocation = {
            id: 'gps_current',
            name: `${nearest.name}`,
            state: `GPS Live • ${nearest.state}`,
            country: 'India',
            lat,
            lon,
            isCoastal: nearest.isCoastal,
            isHilly: nearest.isHilly
          };
          setCity(gpsLoc);
          setIsDetectingGps(false);
        },
        () => {
          const detected = POPULAR_CITIES[0];
          setCity({
            id: 'gps_current',
            name: `${detected.name}`,
            state: `GPS Active • ${detected.state}`,
            country: 'India',
            lat: detected.lat,
            lon: detected.lon,
            isCoastal: detected.isCoastal,
            isHilly: detected.isHilly
          });
          setIsDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const detected = POPULAR_CITIES[0];
      setCity({
        id: 'gps_current',
        name: `${detected.name}`,
        state: `GPS Active • ${detected.state}`,
        country: 'India',
        lat: detected.lat,
        lon: detected.lon
      });
      setIsDetectingGps(false);
    }
  };

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-10 sm:pb-12 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[82vh] sm:max-h-[86vh] bg-white text-slate-800 rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Header matching user screenshots: Centered title, subtitle, and 3 progress indicator dots */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-slate-100 relative shrink-0">
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* M Logo matching video frame 0:00 */}
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-500/20 mx-auto mb-2.5">
            M
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {step === 1 && (lang === 'hi' ? 'अपनी भाषा चुनें' : 'Select Your Language')}
            {step === 2 && (lang === 'hi' ? 'अपनी श्रेणियां चुनें' : 'Choose Your Personas')}
            {step === 3 && (lang === 'hi' ? 'अपना स्थान चुनें' : 'Select Your Location')}
          </h2>

          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {step === 1 && (lang === 'hi' ? 'व्यक्तिगत पूर्वानुमान के लिए' : 'Choose your preferred language')}
            {step === 2 && (lang === 'hi' ? '1 से 3 फ़ोकस क्षेत्र चुनें' : 'Select 1 to 3 focus areas')}
            {step === 3 && (lang === 'hi' ? 'अपना शहर चुनें' : 'Choose your city')}
          </p>

          {/* 3 Progress Dots matching screenshot */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span
              className={`rounded-full transition-all duration-300 ${
                step === 1 ? 'w-7 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-blue-200'
              }`}
            />
            <span
              className={`rounded-full transition-all duration-300 ${
                step === 2 ? 'w-7 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-blue-200'
              }`}
            />
            <span
              className={`rounded-full transition-all duration-300 ${
                step === 3 ? 'w-7 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-blue-200'
              }`}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-3.5">
          {/* STEP 1: LANGUAGE SELECTION */}
          {step === 1 && (
            <div className="space-y-2.5">
              {[
                { code: 'en', badge: 'IN', name: 'English', sub: 'English' },
                { code: 'hi', badge: 'IN', name: 'हिंदी', sub: 'Hindi' },
                { code: 'mr', badge: 'MR', name: 'मराठी', sub: 'Marathi' },
                { code: 'ta', badge: 'TA', name: 'தமிழ்', sub: 'Tamil' },
                { code: 'bn', badge: 'BN', name: 'বাংলা', sub: 'Bengali' }
              ].map((item) => {
                const isSelected = lang === item.code;
                return (
                  <div
                    key={item.code}
                    onClick={() => setLang(item.code as LanguageCode)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-center">
                        {item.badge}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{item.sub}</div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: PERSONAS (Exact replica of Image 1) */}
          {step === 2 && (
            <div className="space-y-3">
              {/* Counter matching Image 1: "Selected: 2 / 3" */}
              <div className="text-xs font-bold text-slate-700 px-0.5">
                Selected: {personas.length} / 3
              </div>

              {/* 2-Column Persona Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {personaCardsConfig.map((cfg) => {
                  const isSelected = personas.includes(cfg.id);
                  const isPrimary = personas[0] === cfg.id;
                  const order = personas.indexOf(cfg.id) + 1;

                  return (
                    <div
                      key={cfg.id}
                      onClick={() => togglePersona(cfg.id)}
                      className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/30 shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {/* Top Row: Icon & Status Badge */}
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-xl border ${cfg.iconBg}`}>
                          {cfg.icon}
                        </div>

                        {isSelected && (
                          isPrimary ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs tracking-wider">
                              MAIN
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {order}
                            </span>
                          )
                        )}
                      </div>

                      {/* Title & Description matching screenshot */}
                      <div className="mt-2.5">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {cfg.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug line-clamp-2">
                          {cfg.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION (Exact replica of Image 2 & 3) */}
          {step === 3 && (
            <div className="space-y-3">
              {/* GPS Card matching screenshot: Blue/Emerald border, compass icon, Detect button */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs transition-all ${
                  city.id === 'gps_current'
                    ? 'border-2 border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      city.id === 'gps_current' ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        Use Current GPS Location
                      </span>
                      {city.id === 'gps_current' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-800">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium block ${
                        city.id === 'gps_current' ? 'text-emerald-700' : 'text-blue-600'
                      }`}
                    >
                      {city.id === 'gps_current'
                        ? `Locked to ${city.name} (${city.state})`
                        : 'Detect nearest weather station'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={isDetectingGps}
                  className={`text-xs font-bold transition-colors shrink-0 px-2 py-1 cursor-pointer flex items-center gap-1 ${
                    city.id === 'gps_current'
                      ? 'text-emerald-700 hover:text-emerald-900'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {isDetectingGps ? (
                    <>
                      <Radar className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : city.id === 'gps_current' ? (
                    <span>● Active</span>
                  ) : (
                    <span>Detect</span>
                  )}
                </button>
              </div>

              {/* Search city input matching screenshot */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>

              {/* 2-column City Cards Grid matching screenshot with scrollbar */}
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredCities.map((c) => {
                  const isSelected = city.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setCity(c)}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block truncate">
                          {c.state}
                        </span>
                      </div>
                      {isSelected && <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom 2-Button Section: Elevated with generous bottom padding so it is NEVER clipped */}
        <div className="px-5 py-4 pb-6 sm:pb-6 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="w-24 sm:w-28 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors text-center cursor-pointer shadow-2xs"
            >
              Back
            </button>
          ) : null}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Continue →</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer truncate"
            >
              <span>Get Started →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
