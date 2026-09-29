import React from 'react';
import { CityLocation } from '../types';
import { POPULAR_CITIES } from '../data/mockWeatherData';
import { X, Compass, Check } from 'lucide-react';

interface SelectCityModalProps {
  currentCity: CityLocation;
  isGpsActive: boolean;
  onSelectCity: (city: CityLocation) => void;
  onActivateGps: () => void;
  onClose: () => void;
}

export const SelectCityModal: React.FC<SelectCityModalProps> = ({
  currentCity,
  isGpsActive,
  onSelectCity,
  onActivateGps,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header matching video frame 0:21 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Select City</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Location Option */}
        <div className="py-3">
          <button
            onClick={() => {
              onActivateGps();
              onClose();
            }}
            className={`w-full text-left p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              isGpsActive
                ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs'
                : 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isGpsActive ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">Current GPS Location</span>
                  {isGpsActive && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-800">
                      ACTIVE
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Auto-detect nearest IMD radar station
                </span>
              </div>
            </div>

            <span className={`text-xs font-bold ${isGpsActive ? 'text-emerald-700' : 'text-blue-600'}`}>
              {isGpsActive ? '● Live' : 'Detect'}
            </span>
          </button>
        </div>

        {/* 2-Column Cities Grid matching video frame 0:21 */}
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Or Select Weather Station
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {POPULAR_CITIES.map((c) => {
            const isSelected = !isGpsActive && currentCity.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCity(c);
                  onClose();
                }}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  {c.state}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
