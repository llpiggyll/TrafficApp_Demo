import React, { useState, useEffect, useCallback } from 'react';
import { ScreenType, Incident, SavedPlace } from './types/traffic';
import { INITIAL_INCIDENTS, INITIAL_SAVED_PLACES } from './data/mockData';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { NearestIncidentsList } from './components/NearestIncidentsList';
import { IncidentDetail } from './components/IncidentDetail';
import { AlertsScreen } from './components/AlertsScreen';
import { HelpScreen } from './components/HelpScreen';
import { LocationPromptBanner } from './components/LocationPromptBanner';
import { fetchLtaIncidents } from './services/ltaService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('map');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    try {
      const cached = localStorage.getItem('sg_saved_places');
      return cached ? JSON.parse(cached) : INITIAL_SAVED_PLACES;
    } catch {
      return INITIAL_SAVED_PLACES;
    }
  });
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState<boolean>(false);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [permissionState, setPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'error'
  >('prompt');
  const [isRequestingLocation, setIsRequestingLocation] = useState<boolean>(false);
  const [showLocationBanner, setShowLocationBanner] = useState<boolean>(() => {
    return localStorage.getItem('sg_location_dismissed') !== 'true';
  });
  const [locationError, setLocationError] = useState<string | null>(null);

  // Save places to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sg_saved_places', JSON.stringify(savedPlaces));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [savedPlaces]);

  // Check initial geolocation permission status
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            setPermissionState('granted');
            setShowLocationBanner(false);
            requestUserLocation(false);
          } else if (result.state === 'denied') {
            setPermissionState('denied');
          }
          result.onchange = () => {
            if (result.state === 'granted') {
              setPermissionState('granted');
              setShowLocationBanner(false);
              requestUserLocation(false);
            } else if (result.state === 'denied') {
              setPermissionState('denied');
            }
          };
        })
        .catch(() => {
          // Ignore unsupported query
        });
    }
  }, []);

  const requestUserLocation = (userTriggered = true) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setPermissionState('error');
      return;
    }

    if (userTriggered) {
      setIsRequestingLocation(true);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setPermissionState('granted');
        setIsRequestingLocation(false);
        setShowLocationBanner(false);
        setLocationError(null);
      },
      (err) => {
        setIsRequestingLocation(false);
        if (err.code === 1) {
          setPermissionState('denied');
          setLocationError('Permission denied. Please enable location in browser settings.');
        } else {
          setPermissionState('error');
          setLocationError(err.message || 'Unable to retrieve location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleDismissBanner = () => {
    setShowLocationBanner(false);
    try {
      localStorage.setItem('sg_location_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  // Live data fetcher
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLtaIncidents();
      if (result.incidents.length > 0) {
        setIncidents(result.incidents);
      }
      setSecondsAgo(0);
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic polling every 25s
  useEffect(() => {
    loadData();

    const secTimer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    const pollInterval = setInterval(() => {
      loadData();
    }, 25000);

    return () => {
      clearInterval(secTimer);
      clearInterval(pollInterval);
    };
  }, [loadData]);

  // Filter incidents by search query
  const filteredIncidents = incidents.filter((inc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.road.toLowerCase().includes(q) ||
      inc.roadFullName.toLowerCase().includes(q) ||
      inc.direction.toLowerCase().includes(q) ||
      inc.type.toLowerCase().includes(q) ||
      inc.cameraLocation.toLowerCase().includes(q)
    );
  });

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleBackToAllIncidents = () => {
    setSelectedIncident(null);
  };

  const handleTogglePlace = (id: string) => {
    setSavedPlaces((prev) =>
      prev.map((place) =>
        place.id === id ? { ...place, enabled: !place.enabled } : place
      )
    );
  };

  const handleAddPlace = (newPlace: SavedPlace) => {
    if (savedPlaces.length < 5) {
      setSavedPlaces((prev) => [...prev, newPlace]);
    }
  };

  // Functionality to remove previously saved places
  const handleRemovePlace = (id: string) => {
    setSavedPlaces((prev) => prev.filter((place) => place.id !== id));
  };

  const handleUpdateTimeWindow = (id: string, morning: string, evening: string) => {
    setSavedPlaces((prev) =>
      prev.map((place) =>
        place.id === id && place.timeWindows
          ? {
              ...place,
              timeWindows: { ...place.timeWindows, morning, evening }
            }
          : place
      )
    );
  };

  const handleNavSelect = (screen: ScreenType) => {
    setCurrentScreen(screen);
    if (screen !== 'map') {
      setIsMobileSheetExpanded(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Persistent Navigation (Desktop Left Rail + Mobile Bottom Bar) */}
      <Navigation
        currentScreen={currentScreen}
        onSelectScreen={handleNavSelect}
        savedPlacesCount={savedPlaces.length}
      />

      {/* Main App Content Container */}
      <div className="md:pl-16 min-h-screen flex flex-col">
        {/* Floating Search Bar + "Updated Xs ago" Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {
            if (filteredIncidents.length > 0) {
              setSelectedIncident(filteredIncidents[0]);
            }
          }}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          secondsAgo={secondsAgo}
        />

        {/* Content Body Below 56px Header */}
        <main className="w-full pt-14 flex-1 flex flex-col overflow-hidden">
          {/* Geolocation Reminder Banner */}
          {showLocationBanner && permissionState !== 'granted' && (
            <LocationPromptBanner
              onGrantLocation={() => requestUserLocation(true)}
              onDismiss={handleDismissBanner}
              isRequesting={isRequestingLocation}
              permissionState={permissionState}
              errorMessage={locationError}
            />
          )}

          {/* SCREEN 1: MAP (HOME) & SCREEN 2: INCIDENT DETAIL */}
          {currentScreen === 'map' && (
            <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden">
              {/* Desktop Side Panel: Nearest Incidents (Screen 1) OR Incident Detail (Screen 2) */}
              {selectedIncident ? (
                <IncidentDetail
                  incident={selectedIncident}
                  onBack={handleBackToAllIncidents}
                />
              ) : (
                <NearestIncidentsList
                  incidents={filteredIncidents}
                  onSelectIncident={handleSelectIncident}
                  selectedIncidentId={selectedIncident ? (selectedIncident as Incident).id : undefined}
                  isMobileSheetExpanded={isMobileSheetExpanded}
                  onToggleMobileSheet={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
                />
              )}

              {/* Full-screen Waze / Google Maps Navigation Map Canvas */}
              <div className="flex-1 relative h-full bg-[#f0f3f8] overflow-hidden">
                <InteractiveMap
                  incidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={handleSelectIncident}
                  searchQuery={searchQuery}
                  isFocusedCorridor={!!selectedIncident}
                  userLocation={userLocation}
                  onCenterUserLocation={() => requestUserLocation(true)}
                />
              </div>

              {/* Mobile Bottom Sheet */}
              {selectedIncident ? (
                <div className="md:hidden">
                  <IncidentDetail
                    incident={selectedIncident}
                    onBack={handleBackToAllIncidents}
                  />
                </div>
              ) : (
                <div className="md:hidden">
                  <NearestIncidentsList
                    incidents={filteredIncidents}
                    onSelectIncident={handleSelectIncident}
                    selectedIncidentId={undefined}
                    isMobileSheetExpanded={isMobileSheetExpanded}
                    onToggleMobileSheet={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
                  />
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: ALERTS */}
          {currentScreen === 'alerts' && (
            <AlertsScreen
              savedPlaces={savedPlaces}
              onTogglePlace={handleTogglePlace}
              onAddPlace={handleAddPlace}
              onRemovePlace={handleRemovePlace}
              onUpdateTimeWindow={handleUpdateTimeWindow}
            />
          )}

          {/* SCREEN 4: HELP */}
          {currentScreen === 'help' && <HelpScreen />}
        </main>
      </div>
    </div>
  );
}
