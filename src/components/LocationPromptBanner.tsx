import React from 'react';

interface LocationPromptBannerProps {
  onGrantLocation: () => void;
  onDismiss: () => void;
  isRequesting: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'error';
  errorMessage?: string | null;
}

export const LocationPromptBanner: React.FC<LocationPromptBannerProps> = ({
  onGrantLocation,
  onDismiss,
  isRequesting,
  permissionState,
  errorMessage
}) => {
  if (permissionState === 'granted') {
    return null;
  }

  return (
    <div className="mx-3 md:mx-6 my-2 bg-[#ffffff] border border-[#1d4ed8]/30 rounded-xl shadow-md p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in z-30">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#dce9ff] text-[#0037b0] flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
          <span className="material-symbols-outlined text-[20px]">near_me</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-[#0b1c30]">
              {permissionState === 'denied' ? 'Location Access Blocked' : 'Enable Live GPS Location'}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#eff4ff] text-[#0037b0]">
              Google / Waze Navigation
            </span>
          </div>
          <p className="text-xs text-[#565e74] mt-0.5 leading-relaxed">
            {permissionState === 'denied'
              ? 'Location was denied. Please allow location in your browser site settings to see your live blue dot on expressways.'
              : 'Grant location permission to pinpoint your live vehicle position, calculate real distances to incidents, and receive emergency help.'}
          </p>
          {errorMessage && (
            <span className="text-[11px] text-[#ba1a1a] mt-0.5">{errorMessage}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#565e74] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
        >
          Later
        </button>
        {permissionState !== 'denied' && (
          <button
            type="button"
            disabled={isRequesting}
            onClick={onGrantLocation}
            className="px-3.5 py-1.5 rounded-lg bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-70"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isRequesting ? 'animate-spin' : ''
              }`}
            >
              {isRequesting ? 'sync' : 'my_location'}
            </span>
            <span>{isRequesting ? 'Requesting GPS...' : 'Grant Access'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
