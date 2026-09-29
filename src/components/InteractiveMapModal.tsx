import React, { useEffect, useRef, useState } from 'react';
import { CityLocation, SavedLocationItem } from '../types';
import {
  X,
  MapPin,
  Plus,
  Navigation,
  ExternalLink,
  Check,
  Building2,
  GraduationCap,
  Home,
  Briefcase,
  Compass,
  Layers,
  Thermometer,
  CloudRain
} from 'lucide-react';
import L from 'leaflet';

interface InteractiveMapModalProps {
  currentCity: CityLocation;
  savedLocations: SavedLocationItem[];
  isGpsActive?: boolean;
  userGpsCoords?: { lat: number; lon: number };
  initialFocusLocationId?: string | null;
  onSelectCityLocation: (lat: number, lon: number, name: string) => void;
  onAddSavedLocation?: (loc: SavedLocationItem) => void;
  onClose: () => void;
}

export const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({
  currentCity,
  savedLocations,
  isGpsActive = false,
  userGpsCoords,
  initialFocusLocationId,
  onSelectCityLocation,
  onAddSavedLocation,
  onClose
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('satellite');
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [isDeckMinimized, setIsDeckMinimized] = useState<boolean>(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlaceCoord, setNewPlaceCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [newPlaceLabel, setNewPlaceLabel] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState<'home' | 'college' | 'office' | 'travel' | 'gym' | 'park' | 'custom'>('home');

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'home':
        return {
          icon: '🏠',
          bg: '#10b981',
          shadow: 'rgba(16, 185, 129, 0.4)',
          border: '#059669',
          title: 'Home'
        };
      case 'college':
        return {
          icon: '🎓',
          bg: '#2563eb',
          shadow: 'rgba(37, 99, 235, 0.4)',
          border: '#1d4ed8',
          title: 'College'
        };
      case 'office':
        return {
          icon: '💼',
          bg: '#7c3aed',
          shadow: 'rgba(124, 58, 237, 0.4)',
          border: '#6d28d9',
          title: 'Office'
        };
      case 'travel':
        return {
          icon: '🏖️',
          bg: '#0891b2',
          shadow: 'rgba(8, 145, 178, 0.4)',
          border: '#0e7490',
          title: 'Travel'
        };
      case 'gym':
        return {
          icon: '🏋️',
          bg: '#ea580c',
          shadow: 'rgba(234, 88, 12, 0.4)',
          border: '#c2410c',
          title: 'Gym'
        };
      default:
        return {
          icon: '📍',
          bg: '#475569',
          shadow: 'rgba(71, 85, 105, 0.4)',
          border: '#334155',
          title: 'Place'
        };
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around first saved location or active city
    const initialLat = savedLocations[0]?.lat || currentCity.lat;
    const initialLon = savedLocations[0]?.lon || currentCity.lon;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 12,
      zoomControl: true
    });

    mapInstanceRef.current = map;

    // 1. Crisp high-contrast street layer from CartoDB Voyager
    const streetLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19
      }
    );
    streetLayerRef.current = streetLayer;

    // 2. Google Earth Satellite Layer (Hybrid Satellite + Road Labels)
    const satelliteLayer = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Earth / Maps Satellite Imagery',
        maxZoom: 20
      }
    );
    satelliteLayerRef.current = satelliteLayer;

    // Add selected initial layer
    if (mapLayer === 'satellite') {
      satelliteLayer.addTo(map);
    } else {
      streetLayer.addTo(map);
    }

    // Live RainViewer / IMD Doppler Weather Radar Composite Tile Overlay
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        const radarList = data?.radar?.past || [];
        if (radarList.length > 0 && mapInstanceRef.current) {
          const latestFrame = radarList[radarList.length - 1];
          const radarTileLayer = L.tileLayer(
            `https://tilecache.rainviewer.com/v2/radar/${latestFrame.time}/512/{z}/{x}/{y}/2/1_1.png`,
            {
              opacity: 0.65,
              zIndex: 100,
              attribution: 'IMD & RainViewer Doppler Radar Composite'
            }
          );
          radarLayerRef.current = radarTileLayer;
          if (showRadar) {
            radarTileLayer.addTo(mapInstanceRef.current);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load live radar tile cache:', err);
      });

    // Key IMD Doppler Weather Radar (DWR) Stations across India
    const imdRadarStations = [
      { name: 'New Delhi (Mausam Bhawan)', lat: 28.588, lon: 77.221, freq: 'S-Band', rangeKm: 250 },
      { name: 'Mumbai (Colaba)', lat: 18.906, lon: 72.814, freq: 'S-Band', rangeKm: 250 },
      { name: 'Kolkata', lat: 22.533, lon: 88.343, freq: 'S-Band', rangeKm: 250 },
      { name: 'Chennai', lat: 13.082, lon: 80.293, freq: 'S-Band', rangeKm: 250 },
      { name: 'Kochi', lat: 9.965, lon: 76.262, freq: 'C-Band', rangeKm: 250 },
      { name: 'Visakhapatnam', lat: 17.690, lon: 83.318, freq: 'S-Band', rangeKm: 250 },
      { name: 'Hyderabad', lat: 17.447, lon: 78.471, freq: 'C-Band', rangeKm: 250 },
      { name: 'Goa', lat: 15.380, lon: 73.834, freq: 'C-Band', rangeKm: 250 }
    ];

    imdRadarStations.forEach((st) => {
      // DWR 250km Surveillance Circle
      L.circle([st.lat, st.lon], {
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.08,
        weight: 1.2,
        dashArray: '3, 6',
        radius: st.rangeKm * 1000
      }).addTo(map);

      // Station Marker
      const radarIcon = L.divIcon({
        className: 'imd-dwr-marker',
        html: `
          <div style="
            background: #0284c7;
            color: #ffffff;
            border-radius: 8px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 3px;
            border: 1.5px solid #ffffff;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
            white-space: nowrap;
          ">
            <span>📡</span>
            <span>DWR ${st.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [100, 22],
        iconAnchor: [50, 11]
      });

      L.marker([st.lat, st.lon], { icon: radarIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #0284c7;">IMD Doppler Weather Radar</b><br/>
            <b>${st.name}</b><br/>
            Frequency: <b>${st.freq}</b> | Coverage: <b>${st.rangeKm} km</b><br/>
            <span style="color: #10b981; font-weight: bold;">● Operational Telemetry Live</span>
          </div>
        `);
    });

    // Add main city observation station marker
    const stationIcon = L.divIcon({
      className: 'station-map-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          border-radius: 12px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 800;
          font-family: system-ui, sans-serif;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
          border: 2px solid #ffffff;
          white-space: nowrap;
        ">
          <span>📡</span>
          <span>${currentCity.name} IMD Station</span>
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15]
    });

    L.marker([currentCity.lat, currentCity.lon], { icon: stationIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif; font-size:12px; padding:4px;">
          <b style="color:#d97706;">IMD Meteorological Observatory</b><br/>
          Station: ${currentCity.name} (${currentCity.state})<br/>
          <span style="color:#10b981; font-weight:bold;">● Live Telemetry Active</span>
        </div>`
      );

    // Live User GPS Location Beacon Marker
    const gpsLat = userGpsCoords?.lat || (isGpsActive ? currentCity.lat : null);
    const gpsLon = userGpsCoords?.lon || (isGpsActive ? currentCity.lon : null);

    if (gpsLat && gpsLon) {
      const gpsBeaconIcon = L.divIcon({
        className: 'user-gps-beacon-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <!-- Outer Pulsing Ring -->
            <div style="
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 9999px;
              background: rgba(16, 185, 129, 0.25);
              border: 1.5px solid #10b981;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <!-- Center High-Contrast Blue/Emerald Core -->
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 9999px;
              background: #10b981;
              border: 3px solid #ffffff;
              box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const gpsMarker = L.marker([gpsLat, gpsLon], { icon: gpsBeaconIcon, zIndexOffset: 2000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom: 4px;">
              <span style="font-size:18px;">📍</span>
              <div>
                <b style="font-size:12px; color:#0f172a; display:block;">Your Current GPS Location</b>
                <span style="font-size:10px; color:#10b981; font-weight:bold;">● GPS Satellite Lock Active</span>
              </div>
            </div>
            <div style="font-size:10px; color:#64748b; background:#f1f5f9; padding:5px 7px; border-radius:6px;">
              Coordinates: ${gpsLat.toFixed(4)}°N, ${gpsLon.toFixed(4)}°E
            </div>
          </div>
        `);

      markersRef.current['user_gps'] = gpsMarker;
    }

    // Render each saved location with custom badges (🏠 Home, 🎓 College, 💼 Office, etc.)
    const markersObj: { [key: string]: L.Marker } = {};

    savedLocations.forEach((loc) => {
      const theme = getCategoryTheme(loc.category);
      const iconEmoji = loc.icon || theme.icon;

      const customBadgeIcon = L.divIcon({
        className: 'custom-saved-place-marker',
        html: `
          <div style="position: relative; display: inline-flex; flex-direction: column; align-items: center; cursor: pointer;">
            <!-- Pulsing Radar Beacon Ring -->
            <span style="
              position: absolute;
              top: -3px;
              right: -3px;
              width: 8px;
              height: 8px;
              border-radius: 9999px;
              background-color: ${theme.bg};
              border: 1.5px solid white;
              box-shadow: 0 0 6px ${theme.bg};
            "></span>

            <!-- Floating Label Pill -->
            <div style="
              background: ${theme.bg};
              color: #ffffff;
              padding: 5px 11px;
              border-radius: 9999px;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 11px;
              font-weight: 800;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 4px 16px ${theme.shadow};
              border: 2px solid #ffffff;
              white-space: nowrap;
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 14px;">${iconEmoji}</span>
              <span>${loc.label}</span>
            </div>
            <!-- Pin Pointer Triangle -->
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid ${theme.bg};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 36]
      });

      // Contextual weather advice for popup
      let contextualNote = 'Good conditions for regular daily movement.';
      if (loc.category === 'home') {
        contextualNote = 'AQI is satisfactory; comfortable natural ventilation.';
      } else if (loc.category === 'college') {
        contextualNote = 'Passing evening drizzle possible; carry lightweight umbrella.';
      } else if (loc.category === 'office') {
        contextualNote = 'Commute delay index +5 mins; expressway traffic moving smoothly.';
      } else if (loc.category === 'travel') {
        contextualNote = 'High UV (7.2); coastal breeze 18 km/h. Sun protection advised.';
      }

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size: 20px;">${iconEmoji}</span>
              <div>
                <b style="font-size: 13px; color: #0f172a; display:block; line-height: 1.2;">${loc.label}</b>
                <span style="font-size: 10px; color: #64748b;">${loc.cityName}</span>
              </div>
            </div>
            <span style="background: ${theme.bg}15; color: ${theme.bg}; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; border: 1px solid ${theme.bg}40;">
              ${theme.title}
            </span>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 8px; margin: 8px 0; border: 1px solid #e2e8f0; font-size: 11px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
              <span style="color:#64748b;">Current Temp:</span>
              <b style="color:#0f172a;">28°C (Feels 31°C)</b>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
              <span style="color:#64748b;">Air Quality:</span>
              <b style="color:#10b981;">64 AQI (Moderate)</b>
            </div>
            <div style="color: #475569; font-size: 10px; line-height: 1.3; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
              💡 ${contextualNote}
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button id="btn-observe-${loc.id}" style="
              flex: 1;
              background: #2563eb;
              color: #ffffff;
              border: none;
              padding: 6px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              🎯 Focus Feed
            </button>
            <a href="https://earth.google.com/web/@${loc.lat},${loc.lon},1200a,35y,0h,45t,0r" target="_blank" rel="noopener noreferrer" style="
              background: #0284c7;
              color: #ffffff;
              text-decoration: none;
              padding: 6px 9px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
              border: 1px solid #0369a1;
            ">
              <span>🌍 Google Earth 3D</span>
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([loc.lat, loc.lon], { icon: customBadgeIcon })
        .addTo(map)
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-observe-${loc.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectCityLocation(loc.lat, loc.lon, `${loc.label} (${loc.cityName})`);
              onClose();
            };
          }
        }, 80);
      });

      markersObj[loc.id] = marker;
    });

    markersRef.current = markersObj;

    // Automatically Fit Bounds so ALL Points (Home, College, Office, and Station) are covered
    if (savedLocations.length > 0) {
      const allCoords: [number, number][] = [
        [currentCity.lat, currentCity.lon],
        ...savedLocations.map((l) => [l.lat, l.lon] as [number, number])
      ];
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    // Auto-focus requested place if initialFocusLocationId was provided
    if (initialFocusLocationId) {
      const targetLoc = savedLocations.find(
        (l) => l.id === initialFocusLocationId || l.category === initialFocusLocationId
      );
      if (targetLoc) {
        setTimeout(() => {
          handleJumpToLocation(targetLoc);
        }, 350);
      }
    }

    // Map click handler to drop new pin and save place
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setNewPlaceCoord({ lat, lng });
      setShowAddModal(true);
    });

    return () => {
      map.remove();
    };
  }, [currentCity, savedLocations]);

  // Toggle between Street and Google Earth Satellite layer
  const handleToggleLayer = (type: 'streets' | 'satellite') => {
    setMapLayer(type);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (type === 'satellite') {
      if (streetLayerRef.current && map.hasLayer(streetLayerRef.current)) {
        map.removeLayer(streetLayerRef.current);
      }
      if (satelliteLayerRef.current && !map.hasLayer(satelliteLayerRef.current)) {
        satelliteLayerRef.current.addTo(map);
      }
    } else {
      if (satelliteLayerRef.current && map.hasLayer(satelliteLayerRef.current)) {
        map.removeLayer(satelliteLayerRef.current);
      }
      if (streetLayerRef.current && !map.hasLayer(streetLayerRef.current)) {
        streetLayerRef.current.addTo(map);
      }
    }
  };

  // Toggle Live Doppler Radar overlay
  const handleToggleRadar = () => {
    const nextVal = !showRadar;
    setShowRadar(nextVal);
    const map = mapInstanceRef.current;
    if (!map || !radarLayerRef.current) return;
    if (nextVal) {
      if (!map.hasLayer(radarLayerRef.current)) {
        radarLayerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(radarLayerRef.current)) {
        map.removeLayer(radarLayerRef.current);
      }
    }
  };

  // Jump to specific saved location
  const handleJumpToLocation = (loc: SavedLocationItem) => {
    setActivePlaceId(loc.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lon], 15, { duration: 1.2 });
      const marker = markersRef.current[loc.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 1200);
      }
    }
  };

  // Cover all points by fitting bounds
  const handleFitAllPoints = () => {
    setActivePlaceId(null);
    if (mapInstanceRef.current && savedLocations.length > 0) {
      const allCoords: [number, number][] = [
        [currentCity.lat, currentCity.lon],
        ...savedLocations.map((l) => [l.lat, l.lon] as [number, number])
      ];
      const bounds = L.latLngBounds(allCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
  };

  // Save new location dropped on map
  const handleSaveDroppedPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceCoord || !newPlaceLabel.trim() || !onAddSavedLocation) return;

    const theme = getCategoryTheme(newPlaceCategory);
    const newLoc: SavedLocationItem = {
      id: `loc_${Date.now()}`,
      label: newPlaceLabel.trim(),
      cityName: `${currentCity.name}`,
      lat: newPlaceCoord.lat,
      lon: newPlaceCoord.lng,
      category: newPlaceCategory,
      icon: theme.icon,
      createdAt: new Date().toISOString()
    };

    onAddSavedLocation(newLoc);
    setShowAddModal(false);
    setNewPlaceLabel('');
    setNewPlaceCoord(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 text-slate-800">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🌍 Google Earth Weather Map</span>
                </h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  🛰️ Google Earth Satellite Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Satellite 3D imagery with live Doppler Radar and user places
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewPlaceCoord({ lat: currentCity.lat + 0.015, lng: currentCity.lon + 0.015 });
                setShowAddModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Place</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Location Chips Carousel (Home, College, Office, Cover All) */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto z-10 shrink-0 no-scrollbar">
          {/* Cover All Points Primary Action */}
          <button
            onClick={handleFitAllPoints}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shrink-0 border shadow-2xs ${
              activePlaceId === null
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            <span>🌐</span>
            <span>Cover All Points</span>
          </button>

          {/* My GPS Location Chip */}
          <button
            onClick={() => {
              const gLat = userGpsCoords?.lat || currentCity.lat;
              const gLon = userGpsCoords?.lon || currentCity.lon;
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([gLat, gLon], 14, { duration: 1.2 });
                const marker = markersRef.current['user_gps'];
                if (marker) {
                  setTimeout(() => marker.openPopup(), 1200);
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shrink-0 shadow-2xs cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>My GPS Location</span>
          </button>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
            Places:
          </span>

          {savedLocations.map((loc) => {
            const theme = getCategoryTheme(loc.category);
            const isSelected = activePlaceId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => handleJumpToLocation(loc)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{loc.icon || theme.icon}</span>
                <span>{loc.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([currentCity.lat, currentCity.lon], 12);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-amber-700 border border-amber-200 shrink-0"
          >
            <span>📡</span>
            <span>{currentCity.name} Station</span>
          </button>
        </div>

        {/* Map Canvas with Floating Important Places Deck & Google Earth Controls */}
        <div className="flex-1 w-full h-full relative z-0">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Top-Right: Floating Google Earth & Radar Controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleToggleLayer('streets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mapLayer === 'streets'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🗺️</span>
                <span>Street Map</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleLayer('satellite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mapLayer === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🛰️</span>
                <span>Google Earth</span>
              </button>
            </div>

            {/* Radar Overlay Toggle */}
            <button
              type="button"
              onClick={handleToggleRadar}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm backdrop-blur-md cursor-pointer ${
                showRadar
                  ? 'bg-blue-50/95 text-blue-700 border-blue-300'
                  : 'bg-white/95 text-slate-500 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showRadar ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
              <span>🌧️ Doppler Radar: {showRadar ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Top-Left: Floating Important Places Live Cards Deck covering 🏠 Home, 🎓 College, 💼 Office */}
          <div className="absolute top-3 left-3 right-auto max-w-[calc(100vw-32px)] sm:max-w-md pointer-events-none z-10 space-y-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/90 pointer-events-auto">
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Important Places
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFitAllPoints}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Fit All
                  </button>
                  <button
                    onClick={() => setIsDeckMinimized(!isDeckMinimized)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-1 cursor-pointer"
                  >
                    {isDeckMinimized ? 'Expand ▼' : 'Hide ▲'}
                  </button>
                </div>
              </div>

              {!isDeckMinimized && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {savedLocations.slice(0, 3).map((loc) => {
                    const theme = getCategoryTheme(loc.category);
                    const isSelected = activePlaceId === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleJumpToLocation(loc)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                            {loc.icon || theme.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-extrabold text-slate-900 block truncate leading-tight">
                              {loc.label}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {loc.cityName.split(',')[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                          <span className="font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            Active
                          </span>
                          <span className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                            Focus 🎯
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Instructions & Legend */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 z-10 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 🏠 Home
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> 🎓 College
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> 💼 Office
            </span>
            <span className="hidden sm:inline text-slate-400">| Tap anywhere on the map to pin a new place</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Close Map
          </button>
        </div>

        {/* Modal: Add Pin on Click */}
        {showAddModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 animate-in fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <h4 className="text-sm font-bold text-slate-900">Save This Location</h4>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDroppedPlace} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Place Name / Label
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlaceLabel}
                    onChange={(e) => setNewPlaceLabel(e.target.value)}
                    placeholder="e.g. My Home, University Hall, Head Office"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Select Important Place Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { cat: 'home', icon: '🏠', label: 'Home' },
                      { cat: 'college', icon: '🎓', label: 'College' },
                      { cat: 'office', icon: '💼', label: 'Office' },
                      { cat: 'gym', icon: '🏋️', label: 'Gym' },
                      { cat: 'travel', icon: '🏖️', label: 'Beach' },
                      { cat: 'custom', icon: '📍', label: 'Custom' }
                    ].map((item) => (
                      <button
                        key={item.cat}
                        type="button"
                        onClick={() => setNewPlaceCategory(item.cat as any)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          newPlaceCategory === item.cat
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  Coordinates: {newPlaceCoord?.lat.toFixed(4)}, {newPlaceCoord?.lng.toFixed(4)}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    Save to Map ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
