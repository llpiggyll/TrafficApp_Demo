/**
 * API Health & Telemetry Monitor
 * Endpoint: /api/health
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.LTA_ACCOUNT_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

  // Masked key for monitoring confirmation without leaking secrets
  const maskedKey = hasKey
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (${apiKey.length} chars)`
    : null;

  const healthData = {
    status: 'healthy',
    service: 'SG Traffic Flow & Incident Telemetry API Gateway',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    lta_account_key: {
      configured: hasKey,
      preview: maskedKey,
      status: hasKey ? 'READY' : 'MISSING (Configure LTA_ACCOUNT_KEY in Vercel Environment Variables)'
    },
    endpoints: {
      incidents: {
        path: '/api/incidents',
        method: 'GET',
        description: 'LTA DataMall Traffic Incidents proxy with fallback telemetry',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents'
      },
      traffic_images: {
        path: '/api/traffic-images',
        method: 'GET',
        description: 'LTA DataMall Traffic Images v2 proxy with fallback camera feeds',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2'
      },
      health: {
        path: '/api/health',
        method: 'GET',
        description: 'Health and upstream connectivity telemetry'
      }
    }
  };

  // Optional live upstream test when ?check_upstream=true is provided
  if (req.query && (req.query.check_upstream === 'true' || req.query.test === 'true')) {
    if (!hasKey) {
      healthData.upstream_connectivity = {
        tested: true,
        success: false,
        reason: 'LTA_ACCOUNT_KEY is not set. Add it in Vercel settings.'
      };
    } else {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const testRes = await fetch(
          'https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents?$top=1',
          {
            headers: { AccountKey: apiKey },
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);
        healthData.upstream_connectivity = {
          tested: true,
          success: testRes.ok,
          statusCode: testRes.status,
          statusText: testRes.statusText
        };
      } catch (err) {
        healthData.upstream_connectivity = {
          tested: true,
          success: false,
          error: err.message
        };
      }
    }
  }

  return res.status(200).json(healthData);
}
