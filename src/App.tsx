import React, { useState, useEffect } from 'react';
import {
  PersonaId,
  LanguageCode,
  CityLocation,
  SavedLocationItem,
  UserPreferences,
  PersonalizedWeatherFeed,
  AuthUserProfile
} from './types';
import { TRANSLATIONS } from './data/translations';
import { POPULAR_CITIES, getWeatherDataForCity, findNearestStation } from './data/mockWeatherData';
import {
  fetchUserPreferences,
  saveUserPreferences,
  fetchSavedLocations,
  saveLocationItem,
  removeLocationItem,
  subscribeToAuth,
  getStoredAuthUser
} from './services/firebase';
import { fetchLiveWeatherData } from './services/liveWeatherService';
import { PushNotificationManager, CriticalAlertPayload } from './services/pushNotificationService';
import { PersonaCard } from './components/PersonaCard';
import { PersonaDetailModal } from './components/PersonaDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { InteractiveMapModal } from './components/InteractiveMapModal';
import { SavedPlacesModal } from './components/SavedPlacesModal';
import { AskAiTab } from './components/AskAiTab';
import { AskAIModal } from './components/AskAIModal';
import { SettingsTab } from './components/SettingsTab';
import { SelectCityModal } from './components/SelectCityModal';
import { SplashScreen } from './components/SplashScreen';
import { SevereWeatherAlertBanner } from './components/SevereWeatherAlertBanner';
import { LoginModal } from './components/LoginModal';
import { DailyForecastSummaryCard } from './components/DailyForecastSummaryCard';
import {
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles,
  ChevronDown,
  Sun,
  Settings,
  Bot,
  Calendar,
  Layers,
  Map as MapIcon,
  Sliders,
  Bookmark,
  User,
  Compass,
  Navigation,
  Plus
} from 'lucide-react';

