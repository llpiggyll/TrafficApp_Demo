import { Incident } from '../types/traffic';
import { INITIAL_INCIDENTS } from '../data/mockData';

export interface LtaIncidentRaw {
  Type: string;
  Latitude: number;
  Longitude: number;
  Message: string;
  ReportedTime?: string;
  TimeAgo?: string;
}

export interface LtaCameraRaw {
  CameraID: string;
  Expressway?: string;
  Road?: string;
  Location?: string;
  Latitude: number;
  Longitude: number;
  ImageLink: string;
  Timestamp?: string;
}

// Convert GPS coordinates to SVG coordinate space (1000x620)
export function gpsToSvgCoords(lat: number, lng: number): { x: number; y: number } {
  const minLat = 1.22;
  const maxLat = 1.47;
  const minLng = 103.60;
  const maxLng = 104.02;

  const clampedLat = Math.min(Math.max(lat, minLat), maxLat);
  const clampedLng = Math.min(Math.max(lng, minLng), maxLng);

  // SVG dimensions
  const x = Math.round(((clampedLng - minLng) / (maxLng - minLng)) * (900 - 150) + 150);
  const y = Math.round(((maxLat - clampedLat) / (maxLat - minLat)) * (480 - 180) + 180);

  return { x, y };
}

// Parse LTA DataMall Message string into structured telemetry
export function parseLtaMessage(msg: string, type: string) {
  let road = 'Expressway';
  let direction = 'Both bounds';
  let timeAgo = 'Recently';
  let advisory = msg;
  let expresswayCode = '';

  const timeMatch = msg.match(/\((\d+\/\d+)\)?\s*(\d{1,2}:\d{2})/);
  if (timeMatch) {
    const timeStr = timeMatch[2];
    timeAgo = `At ${timeStr}`;
  }

  // Extract expressway acronyms (CTE, PIE, AYE, KJE, BKE, SLE, TPE, ECP, MCE, KPE)
  const expresswayMatch = msg.match(/\b(CTE|PIE|AYE|KJE|BKE|SLE|TPE|ECP|MCE|KPE)\b/i);
  if (expresswayMatch) {
    expresswayCode = expresswayMatch[1].toUpperCase();
    const towardsMatch = msg.match(/towards\s+([A-Za-z0-9\s]+?)(?:\)|before|after|\.)/i);
    const towards = towardsMatch ? towardsMatch[1].trim() : 'City';
    road = `${expresswayCode} (${towards}-bound)`;
    direction = `Towards ${towards}`;
  } else {
    const onMatch = msg.match(/on\s+([A-Za-z0-9\s]+?)(?:\s+\(towards|\s+before|\s+after|\.)/i);
    if (onMatch) {
      road = onMatch[1].trim();
    }
  }

  return { road, direction, timeAgo, advisory, expresswayCode };
}

export async function fetchLtaCameras(): Promise<LtaCameraRaw[]> {
  try {
    const res = await fetch('/api/traffic-images');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.value) && data.value.length > 0) {
        return data.value;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch cameras from /api/traffic-images:', err);
  }
  return [];
}

export async function fetchLtaIncidents(): Promise<{
  incidents: Incident[];
  source: 'live' | 'fallback';
}> {
  try {
    const res = await fetch('/api/incidents');
    if (!res.ok) {
      return { incidents: INITIAL_INCIDENTS, source: 'fallback' };
    }

    const data = await res.json();
    const rawList: LtaIncidentRaw[] = data.value || [];

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return { incidents: INITIAL_INCIDENTS, source: 'fallback' };
    }

    // Fetch cameras directory
    const cameras: LtaCameraRaw[] = await fetchLtaCameras();

    const parsed: Incident[] = rawList.map((raw, idx) => {
      const { road, direction, timeAgo, advisory, expresswayCode } = parseLtaMessage(raw.Message, raw.Type);
      const coords = gpsToSvgCoords(raw.Latitude, raw.Longitude);

      // HIGHWAY-SPECIFIC CAMERA MATCHING:
      // First, filter cameras that belong to the SAME expressway (e.g. CTE -> only CTE cameras)
      let matchingCameras = cameras;
      if (expresswayCode) {
        const highwayFiltered = cameras.filter((c) => {
          if (c.Expressway && c.Expressway.toUpperCase() === expresswayCode) return true;
          if (c.Location && c.Location.toUpperCase().includes(expresswayCode)) return true;
          if (c.Road && c.Road.toUpperCase().includes(expresswayCode)) return true;
          return false;
        });

        if (highwayFiltered.length > 0) {
          matchingCameras = highwayFiltered;
        }
      }

      // Pick the closest camera on that specific expressway
      let nearestCam: LtaCameraRaw | null = null;
      if (matchingCameras.length > 0) {
        let minDist = Infinity;
        for (const c of matchingCameras) {
          const dist = Math.hypot(c.Latitude - raw.Latitude, c.Longitude - raw.Longitude);
          if (dist < minDist) {
            minDist = dist;
            nearestCam = c;
          }
        }
      }

      const isSevere = /accident|collision/i.test(raw.Type) || /accident/i.test(raw.Message);
      const icon = isSevere ? 'car_crash' : /breakdown|stalled/i.test(raw.Message) ? 'warning' : 'minor_crash';

      const reportedTime = raw.ReportedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const displayTimeAgo = raw.TimeAgo || timeAgo || 'Recently';

      // Real expressway specific camera location title
      const cameraLocation =
        nearestCam?.Location ||
        (expresswayCode ? `${expresswayCode} Corridor Surveillance` : road);

      const cameraName = nearestCam ? `Cam ${nearestCam.CameraID}` : `Cam 1704`;

      const defaultFallbackImage =
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9';

      return {
        id: `lta-${idx + 1}`,
        road,
        roadFullName: road,
        direction,
        type: raw.Type || 'Traffic Hazard',
        severity: isSevere ? 'CRITICAL' : 'MODERATE',
        reportedTime,
        timeAgo: displayTimeAgo,
        sensorId: `#LTA-DATAMALL-${idx + 101}`,
        currentSpeed: isSevere ? 16 : 42,
        normalSpeed: 70,
        delayMinutes: isSevere ? 20 : 6,
        officialAdvisory: advisory || 'Proceed with caution and allow extra traveling time.',
        cameraName,
        cameraLocation,
        cameraImage: nearestCam?.ImageLink || defaultFallbackImage,
        coordinates: {
          x: coords.x,
          y: coords.y,
          lat: raw.Latitude,
          lng: raw.Longitude
        },
        icon,
        category: isSevere ? 'accident' : 'congestion'
      };
    });

    return {
      incidents: parsed.length >= 3 ? parsed : [...parsed, ...INITIAL_INCIDENTS].slice(0, 5),
      source: data.source?.includes('live') ? 'live' : 'fallback'
    };
  } catch (err) {
    console.warn('Failed to load incidents from /api/incidents:', err);
    return { incidents: INITIAL_INCIDENTS, source: 'fallback' };
  }
}
