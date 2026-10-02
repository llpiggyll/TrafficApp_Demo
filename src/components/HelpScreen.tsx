import React, { useState } from 'react';
import { TOWING_SERVICES, HELP_MAP_BG } from '../data/mockData';

export const HelpScreen: React.FC = () => {
  const [isInIncident, setIsInIncident] = useState<boolean>(false);
  const [copiedLocation, setCopiedLocation] = useState<boolean>(false);
  const [callingService, setCallingService] = useState<string | null>(null);

  const currentLocationText =
    'CTE Southbound KM 14.2 (Near Braddell Flyover Exit 10) · Lat 1.3431° N, Long 103.8568° E';

  const handleShareLocation = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentLocationText);
        setCopiedLocation(true);
        setTimeout(() => setCopiedLocation(false), 2500);
      } catch {
        setCopiedLocation(true);
      }
    } else {
      setCopiedLocation(true);
    }
  };

  const handleCall = (serviceName: string, phone: string) => {
    setCallingService(serviceName);
    // Real tel anchor trigger
    window.location.href = `tel:${phone}`;
    setTimeout(() => setCallingService(null), 3500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#f8f9ff]">
      {/* MAP CANVAS & TELEMETRY BEACON (Background on mobile, right panel on desktop) */}
      <div className="relative flex-1 h-full min-h-[300px] bg-[#eff4ff] overflow-hidden order-2 md:order-1">
        {/* Real Singapore Map Imagery or Fallback Graphic */}
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url('${HELP_MAP_BG}')`,
            filter: isInIncident ? 'brightness(0.95)' : 'brightness(1)'
          }}
        >
          {/* Subtle dark gradient overlay */}
          <div className="w-full h-full bg-gradient-to-t from-[#0b1c30]/20 via-transparent to-transparent"></div>
        </div>

        {/* Real-Time GPS Pin and Visual Telemetry Pulse */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {isInIncident && (
              <>
                <span className="absolute w-36 h-36 rounded-full bg-[#ba1a1a]/15 animate-ping"></span>
                <span className="absolute w-20 h-20 rounded-full bg-[#ba1a1a]/30 animate-pulse"></span>
              </>
            )}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-xl text-white transition-all duration-300 ${
                isInIncident ? 'bg-[#ba1a1a] scale-110' : 'bg-[#0037b0]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isInIncident ? 'emergency' : 'near_me'}
              </span>
            </div>

            {/* Tactical Pin Flag */}
            <div className="absolute left-12 -top-8 pointer-events-auto bg-[#ffffff] shadow-lg border border-[#c4c5d7]/40 px-3 py-1.5 rounded-lg flex flex-col gap-0.5 whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isInIncident ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#16A34A]'
                  }`}
                ></span>
                <span className="text-xs font-bold text-[#0b1c30]">CTE KM 14.2 SB</span>
              </div>
              <span className="text-[10px] text-[#434655] font-mono">
                Lat 1.3431° N • Long 103.8568° E
              </span>
            </div>
          </div>
        </div>

        {/* Floating Map Status Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
          <div className="bg-[#ffffff]/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-[#c4c5d7]/30 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
              fmd_good
            </span>
            <span className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wide">
              Fixed GPS Precision
            </span>
            <span className="text-[11px] text-[#565e74] ml-1">± 2.4m</span>
          </div>

          <div className="bg-[#ffffff]/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-[#c4c5d7]/30 hidden sm:flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#0037b0]">traffic</span>
            <span className="text-[11px] text-[#0b1c30]">
              CTE Southbound: Heavy Flow (38 km/h)
            </span>
          </div>
        </div>
      </div>

      {/* FIXED SIDE PANEL (Strict 360px on desktop, top/stacked on mobile) */}
      <div className="w-full md:w-[380px] md:min-w-[380px] md:max-w-[380px] h-full bg-[#ffffff] border-l border-[#c4c5d7]/30 flex flex-col overflow-y-auto shadow-xl z-20 order-1 md:order-2">
        {/* Fast Triage Action Zone */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* PRIMARY EMERGENCY CTA: ONE LARGE RED BUTTON */}
          <button
            type="button"
            onClick={() => setIsInIncident(!isInIncident)}
            className={`w-full min-h-[52px] font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              isInIncident
                ? 'bg-[#ba1a1a] text-white ring-4 ring-[#ffdad6]'
                : 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emergency
            </span>
            <span>
              {isInIncident ? "I'M IN AN INCIDENT (ACTIVE)" : "I'm in an incident"}
            </span>
          </button>

          {/* Reveal details AFTER TAPPING: "Share my location" and short list of 3 nearby repair/towing services */}
          {isInIncident ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Share My Location Pill */}
              <div className="bg-[#eff4ff] rounded-xl p-3.5 flex flex-col gap-2.5 border border-[#c4c5d7]/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                      Current Expressway Marker
                    </span>
                    <span className="text-sm font-bold text-[#0b1c30]">
                      CTE KM 14.2 Southbound
                    </span>
                    <span className="text-xs text-[#565e74]">
                      Near Braddell Flyover Exit 10
                    </span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-[#dce9ff] text-[#0037b0] text-[10px] font-bold">
                    LIVE LOCK
                  </div>
                </div>

                {/* "Share my location" button */}
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="w-full h-10 rounded-lg bg-[#ffffff] hover:bg-[#eff4ff] text-[#0b1c30] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm border border-[#c4c5d7]/30 active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#0037b0]">
                    {copiedLocation ? 'check' : 'share_location'}
                  </span>
                  <span>
                    {copiedLocation ? 'Location Copied to Clipboard!' : 'Share my location'}
                  </span>
                </button>
              </div>

              {/* EMAS Recovery (LTA Free Towing) */}
              <div className="bg-[#dce9ff]/50 rounded-xl p-3 flex flex-col gap-1 border border-[#c4c5d7]/30">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#0037b0]">
                    local_shipping
                  </span>
                  <span className="text-xs font-bold text-[#0b1c30]">
                    EMAS Recovery (LTA Free Towing)
                  </span>
                </div>
                <p className="text-[11px] text-[#434655]">
                  Free clearance to nearest expressway safe bay. 24/7 dedicated line.
                </p>
                <a
                  href="tel:18002255582"
                  className="mt-1 w-full h-9 bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>1800-2255-582 (Free EMAS)</span>
                </a>
              </div>

              {/* Short list of 3 nearby repair or towing services, each showing name, distance, and a "Call" button */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                    Nearby Verified Towing
                  </span>
                  <span className="text-[11px] text-[#565e74]">3 Available Now</span>
                </div>

                <div className="flex flex-col gap-2">
                  {TOWING_SERVICES.map((service) => (
                    <div
                      key={service.id}
                      className="bg-[#eff4ff]/70 hover:bg-[#eff4ff] rounded-xl p-3 flex items-center justify-between gap-3 border border-[#c4c5d7]/25 transition-all"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-[#0b1c30] truncate">
                          {service.name}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-[#565e74]">
                          <span className="material-symbols-outlined text-[14px] text-[#0037b0]">
                            navigation
                          </span>
                          <span>{service.distance}</span>
                        </div>
                      </div>

                      {/* "Call" Button */}
                      <button
                        type="button"
                        onClick={() => handleCall(service.name, service.phone)}
                        className="h-9 px-3.5 bg-[#ffffff] hover:bg-[#dce9ff] text-[#0037b0] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm border border-[#c4c5d7]/40 active:scale-95 whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        <span>Call</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Road Safety Directive Note */}
                <div className="mt-2 pt-2 border-t border-[#c4c5d7]/20 flex items-start gap-2 text-xs text-[#434655]">
                  <span className="material-symbols-outlined text-[16px] text-[#a73400] flex-shrink-0 mt-0.5">
                    shield
                  </span>
                  <span className="leading-relaxed">
                    Move behind the metal crash barrier immediately. Keep hazard lights active while awaiting recovery vehicle.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Prompt state before tapping */
            <div className="flex flex-col items-center justify-center p-6 text-center text-[#565e74] gap-2">
              <span className="material-symbols-outlined text-[36px] text-[#c4c5d7]">
                car_repair
              </span>
              <p className="text-xs leading-relaxed max-w-xs">
                Tap the red button above if your vehicle has broken down or you have been involved in an expressway incident.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calling Modal Simulation */}
      {callingService && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-xs w-full flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#dce9ff] text-[#0037b0] flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[28px]">phone_in_talk</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">Connecting Call</h3>
              <p className="text-xs text-[#565e74] mt-0.5">Dialing {callingService}...</p>
            </div>
            <button
              onClick={() => setCallingService(null)}
              className="w-full h-9 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] hover:bg-[#dce9ff]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
