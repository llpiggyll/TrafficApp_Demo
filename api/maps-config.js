/**
 * Google Maps Configuration Endpoint
 * Endpoint: /api/maps-config
 * Returns configured status and MAPS_DEMO_KEY for client-side Google Maps layers
 */

export default async function handler(req, res) {
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

  const key =
    process.env.MAPS_DEMO_KEY ||
    process.env.VITE_MAPS_DEMO_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';

  const isConfigured = Boolean(key && key.trim().length > 0);

  return res.status(200).json({
    configured: isConfigured,
    key: key.trim(),
    provider: 'Google Maps Platform',
    source: isConfigured ? 'environment_variable' : 'none'
  });
}
