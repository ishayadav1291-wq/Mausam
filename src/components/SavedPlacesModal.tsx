import React, { useState, useEffect } from 'react';
import { SavedLocationItem, CityLocation } from '../types';
import { POPULAR_CITIES } from '../data/mockWeatherData';
import { X, Plus, Trash2, MapPin, Check, Bookmark, Sparkles } from 'lucide-react';

interface SavedPlacesModalProps {
  savedLocations: SavedLocationItem[];
  currentCity?: CityLocation;
  initialCategory?: 'home' | 'college' | 'office' | 'travel' | 'gym' | 'park' | 'custom' | null;
  onSelectLocation: (loc: SavedLocationItem) => void;
  onAddLocation: (loc: SavedLocationItem) => void;
  onDeleteLocation: (id: string) => void;
  onClose: () => void;
}

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({
  savedLocations,
  currentCity,
  initialCategory = null,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onClose
}) => {
  const [showAddForm, setShowAddForm] = useState(initialCategory !== null || savedLocations.length === 0);
  const [label, setLabel] = useState(
    initialCategory === 'home'
      ? 'Home'
      : initialCategory === 'office'
      ? 'Work Office'
      : initialCategory === 'college'
      ? 'College'
      : initialCategory === 'travel'
      ? 'Travel Destination'
      : ''
  );
  const [areaName, setAreaName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(
    currentCity?.id || POPULAR_CITIES[0].id
  );
  const [category, setCategory] = useState<'home' | 'college' | 'office' | 'travel' | 'gym' | 'park' | 'custom'>(
    initialCategory || 'home'
  );

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setShowAddForm(true);
      if (initialCategory === 'home') setLabel('Home');
      else if (initialCategory === 'office') setLabel('Work Office');
      else if (initialCategory === 'college') setLabel('College');
      else if (initialCategory === 'travel') setLabel('Travel Destination');
    }
  }, [initialCategory]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'home':
        return '🏠';
      case 'office':
        return '💼';
      case 'college':
        return '🎓';
      case 'travel':
        return '🏖️';
      case 'gym':
        return '🏋️';
      case 'park':
        return '🌳';
      default:
        return '📍';
    }
  };

  const handleQuickPreset = (presetCat: 'home' | 'office' | 'college' | 'travel') => {
    setCategory(presetCat);
    if (presetCat === 'home') setLabel('Home');
    else if (presetCat === 'office') setLabel('Work Office');
    else if (presetCat === 'college') setLabel('College Campus');
    else if (presetCat === 'travel') setLabel('Weekend Getaway');
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const cityObj = POPULAR_CITIES.find((c) => c.id === selectedCityId) || POPULAR_CITIES[0];
    const fullCityName = areaName.trim() ? `${areaName.trim()}, ${cityObj.name}` : cityObj.name;

    const newItem: SavedLocationItem = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label: label.trim(),
      cityName: fullCityName,
      lat: cityObj.lat,
      lon: cityObj.lon,
      category,
      icon: getCategoryIcon(category),
      createdAt: new Date().toISOString()
    };

    onAddLocation(newItem);
    setLabel('');
    setAreaName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800 max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-base shadow-2xs">
              📍
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Manage Saved Places
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Save places to view weather & locate on Google Earth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick starter chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Add Presets:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('home')}
                className="py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <span className="text-base">🏠</span>
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('office')}
                className="py-2.5 px-2 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <span className="text-base">💼</span>
                <span>Work</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('college')}
                className="py-2.5 px-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <span className="text-base">🎓</span>
                <span>College</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('travel')}
                className="py-2.5 px-2 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-[11px] font-bold flex flex-col items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <span className="text-base">🏖️</span>
                <span>Travel</span>
              </button>
            </div>
          </div>

          {/* Add place form toggle */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/40 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add Custom Place</span>
            </button>
          ) : (
            <form
              onSubmit={handleSave}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-2xs animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>{getCategoryIcon(category)}</span>
                  <span>Add {category ? category.toUpperCase() : 'Custom Place'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-medium"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Place Name / Label
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. My Apartment, Bandra Studio, IIT Campus"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    City
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="home">Home (🏠)</option>
                    <option value="office">Work (💼)</option>
                    <option value="college">College (🎓)</option>
                    <option value="travel">Travel (🏖️)</option>
                    <option value="gym">Gym (🏋️)</option>
                    <option value="park">Park (🌳)</option>
                    <option value="custom">Other (📍)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Area / Locality (Optional)
                </label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Bandra West, Indiranagar, North Campus"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Save Place
              </button>
            </form>
          )}

          {/* List of saved places */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Your Places ({savedLocations.length}):
            </span>

            {savedLocations.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-2xl block">📍</span>
                <p className="text-xs font-bold text-slate-700">No saved places yet</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Use the presets above or click "Add Custom Place" to create your first saved location.
                </p>
              </div>
            ) : (
              savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all shadow-2xs"
                >
                  <div
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="text-xl p-2.5 rounded-2xl bg-slate-100 border border-slate-200/70 shrink-0">
                      {loc.icon || getCategoryIcon(loc.category)}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-black text-slate-900 block truncate">
                        {loc.label}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate font-medium mt-0.5">
                        {loc.cityName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDeleteLocation(loc.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete place"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
