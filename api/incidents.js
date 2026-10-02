/**
 * LTA DataMall Traffic Incidents Proxy
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents
 */

const FALLBACK_INCIDENTS = [
  {
    Type: 'Accident',
    Latitude: 1.3431,
    Longitude: 103.8568,
    Message: '(1/10)18:31 Accident on CTE (towards City) after AMK Ave 1 before Braddell Flyover Exit 10. Avoid lanes 1 & 2.'
  },
  {
    Type: 'Vehicle breakdown',
    Latitude: 1.325,
    Longitude: 103.865,
    Message: '(1/10)18:38 Breakdown on PIE (towards Changi) near Woodsville Flyover. Shoulder blocked.'
  },
  {
    Type: 'Accident',
    Latitude: 1.315,
    Longitude: 103.765,
    Message: '(1/10)18:24 Accident on AYE (towards Tuas) near Clementi Ave 6 Exit. Avoid lane 2.'
  },
  {
    Type: 'Roadwork',
    Latitude: 1.390923508426507,
    Longitude: 103.76543045742648,
    Message: '(12/2)14:42 Roadworks on KJE (towards BKE) before BKE Exit. Avoid lane 2.'
  },
  {
    Type: 'Roadwork',
    Latitude: 1.3228083288625956,
    Longitude: 103.7486545963207,
    Message: '(12/2)14:40 Roadworks on AYE (towards MCE) after Jurong Town Hall Exit. Avoid lane 1.'
  },
  {
    Type: 'Roadwork',
    Latitude: 1.2655918425973762,
    Longitude: 103.82208988201302,
    Message: '(12/2)14:37 Roadworks on Telok Blangah Road (towards Tuas) after Sentosa Gateway. Avoid right lane.'
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
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.LTA_ACCOUNT_KEY;

  if (!apiKey) {
    return res.status(200).json({
      'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#IncidentSet',
      source: 'fallback',
      warning: 'LTA_ACCOUNT_KEY environment variable is not configured. Serving cached incident telemetry.',
      value: FALLBACK_INCIDENTS
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const ltaResponse = await fetch(
      'https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents',
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
      console.warn(`LTA DataMall returned status ${ltaResponse.status}`);
      return res.status(200).json({
        'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#IncidentSet',
        source: 'fallback',
        warning: `Upstream LTA DataMall returned status ${ltaResponse.status}. Falling back to cached incidents.`,
        value: FALLBACK_INCIDENTS
      });
    }

    const data = await ltaResponse.json();
    return res.status(200).json({
      ...data,
      source: 'live',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching LTA TrafficIncidents:', error);
    return res.status(200).json({
      'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#IncidentSet',
      source: 'fallback',
      warning: 'Network or timeout error contacting LTA DataMall. Serving fallback incidents.',
      error: error.message,
      value: FALLBACK_INCIDENTS
    });
  }
}
