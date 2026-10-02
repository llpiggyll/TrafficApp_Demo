/**
 * LTA DataMall Traffic Images Proxy
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2
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

  if (!apiKey) {
    return res.status(200).json({
      'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#Traffic-Imagesv2',
      source: 'fallback',
      warning: 'LTA_ACCOUNT_KEY environment variable is not configured. Serving cached traffic camera feeds.',
      value: FALLBACK_TRAFFIC_IMAGES
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

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

    if (!ltaResponse.ok) {
      console.warn(`LTA DataMall Images returned status ${ltaResponse.status}`);
      return res.status(200).json({
        'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#Traffic-Imagesv2',
        source: 'fallback',
        warning: `Upstream LTA DataMall returned status ${ltaResponse.status}. Falling back to cached camera feeds.`,
        value: FALLBACK_TRAFFIC_IMAGES
      });
    }

    const data = await ltaResponse.json();
    return res.status(200).json({
      ...data,
      source: 'live',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching LTA Traffic-Imagesv2:', error);
    return res.status(200).json({
      'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#Traffic-Imagesv2',
      source: 'fallback',
      warning: 'Network or timeout error contacting LTA DataMall. Serving fallback camera feeds.',
      error: error.message,
      value: FALLBACK_TRAFFIC_IMAGES
    });
  }
}
