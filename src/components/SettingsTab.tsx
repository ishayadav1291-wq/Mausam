import React, { useState } from 'react';
import { PersonaId, LanguageCode, UserPreferences, AuthUserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PushNotificationManager } from '../services/pushNotificationService';
import {
  RotateCcw,
  Check,
  Heart,
  Activity,
  Waves,
  Compass,
  Shield,
  Navigation,
  Sprout,
  Calendar,
  User,
  CloudCheck
} from 'lucide-react';

interface SettingsTabProps {
  language: LanguageCode;
  selectedPersonas: PersonaId[];
  authUser: AuthUserProfile | null;
  onLanguageChange: (lang: LanguageCode) => void;
  onPersonasChange: (personas: PersonaId[]) => void;
  onResetSetup: () => void;
  onOpenLogin: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  language,
  selectedPersonas,
  authUser,
  onLanguageChange,
  onPersonasChange,
  onResetSetup,
  onOpenLogin
}) => {
  const t = TRANSLATIONS[language];
  const [isPushEnabled, setIsPushEnabled] = useState(PushNotificationManager.isEnabled());
  const [alertThreshold, setAlertThreshold] = useState<'red' | 'orange'>(
    PushNotificationManager.getSeverityThreshold()
  );
  const [isDispatchingTest, setIsDispatchingTest] = useState(false);
  const [testAlertStatus, setTestAlertStatus] = useState<string | null>(null);

  // Specific 8 personas matching video 01:26
  const personaCardsConfig: {
    id: PersonaId;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'health',
      icon: <Heart className="w-5 h-5 text-emerald-500" />,
      color: 'text-emerald-500'
    },
    {
      id: 'fitness',
      icon: <Activity className="w-5 h-5 text-amber-500" />,
      color: 'text-amber-500'
    },
    {
      id: 'beach',
      icon: <Waves className="w-5 h-5 text-blue-500" />,
      color: 'text-blue-500'
    },
    {
      id: 'traveller',
      icon: <Compass className="w-5 h-5 text-purple-500" />,
      color: 'text-purple-500'
    },
    {
      id: 'parent',
      icon: <Shield className="w-5 h-5 text-pink-500" />,
      color: 'text-pink-500'
    },
    {
      id: 'commuter',
      icon: <Navigation className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600'
    },
    {
      id: 'agriculture',
      icon: <Sprout className="w-5 h-5 text-emerald-600" />,
      color: 'text-emerald-600'
    },
    {
      id: 'events',
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      color: 'text-amber-600'
    }
  ];

  const togglePersona = (id: PersonaId) => {
    if (selectedPersonas.includes(id)) {
      if (selectedPersonas.length === 1) return; // keep at least 1
      onPersonasChange(selectedPersonas.filter((p) => p !== id));
    } else {
      if (selectedPersonas.length < 3) {
        onPersonasChange([...selectedPersonas, id]);
      }
    }
  };

  const languagesList: { code: LanguageCode; name: string; sub: string }[] = [
    { code: 'en', name: 'English', sub: 'English' },
    { code: 'hi', name: 'हिंदी', sub: 'Hindi' },
    { code: 'mr', name: 'मराठी', sub: 'Marathi' },
    { code: 'ta', name: 'தமிழ்', sub: 'Tamil' },
    { code: 'bn', name: 'বাংলা', sub: 'Bengali' }
  ];

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-800">
      {/* Account / Cloud Sync Card */}
      <div
        onClick={onOpenLogin}
        className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
      >
        <div className="flex items-center gap-3">
          {authUser?.photoURL ? (
            <img
              src={authUser.photoURL}
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
              {authUser ? (
                (authUser.displayName || authUser.email || 'U')[0].toUpperCase()
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {authUser ? authUser.displayName || 'Mausam User' : 'Sign In / Account'}
              </span>
              {authUser && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Synced
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {authUser ? authUser.email || 'Firebase Connected' : 'Sync preferences across devices'}
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-blue-600">
          {authUser ? 'Profile →' : 'Sign In →'}
        </span>
      </div>

      {/* SECTION 1: LANGUAGE matching video frame 01:26 */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 px-0.5">
          {language === 'hi' ? 'भाषा' : 'LANGUAGE'}
        </h4>

        <div className="space-y-2">
          {languagesList.map((langItem) => {
            const isSelected = language === langItem.code;
            return (
              <div
                key={langItem.code}
                onClick={() => onLanguageChange(langItem.code)}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-white shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{langItem.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{langItem.sub}</div>
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
      </div>

      {/* SECTION 2: YOUR FOCUS (PICK 1 TO 3) matching video frame 01:26 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
            {language === 'hi' ? 'आपका फोकस (1 से 3 चुनें)' : 'YOUR FOCUS (PICK 1 TO 3)'}
          </h4>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {selectedPersonas.length}/3
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {personaCardsConfig.map((cfg) => {
            const isSelected = selectedPersonas.includes(cfg.id);
            const personaDetails = t.personas[cfg.id];

            return (
              <div
                key={cfg.id}
                onClick={() => togglePersona(cfg.id)}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-xl bg-slate-100 shrink-0">
                    {cfg.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {personaDetails.name}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Critical Alert Push Notifications */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-tight">
                {language === 'hi' ? 'गंभीर मौसम चेतावनी अलर्ट' : 'Severe Weather Push Alerts'}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {language === 'hi' ? 'चक्रवात, भारी वर्षा और लू के लिए पुश सूचनाएं' : 'Web Push & PWA alerts for Cyclones, Heatwaves & Heavy Rain'}
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isPushEnabled}
            onClick={async () => {
              const nextState = !isPushEnabled;
              PushNotificationManager.setEnabled(nextState);
              setIsPushEnabled(nextState);
              if (nextState) {
                setTestAlertStatus(
                  language === 'hi'
                    ? 'अलर्ट सक्रिय: इन-ऐप चेतावनी एवं वेब पुश अलर्ट'
                    : 'Alerts active: In-app warning banners & silent push notifications enabled'
                );
                await PushNotificationManager.requestPermission();
              } else {
                setTestAlertStatus(
                  language === 'hi'
                    ? 'अलर्ट सूचनाएं बंद कर दी गई हैं'
                    : 'Alert notifications muted'
                );
              }
              setTimeout(() => setTestAlertStatus(null), 4000);
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
              isPushEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                isPushEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 pt-1 text-[11px]">
          <button
            onClick={() => {
              PushNotificationManager.setSeverityThreshold('orange');
              setAlertThreshold('orange');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold border transition-all text-center cursor-pointer ${
              alertThreshold === 'orange'
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            ⚠️ Red & Orange Alerts
          </button>
          <button
            onClick={() => {
              PushNotificationManager.setSeverityThreshold('red');
              setAlertThreshold('red');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold border transition-all text-center cursor-pointer ${
              alertThreshold === 'red'
                ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            🚨 Red Alerts Only
          </button>
        </div>

        {/* Test Notification Button */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            disabled={isDispatchingTest}
            onClick={async () => {
              setIsDispatchingTest(true);
              if (!isPushEnabled) {
                PushNotificationManager.setEnabled(true);
                setIsPushEnabled(true);
              }
              await PushNotificationManager.sendTestNotification();
              setIsDispatchingTest(false);
              setTestAlertStatus(
                language === 'hi'
                  ? '✅ टेस्ट अलर्ट प्रसारित! शीर्ष पर चेतावनी बैनर देखें।'
                  : '✅ Test alert broadcast triggered! Notice top warning banner.'
              );
              setTimeout(() => setTestAlertStatus(null), 5000);
            }}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-2 shadow-2xs ${
              isDispatchingTest
                ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 border-slate-200'
            }`}
          >
            <span className="text-sm">🔔</span>
            <span>
              {isDispatchingTest
                ? (language === 'hi' ? 'अलर्ट भेजा जा रहा है...' : 'Dispatching Alert Broadcast...')
                : (language === 'hi' ? 'सिस्टम सूचना का परीक्षण करें' : 'Send Test System Push Alert')}
            </span>
          </button>

          {/* Real-time status feedback banner */}
          {testAlertStatus && (
            <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 animate-fadeIn">
              <span className="shrink-0">⚡</span>
              <span>{testAlertStatus}</span>
            </div>
          )}

          {/* Helpful preview notice */}
          {PushNotificationManager.isInIframe() && (
            <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              {language === 'hi'
                ? 'ℹ️ पूर्वावलोकन मोड: इन-ऐप अलर्ट बैनर तुरंत दिखाई देंगे।'
                : 'ℹ️ Preview environment: In-app warning banners fire immediately.'}
            </p>
          )}
        </div>
      </div>

      {/* SECTION 4: Reset Setup matching video frame 01:26 */}
      <div className="pt-2 text-center">
        <button
          onClick={onResetSetup}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'रीसेट सेटअप' : 'Reset Setup'}</span>
        </button>
      </div>
    </div>
  );
};
