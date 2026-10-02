import React, { useState } from 'react';
import { Incident } from '../types/traffic';

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onBack
}) => {
  const [isNotified, setIsNotified] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleNotifyToggle = () => {
    const nextState = !isNotified;
    setIsNotified(nextState);
    if (nextState) {
      setToastMessage(`Subscribed to clearance alerts for ${incident.road}`);
    } else {
      setToastMessage(`Unsubscribed from alerts for ${incident.road}`);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b1c30] text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-fade-in border border-[#c4c5d7]/20">
          <span className="material-symbols-outlined text-[#16A34A] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDE PANEL (360px persistent on desktop) */}
      <section className="hidden md:flex w-[360px] min-w-[360px] max-w-[360px] h-full flex-col bg-[#ffffff] border-r border-[#c4c5d7]/30 z-30 shadow-sm overflow-y-auto select-none">
        {/* Top Action / Back Anchor */}
        <div className="p-4 flex items-center justify-between border-b border-[#c4c5d7]/20">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-[#0b1c30] hover:text-[#0037b0] transition-colors py-1 group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span className="text-sm font-semibold">All Incidents</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] bg-[#ffdad6]/80 px-2 py-0.5 rounded">
            {incident.severity}
          </span>
        </div>

        {/* Core Incident Content */}
        <div className="p-4 flex flex-col gap-4 flex-1">
          {/* Status & Verification Badge */}
          <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">verified</span>
            <span className="text-xs text-[#0b1c30] font-semibold">
              Active Incident • Verified by LTA TrafficScan
            </span>
          </div>

          {/* Road Name and Direction */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-medium">
              Expressway Corridor
            </span>
            <h1 className="text-lg font-bold text-[#0b1c30] leading-snug">
              {incident.roadFullName}
            </h1>
            <p className="text-xs text-[#434655] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px] text-[#0037b0]">navigation</span>
              {incident.direction}
            </p>
          </div>

          {/* Incident Type and Time Reported */}
          <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col gap-1 border border-[#c4c5d7]/20">
            <div className="flex items-center gap-2 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px]">
                {incident.icon}
              </span>
              <span className="text-sm font-bold">{incident.type}</span>
            </div>
            <span className="text-xs text-[#434655]">
              Reported {incident.timeAgo} • Sensor ID {incident.sensorId}
            </span>
          </div>

          {/* Live Impact Metric Card */}
          <div className="bg-[#eff4ff]/60 p-3 rounded-xl flex flex-col gap-1.5 border border-[#c4c5d7]/20">
            <span className="text-[11px] uppercase tracking-wider text-[#565e74] font-medium">
              Current Speed vs Baseline
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#ba1a1a] tabular-nums leading-tight">
                {incident.currentSpeed} km/h
              </span>
              <span className="text-xs text-[#565e74]">
                Normal: {incident.normalSpeed} km/h
              </span>
            </div>
            <div className="w-full bg-[#d3e4fe] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#ba1a1a] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((incident.currentSpeed / incident.normalSpeed) * 100, 100)}%`
                }}
              ></div>
            </div>
            <span className="text-[11px] text-[#434655] mt-0.5">
              Traffic moving at {incident.currentSpeed} km/h (Normal: {incident.normalSpeed} km/h) • Delay: +{incident.delayMinutes}m
            </span>
          </div>

          {/* Official Advisory Text (One sentence) */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#565e74] font-medium">
              Official Advisory
            </span>
            <p className="text-xs sm:text-sm text-[#0b1c30] leading-relaxed bg-[#f8f9ff] p-2.5 rounded-lg border border-[#c4c5d7]/30">
              {incident.officialAdvisory}
            </p>
          </div>

          {/* Incident Camera Still Snapshot */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#565e74] font-medium">
                Live Camera Feed
              </span>
              <span className="text-[11px] text-[#0037b0] font-semibold">
                {incident.cameraName} • {incident.cameraLocation}
              </span>
            </div>
            <div className="relative w-full h-32 bg-[#dce9ff] rounded-lg overflow-hidden border border-[#c4c5d7]/40 shadow-inner">
              <img
                src={incident.cameraImage}
                alt={`LTA CCTV ${incident.cameraLocation}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.cctv-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'cctv-fallback w-full h-full flex flex-col items-center justify-center bg-[#0b1c30] text-white p-3 text-center';
                    fallback.innerHTML = `
                      <span class="material-symbols-outlined text-[24px] text-[#b7c4ff] mb-1">videocam</span>
                      <span class="text-xs font-mono">LIVE FEED: ${incident.cameraLocation}</span>
                      <span class="text-[10px] text-gray-400 mt-0.5">Traffic moving at ${incident.currentSpeed} km/h</span>
                    `;
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute top-2 left-2 bg-[#ffffff]/90 px-2 py-0.5 rounded text-[#0b1c30] text-[10px] font-mono flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                REC {incident.reportedTime}
              </div>
            </div>
          </div>

          {/* Primary Action Button: "Notify me when cleared" */}
          <div className="pt-2 pb-4 flex flex-col gap-2 mt-auto">
            <button
              onClick={handleNotifyToggle}
              className={`w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] ${
                isNotified
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#1d4ed8] text-white hover:bg-[#0037b0]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isNotified ? 'check_circle' : 'notifications_active'}
              </span>
              <span>
                {isNotified ? 'Subscribed for Clearance Alert' : 'Notify me when cleared'}
              </span>
            </button>

            <div className="flex items-center justify-between px-1 text-[11px] text-[#565e74]">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${incident.roadFullName} - ${incident.type}. Speed: ${incident.currentSpeed} km/h.`
                  );
                  setToastMessage('Route status copied to clipboard');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="hover:text-[#0b1c30] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">share</span>
                Share Route Status
              </button>
              <span>ID #{incident.id.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE BOTTOM SHEET (Bottom sheet on mobile) */}
      <section className="md:hidden fixed left-0 right-0 bottom-16 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-[#c4c5d7]/40 max-h-[82vh] overflow-y-auto flex flex-col pb-6">
        {/* Grab Handle & Back Row */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2 z-10 border-b border-[#c4c5d7]/20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-semibold text-[#0037b0] py-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>All Incidents</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded">
            {incident.severity}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3.5">
          {/* Status & Verification */}
          <div className="flex items-center gap-2 bg-[#eff4ff] px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0b1c30]">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping"></span>
            <span>Verified by LTA TrafficScan</span>
          </div>

          {/* Road Name and Direction */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-medium">
              Expressway Corridor
            </span>
            <h1 className="text-base font-bold text-[#0b1c30]">
              {incident.roadFullName}
            </h1>
            <p className="text-xs text-[#434655] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#0037b0]">navigation</span>
              {incident.direction}
            </p>
          </div>

          {/* Incident Type and Time Reported */}
          <div className="bg-[#eff4ff] p-3 rounded-xl flex flex-col gap-0.5 border border-[#c4c5d7]/20">
            <div className="flex items-center gap-1.5 text-[#ba1a1a] text-sm font-bold">
              <span className="material-symbols-outlined text-[18px]">{incident.icon}</span>
              <span>{incident.type}</span>
            </div>
            <span className="text-xs text-[#434655]">
              Reported {incident.timeAgo} • Sensor ID {incident.sensorId}
            </span>
          </div>

          {/* Speed Telemetry */}
          <div className="bg-[#eff4ff]/60 p-2.5 rounded-xl flex flex-col gap-1 border border-[#c4c5d7]/20">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#565e74]">Current Speed</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-[#ba1a1a]">{incident.currentSpeed} km/h</span>
                <span className="text-[11px] text-[#565e74]">(Normal: {incident.normalSpeed})</span>
              </div>
            </div>
            <div className="w-full bg-[#d3e4fe] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#ba1a1a] h-full rounded-full"
                style={{
                  width: `${Math.min((incident.currentSpeed / incident.normalSpeed) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Official Advisory Text (One sentence) */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#565e74] font-medium">
              Official Advisory
            </span>
            <p className="text-xs text-[#0b1c30] leading-relaxed bg-[#f8f9ff] p-2.5 rounded-lg border border-[#c4c5d7]/30">
              {incident.officialAdvisory}
            </p>
          </div>

          {/* Primary Action Button: "Notify me when cleared" */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleNotifyToggle}
              className={`w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
                isNotified ? 'bg-[#16A34A] text-white' : 'bg-[#1d4ed8] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isNotified ? 'check_circle' : 'notifications_active'}
              </span>
              <span>
                {isNotified ? 'Subscribed for Clearance Alert' : 'Notify me when cleared'}
              </span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
