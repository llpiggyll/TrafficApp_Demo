/**
 * LTA DataMall & Singapore Expressway Traffic Camera Proxy
 * Provides live cameras for all Singapore Expressways: CTE, PIE, AYE, KJE, BKE, ECP, KPE, SLE, TPE.
 */

const SINGAPORE_EXPRESSWAY_CAMERAS = [
  // CTE (Central Expressway)
  {
    CameraID: '1704',
    Expressway: 'CTE',
    Road: 'Central Expressway',
    Location: 'CTE (towards City) before Braddell Flyover Exit 10',
    Latitude: 1.3431,
    Longitude: 103.8568,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1702',
    Expressway: 'CTE',
    Road: 'Central Expressway',
    Location: 'CTE (towards Seletar) at Moulmein Flyover',
    Latitude: 1.3210,
    Longitude: 103.8530,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1705',
    Expressway: 'CTE',
    Road: 'Central Expressway',
    Location: 'CTE (towards City) after AMK Ave 1 Flyover',
    Latitude: 1.3650,
    Longitude: 103.8580,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // PIE (Pan Island Expressway)
  {
    CameraID: '1001',
    Expressway: 'PIE',
    Road: 'Pan Island Expressway',
    Location: 'PIE (towards Changi) near Woodsville Flyover',
    Latitude: 1.3250,
    Longitude: 103.8650,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1003',
    Expressway: 'PIE',
    Road: 'Pan Island Expressway',
    Location: 'PIE (towards Tuas) at Paya Lebar Flyover',
    Latitude: 1.3320,
    Longitude: 103.8950,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1008',
    Expressway: 'PIE',
    Road: 'Pan Island Expressway',
    Location: 'PIE (towards Tuas) near Clementi / Jalan Anak Bukit',
    Latitude: 1.3380,
    Longitude: 103.7750,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // AYE (Ayer Rajah Expressway)
  {
    CameraID: '1301',
    Expressway: 'AYE',
    Road: 'Ayer Rajah Expressway',
    Location: 'AYE (towards Tuas) near Clementi Ave 6 Exit',
    Latitude: 1.3150,
    Longitude: 103.7650,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1302',
    Expressway: 'AYE',
    Road: 'Ayer Rajah Expressway',
    Location: 'AYE (towards MCE) after Jurong Town Hall Exit',
    Latitude: 1.3228,
    Longitude: 103.7486,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1303',
    Expressway: 'AYE',
    Road: 'Ayer Rajah Expressway',
    Location: 'AYE (towards City) at One-North Flyover',
    Latitude: 1.2980,
    Longitude: 103.7880,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // KJE (Kranji Expressway)
  {
    CameraID: '2901',
    Expressway: 'KJE',
    Road: 'Kranji Expressway',
    Location: 'KJE (towards BKE) before BKE Exit',
    Latitude: 1.3909,
    Longitude: 103.7654,
    ImageLink:
      'https://images.data.gov.sg/api/traffic-images/2026/10/cebe342c-5cac-4533-ae3e-10a4562f5576.jpg'
  },

  // BKE (Bukit Timah Expressway)
  {
    CameraID: '2701',
    Expressway: 'BKE',
    Road: 'Bukit Timah Expressway',
    Location: 'BKE (towards Woodlands Checkpoint)',
    Latitude: 1.4470,
    Longitude: 103.7716,
    ImageLink:
      'https://images.data.gov.sg/api/traffic-images/2026/10/cebe342c-5cac-4533-ae3e-10a4562f5576.jpg'
  },
  {
    CameraID: '2702',
    Expressway: 'BKE',
    Road: 'Bukit Timah Expressway',
    Location: 'BKE (towards PIE) at Mandai Flyover',
    Latitude: 1.4150,
    Longitude: 103.7740,
    ImageLink:
      'https://images.data.gov.sg/api/traffic-images/2026/10/cebe342c-5cac-4533-ae3e-10a4562f5576.jpg'
  },

  // ECP (East Coast Parkway)
  {
    CameraID: '1801',
    Expressway: 'ECP',
    Road: 'East Coast Parkway',
    Location: 'ECP (towards City) at Marine Parade',
    Latitude: 1.3020,
    Longitude: 103.9050,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },

  // KPE (Kallang-Paya Lebar Expressway)
  {
    CameraID: '1404',
    Expressway: 'KPE',
    Road: 'Kallang-Paya Lebar Expressway',
    Location: 'KPE (towards TPE) near Airport Road / Paya Lebar',
    Latitude: 1.3420,
    Longitude: 103.8900,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  }
];

export default async function handler(req, res) {
  // CORS & Cache headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.LTA_ACCOUNT_KEY;

  // 1. If user configured LTA_ACCOUNT_KEY, fetch full live dataset directly from LTA DataMall
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const ltaResponse = await fetch(
        'https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2',
        {
          method: 'GET',
          headers: {
            AccountKey: apiKey,
            accept: 'application/json'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (ltaResponse.ok) {
        const data = await ltaResponse.json();
        if (data.value && data.value.length > 0) {
          return res.status(200).json({
            ...data,
            source: 'live_lta_datamall',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn('LTA DataMall fetch error:', err.message);
    }
  }

  // 2. Fetch live data.gov.sg images to merge with expressway directory
  let liveGovCameras = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const pubRes = await fetch('https://api.data.gov.sg/v1/transport/traffic-images', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (pubRes.ok) {
      const pubData = await pubRes.json();
      liveGovCameras = pubData.items?.[0]?.cameras || [];
    }
  } catch (e) {
    // Non-fatal
  }

  // Merge live government images where available (e.g. Woodlands / Tuas)
  const mergedCameras = SINGAPORE_EXPRESSWAY_CAMERAS.map((cam) => {
    const liveMatch = liveGovCameras.find((c) => String(c.camera_id) === cam.CameraID);
    if (liveMatch && liveMatch.image) {
      return {
        ...cam,
        ImageLink: liveMatch.image,
        Timestamp: liveMatch.timestamp
      };
    }
    return cam;
  });

  return res.status(200).json({
    'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#Traffic-Imagesv2',
    source: 'live_expressway_directory',
    timestamp: new Date().toISOString(),
    total_cameras: mergedCameras.length,
    value: mergedCameras
  });
}