export default function App() {
  // State for user preferences
  const [language, setLanguage] = useState<LanguageCode>('hi'); // Default Hindi matching video
  const [selectedPersonas, setSelectedPersonas] = useState<PersonaId[]>([
    'health',
    'fitness',
    'commuter'
  ]);
  const [primaryPersona, setPrimaryPersona] = useState<PersonaId>('health');

  // GPS Location state
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [userGpsCoords, setUserGpsCoords] = useState<{ lat: number; lon: number }>({
    lat: 28.6139,
    lon: 77.2090
  });

  // Default city matching video frame 0:11 (New Delhi / Delhi NCR)
  const [currentCity, setCurrentCity] = useState<CityLocation>(POPULAR_CITIES[1]);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [savedLocations, setSavedLocations] = useState<SavedLocationItem[]>([]);
  const [selectedFocusPlaceId, setSelectedFocusPlaceId] = useState<string | null>(null);

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUserProfile | null>(getStoredAuthUser());
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'today' | 'ai' | 'settings'>('today');

  // UI Modals & Views
  const [showSplash, setShowSplash] = useState(true);
  const [activeDetailPersona, setActiveDetailPersona] = useState<PersonaId | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSavedPlaces, setShowSavedPlaces] = useState(false);
  const [savedPlacePreSelectCategory, setSavedPlacePreSelectCategory] = useState<
    'home' | 'college' | 'office' | 'travel' | 'gym' | 'park' | 'custom' | null
  >(null);
  const [showAskAiModal, setShowAskAiModal] = useState(false);
  const [askAiInitialPrompt, setAskAiInitialPrompt] = useState('');
  const [severeAlertsEnabled, setSevereAlertsEnabled] = useState(true);
  const [activeHeadsUpAlert, setActiveHeadsUpAlert] = useState<CriticalAlertPayload | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFeedUpdating, setIsFeedUpdating] = useState(false);

  // Quick query input on home screen
  const [homeAiQuery, setHomeAiQuery] = useState('');

  // Weather data for current city
  const [weatherData, setWeatherData] = useState<PersonalizedWeatherFeed>(
    getWeatherDataForCity(POPULAR_CITIES[0])
  );

  // Load preferences and saved places from Firebase / LocalStorage on mount
  useEffect(() => {
    async function initData() {
      const prefs = await fetchUserPreferences();
      if (prefs) {
        if (prefs.language) setLanguage(prefs.language);
        if (prefs.selectedPersonas && prefs.selectedPersonas.length > 0) {
          setSelectedPersonas(prefs.selectedPersonas);
          setPrimaryPersona(prefs.primaryPersona || prefs.selectedPersonas[0]);
        }
        if (prefs.temperatureUnit) setTempUnit(prefs.temperatureUnit);
      } else {
        // First-time user: trigger onboarding modal (starts with language selection)
        setShowOnboarding(true);
      }

      const locations = await fetchSavedLocations(currentCity);
      setSavedLocations(locations);
    }

    initData();

    // Subscribe to Firebase Auth state
    const unsubscribeAuth = subscribeToAuth((user) => {
      setAuthUser(user);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Listen to in-app critical alert broadcasts (test alerts & live severe weather triggers)
  useEffect(() => {
    const unsubscribe = PushNotificationManager.subscribe((alertPayload) => {
      setActiveHeadsUpAlert(alertPayload);
      const timer = setTimeout(() => {
        setActiveHeadsUpAlert((curr) => (curr?.id === alertPayload.id ? null : curr));
      }, 8000);
      return () => clearTimeout(timer);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Reload places when city changes
  useEffect(() => {
    async function updatePlaces() {
      const locations = await fetchSavedLocations(currentCity);
      setSavedLocations(locations);
    }
    updatePlaces();
  }, [currentCity]);

  // Update weather whenever city changes with live Open-Meteo & IMD observations
  useEffect(() => {
    let isCancelled = false;
    setIsFeedUpdating(true);

    fetchLiveWeatherData(currentCity, isSimulatedOffline)
      .then(({ feed }) => {
        if (isCancelled) return;
        if (isSimulatedOffline) {
          feed.confidence = 'estimated';
          feed.confidenceReason = 'Cached IMD telemetry (Offline Mode)';
        }
        setWeatherData(feed);
        setIsFeedUpdating(false);
      })
      .catch((err) => {
        console.warn('Failed to fetch live weather:', err);
        if (!isCancelled) {
          setWeatherData(getWeatherDataForCity(currentCity));
          setIsFeedUpdating(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentCity, isSimulatedOffline]);

  // Activate and detect real device GPS location
  const activateGpsLocation = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserGpsCoords({ lat, lon });
          const nearest = findNearestStation(lat, lon);
          const gpsCity: CityLocation = {
            id: 'gps_current',
            name: nearest.name,
            state: nearest.state,
            country: 'India',
            lat,
            lon,
            isCoastal: nearest.isCoastal,
            isHilly: nearest.isHilly
          };
          setCurrentCity(gpsCity);
          setIsGpsActive(true);
          setIsDetectingGps(false);
          setShowCityPicker(false);
        },
        (err) => {
          console.warn('Geolocation fallback:', err);
          const fallback = POPULAR_CITIES[0]; // Mumbai default
          setUserGpsCoords({ lat: fallback.lat, lon: fallback.lon });
          setCurrentCity({
            id: 'gps_current',
            name: fallback.name,
            state: fallback.state,
            country: 'India',
            lat: fallback.lat,
            lon: fallback.lon,
            isCoastal: fallback.isCoastal,
            isHilly: fallback.isHilly
          });
          setIsGpsActive(true);
          setIsDetectingGps(false);
          setShowCityPicker(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsGpsActive(true);
      setIsDetectingGps(false);
      setShowCityPicker(false);
    }
  };

  // Pull to refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsFeedUpdating(true);
    setTimeout(() => {
      const feed = getWeatherDataForCity(currentCity);
      feed.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isSimulatedOffline) {
        feed.confidence = 'estimated';
      }
      setWeatherData(feed);
      setIsRefreshing(false);
      setIsFeedUpdating(false);
    }, 600);
  };

  // Save updated preferences from onboarding
  const handleSaveOnboarding = (
    newLang: LanguageCode,
    newPersonas: PersonaId[],
    newCity: CityLocation
  ) => {
    setIsFeedUpdating(true);
    setLanguage(newLang);
    setSelectedPersonas(newPersonas);
    const newPrimary = newPersonas[0];
    setPrimaryPersona(newPrimary);
    setCurrentCity(newCity);

    setTimeout(() => {
      setIsFeedUpdating(false);
    }, 700);

    const updatedPrefs: UserPreferences = {
      userId: 'default_user',
      language: newLang,
      selectedPersonas: newPersonas,
      primaryPersona: newPrimary,
      savedLocations,
      severeWeatherAlerts: true,
      temperatureUnit: tempUnit,
      updatedAt: new Date().toISOString()
    };
    saveUserPreferences(updatedPrefs);
  };

  // Add saved place
  const handleAddSavedLocation = async (loc: SavedLocationItem) => {
    await saveLocationItem(loc);
    const updated = await fetchSavedLocations();
    setSavedLocations(updated);
  };

  // Delete saved place
  const handleDeleteSavedLocation = async (id: string) => {
    await removeLocationItem(id);
    const updated = await fetchSavedLocations();
    setSavedLocations(updated);
  };

  const t = TRANSLATIONS[language];

  // Reorder cards so that primaryPersona is always first
  const orderedPersonas = [
    primaryPersona,
    ...selectedPersonas.filter((p) => p !== primaryPersona)
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start sm:py-6 px-0 sm:px-4 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Authentic Mausam Splash Screen matching Image 1 before main app */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Mobile Device Container matching video mockup */}
      <div className="w-full max-w-[440px] min-h-screen sm:min-h-[880px] bg-slate-50 sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative sm:ring-1 sm:ring-slate-700/40">
        {/* Top Native Phone Status Bar */}
        <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-slate-800 shrink-0 relative">
          <span>9:41</span>
          <div className="w-20 h-4 bg-slate-950 rounded-full hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span className="text-[10px] font-bold">5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Real-time Heads-up Broadcast Banner Toast */}
        {activeHeadsUpAlert && (
          <div className="absolute top-11 left-3 right-3 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
            <div
              className={`rounded-2xl p-3 shadow-2xl border text-white flex items-start justify-between gap-2.5 backdrop-blur-md ${
                activeHeadsUpAlert.severity === 'red'
                  ? 'bg-rose-700/95 border-rose-400 shadow-rose-900/30'
                  : 'bg-amber-600/95 border-amber-300 shadow-amber-900/30'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-base shadow-2xs">
                  {activeHeadsUpAlert.severity === 'red' ? '🚨' : '⚠️'}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-white/25">
                      {activeHeadsUpAlert.severity === 'red' ? 'Red Alert' : 'Severe Weather Alert'}
                    </span>
                    <span className="text-[10px] text-white/80 font-medium">
                      {activeHeadsUpAlert.issuedAt || 'Just now'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black leading-tight text-white truncate">
                    {activeHeadsUpAlert.title}
                  </h4>
                  <p className="text-[11px] text-white/90 leading-snug line-clamp-2">
                    {activeHeadsUpAlert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveHeadsUpAlert(null)}
                className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors text-xs font-bold"
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Location & Controls Header matching video frame 0:11 (Clean & Uncluttered) */}
        <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-center justify-between relative shrink-0">
          <div
            onClick={() => setShowCityPicker(true)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900 leading-tight">
                <span>{currentCity.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-[11px] text-slate-400 font-medium block">
                {currentCity.state}
              </span>
            </div>
          </div>

          {/* Right Signal, Map, Account & Refresh Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setSelectedFocusPlaceId(null);
                setShowMap(true);
              }}
              className="px-2 py-1 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs border border-blue-200/70 shadow-2xs"
              title="Open Interactive Weather Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer flex items-center"
              title={authUser ? `Signed in as ${authUser.displayName || authUser.email}` : 'Sign In / Sign Up'}
            >
              {authUser ? (
                <div className="relative">
                  {authUser.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover border border-blue-500 shadow-2xs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                      {(authUser.displayName || authUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </div>
              ) : (
                <div className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Sign In</span>
                </div>
              )}
            </button>
            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              title={isSimulatedOffline ? 'Offline' : 'Online'}
            >
              {isSimulatedOffline ? (
                <WifiOff className="w-4 h-4 text-rose-500" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-600" />
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer ${
                isRefreshing ? 'animate-spin text-blue-600' : ''
              }`}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Offline Banner if active */}
        {isSimulatedOffline && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-700 px-4 py-1 text-[11px] font-medium text-center">
            {t.offlineBanner}
          </div>
        )}

        {/* Scrollable Main View based on Active Tab */}
        <div
          className={`flex-1 ${
            activeTab === 'ai'
              ? 'flex flex-col min-h-0 overflow-hidden pb-[58px]'
              : 'overflow-y-auto pb-20'
          }`}
        >
          {/* TAB 1: TODAY (MAIN FEED MATCHING VIDEO) */}
          {activeTab === 'today' && (
            <div className="p-4 space-y-4">
              {/* Severe Weather Alert Banner if current location has severe conditions */}
              {severeAlertsEnabled && weatherData.severeAlert && (
                <SevereWeatherAlertBanner
                  alert={weatherData.severeAlert}
                  lang={language}
                  onViewMap={() => setShowMap(true)}
                  onAskAi={(prompt) => {
                    setAskAiInitialPrompt(prompt);
                    setShowAskAiModal(true);
                  }}
                />
              )}

              {/* Big Weather Card (Blue Gradient matching video frame 0:19) */}
              <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
                {/* Background soft glow */}
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-5xl font-black tracking-tight leading-none block">
                      {weatherData.currentTempC}°
                    </span>
                    <span className="text-xs text-blue-100 font-medium block mt-1.5">
                      Feels like {weatherData.feelsLikeC}°C
                    </span>
                    <span className="text-base font-bold text-white block mt-0.5">
                      {weatherData.condition}
                    </span>
                  </div>

                  {/* Weather Illustration */}
                  <div className="text-5xl drop-shadow-md">
                    {weatherData.icon}
                  </div>
                </div>

                {/* 4 Metrics Pills Row matching video */}
                <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/20 text-center">
                  <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                    <span className="text-[10px] text-blue-100 font-medium block">AQI</span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {weatherData.health.aqi.current}
                    </span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                    <span className="text-[10px] text-blue-100 font-medium block">UV</span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {weatherData.health.uvIndex.current}
                    </span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                    <span className="text-[10px] text-blue-100 font-medium block">Humidity</span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {weatherData.humidityPercentage}%
                    </span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                    <span className="text-[10px] text-blue-100 font-medium block">Wind</span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {weatherData.windSpeedKmph} km/h
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Locations on Google Earth Map: Personalized according to user */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-base shadow-2xs">
                      📍
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-tight">
                        {authUser && !authUser.isAnonymous && authUser.displayName
                          ? `${authUser.displayName.split(' ')[0]}'s Places on Map`
                          : 'Saved Places on Map'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Your personal places & live satellite weather</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSavedPlacePreSelectCategory(null);
                        setShowSavedPlaces(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-slate-200/80 active:scale-95"
                      title="Manage your saved places"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add / Manage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFocusPlaceId(null);
                        setShowMap(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>🌍</span>
                      <span>Google Earth</span>
                    </button>
                  </div>
                </div>

                {/* User Saved Places Grid or Intuitive Empty State */}
                {savedLocations.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-slate-50 border border-dashed border-blue-200 text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto text-xl shadow-2xs">
                      📍
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-800">
                        No Saved Places Added Yet
                      </h5>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Add your home, office, college, or travel spots to track real-time weather & view them directly on Google Earth.
                      </p>
                    </div>

                    {/* Quick Starter Presets */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSavedPlacePreSelectCategory('home');
                          setShowSavedPlaces(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>🏠</span>
                        <span>+ Add Home</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedPlacePreSelectCategory('office');
                          setShowSavedPlaces(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>💼</span>
                        <span>+ Add Work</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedPlacePreSelectCategory('college');
                          setShowSavedPlaces(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>🎓</span>
                        <span>+ Add College</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedPlacePreSelectCategory('travel');
                          setShowSavedPlaces(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>🏖️</span>
                        <span>+ Add Travel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {savedLocations.map((loc) => {
                      const categoryEmoji =
                        loc.category === 'home'
                          ? '🏠'
                          : loc.category === 'college'
                          ? '🎓'
                          : loc.category === 'travel'
                          ? '🏖️'
                          : loc.category === 'office'
                          ? '💼'
                          : loc.category === 'gym'
                          ? '🏋️'
                          : '📍';

                      const categoryBadgeColor =
                        loc.category === 'home'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : loc.category === 'college'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : loc.category === 'travel'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : loc.category === 'office'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200';

                      // Estimated localized weather data
                      const matchedCity = POPULAR_CITIES.find(
                        (c) =>
                          c.name.toLowerCase() === loc.cityName.toLowerCase() ||
                          loc.cityName.toLowerCase().includes(c.name.toLowerCase())
                      );
                      const locWeather = matchedCity
                        ? getWeatherDataForCity(matchedCity)
                        : weatherData;
                      const placeTemp = `${locWeather.currentTempC}°`;
                      const condStr = (locWeather.condition || '').toLowerCase();
                      const weatherEmoji = condStr.includes('rain')
                        ? '🌧️'
                        : condStr.includes('cloud')
                        ? '⛅'
                        : '☀️';

                      return (
                        <div
                          key={loc.id}
                          className="relative group rounded-2xl border border-slate-200/90 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 transition-all text-left flex flex-col justify-between shadow-2xs overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFocusPlaceId(loc.id);
                              setShowMap(true);
                            }}
                            className="p-3 w-full text-left flex flex-col justify-between flex-1 cursor-pointer"
                          >
                            {/* Top: Category Pill + Weather Badge */}
                            <div className="flex items-center justify-between w-full gap-1 mb-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${categoryBadgeColor}`}
                              >
                                <span>{categoryEmoji}</span>
                                <span className="capitalize">{loc.category || 'place'}</span>
                              </span>
                              <span className="text-[11px] font-black text-slate-700 bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200/70 shadow-2xs flex items-center gap-0.5">
                                <span className="text-[10px]">{weatherEmoji}</span>
                                <span>{placeTemp}</span>
                              </span>
                            </div>

                            {/* Middle: Place Label */}
                            <div className="min-w-0 mb-1 pr-4">
                              <span className="text-xs font-black text-slate-900 block truncate group-hover:text-blue-600">
                                {loc.label}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate font-medium">
                                {loc.cityName.split(',')[0]}
                              </span>
                            </div>

                            {/* Bottom: Subtle Earth indicator on hover */}
                            <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400 group-hover:text-blue-600 font-semibold">
                              <span>Google Earth</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </div>
                          </button>

                          {/* Quick 1-tap delete button on hover/tap */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedLocation(loc.id);
                            }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-200/80 hover:bg-rose-500 hover:text-white text-slate-500 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            title="Delete place"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    {/* Add Place card button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSavedPlacePreSelectCategory(null);
                        setShowSavedPlaces(true);
                      }}
                      className="p-3 min-h-[92px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] font-bold">+ Add Place</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Ask AI Input Bar matching video frame 0:19 */}
              <div
                onClick={() => setActiveTab('ai')}
                className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2.5 cursor-pointer hover:border-blue-400 transition-all group"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    AI
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-600 font-medium truncate">
                    Ask a question about today's weather...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('ai');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  Ask →
                </button>
              </div>

              {/* Section Header: YOUR DAILY INSIGHTS matching video */}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  {language === 'hi' ? 'आपकी दैनिक रिपोर्ट' : 'YOUR DAILY INSIGHTS'}
                </span>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  {selectedPersonas.length} focus areas
                </button>
              </div>

              {/* Daily Forecast Summary Card tailored to user's selected primary persona */}
              <DailyForecastSummaryCard
                primaryPersona={primaryPersona}
                weather={weatherData}
                cityName={currentCity.name}
                lang={language}
                onOpenDetail={(pid) => setActiveDetailPersona(pid)}
                onChangePersona={() => setShowOnboarding(true)}
              />

              {/* Feed Loading Spinner matching video frame 0:19 */}
              {isFeedUpdating ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-semibold animate-in fade-in duration-200">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Updating weather insights...</span>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {orderedPersonas.map((pid) => (
                    <PersonaCard
                      key={pid}
                      personaId={pid}
                      isPrimary={pid === primaryPersona}
                      weather={weatherData}
                      lang={language}
                      onOpenDetail={(id) => setActiveDetailPersona(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ASK AI (Full in-app chat matching video 00:46 - 01:25) */}
          {activeTab === 'ai' && (
            <AskAiTab
              currentCity={currentCity}
              weatherData={weatherData}
            />
          )}

          {/* TAB 3: SETTINGS (Exact matching video 01:26 - 01:30) */}
          {activeTab === 'settings' && (
            <SettingsTab
              language={language}
              selectedPersonas={selectedPersonas}
              authUser={authUser}
              onLanguageChange={(newLang) => {
                setLanguage(newLang);
                saveUserPreferences({
                  userId: 'default_user',
                  language: newLang,
                  selectedPersonas,
                  primaryPersona,
                  savedLocations,
                  severeWeatherAlerts: true,
                  temperatureUnit: tempUnit,
                  updatedAt: new Date().toISOString()
                });
              }}
              onPersonasChange={(newPersonas) => {
                setSelectedPersonas(newPersonas);
                saveUserPreferences({
                  userId: 'default_user',
                  language,
                  selectedPersonas: newPersonas,
                  primaryPersona,
                  savedLocations,
                  severeWeatherAlerts: true,
                  temperatureUnit: tempUnit,
                  updatedAt: new Date().toISOString()
                });
              }}
              onResetSetup={() => setShowOnboarding(true)}
              onOpenLogin={() => setShowLoginModal(true)}
            />
          )}
        </div>

        {/* Bottom Fixed Tab Navigation Bar matching video (Exactly 3 Tabs) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-6 py-2 flex items-center justify-around z-20 shadow-lg">
          {/* Tab 1: Today */}
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'today' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sun className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Today</span>
          </button>

          {/* Tab 2: Ask AI */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'ai' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Ask AI</span>
          </button>

          {/* Tab 3: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </div>

      {/* ================= MODALS & SHEETS ================= */}

      {/* City Picker Modal matching video frame 0:21 */}
      {showCityPicker && (
        <SelectCityModal
          currentCity={currentCity}
          isGpsActive={isGpsActive}
          onSelectCity={(c) => {
            setIsGpsActive(false);
            setCurrentCity(c);
          }}
          onActivateGps={activateGpsLocation}
          onClose={() => setShowCityPicker(false)}
        />
      )}

      {/* 1. Persona Deep-Dive Detail Bottom Sheet */}
      {activeDetailPersona && (
        <PersonaDetailModal
          personaId={activeDetailPersona}
          weather={weatherData}
          lang={language}
          onClose={() => setActiveDetailPersona(null)}
        />
      )}

      {/* 2. Onboarding Modal (Language -> Personas -> Location) */}
      {showOnboarding && (
        <OnboardingModal
          currentLanguage={language}
          selectedPersonas={selectedPersonas}
          selectedCity={currentCity}
          isFirstTime={false}
          onSave={handleSaveOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* 3. Maps Grounded AI Weather Modal */}
      {showAskAiModal && (
        <AskAIModal
          currentCity={currentCity}
          initialQuery={askAiInitialPrompt}
          onClose={() => {
            setShowAskAiModal(false);
            setAskAiInitialPrompt('');
          }}
        />
      )}

      {/* 4. Interactive Leaflet Map Modal */}
      {showMap && (
        <InteractiveMapModal
          currentCity={currentCity}
          savedLocations={savedLocations}
          isGpsActive={isGpsActive}
          userGpsCoords={userGpsCoords}
          initialFocusLocationId={selectedFocusPlaceId}
          onAddSavedLocation={handleAddSavedLocation}
          onSelectCityLocation={(lat, lon, name) => {
            const customCity: CityLocation = {
              id: `custom_${Date.now()}`,
              name,
              state: 'Observation Point',
              country: 'India',
              lat,
              lon
            };
            setCurrentCity(customCity);
          }}
          onClose={() => {
            setShowMap(false);
            setSelectedFocusPlaceId(null);
          }}
        />
      )}

      {/* 5. Saved Places Management Modal */}
      {showSavedPlaces && (
        <SavedPlacesModal
          savedLocations={savedLocations}
          currentCity={currentCity}
          initialCategory={savedPlacePreSelectCategory}
          onSelectLocation={(loc) => {
            const matched = POPULAR_CITIES.find(
              (c) => c.name.toLowerCase() === loc.cityName.toLowerCase()
            );
            if (matched) {
              setCurrentCity(matched);
            } else {
              setCurrentCity({
                id: loc.id,
                name: loc.cityName,
                state: loc.label,
                country: 'India',
                lat: loc.lat,
                lon: loc.lon
              });
            }
          }}
          onAddLocation={handleAddSavedLocation}
          onDeleteLocation={handleDeleteSavedLocation}
          onClose={() => {
            setShowSavedPlaces(false);
            setSavedPlacePreSelectCategory(null);
          }}
        />
      )}

      {/* 6. Login & Account Modal */}
      {showLoginModal && (
        <LoginModal
          currentUser={authUser}
          onUserChange={(u) => setAuthUser(u)}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
