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
import { fetchLtaIncidents } from './services/ltaService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('map');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(INITIAL_SAVED_PLACES);
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('fallback');
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live data fetcher
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLtaIncidents();
      if (result.incidents.length > 0) {
        setIncidents(result.incidents);
        setDataSource(result.source);
      }
      setSecondsAgo(0);
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic polling every 25s for timely live information
  useEffect(() => {
    loadData();

    // Seconds counter
    const secTimer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    // Live polling every 25s
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

      {/* Main App Content Container (offset by desktop sidebar rail w-16) */}
      <div className="md:pl-16 min-h-screen flex flex-col">
        {/* Floating Search Bar + "Updated Xs ago" Header with Real Sync Handler */}
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

              {/* Full-screen Map Canvas with Traffic Flow Lines, Incident Pins & CCTV nodes */}
              <div className="flex-1 relative h-full bg-[#E5EEFF]/40 overflow-hidden">
                <InteractiveMap
                  incidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={handleSelectIncident}
                  searchQuery={searchQuery}
                  isFocusedCorridor={!!selectedIncident}
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
