import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const result = await fetchLtaIncidents();
      if (isMounted && result.incidents.length > 0) {
        setIncidents(result.incidents);
        setDataSource(result.source);
      }
    }
    loadData();
    // Poll every 60s
    const interval = setInterval(loadData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    // If navigating back to map, keep or clear selection based on preference
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
        {/* Floating Search Bar + "Updated 12s ago" Header (Shown on Map screen, or as global header) */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {
            if (filteredIncidents.length > 0) {
              setSelectedIncident(filteredIncidents[0]);
            }
          }}
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

              {/* Full-screen Map Canvas with Traffic Flow Lines & Simple Incident Pins */}
              <div className="flex-1 relative h-full bg-[#E5EEFF]/40 overflow-hidden">
                <InteractiveMap
                  incidents={filteredIncidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={handleSelectIncident}
                  searchQuery={searchQuery}
                  isFocusedCorridor={!!selectedIncident}
                />
              </div>

              {/* Mobile Bottom Sheet: If an incident is selected, show detail bottom sheet; otherwise show 3 nearest incidents */}
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
