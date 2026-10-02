import React, { useState } from 'react';
import { SavedPlace } from '../types/traffic';

interface AlertsScreenProps {
  savedPlaces: SavedPlace[];
  onTogglePlace: (id: string) => void;
  onAddPlace: (newPlace: SavedPlace) => void;
  onRemovePlace: (id: string) => void;
  onUpdateTimeWindow: (id: string, morning: string, evening: string) => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  savedPlaces,
  onTogglePlace,
  onAddPlace,
  onRemovePlace,
  onUpdateTimeWindow
}) => {
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(savedPlaces[1]?.id || null);
  const [isAddingPlace, setIsAddingPlace] = useState<boolean>(false);
  const [newPlaceName, setNewPlaceName] = useState<string>('');
  const [newPlaceCorridor, setNewPlaceCorridor] = useState<string>('SLE/TPE corridor');
  const [customIcon, setCustomIcon] = useState<string>('place');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const maxPlacesReached = savedPlaces.length >= 5;

  const handleCreatePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim() || maxPlacesReached) return;

    const newPlace: SavedPlace = {
      id: `place-${Date.now()}`,
      name: newPlaceName.trim(),
      corridor: newPlaceCorridor,
      icon: customIcon,
      enabled: true,
      timeWindows: {
        morning: '08:00 – 09:30',
        evening: '18:00 – 19:30',
        frequency: 'Mon – Fri',
        threshold: '> 10 mins'
      }
    };

    onAddPlace(newPlace);
    setNewPlaceName('');
    setIsAddingPlace(false);
    setExpandedPlaceId(newPlace.id);
  };

  const handleDelete = (id: string) => {
    onRemovePlace(id);
    setDeleteConfirmId(null);
    if (expandedPlaceId === id) {
      setExpandedPlaceId(null);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#f8f9ff]">
      {/* Background Subdued Singapore Map with Corridor Telemetry Vectors */}
      <div className="absolute inset-0 z-0 bg-[#eff4ff] pointer-events-none opacity-85">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="alerts-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dce9ff" strokeOpacity="0.4" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#alerts-grid)" />

          {/* Stylized Island Coastline */}
          <path
            d="M 280,480 C 350,420 520,380 750,390 C 950,400 1150,420 1280,460 C 1320,490 1260,560 1120,600 C 920,640 680,630 450,600 C 320,580 260,520 280,480 Z"
            fill="#ffffff"
            fillOpacity="0.6"
          />

          {/* Inactive Corridor Backdrops */}
          <path d="M 320,530 Q 600,490 900,510 T 1240,470" fill="none" opacity="0.4" stroke="#c4c5d7" strokeWidth="2.5" />
          <path d="M 720,390 Q 740,500 730,620" fill="none" opacity="0.4" stroke="#c4c5d7" strokeWidth="2.5" />

          {/* Highlighted Saved Place Corridors */}
          <g>
            <path d="M 420,575 L 560,545 L 680,535 L 790,560" fill="none" stroke="#1d4ed8" strokeWidth="4" />
            <circle cx="560" cy="545" r="5" fill="#1d4ed8" />
            <circle cx="560" cy="545" r="11" fill="none" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.5" />
            <rect x="575" y="534" width="138" height="22" rx="4" fill="#0b1c30" />
            <text x="583" y="549" fill="#ffffff" fontFamily="Inter" fontSize="11" fontWeight="600" letterSpacing="0.5">
              AYE · ONE-NORTH
            </text>
          </g>

          <g>
            <path d="M 680,480 L 890,470 L 1080,485 L 1210,480" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeDasharray="4 3" opacity="0.8" />
            <circle cx="1160" cy="482" r="4.5" fill="#1d4ed8" />
            <rect x="1110" y="454" width="102" height="20" rx="4" fill="#ffffff" />
            <text x="1118" y="468" fill="#0b1c30" fontFamily="Inter" fontSize="10" fontWeight="600">
              HOME · PIE
            </text>
          </g>

          <g>
            <path d="M 830,590 L 960,570 L 1150,530" fill="none" stroke="#1d4ed8" strokeWidth="3" opacity="0.6" />
            <circle cx="850" cy="587" r="4" fill="#1d4ed8" />
            <rect x="800" y="602" width="106" height="20" rx="4" fill="#ffffff" />
            <text x="808" y="616" fill="#0b1c30" fontFamily="Inter" fontSize="10" fontWeight="600">
              GYM · ECP
            </text>
          </g>
        </svg>

        <div className="hidden lg:flex absolute bottom-6 right-6 items-center gap-2 px-3 py-1.5 bg-white rounded shadow-sm text-[#565e74]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-ping"></span>
          <span className="text-xs uppercase tracking-wider text-[#434655]">
            Telemetry Grid 103.8198° E / 1.3521° N
          </span>
        </div>
      </div>

      {/* Main Alerts Surface Container (Strictly Saved Places, Toggles, Time Window, Add Place) */}
      <div className="relative z-10 w-full md:w-[380px] md:min-w-[380px] md:max-w-[380px] h-full bg-[#ffffff] flex flex-col justify-between shadow-xl md:shadow-md border-r border-[#c4c5d7]/30 overflow-y-auto">
        {/* Header & List of Saved Places */}
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 flex flex-col gap-1 border-b border-[#c4c5d7]/20">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#0b1c30] tracking-tight">Saved Places</h1>
              <span className="text-xs font-semibold text-[#565e74] px-2 py-0.5 rounded bg-[#eff4ff]">
                {savedPlaces.length} / 5
              </span>
            </div>
            <p className="text-xs text-[#565e74]">Up to 5 custom routes</p>
          </div>

          {/* List of saved places (max 5) */}
          <div className="flex flex-col w-full divide-y divide-[#c4c5d7]/20" id="saved-places-list">
            {savedPlaces.map((place) => {
              const isExpanded = expandedPlaceId === place.id;
              const isConfirmingDelete = deleteConfirmId === place.id;

              return (
                <div key={place.id} className="flex flex-col transition-colors">
                  {/* Row: Place Item + Single Toggle + Quick Remove */}
                  <div
                    onClick={() => setExpandedPlaceId(isExpanded ? null : place.id)}
                    className={`flex items-center justify-between px-4 sm:px-6 py-3.5 cursor-pointer select-none transition-colors ${
                      isExpanded ? 'bg-[#eff4ff]' : 'hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          place.enabled
                            ? isExpanded
                              ? 'bg-[#0037b0] text-white shadow-sm'
                              : 'bg-[#dce9ff] text-[#0037b0]'
                            : 'bg-[#eff4ff] text-[#565e74]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {place.icon}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#0b1c30] truncate">
                            {place.name}
                          </span>
                          {isExpanded && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] flex-shrink-0"></span>
                          )}
                        </div>
                        <span className="text-xs text-[#565e74] truncate">
                          {place.corridor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Delete Trigger */}
                      <button
                        type="button"
                        title={`Remove ${place.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(isConfirmingDelete ? null : place.id);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#747686] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>

                      {/* Single Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={place.enabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlace(place.id);
                        }}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center focus:outline-none flex-shrink-0 ${
                          place.enabled ? 'bg-[#1d4ed8] justify-end' : 'bg-[#c4c5d7] justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 bg-white rounded-full shadow-md"></span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Delete Confirmation Banner */}
                  {isConfirmingDelete && (
                    <div className="px-4 sm:px-6 py-2.5 bg-[#ffdad6]/40 border-t border-b border-[#ba1a1a]/20 flex items-center justify-between text-xs animate-fade-in">
                      <span className="text-[#93000a] font-medium">Remove this place?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 text-[#565e74] hover:text-[#0b1c30]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(place.id)}
                          className="px-3 py-1 bg-[#ba1a1a] text-white rounded font-semibold hover:bg-[#93000a] shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Time of day selector shown ONLY after tapping a place */}
                  {isExpanded && place.timeWindows && (
                    <div className="flex flex-col px-4 sm:px-6 py-3.5 gap-3 bg-[#dce9ff]/35 border-t border-b border-[#c4c5d7]/30 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#434655] uppercase tracking-wide">
                          Alert time window
                        </span>
                        <span className="text-[11px] font-semibold text-[#0037b0]">
                          Configured
                        </span>
                      </div>

                      {/* Time intervals */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Morning Interval */}
                        <div className="flex flex-col p-2.5 bg-white rounded-lg shadow-sm border border-[#c4c5d7]/30">
                          <div className="flex items-center gap-1 text-[#565e74] mb-1">
                            <span className="material-symbols-outlined text-[15px] text-[#D97706]">
                              wb_sunny
                            </span>
                            <span className="text-[11px] font-medium">Morning</span>
                          </div>
                          <span className="text-sm font-bold text-[#0b1c30] tracking-tight tabular-nums">
                            {place.timeWindows.morning}
                          </span>
                        </div>

                        {/* Evening Interval */}
                        <div className="flex flex-col p-2.5 bg-white rounded-lg shadow-sm border border-[#c4c5d7]/30">
                          <div className="flex items-center gap-1 text-[#565e74] mb-1">
                            <span className="material-symbols-outlined text-[15px] text-[#1d4ed8]">
                              nights_stay
                            </span>
                            <span className="text-[11px] font-medium">Evening</span>
                          </div>
                          <span className="text-sm font-bold text-[#0b1c30] tracking-tight tabular-nums">
                            {place.timeWindows.evening}
                          </span>
                        </div>
                      </div>

                      {/* Frequency Setting */}
                      <div className="flex items-center justify-between py-1.5 px-2.5 bg-white rounded-lg shadow-sm border border-[#c4c5d7]/30 text-xs">
                        <span className="text-[#565e74]">Frequency</span>
                        <span className="font-semibold text-[#0b1c30]">
                          {place.timeWindows.frequency}
                        </span>
                      </div>

                      {/* Sensitivity Condition */}
                      <div className="flex items-center justify-between py-1.5 px-2.5 bg-white rounded-lg shadow-sm border border-[#c4c5d7]/30 text-xs">
                        <div className="flex items-center gap-1.5 text-[#0b1c30]">
                          <span className="material-symbols-outlined text-[15px] text-[#a73400]">
                            timer
                          </span>
                          <span className="text-[#565e74]">Only notify when delay</span>
                        </div>
                        <span className="font-bold text-[#a73400]">
                          {place.timeWindows.threshold}
                        </span>
                      </div>

                      {/* Remove place action in expanded view */}
                      <div className="pt-1 flex items-center justify-between border-t border-[#c4c5d7]/30">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(place.id)}
                          className="text-xs text-[#ba1a1a] hover:underline flex items-center gap-1 font-medium py-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Remove this place</span>
                        </button>
                        <span className="text-[10px] text-[#565e74]">{place.corridor}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inline Add Place Form (if open) */}
          {isAddingPlace && (
            <form onSubmit={handleCreatePlace} className="p-4 sm:p-6 bg-[#eff4ff] border-t border-[#c4c5d7]/30 flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0b1c30] uppercase">Add New Place ({savedPlaces.length + 1}/5)</span>
                <button
                  type="button"
                  onClick={() => setIsAddingPlace(false)}
                  className="text-xs text-[#565e74] hover:text-[#0b1c30]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#434655] block mb-1">Place Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Changi Airport, Parents' House"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  className="w-full h-9 px-3 text-xs sm:text-sm bg-white border border-[#c4c5d7]/50 rounded-lg focus:outline-none focus:border-[#1d4ed8]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#434655] block mb-1">Corridor</label>
                <select
                  value={newPlaceCorridor}
                  onChange={(e) => setNewPlaceCorridor(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs sm:text-sm bg-white border border-[#c4c5d7]/50 rounded-lg focus:outline-none focus:border-[#1d4ed8]"
                >
                  <option value="PIE corridor">PIE (Pan Island Expressway)</option>
                  <option value="CTE corridor">CTE (Central Expressway)</option>
                  <option value="AYE corridor">AYE (Ayer Rajah Expressway)</option>
                  <option value="ECP corridor">ECP (East Coast Parkway)</option>
                  <option value="KPE corridor">KPE (Kallang-Paya Lebar)</option>
                  <option value="SLE/TPE corridor">SLE / TPE corridor</option>
                  <option value="BKE corridor">BKE (Bukit Timah Expressway)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#434655] block mb-1">Icon</label>
                <div className="flex items-center gap-2">
                  {['home', 'business_center', 'school', 'fitness_center', 'flight', 'local_mall'].map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCustomIcon(iconName)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        customIcon === iconName
                          ? 'bg-[#1d4ed8] text-white shadow-sm'
                          : 'bg-white text-[#434655] border border-[#c4c5d7]/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 mt-1 bg-[#1d4ed8] hover:bg-[#0037b0] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-colors"
              >
                Save Place
              </button>
            </form>
          )}
        </div>

        {/* Footer: One "Add place" button ("Nothing else on this screen") */}
        <div className="p-4 sm:p-6 mt-auto border-t border-[#c4c5d7]/20 bg-white">
          <button
            type="button"
            disabled={maxPlacesReached}
            onClick={() => setIsAddingPlace(true)}
            className={`w-full h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all active:scale-[0.99] ${
              maxPlacesReached
                ? 'bg-[#c4c5d7]/50 text-[#565e74] cursor-not-allowed'
                : 'bg-[#0037b0] hover:bg-[#1d4ed8] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>{maxPlacesReached ? 'Max 5 places reached' : 'Add place'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
