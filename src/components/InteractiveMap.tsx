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
  road: string;
  lat: number;
  lng: number;
  image: string;
}

// Singapore Expressway Polyline GPS Coordinates for Traffic Flow Lines
const EXPRESSWAY_CORRIDORS = [
  // CTE Southbound (Central Expressway)
  {
    name: 'CTE Southbound (Seletar to AMK Ave 1)',
    coords: [
      [1.3882, 103.8645],
      [1.3780, 103.8612],
      [1.3650, 103.8580]
    ] as [number, number][],
    color: '#16A34A', // Smooth > 60 km/h
    weight: 6,
    speed: '68 km/h'
  },
  {
    name: 'CTE AMK Ave 1 to Braddell (Compression)',
    coords: [
      [1.3650, 103.8580],
      [1.3540, 103.8572],
      [1.3431, 103.8568]
    ] as [number, number][],
    color: '#D97706', // Moderate 30-59 km/h
    weight: 7,
    speed: '34 km/h'
  },
  {
    name: 'CTE Braddell Incident Bottleneck',
    coords: [
      [1.3431, 103.8568],
      [1.3320, 103.8550],
      [1.3210, 103.8530]
    ] as [number, number][],
    color: '#DC2626', // Congested < 30 km/h
    weight: 8,
    speed: '14 km/h'
  },
  {
    name: 'CTE Moulmein to City (Recovery)',
    coords: [
      [1.3210, 103.8530],
      [1.3090, 103.8490],
      [1.2980, 103.8450],
      [1.2850, 103.8400]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '62 km/h'
  },

  // PIE (Pan Island Expressway - Tuas to Changi)
  {
    name: 'PIE West (Tuas to Bukit Timah)',
    coords: [
      [1.3350, 103.7050],
      [1.3420, 103.7450],
      [1.3500, 103.7850],
      [1.3450, 103.8200]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '75 km/h'
  },
  {
    name: 'PIE Woodsville Stalled Vehicle Sector',
    coords: [
      [1.3450, 103.8200],
      [1.3350, 103.8500],
      [1.3250, 103.8650],
      [1.3280, 103.8850]
    ] as [number, number][],
    color: '#D97706',
    weight: 7,
    speed: '42 km/h'
  },
  {
    name: 'PIE East (Paya Lebar to Changi Airport)',
    coords: [
      [1.3280, 103.8850],
      [1.3350, 103.9250],
      [1.3480, 103.9650],
      [1.3580, 103.9850]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '82 km/h'
  },

  // AYE (Ayer Rajah Expressway)
  {
    name: 'AYE West (Tuas to Jurong)',
    coords: [
      [1.3050, 103.6800],
      [1.3150, 103.7250]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '74 km/h'
  },
  {
    name: 'AYE Clementi Collision Bottleneck',
    coords: [
      [1.3150, 103.7250],
      [1.3150, 103.7650],
      [1.3050, 103.7850]
    ] as [number, number][],
    color: '#DC2626',
    weight: 8,
    speed: '22 km/h'
  },
  {
    name: 'AYE East (One-North to MCE/Marina)',
    coords: [
      [1.3050, 103.7850],
      [1.2850, 103.8150],
      [1.2720, 103.8450]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '65 km/h'
  },

  // ECP (East Coast Parkway)
  {
    name: 'ECP Corridor',
    coords: [
      [1.2720, 103.8550],
      [1.2950, 103.8900],
      [1.3050, 103.9300],
      [1.3350, 103.9800]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '78 km/h'
  },

  // BKE (Bukit Timah Expressway to Woodlands Checkpoint)
  {
    name: 'BKE Corridor',
    coords: [
      [1.3450, 103.7800],
      [1.3850, 103.7750],
      [1.4300, 103.7720]
    ] as [number, number][],
    color: '#16A34A',
    weight: 6,
    speed: '84 km/h'
  }
];

const DEFAULT_MAP_CAMERAS: MapCamera[] = [
  {
    id: '1704',
    name: 'Cam 1704',
    location: 'Braddell Flyover',
    road: 'CTE (Central Expressway)',
    lat: 1.3431,
    lng: 103.8568,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1001',
    name: 'Cam 1001',
    location: 'Woodsville Flyover',
    road: 'PIE (Pan Island Expressway)',
    lat: 1.325,
    lng: 103.865,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1302',
    name: 'Cam 1302',
    location: 'Clementi Ave 6 Exit',
    road: 'AYE (Ayer Rajah Expressway)',
    lat: 1.315,
    lng: 103.765,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '2701',
    name: 'Cam 2701',
    location: 'Woodlands Flyover',
    road: 'BKE (Woodlands)',
    lat: 1.4470,
    lng: 103.7716,
    image:
      'https://images.data.gov.sg/api/traffic-images/2026/10/cebe342c-5cac-4533-ae3e-10a4562f5576.jpg'
  },
  {
    id: '1405',
    name: 'Cam 1405',
    location: 'Paya Lebar Flyover',
    road: 'KPE Tunnel',
    lat: 1.328,
    lng: 103.895,
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
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);

  const [mapStyle, setMapStyle] = useState<string>('navigation');
  const [showTrafficFlow, setShowTrafficFlow] = useState<boolean>(true);
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [activeCamera, setActiveCamera] = useState<MapCamera | null>(null);

  // Dynamic Tile Layers Definition with Google Maps Platform Support
  const getTileConfig = (styleKey: string, key?: string) => {
    const hasGoogleKey = Boolean(key && key.trim().length > 0);

    if (hasGoogleKey && styleKey === 'google_traffic') {
      return {
        url: `https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&key=${key}`,
        subdomains: ['0', '1', '2', '3']
      };
    }

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
      trafficLayerRef.current = L.layerGroup().addTo(map);
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

  // Render Traffic Flow Lines on Map
  useEffect(() => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;
    trafficLayerRef.current.clearLayers();

    if (showTrafficFlow) {
      EXPRESSWAY_CORRIDORS.forEach((corridor) => {
        // Shadow/glow line
        L.polyline(corridor.coords, {
          color: corridor.color,
          weight: corridor.weight + 4,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(trafficLayerRef.current!);

        // Core traffic speed line
        const polyline = L.polyline(corridor.coords, {
          color: corridor.color,
          weight: corridor.weight,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(trafficLayerRef.current!);

        polyline.bindTooltip(
          `<div class="font-sans text-xs"><b>${corridor.name}</b><br/><span style="color:${corridor.color}">Flow: ${corridor.speed}</span></div>`,
          { sticky: true }
        );
      });
    }
  }, [showTrafficFlow]);

  // Render Incident Pins (Simple Icon Only) & Cameras
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. Render Incident Pins (Simple icon only)
    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const isSevere = inc.severity === 'CRITICAL' || inc.severity === 'HEAVY';
      const bgColor = isSevere ? '#DC2626' : '#D97706';

      const customIcon = L.divIcon({
        className: 'incident-map-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
            <div class="absolute -inset-2.5 rounded-full" style="background-color: ${bgColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div class="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110" style="background-color: ${bgColor}; border: 2.5px solid #ffffff;">
              <span class="material-symbols-outlined" style="color: #ffffff; font-size: 19px; font-variation-settings: 'FILL' 1;">
                ${inc.icon}
              </span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-8 px-2 py-0.5 rounded shadow-md bg-white border border-gray-200 text-[11px] font-bold whitespace-nowrap text-gray-900 pointer-events-none z-20">
                    ${inc.road} (${inc.currentSpeed} km/h)
                  </div>`
                : ''
            }
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
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

    // 2. Render CCTV Camera Pins
    if (showCameras) {
      DEFAULT_MAP_CAMERAS.forEach((cam) => {
        const camIcon = L.divIcon({
          className: 'cctv-map-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style="width: 28px; height: 28px;">
              <div class="w-7 h-7 rounded-full bg-[#0037b0] border-2 border-white shadow-md flex items-center justify-center text-white">
                <span class="material-symbols-outlined text-[15px]">videocam</span>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const camMarker = L.marker([cam.lat, cam.lng], { icon: camIcon });
        camMarker.on('click', () => {
          setActiveCamera(cam);
        });
        camMarker.addTo(markersLayerRef.current!);
      });
    }
  }, [incidents, selectedIncident, showCameras, onSelectIncident]);

  // Render User Location (GPS Blue Dot with Pulsing Halo)
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

  // Recenter when an incident is selected
  useEffect(() => {
    if (selectedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedIncident.coordinates.lat, selectedIncident.coordinates.lng],
        14,
        { duration: 1.2 }
      );
    }
  }, [selectedIncident]);

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
      {/* Leaflet Real Interactive Map Container */}
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

        {/* Fit Island Button */}
        <button
          onClick={handleFitSingapore}
          className="w-10 h-10 bg-[#ffffff] rounded-xl shadow-lg border border-[#c4c5d7]/40 flex items-center justify-center text-[#0037b0] hover:bg-[#eff4ff] active:scale-95 transition-all"
          title="Fit Singapore Island Overview"
          aria-label="Fit Singapore Island Overview"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>

        {/* Toggle Traffic Flow Layer */}
        <button
          onClick={() => setShowTrafficFlow(!showTrafficFlow)}
          className={`w-10 h-10 rounded-xl shadow-lg border border-[#c4c5d7]/40 flex items-center justify-center transition-all active:scale-95 ${
            showTrafficFlow
              ? 'bg-[#dce9ff] text-[#0037b0] font-semibold'
              : 'bg-[#ffffff] text-[#747686] hover:bg-[#eff4ff]'
          }`}
          title="Toggle Waze Live Traffic Flow"
          aria-label="Toggle Live Traffic Flow"
        >
          <span className="material-symbols-outlined text-[20px]">traffic</span>
        </button>

        {/* Toggle CCTV Layer */}
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
            title={`Style: ${mapStyle}. Click to switch.`}
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

      {/* Floating Live Telemetry Legend Chip */}
      <div className="absolute bottom-20 md:bottom-4 right-3 md:right-4 bg-[#ffffff]/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-[#c4c5d7]/40 flex flex-col gap-1.5 max-w-xs z-10 select-none">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#434655] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#0037b0]">traffic</span>
            {mapsApiKey ? 'Google Maps Traffic' : 'Waze Live Traffic'}
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
