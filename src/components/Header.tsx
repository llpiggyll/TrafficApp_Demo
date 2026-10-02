import React, { useEffect, useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  const [secondsAgo, setSecondsAgo] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 60 ? 4 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setSecondsAgo(1);
  };

  return (
    <header className="fixed top-0 left-0 md:left-16 right-0 h-14 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#c4c5d7]/30 z-40 px-3 md:px-6 flex items-center justify-between gap-3">
      {/* Search Bar (Single line) */}
      <div className="flex-1 max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.();
          }}
          className="relative w-full flex items-center"
        >
          <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search expressways, exits, cameras (e.g. CTE, PIE)..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#f8f9ff] border border-[#c4c5d7]/50 text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#434655]/70 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-colors"
          />
        </form>
      </div>

      {/* Top Corner: Small "Updated 12s ago" text + Profile icon */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={handleRefresh}
          title="Click to refresh sensor sync"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#c4c5d7]/40 bg-[#ffffff] hover:bg-[#eff4ff] transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          <span className="text-[10px] sm:text-xs font-semibold text-[#434655] uppercase tracking-wider tabular-nums">
            Updated {secondsAgo}s ago
          </span>
        </button>

        <div
          className="w-8 h-8 rounded-full bg-[#0037b0] flex items-center justify-center text-white shadow-sm flex-shrink-0"
          title="LTA Commuter ID #SG-9482"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};
