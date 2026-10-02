import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident } from '../types/traffic';

interface InteractiveMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  searchQuery?: string;
  isFocusedCorridor?: boolean;
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  onCenterUserLocation?: () => void;
  mapsApiKey?: string;
}

interface MapCamera {
  id: string;
  name: string;
  location: string;
  expressway: string;
  road: string;
  lat: number;
  lng: number;
  image: string;
}

// Expressway Cameras with exact GPS coordinates on Singapore Expressways
const ALL_EXPRESSWAY_CAMERAS: MapCamera[] = [
  // CTE (Central Expressway)
  {
    id: '1704',
    name: 'Cam 1704',
    expressway: 'CTE',
    location: 'Before Braddell Flyover Exit 10 (City-bound)',
    road: 'CTE (Central Expressway)',
    lat: 1.3431,
    lng: 103.8568,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1702',
    name: 'Cam 1702',
    expressway: 'CTE',
    location: 'Moulmein Flyover (Seletar-bound)',
    road: 'CTE (Central Expressway)',
    lat: 1.3210,
    lng: 103.8530,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1705',
    name: 'Cam 1705',
    expressway: 'CTE',
    location: 'After AMK Ave 1 Flyover (City-bound)',
    road: 'CTE (Central Expressway)',
    lat: 1.3650,
    lng: 103.8580,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // PIE (Pan Island Expressway)
  {
    id: '1001',
    name: 'Cam 1001',
    expressway: 'PIE',
    location: 'Near Woodsville Flyover (Changi-bound)',
    road: 'PIE (Pan Island Expressway)',
    lat: 1.3250,
    lng: 103.8650,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1003',
    name: 'Cam 1003',
    expressway: 'PIE',
    location: 'Paya Lebar Flyover (Tuas-bound)',
    road: 'PIE (Pan Island Expressway)',
    lat: 1.3320,
    lng: 103.8950,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // AYE (Ayer Rajah Expressway)
  {
    id: '1301',
    name: 'Cam 1301',
    expressway: 'AYE',
    location: 'Near Clementi Ave 6 Exit (Tuas-bound)',
    road: 'AYE (Ayer Rajah Expressway)',
    lat: 1.3150,
    lng: 103.7650,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1302',
    name: 'Cam 1302',
    expressway: 'AYE',
    location: 'After Jurong Town Hall Exit (MCE-bound)',
    road: 'AYE (Ayer Rajah Expressway)',
    lat: 1.3228,
    lng: 103.7486,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // KJE (Kranji Expressway)
  {
    id: '2901',
    name: 'Cam 2901',
    expressway: 'KJE',
    location: 'Before BKE Exit (BKE-bound)',
    road: 'Kranji Expressway',
    lat: 1.3909,
    lng: 103.7654,
    image:
      'https://images.data.gov.sg/api/traffic-images/2026/10/cebe342c-5cac-4533-ae3e-10a4562f5576.jpg'
  },

  // BKE (Bukit Timah Expressway)
  {
    id: '2701',
    name: 'Cam 2701',
    expressway: 'BKE',
    location: 'Woodlands Checkpoint',
    road: 'BKE (Bukit Timah Expressway)',
    lat: 1.4470,
    lng: 103.7716,
    image:
      'https://images.data.gov.sg/api/traffic-images/2026/10/cebe342c-5cac-4533-ae3e-10a4562f5576.jpg'
  },

  // ECP (East Coast Parkway)
  {
    id: '1801',
    name: 'Cam 1801',
    expressway: 'ECP',
    location: 'Marine Parade (City-bound)',
    road: 'East Coast Parkway',
    lat: 1.3020,
    lng: 103.9050,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  }
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  searchQuery = '',
  isFocusedCorridor = false,
  userLocation,
  onCenterUserLocation,
  mapsApiKey
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const focusCircleRef = useRef<L.Circle | null>(null);

  const [mapStyle, setMapStyle] = useState<string>('google_traffic');
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [activeCamera, setActiveCamera] = useState<MapCamera | null>(null);

  // Dynamic Tile Configuration with Google Maps Platform Support
  const getTileConfig = (styleKey: string, key?: string) => {
    const hasGoogleKey = Boolean(key && key.trim().length > 0);

    // Official Google Maps Live Traffic (Renders Google's accurate highway traffic)
    if (hasGoogleKey && styleKey === 'google_traffic') {
      return {
        url: `https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&key=${key}`,
        subdomains: ['0', '1', '2', '3']
      };
    }

    // Google Maps Satellite with Road Labels
    if (hasGoogleKey && styleKey === 'google_satellite') {
      return {
        url: `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${key}`,
        subdomains: ['0', '1', '2', '3']
      };
    }

    if (styleKey === 'night') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        subdomains: 'abcd'
      };
    }

    if (styleKey === 'osm') {
      return {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: 'abc'
      };
    }

    // Default clean navigation tiles (Voyager)
    return {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd'
    };
  };

  // If a Google Maps API Key is provided, auto-switch to Google Maps Live Traffic
  useEffect(() => {
    if (mapsApiKey && mapsApiKey.trim().length > 0) {
      setMapStyle('google_traffic');
    }
  }, [mapsApiKey]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 12,
        minZoom: 10,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false
      });

      const config = getTileConfig(mapStyle, mapsApiKey);
      const initialLayer = L.tileLayer(config.url, {
        subdomains: config.subdomains,
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = initialLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Style Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const config = getTileConfig(mapStyle, mapsApiKey);
    const newLayer = L.tileLayer(config.url, {
      subdomains: config.subdomains,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapStyle, mapsApiKey]);

  // Render Incident Pins & CCTV Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. Render Incident Pins strictly on their real GPS coordinates
    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const isSevere = inc.severity === 'CRITICAL' || inc.severity === 'HEAVY';
      const bgColor = isSevere ? '#DC2626' : '#D97706';

      const customIcon = L.divIcon({
        className: 'incident-map-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 42px; height: 42px;">
            <div class="absolute -inset-2.5 rounded-full" style="background-color: ${bgColor}; opacity: ${
              isSelected ? '0.45' : '0.2'
            }; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div class="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110" style="background-color: ${bgColor}; border: 2.5px solid #ffffff;">
              <span class="material-symbols-outlined" style="color: #ffffff; font-size: 19px; font-variation-settings: 'FILL' 1;">
                ${inc.icon}
              </span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-8 px-2.5 py-0.5 rounded shadow-lg bg-[#0b1c30] text-white text-[11px] font-bold whitespace-nowrap pointer-events-none z-20 flex items-center gap-1 border border-white/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
                    <span>${inc.road} (${inc.currentSpeed} km/h)</span>
                  </div>`
                : ''
            }
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 500
      });

      marker.on('click', () => {
        onSelectIncident(inc);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // 2. Render CCTV Camera Pins along Expressways
    if (showCameras) {
      ALL_EXPRESSWAY_CAMERAS.forEach((cam) => {
        // Highlight cameras matching the selected incident's expressway
        const isMatchedHighway =
          selectedIncident &&
          (selectedIncident.road.toUpperCase().includes(cam.expressway) ||
            selectedIncident.cameraName.includes(cam.id));

        const camIcon = L.divIcon({
          className: 'cctv-map-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer hover:scale-125 transition-transform" style="width: 32px; height: 32px;">
              ${
                isMatchedHighway
                  ? '<div class="absolute -inset-1.5 rounded-full bg-[#16A34A] opacity-40 animate-ping"></div>'
                  : ''
              }
              <div class="w-7 h-7 rounded-full shadow-md flex items-center justify-center text-white border-2 border-white transition-colors" style="background-color: ${
                isMatchedHighway ? '#16A34A' : '#0037b0'
              };">
                <span class="material-symbols-outlined text-[15px]">videocam</span>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const camMarker = L.marker([cam.lat, cam.lng], {
          icon: camIcon,
          zIndexOffset: isMatchedHighway ? 900 : 300
        });

        camMarker.on('click', () => {
          setActiveCamera(cam);
        });

        camMarker.addTo(markersLayerRef.current!);
      });
    }
  }, [incidents, selectedIncident, showCameras, onSelectIncident]);

  // Highlight Incident Impact Zone when an incident is selected
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedIncident) {
      const latlng: [number, number] = [
        selectedIncident.coordinates.lat,
        selectedIncident.coordinates.lng
      ];

      // Smooth camera pan to incident
      mapInstanceRef.current.flyTo(latlng, 14, { duration: 1.2 });

      // Clean glowing halo directly over the incident location
      if (focusCircleRef.current) {
        focusCircleRef.current.setLatLng(latlng);
      } else {
        focusCircleRef.current = L.circle(latlng, {
          radius: 800,
          color: selectedIncident.severity === 'CRITICAL' ? '#DC2626' : '#D97706',
          weight: 2,
          dashArray: '4 4',
          fillColor: selectedIncident.severity === 'CRITICAL' ? '#DC2626' : '#D97706',
          fillOpacity: 0.12
        }).addTo(mapInstanceRef.current);
      }
    } else {
      if (focusCircleRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(focusCircleRef.current);
        focusCircleRef.current = null;
      }
    }
  }, [selectedIncident]);

  // Render User GPS Location (Blue Dot)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation) {
      const latlng: [number, number] = [userLocation.lat, userLocation.lng];

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(latlng);
      } else {
        userMarkerRef.current = L.circleMarker(latlng, {
          radius: 8,
          fillColor: '#1d4ed8',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 1
        }).addTo(mapInstanceRef.current);
      }

      if (userLocation.accuracy) {
        if (userAccuracyRef.current) {
          userAccuracyRef.current.setLatLng(latlng);
          userAccuracyRef.current.setRadius(userLocation.accuracy);
        } else {
          userAccuracyRef.current = L.circle(latlng, {
            radius: userLocation.accuracy,
            color: '#1d4ed8',
            weight: 1,
            fillColor: '#1d4ed8',
            fillOpacity: 0.15
          }).addTo(mapInstanceRef.current);
        }
      }
    } else {
      if (userMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userAccuracyRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userAccuracyRef.current);
        userAccuracyRef.current = null;
      }
    }
  }, [userLocation]);

  const handleZoom = (factor: number) => {
    if (!mapInstanceRef.current) return;
    if (factor > 1) {
      mapInstanceRef.current.zoomIn();
    } else {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleFitSingapore = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([1.3521, 103.8198], 12, { duration: 1 });
  };

  const handleCenterUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1 });
    } else {
      onCenterUserLocation?.();
    }
  };

  const cycleMapStyle = () => {
    const hasGoogleKey = Boolean(mapsApiKey && mapsApiKey.trim().length > 0);
    const styles = hasGoogleKey
      ? ['google_traffic', 'google_satellite', 'navigation', 'night', 'osm']
      : ['navigation', 'night', 'osm'];

    const currentIndex = styles.indexOf(mapStyle);
    const nextStyle = styles[(currentIndex + 1) % styles.length];
    setMapStyle(nextStyle);
  };

  return (
    <div className="relative w-full h-full bg-[#f0f3f8] overflow-hidden select-none">
      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Tactical Map HUD Controls */}
      <div className="absolute top-16 md:top-4 right-3 md:right-4 z-20 flex flex-col gap-2">
        {/* Zoom In / Out Pill */}
        <div className="bg-[#ffffff] p-1 rounded-xl shadow-lg border border-[#c4c5d7]/40 flex flex-col gap-1 backdrop-blur-md">
          <button
            onClick={() => handleZoom(1.2)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0b1c30] hover:bg-[#eff4ff] active:scale-95 transition-all"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <div className="h-[1px] bg-[#c4c5d7]/30 w-full"></div>
          <button
            onClick={() => handleZoom(0.8)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0b1c30] hover:bg-[#eff4ff] active:scale-95 transition-all"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>

        {/* GPS Live Recenter Button */}
        <button
          onClick={handleCenterUser}
          className={`w-10 h-10 rounded-xl shadow-lg border border-[#c4c5d7]/40 flex items-center justify-center transition-all active:scale-95 ${
            userLocation
              ? 'bg-[#ffffff] text-[#0037b0] hover:bg-[#eff4ff]'
              : 'bg-[#ffffff] text-[#747686] hover:text-[#0037b0]'
          }`}
          title={userLocation ? 'Center on My GPS Location' : 'Enable My GPS Location'}
          aria-label="My Location"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: userLocation ? "'FILL' 1" : "'FILL' 0" }}
          >
            my_location
          </span>
        </button>

        {/* Fit Island Overview */}
        <button
          onClick={handleFitSingapore}
          className="w-10 h-10 bg-[#ffffff] rounded-xl shadow-lg border border-[#c4c5d7]/40 flex items-center justify-center text-[#0037b0] hover:bg-[#eff4ff] active:scale-95 transition-all"
          title="Fit Singapore Island Overview"
          aria-label="Fit Singapore Island Overview"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>

        {/* Toggle Expressway CCTV Layer */}
        <button
          onClick={() => setShowCameras(!showCameras)}
          className={`w-10 h-10 rounded-xl shadow-lg border border-[#c4c5d7]/40 flex items-center justify-center transition-all active:scale-95 ${
            showCameras
              ? 'bg-[#dce9ff] text-[#0037b0]'
              : 'bg-[#ffffff] text-[#747686] hover:bg-[#eff4ff]'
          }`}
          title="Toggle Expressway Surveillance Cameras"
          aria-label="Toggle Cameras"
        >
          <span className="material-symbols-outlined text-[20px]">videocam</span>
        </button>

        {/* Map Style Switcher */}
        <div className="bg-[#ffffff] p-1 rounded-xl shadow-lg border border-[#c4c5d7]/40 flex flex-col gap-1">
          <button
            onClick={cycleMapStyle}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] active:scale-95 transition-all"
            title={`Style: ${mapStyle}. Click to cycle.`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {mapStyle.includes('satellite')
                ? 'satellite'
                : mapStyle === 'night'
                ? 'dark_mode'
                : mapStyle.includes('google')
                ? 'public'
                : 'layers'}
            </span>
          </button>
        </div>
      </div>

      {/* Corridor Focus Pill (When an incident is selected) */}
      {selectedIncident && (
        <div className="absolute top-16 md:top-4 left-3 md:left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-[#c4c5d7]/40 flex items-center gap-2.5 max-w-sm animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping flex-shrink-0"></span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#0b1c30] truncate">
              {selectedIncident.roadFullName}
            </span>
            <span className="text-[11px] text-[#565e74] truncate">
              {selectedIncident.cameraName} • Traffic moving at {selectedIncident.currentSpeed} km/h
            </span>
          </div>
        </div>
      )}

      {/* Floating Live Telemetry Legend Chip */}
      <div className="absolute bottom-20 md:bottom-4 right-3 md:right-4 bg-[#ffffff]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-[#c4c5d7]/40 flex flex-col gap-1.5 max-w-xs z-10 select-none">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#434655] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#0037b0]">traffic</span>
            {mapsApiKey ? 'Google Maps Live Traffic' : 'Expressway Flow'}
          </span>
          <span className="text-[#16A34A] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#0b1c30]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
            <span>&gt;60 km/h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
            <span>30–59</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
            <span>&lt;30 km/h</span>
          </div>
        </div>
      </div>

      {/* LIVE CAMERA POPUP MODAL */}
      {activeCamera && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveCamera(null)}
        >
          <div
            className="relative bg-[#ffffff] rounded-2xl overflow-hidden shadow-2xl max-w-sm sm:max-w-md w-full border border-[#c4c5d7]/40 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-[#eff4ff] border-b border-[#c4c5d7]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span className="text-xs sm:text-sm font-bold text-[#0b1c30]">
                  {activeCamera.name} • {activeCamera.location}
                </span>
              </div>
              <button
                onClick={() => setActiveCamera(null)}
                className="w-7 h-7 rounded-full bg-[#dce9ff] hover:bg-[#c4c5d7] flex items-center justify-center text-xs font-bold text-[#0b1c30]"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <img
                src={activeCamera.image}
                alt={activeCamera.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9';
                }}
              />
              <div className="absolute top-2 left-2 bg-[#0b1c30]/85 px-2 py-0.5 rounded text-white text-[10px] font-mono flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                LIVE CCTV STREAM
              </div>
            </div>

            <div className="p-3 bg-white flex items-center justify-between text-xs text-[#565e74]">
              <span className="font-semibold text-[#0b1c30]">{activeCamera.road}</span>
              <span className="text-[11px] text-[#0037b0] font-medium">LTA TrafficScan Feed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
