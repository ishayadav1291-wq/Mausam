import React, { useState, useEffect } from 'react';
import { SevereWeatherAlert, LanguageCode } from '../types';
import { PushNotificationManager } from '../services/pushNotificationService';
import {
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  X,
  ShieldAlert,
  Clock,
  MapPin,
  Compass,
  Sparkles,
  Info,
  Bell,
  BellRing
} from 'lucide-react';

interface SevereWeatherAlertBannerProps {
  alert: SevereWeatherAlert;
  lang?: LanguageCode;
  onViewMap?: () => void;
  onAskAi?: (query: string) => void;
}

export const SevereWeatherAlertBanner: React.FC<SevereWeatherAlertBannerProps> = ({
  alert,
  lang = 'en',
  onViewMap,
  onAskAi
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);
  const [pushSentSuccess, setPushSentSuccess] = useState(false);

  // Automatically dispatch native critical push notification if enabled
  useEffect(() => {
    if (!hasNotified && PushNotificationManager.isEnabled()) {
      setHasNotified(true);
      PushNotificationManager.sendCriticalAlert({
        title: alert.headline || alert.event,
        message: alert.description.slice(0, 140) + '...',
        severity: alert.color === 'red' ? 'red' : 'orange',
        category: alert.event.toLowerCase().includes('cyclone') ? 'cyclone' : 'rain',
        issuedAt: alert.effective
      });
    }
  }, [alert, hasNotified]);

  const handleTestPushNotification = async () => {
    const success = await PushNotificationManager.sendCriticalAlert({
      title: alert.headline || alert.event,
      message: `${alert.description.slice(0, 120)}... (Critical IMD Alert Broadcast)`,
      severity: alert.color === 'red' ? 'red' : 'orange',
      category: alert.event.toLowerCase().includes('cyclone') ? 'cyclone' : 'rain',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (success) {
      setPushSentSuccess(true);
      setTimeout(() => setPushSentSuccess(false), 4000);
    } else {
      // Prompt user to enable
      await PushNotificationManager.requestPermission();
    }
  };

  if (isDismissed) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          <span className="text-xs font-bold text-rose-800">
            {alert.event}
          </span>
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
            {alert.severity === 'extreme' ? 'RED ALERT' : 'ORANGE ALERT'}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
        >
          View Alert
        </button>
      </div>
    );
  }

  // Theme styling based on alert level
  const isRed = alert.color === 'red' || alert.severity === 'extreme';
  const isOrange = alert.color === 'orange' || alert.severity === 'severe';

  const theme = isRed
    ? {
        container: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border-red-500 shadow-md shadow-red-500/20',
        badge: 'bg-white text-red-700 border-white',
        subBadge: 'bg-black/25 text-red-100 border-white/20',
        expandedBg: 'bg-red-950/40 border-red-400/30',
        actionBtn: 'bg-white text-red-700 hover:bg-red-50 shadow-xs',
        secondaryBtn: 'bg-red-700/60 hover:bg-red-700 text-white border-white/20',
        beacon: 'bg-red-300'
      }
    : isOrange
    ? {
        container: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-orange-500 shadow-md shadow-orange-500/20',
        badge: 'bg-white text-orange-800 border-white',
        subBadge: 'bg-black/25 text-amber-100 border-white/20',
        expandedBg: 'bg-orange-950/40 border-orange-400/30',
        actionBtn: 'bg-white text-orange-800 hover:bg-orange-50 shadow-xs',
        secondaryBtn: 'bg-orange-700/60 hover:bg-orange-700 text-white border-white/20',
        beacon: 'bg-amber-300'
      }
    : {
        container: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 border-amber-400 shadow-md',
        badge: 'bg-slate-900 text-amber-300 border-slate-900',
        subBadge: 'bg-white/40 text-slate-900 border-slate-900/10',
        expandedBg: 'bg-white/30 border-amber-600/20',
        actionBtn: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs',
        secondaryBtn: 'bg-white/70 hover:bg-white text-slate-900 border-slate-400/30',
        beacon: 'bg-amber-700'
      };

  return (
    <div className={`rounded-3xl border p-4 transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-top-2 ${theme.container}`}>
      {/* Background Soft Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Main Alert Header Banner */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Animated Warning Icon with Radar Ping */}
          <div className="relative mt-0.5 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.beacon} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${theme.beacon}`} />
            </span>
            <div className="mt-1">
              {isRed ? (
                <AlertOctagon className="w-5 h-5 text-white" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Top Badges Row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${theme.badge}`}>
                {isRed ? '🚨 IMD RED ALERT' : isOrange ? '⚠️ IMD ORANGE ALERT' : '⚡ IMD WEATHER WATCH'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.subBadge}`}>
                {alert.urgency.toUpperCase()}
              </span>
              <span className="text-[10px] opacity-80 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                <span>Expires: {alert.expires}</span>
              </span>
            </div>

            {/* Headline */}
            <h4 className="text-sm font-extrabold leading-snug tracking-tight text-white drop-shadow-xs">
              {alert.headline}
            </h4>

            {/* Quick One-Liner Advisory */}
            <p className="text-xs text-white/90 font-medium mt-1 line-clamp-2 leading-relaxed">
              {alert.instruction}
            </p>
          </div>
        </div>

        {/* Action Controls: Details & Dismiss */}
        <div className="flex items-center gap-1 shrink-0 relative z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-xs cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide' : 'Details'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Minimize Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Deep-Dive Bulletin Drawer */}
      {isExpanded && (
        <div className={`mt-3.5 pt-3.5 border-t rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200 relative z-10 ${theme.expandedBg}`}>
          {/* Official Agency Attribution */}
          <div className="flex items-center justify-between text-[11px] font-semibold opacity-90 pb-1 border-b border-white/10">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Issuing Authority: {alert.senderName}</span>
            </span>
            <span>Effective: {alert.effective}</span>
          </div>

          {/* Detailed Meteorological Description */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80 mb-0.5">
              Official Meteorological Bulletin:
            </span>
            <p className="text-xs text-white/95 leading-relaxed font-normal">
              {alert.description}
            </p>
          </div>

          {/* Key Precautions & Action Items */}
          <div className="bg-black/20 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider block text-white mb-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-white" />
              Immediate Protective Directives:
            </span>
            <div className="text-xs text-white/90 space-y-1">
              {alert.instruction.split('. ').map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold text-white shrink-0">•</span>
                  <span>{step}{step.endsWith('.') ? '' : '.'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impacted High-Risk Corridors & Zones */}
          {alert.areas && alert.areas.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Impacted Localities & High-Alert Corridors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {alert.areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/15"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Buttons & Native Push Alert */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <button
              onClick={handleTestPushNotification}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs border border-white/20 transition-all ${
                pushSentSuccess ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-black/25 hover:bg-black/35 text-white'
              }`}
            >
              {pushSentSuccess ? <BellRing className="w-4 h-4 text-emerald-300" /> : <Bell className="w-4 h-4" />}
              <span>{pushSentSuccess ? 'Native Alert Broadcast Sent!' : 'Test Critical Push Alert'}</span>
            </button>

            {onViewMap && (
              <button
                onClick={onViewMap}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all ${theme.actionBtn}`}
              >
                <Compass className="w-4 h-4" />
                <span>View Alert Radar</span>
              </button>
            )}

            {onAskAi && (
              <button
                onClick={() =>
                  onAskAi(`What safety precautions should I take right now for ${alert.event} in ${alert.areas?.[0] || 'my area'}?`)
                }
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs border transition-all ${theme.secondaryBtn}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Safety Advisory</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
