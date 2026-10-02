import React, { useState } from 'react';
import { Incident } from '../types/traffic';

interface NearestIncidentsListProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId?: string;
  isMobileSheetExpanded?: boolean;
  onToggleMobileSheet?: () => void;
}

export const NearestIncidentsList: React.FC<NearestIncidentsListProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId,
  isMobileSheetExpanded = false,
  onToggleMobileSheet
}) => {
  const [filter, setFilter] = useState<'all' | 'accident' | 'congestion'>('all');

  const filtered = incidents.slice(0, 3).filter((item) => {
    if (filter === 'accident') return item.category === 'accident';
    if (filter === 'congestion') return item.category === 'congestion';
    return true;
  });

  return (
    <>
      {/* DESKTOP SIDE PANEL (360px persistent on desktop) */}
      <aside className="hidden md:flex w-[360px] min-w-[360px] max-w-[360px] h-full flex-col bg-[#ffffff] border-r border-[#c4c5d7]/30 z-30 shadow-sm overflow-hidden select-none">
        {/* Panel Header & Telemetry Overview */}
        <div className="p-4 bg-[#eff4ff] flex flex-col gap-2 border-b border-[#c4c5d7]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Telemetry Overview
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white text-[#434655] text-[11px] font-medium border border-[#c4c5d7]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0037b0] animate-pulse"></span>
              LTA SENSOR SYNC
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-[#0b1c30]">94.2%</span>
              <span className="text-xs text-[#434655] ml-1.5">Grid Flow</span>
            </div>
            <span className="text-xs text-[#0037b0] font-semibold">Clearance Normal</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 flex items-center gap-1.5 border-b border-[#c4c5d7]/20 bg-white">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#434655] hover:bg-[#dce9ff]'
            }`}
          >
            All (3)
          </button>
          <button
            onClick={() => setFilter('congestion')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'congestion'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#434655] hover:bg-[#dce9ff]'
            }`}
          >
            Congestion
          </button>
          <button
            onClick={() => setFilter('accident')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'accident'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'bg-[#eff4ff] text-[#434655] hover:bg-[#dce9ff]'
            }`}
          >
            Accidents
          </button>
        </div>

        {/* 3 Nearest Incidents Feed */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Nearest Incidents
            </span>
            <span className="text-xs text-[#565e74]">Radius: 8.5 km</span>
          </div>

          {/* List of 3 nearest incidents, each as one line: icon, road, time ago */}
          <div className="flex flex-col gap-2">
            {filtered.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const isSevere = inc.severity === 'CRITICAL' || inc.severity === 'HEAVY';

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`group p-3 rounded-xl transition-all cursor-pointer border flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#eff4ff] border-[#1d4ed8] shadow-sm'
                      : 'bg-[#eff4ff]/60 hover:bg-[#eff4ff] border-transparent'
                  }`}
                >
                  {/* Single Line: icon, road, time ago */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSevere
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : 'bg-[#dce9ff] text-[#0037b0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {inc.icon}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <span className="text-sm font-semibold text-[#0b1c30] truncate">
                        {inc.road}
                      </span>
                      <span className="text-xs text-[#565e74] flex-shrink-0">
                        • {inc.timeAgo}
                      </span>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-[#747686] text-[18px] group-hover:text-[#0037b0] transition-colors flex-shrink-0">
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>

          {/* Corridor Speeds Snapshot */}
          <div className="mt-4 pt-3 border-t border-[#c4c5d7]/20 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
              Corridor Speeds
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                <span className="text-xs text-[#565e74]">ECP East Coast</span>
                <span className="text-base font-bold text-[#0b1c30] mt-0.5">
                  78 <span className="text-xs text-[#565e74] font-normal">km/h</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                <span className="text-xs text-[#565e74]">KPE Tunnel</span>
                <span className="text-base font-bold text-[#0b1c30] mt-0.5">
                  69 <span className="text-xs text-[#565e74] font-normal">km/h</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                <span className="text-xs text-[#565e74]">BKE Woodlands</span>
                <span className="text-base font-bold text-[#0b1c30] mt-0.5">
                  84 <span className="text-xs text-[#565e74] font-normal">km/h</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#eff4ff] flex flex-col">
                <span className="text-xs text-[#565e74]">SLE Seletar</span>
                <span className="text-base font-bold text-[#0b1c30] mt-0.5">
                  88 <span className="text-xs text-[#565e74] font-normal">km/h</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-3 bg-[#eff4ff] border-t border-[#c4c5d7]/30 flex items-center justify-between text-xs text-[#565e74]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            LTA TrafficScan Sync
          </span>
          <span className="font-mono text-[11px]">3 Corridors Flagged</span>
        </div>
      </aside>

      {/* MOBILE BOTTOM SHEET (Bottom sheet on mobile) */}
      <div
        className={`md:hidden fixed left-0 right-0 bottom-16 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-[#c4c5d7]/40 transition-all duration-300 ${
          isMobileSheetExpanded ? 'h-[65vh]' : 'h-auto max-h-[220px]'
        }`}
      >
        {/* Grab Handle */}
        <div
          onClick={onToggleMobileSheet}
          className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer select-none"
        >
          <div className="w-10 h-1 bg-[#c4c5d7] rounded-full"></div>
          <div className="w-full px-4 pt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              3 Nearest Incidents
            </span>
            <span className="text-[11px] text-[#0037b0] font-medium flex items-center gap-0.5">
              {isMobileSheetExpanded ? 'Collapse' : 'Tap to expand'}
              <span className="material-symbols-outlined text-[16px]">
                {isMobileSheetExpanded ? 'expand_more' : 'expand_less'}
              </span>
            </span>
          </div>
        </div>

        {/* 3 Nearest Incidents (Each as one line: icon, road, time ago) */}
        <div className="px-4 pb-3 flex flex-col gap-2 overflow-y-auto max-h-[calc(65vh-50px)]">
          {incidents.slice(0, 3).map((inc) => {
            const isSevere = inc.severity === 'CRITICAL' || inc.severity === 'HEAVY';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] active:scale-[0.99] transition-all flex items-center justify-between gap-2.5 cursor-pointer"
              >
                {/* One line: icon, road, time ago */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSevere ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#dce9ff] text-[#0037b0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {inc.icon}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-[#0b1c30] truncate">
                    {inc.road}
                  </span>

                  <span className="text-xs text-[#565e74] flex-shrink-0 ml-auto">
                    {inc.timeAgo}
                  </span>
                </div>

                <span className="material-symbols-outlined text-[#747686] text-[16px] flex-shrink-0">
                  chevron_right
                </span>
              </div>
            );
          })}

          {/* Expanded extra corridor speeds for mobile */}
          {isMobileSheetExpanded && (
            <div className="mt-3 pt-3 border-t border-[#c4c5d7]/30 flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">
                Corridor Speeds
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#eff4ff]">
                  <span className="text-[11px] text-[#565e74]">ECP East Coast</span>
                  <div className="text-sm font-bold text-[#0b1c30]">78 km/h</div>
                </div>
                <div className="p-2 rounded-lg bg-[#eff4ff]">
                  <span className="text-[11px] text-[#565e74]">KPE Tunnel</span>
                  <div className="text-sm font-bold text-[#0b1c30]">69 km/h</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
