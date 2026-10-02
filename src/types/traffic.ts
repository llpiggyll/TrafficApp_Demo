export type ScreenType = 'map' | 'alerts' | 'help';

export interface Incident {
  id: string;
  road: string;
  roadFullName: string;
  direction: string;
  type: string;
  severity: 'CRITICAL' | 'HEAVY' | 'MODERATE';
  reportedTime: string;
  timeAgo: string;
  sensorId: string;
  currentSpeed: number;
  normalSpeed: number;
  delayMinutes: number;
  officialAdvisory: string;
  cameraName: string;
  cameraLocation: string;
  cameraImage: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  icon: string;
  category: 'accident' | 'congestion' | 'roadwork';
}

export interface SavedPlace {
  id: string;
  name: string;
  corridor: string;
  icon: string;
  enabled: boolean;
  timeWindows?: {
    morning: string;
    evening: string;
    frequency: string;
    threshold: string;
  };
}

export interface TowingService {
  id: string;
  name: string;
  distance: string;
  phone: string;
  displayPhone: string;
  type: string;
}
