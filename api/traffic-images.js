/**
 * LTA DataMall & Live Singapore Traffic Images Proxy
 * Primary Endpoint: https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2
 * Live Fallback Mirror: https://api.data.gov.sg/v1/transport/traffic-images
 */

const FALLBACK_TRAFFIC_IMAGES = [
  {
    CameraID: '1704',
    Latitude: 1.3431,
    Longitude: 103.8568,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1001',
    Latitude: 1.29531332,
    Longitude: 103.871146,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '2108',
    Latitude: 1.325,
    Longitude: 103.865,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  },
  {
    CameraID: '1302',
    Latitude: 1.315,
    Longitude: 103.765,
    ImageLink:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpYO9z6YZL9QthM77C_s_RBa4i7HoSGCFMTpCVDH3SwoeJsMzsEfaQCea_eVtvW2NiFR4tkcD0Mxan4pc4I6BbK5hW1gqUOhQVxcZOPzn3vCyfwt5umWGnAcGv3rylJcghg1XrKDM69yAO6j0g55lvxK7OAyYXR12-FsHxPU4X--5uERq5jYPWsTqqOPU3Vr4J5unfZbN5RopyjMwXQGZShf--Hx50tE6gbuF08XlavbFdMVB-9K9'
  }
];

export default async function handler(req, res) {
  // Set standard CORS & Cache headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.LTA_ACCOUNT_KEY;

  // 1. Try official LTA DataMall if API key is provided
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
      } else {
        console.warn(`LTA DataMall returned status ${ltaResponse.status}. Attempting public live camera mirror...`);
      }
    } catch (err) {
      console.warn('LTA DataMall fetch error:', err.message);
    }
  }

  // 2. Fetch from Singapore Government Public Live Traffic Camera API (real-time live feeds updated every ~1 min)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const publicResponse = await fetch(
      'https://api.data.gov.sg/v1/transport/traffic-images',
      {
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (publicResponse.ok) {
      const pubData = await publicResponse.json();
      const items = pubData.items?.[0]?.cameras || [];

      if (items.length > 0) {
        const mappedValue = items.map((c) => ({
          CameraID: String(c.camera_id),
          Latitude: c.location?.latitude || 1.35,
          Longitude: c.location?.longitude || 103.82,
          ImageLink: c.image,
          Timestamp: c.timestamp
        }));

        return res.status(200).json({
          'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#Traffic-Imagesv2',
          source: 'live_public_datagov',
          timestamp: pubData.items?.[0]?.timestamp || new Date().toISOString(),
          total_cameras: mappedValue.length,
          value: mappedValue
        });
      }
    }
  } catch (pubErr) {
    console.warn('Public live traffic image fetch error:', pubErr.message);
  }

  // 3. Fallback to cached default expressway cameras
  return res.status(200).json({
    'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#Traffic-Imagesv2',
    source: 'fallback',
    warning: 'Serving cached traffic camera feeds.',
    value: FALLBACK_TRAFFIC_IMAGES
  });
}
