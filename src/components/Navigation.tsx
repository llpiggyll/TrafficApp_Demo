import React from 'react';
import { ScreenType } from '../types/traffic';
import { LOGO_URL } from '../data/mockData';

interface NavigationProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  savedPlacesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onSelectScreen,
  savedPlacesCount
}) => {
  return (
    <>
      {/* Desktop Left Rail (w-16 persistent) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-16 bg-[#ffffff] border-r border-[#c4c5d7]/30 z-50 flex-col items-center justify-between py-3">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo */}
          <button
            onClick={() => onSelectScreen('map')}
            className="flex items-center justify-center p-1.5 hover:opacity-80 transition-opacity"
            title="SG Flow Telemetry"
          >
            <img
              src={LOGO_URL}
              alt="SG Flow"
              className="h-8 w-8 object-contain rounded-lg"
              onError={(e) => {
                // Inline SVG fallback if image blocked
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.logo-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'logo-fallback w-8 h-8 rounded-lg bg-[#0037b0] flex items-center justify-center text-white text-xs font-bold';
                  fallback.innerText = 'SG';
                  parent.appendChild(fallback);
                }
              }}
            />
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <button
              onClick={() => onSelectScreen('map')}
              aria-label="Live Map"
              title="Live Map"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                currentScreen === 'map'
                  ? 'bg-[#dce9ff] text-[#0037b0] shadow-sm'
                  : 'text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">map</span>
            </button>

            <button
              onClick={() => onSelectScreen('alerts')}
              aria-label="Alerts & Saved Places"
              title="Alerts & Saved Places"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
                currentScreen === 'alerts'
                  ? 'bg-[#dce9ff] text-[#0037b0] shadow-sm'
                  : 'text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {savedPlacesCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
              )}
            </button>

            <button
              onClick={() => onSelectScreen('help')}
              aria-label="Emergency Help & Towing"
              title="Emergency Help & Towing"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                currentScreen === 'help'
                  ? 'bg-[#ffdad6] text-[#ba1a1a] shadow-sm'
                  : 'text-[#434655] hover:bg-[#eff4ff] hover:text-[#ba1a1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">emergency</span>
            </button>
          </nav>
        </div>

        {/* Bottom utility */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#434655]" title="Sensor System Online">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (fixed bottom-0) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#c4c5d7]/30 z-50 flex items-center justify-around px-4 pb-safe">
        <button
          onClick={() => onSelectScreen('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-colors ${
            currentScreen === 'map' ? 'text-[#0037b0] font-semibold' : 'text-[#434655]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">map</span>
          <span className="text-[11px] mt-0.5">Live Map</span>
        </button>

        <button
          onClick={() => onSelectScreen('alerts')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-colors relative ${
            currentScreen === 'alerts' ? 'text-[#0037b0] font-semibold' : 'text-[#434655]'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {savedPlacesCount > 0 && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">Alerts</span>
        </button>

        <button
          onClick={() => onSelectScreen('help')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-colors ${
            currentScreen === 'help' ? 'text-[#ba1a1a] font-semibold' : 'text-[#434655]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">emergency</span>
          <span className="text-[11px] mt-0.5">Help</span>
        </button>
      </nav>
    </>
  );
};
