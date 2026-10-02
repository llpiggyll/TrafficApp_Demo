import React, { useState } from 'react';
import { Incident } from '../types/traffic';

interface InteractiveMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  searchQuery?: string;
  isFocusedCorridor?: boolean;
}

interface MapCamera {
  id: string;
  name: string;
  location: string;
  road: string;
  x: number;
  y: number;
  image: string;
}

const DEFAULT_MAP_CAMERAS: MapCamera[] = [
  {
    id: '1704',
    name: 'Cam 1704',
    location: 'Braddell Flyover',
    road: 'CTE (Central Expressway)',
    x: 523,
    y: 380,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1001',
    name: 'Cam 1001',
    location: 'Woodsville Flyover',
    road: 'PIE (Pan Island Expressway)',
    x: 410,
    y: 340,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1302',
    name: 'Cam 1302',
    location: 'Clementi Ave 6',
    road: 'AYE (Ayer Rajah Expressway)',
    x: 310,
    y: 433,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1405',
    name: 'Cam 1405',
    location: 'Paya Lebar Flyover',
    road: 'KPE Tunnel',
    x: 610,
    y: 325,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    id: '1802',
    name: 'Cam 1802',
    location: 'Marine Parade',
    road: 'ECP (East Coast Parkway)',
    x: 650,
    y: 425,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  }
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  searchQuery = '',
  isFocusedCorridor = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [activeCamera, setActiveCamera] = useState<MapCamera | null>(null);

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev * factor, 0.75), 2.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="relative w-full h-full bg-[#E5EEFF]/40 overflow-hidden select-none flex items-center justify-center">
      {/* Background Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="urban-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#747686" strokeWidth="0.5" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#urban-grid)" />
      </svg>

      {/* Main Vector SVG Map of Singapore Expressways */}
      <div
        className="w-full h-full relative flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Singapore Main Island Coastline Shape */}
          <path
            d="M 120,310 C 140,260 210,230 290,210 C 370,190 470,180 570,180 C 670,180 770,220 870,260 C 930,285 960,330 920,380 C 880,430 790,440 680,450 C 580,460 480,480 380,470 C 270,460 170,440 120,380 Z"
            fill="#F8FAFF"
            stroke="#D3E4FE"
            strokeWidth="2.5"
          />

          {/* Jurong Island & Sentosa Island */}
          <path
            d="M 230,480 C 260,470 310,480 300,515 C 270,540 220,530 200,510 Z"
            fill="#F8FAFF"
            stroke="#D3E4FE"
            strokeWidth="1.5"
          />
          <path
            d="M 490,485 C 530,480 560,500 550,520 C 520,530 480,520 480,500 Z"
            fill="#F8FAFF"
            stroke="#D3E4FE"
            strokeWidth="1.5"
          />

          {/* Secondary Arterial Grid */}
          <g opacity="0.25">
            <path d="M 200,340 Q 360,310 520,310 T 840,280" stroke="#c4c5d7" strokeWidth="2" fill="none" />
            <path d="M 280,440 Q 440,430 600,410 T 820,390" stroke="#c4c5d7" strokeWidth="2" fill="none" />
            <path d="M 460,190 L 460,450" stroke="#c4c5d7" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <path d="M 640,210 L 640,440" stroke="#c4c5d7" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
          </g>

          {/* === EXPRESSWAY FLOW LINES === */}

          {/* 1. PIE (Pan Island Expressway) */}
          <path
            d="M 520,330 Q 720,320 890,290"
            fill="none"
            stroke="#16A34A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 450,335 Q 485,332 520,330"
            fill="none"
            stroke="#D97706"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 160,370 Q 300,350 450,335"
            fill="none"
            stroke="#16A34A"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 2. CTE (Central Expressway) */}
          <path
            d="M 530,190 L 525,270"
            fill="none"
            stroke="#16A34A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 525,270 L 520,345"
            fill="none"
            stroke="#DC2626"
            strokeWidth={selectedIncident?.id?.includes('1') ? "9" : "7"}
            strokeLinecap="round"
          />
          <path
            d="M 520,345 L 515,420"
            fill="none"
            stroke="#D97706"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 3. AYE (Ayer Rajah Expressway) */}
          <path
            d="M 140,400 L 260,425"
            fill="none"
            stroke="#16A34A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 260,425 L 360,440"
            fill="none"
            stroke="#DC2626"
            strokeWidth={selectedIncident?.id?.includes('3') ? "9" : "7"}
            strokeLinecap="round"
          />
          <path
            d="M 360,440 Q 450,455 530,445"
            fill="none"
            stroke="#16A34A"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 4. ECP (East Coast Parkway) */}
          <path
            d="M 530,445 Q 690,430 880,310"
            fill="none"
            stroke="#16A34A"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 5. KPE Tunnel */}
          <path
            d="M 570,430 Q 600,340 610,230"
            fill="none"
            stroke="#16A34A"
            strokeWidth="5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* 6. SLE (Seletar Expressway) */}
          <path
            d="M 350,215 Q 460,200 540,210"
            fill="none"
            stroke="#16A34A"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* 7. BKE (Bukit Timah Expressway) */}
          <path
            d="M 360,185 L 375,320"
            fill="none"
            stroke="#16A34A"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Detour Route when corridor focused */}
          {selectedIncident && (
            <path
              d="M 528,240 Q 420,290 390,380 T 420,440"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="3.5"
              strokeDasharray="8 6"
              opacity="0.9"
            />
          )}

          {/* Flow Particles (Live Telemetry Animation) */}
          <circle cx="522" cy="305" r="3.5" fill="#ffffff">
            <animate attributeName="cy" values="270;345" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="310" cy="433" r="3.5" fill="#ffffff">
            <animate attributeName="cx" values="265;355" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;1;0.2" dur="3.5s" repeatCount="indefinite" />
          </circle>

          {/* Expressway Labels */}
          <g fill="#0B1C30" fontFamily="Inter" fontSize="10" fontWeight="600">
            <rect x="220" y="340" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="227" y="353">PIE</text>

            <rect x="740" y="300" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="747" y="313">PIE</text>

            <rect x="532" y="235" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="538" y="248">CTE</text>

            <rect x="200" y="420" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="207" y="433">AYE</text>

            <rect x="710" y="405" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="717" y="418">ECP</text>

            <rect x="620" y="270" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="627" y="283">KPE</text>

            <rect x="345" y="245" width="34" height="18" rx="4" fill="#FFFFFF" filter="url(#soft-shadow)" />
            <text x="351" y="258">BKE</text>
          </g>

          {/* CCTV Camera Interactive Nodes */}
          {showCameras &&
            DEFAULT_MAP_CAMERAS.map((cam) => (
              <g
                key={cam.id}
                className="cursor-pointer group"
                onClick={() => setActiveCamera(cam)}
              >
                <circle
                  cx={cam.x}
                  cy={cam.y}
                  r="9"
                  fill="#0037B0"
                  fillOpacity="0.2"
                  className="group-hover:scale-125 transition-transform"
                />
                <circle
                  cx={cam.x}
                  cy={cam.y}
                  r="5.5"
                  fill="#0037B0"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            ))}

          {/* === INCIDENT PINS (SIMPLE ICON ONLY) === */}
          {incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isRed = inc.severity === 'CRITICAL' || inc.severity === 'HEAVY';
            const color = isRed ? '#DC2626' : '#D97706';

            return (
              <g
                key={inc.id}
                className="cursor-pointer transition-transform group"
                onClick={() => onSelectIncident(inc)}
              >
                {/* Radar Waves for Active Incident */}
                <circle
                  cx={inc.coordinates.x}
                  cy={inc.coordinates.y}
                  r="20"
                  fill={color}
                  opacity="0.15"
                >
                  <animate attributeName="r" values="14;28" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0" dur="1.8s" repeatCount="indefinite" />
                </circle>

                <circle
                  cx={inc.coordinates.x}
                  cy={inc.coordinates.y}
                  r={isSelected ? "17" : "14"}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#soft-shadow)"
                  className="transition-all duration-200 group-hover:scale-110"
                />

                {/* Simple Icon Only in Pin Center */}
                <text
                  x={inc.coordinates.x}
                  y={inc.coordinates.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontFamily="Material Symbols Outlined"
                  fontSize={isSelected ? "14" : "12"}
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {inc.icon === 'car_crash' ? 'car_crash' : inc.icon === 'warning' ? 'warning' : 'minor_crash'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Incident Floating Overlay Tag */}
        {selectedIncident && (
          <div
            className="absolute z-20 pointer-events-none bg-white px-3 py-1.5 rounded-lg shadow-lg border border-[#c4c5d7]/40 flex flex-col items-center"
            style={{
              left: `${(selectedIncident.coordinates.x / 1000) * 100}%`,
              top: `${(selectedIncident.coordinates.y / 620) * 100}%`,
              transform: 'translate(-50%, -150%)'
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping"></span>
              <span className="text-xs font-bold text-[#DC2626] whitespace-nowrap">
                {selectedIncident.road} ({selectedIncident.currentSpeed} km/h)
              </span>
            </div>
            <span className="text-[11px] text-[#434655] whitespace-nowrap">
              {selectedIncident.direction}
            </span>
          </div>
        )}
      </div>

      {/* Floating Tactical Map HUD Controls (Top-right) */}
      <div className="absolute top-16 md:top-4 right-3 md:right-4 z-20 flex flex-col gap-2">
        <div className="bg-[#ffffff] p-1 rounded-xl shadow-md border border-[#c4c5d7]/30 flex flex-col gap-1">
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

        <button
          onClick={resetZoom}
          className="w-9 h-9 bg-[#ffffff] rounded-xl shadow-md border border-[#c4c5d7]/30 flex items-center justify-center text-[#0037b0] hover:bg-[#eff4ff] active:scale-95 transition-all"
          title="Fit Singapore Island"
          aria-label="Fit Singapore Island"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>

        <button
          onClick={() => setShowCameras(!showCameras)}
          className={`w-9 h-9 rounded-xl shadow-md border border-[#c4c5d7]/30 flex items-center justify-center transition-all ${
            showCameras ? 'bg-[#dce9ff] text-[#0037b0]' : 'bg-[#ffffff] text-[#434655] hover:bg-[#eff4ff]'
          }`}
          title="Toggle CCTV Nodes"
          aria-label="Toggle CCTV Nodes"
        >
          <span className="material-symbols-outlined text-[20px]">videocam</span>
        </button>
      </div>

      {/* Floating Live Telemetry Legend Chip */}
      <div className="absolute bottom-20 md:bottom-4 right-3 md:right-4 bg-[#ffffff]/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-[#c4c5d7]/30 flex flex-col gap-1.5 max-w-xs z-10">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#434655] uppercase tracking-wider">
          <span>Speed Telemetry</span>
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

      {/* LIVE CAMERA POPUP MODAL (When tapping ANY camera node on the map) */}
      {activeCamera && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveCamera(null)}
        >
          <div
            className="relative bg-[#ffffff] rounded-2xl overflow-hidden shadow-2xl max-w-sm sm:max-w-md w-full border border-[#c4c5d7]/40 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Live Camera Snapshot */}
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

            {/* Footer with road info */}
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
