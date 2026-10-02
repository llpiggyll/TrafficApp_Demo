import { Incident } from '../types/traffic';
import { INITIAL_INCIDENTS } from '../data/mockData';

export interface LtaIncidentRaw {
  Type: string;
  Latitude: number;
  Longitude: number;
  Message: string;
}

export interface LtaCameraRaw {
  CameraID: string;
  Latitude: number;
  Longitude: number;
  ImageLink: string;
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
  // Format example: "(12/2)14:42 Roadworks on KJE (towards BKE) before BKE Exit. Avoid lane 2."
  let road = 'Expressway';
  let direction = 'Both bounds';
  let timeAgo = 'Just now';
  let advisory = msg;

  const timeMatch = msg.match(/\((\d+\/\d+)\)?\s*(\d{1,2}:\d{2})/);
  if (timeMatch) {
    const timeStr = timeMatch[2];
    timeAgo = `At ${timeStr}`;
  }

  // Extract expressway acronyms (CTE, PIE, AYE, KJE, BKE, SLE, TPE, ECP, MCE, KPE)
  const expresswayMatch = msg.match(/\b(CTE|PIE|AYE|KJE|BKE|SLE|TPE|ECP|MCE|KPE)\b/i);
  if (expresswayMatch) {
    const exp = expresswayMatch[1].toUpperCase();
    const towardsMatch = msg.match(/towards\s+([A-Za-z0-9\s]+?)(?:\)|before|after|\.)/i);
    const towards = towardsMatch ? towardsMatch[1].trim() : 'City';
    road = `${exp} (${towards}-bound)`;
    direction = `Towards ${towards}`;
  } else {
    // Other roads (e.g. Telok Blangah Road)
    const onMatch = msg.match(/on\s+([A-Za-z0-9\s]+?)(?:\s+\(towards|\s+before|\s+after|\.)/i);
    if (onMatch) {
      road = onMatch[1].trim();
    }
  }

  return { road, direction, timeAgo, advisory };
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

    // Try fetching cameras to match
    let cameras: LtaCameraRaw[] = [];
    try {
      const camRes = await fetch('/api/traffic-images');
      if (camRes.ok) {
        const camData = await camRes.json();
        cameras = camData.value || [];
      }
    } catch {
      // Ignore camera fetch error
    }

    const parsed: Incident[] = rawList.map((raw, idx) => {
      const { road, direction, timeAgo, advisory } = parseLtaMessage(raw.Message, raw.Type);
      const coords = gpsToSvgCoords(raw.Latitude, raw.Longitude);

      // Match closest camera or default
      const nearestCam = cameras[idx % (cameras.length || 1)] || null;

      const isSevere = /accident|collision/i.test(raw.Type) || /accident/i.test(raw.Message);
      const icon = isSevere ? 'car_crash' : /breakdown|stalled/i.test(raw.Message) ? 'warning' : 'minor_crash';

      return {
        id: `lta-${idx + 1}`,
        road,
        roadFullName: road,
        direction,
        type: raw.Type || 'Traffic Hazard',
        severity: isSevere ? 'CRITICAL' : 'MODERATE',
        reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeAgo: timeAgo || 'Recently',
        sensorId: `#LTA-DATAMALL-${idx + 101}`,
        currentSpeed: isSevere ? 18 : 36,
        normalSpeed: 70,
        delayMinutes: isSevere ? 18 : 6,
        officialAdvisory: advisory || 'Proceed with caution and allow extra traveling time.',
        cameraName: nearestCam ? `Cam ${nearestCam.CameraID}` : 'Cam 1704',
        cameraLocation: road,
        cameraImage:
          nearestCam?.ImageLink ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9',
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
      source: data.source === 'live' ? 'live' : 'fallback'
    };
  } catch (err) {
    console.warn('Failed to load incidents from /api/incidents:', err);
    return { incidents: INITIAL_INCIDENTS, source: 'fallback' };
  }
}
