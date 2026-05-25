// pages/api/platform/config.js
// GET/POST config for any registered platform
// Query param: ?platform_id=silverconnect (defaults to 'silverconnect')
import { getPlatform, savePlatform } from '@/lib/platformRegistry';
import { applyUpstreamConfig } from '@/lib/platformFee';

export default async function handler(req, res) {
  const platformId = req.query.platform_id || 'silverconnect';

  if (req.method === 'GET') {
    let config = getPlatform(platformId);

    // Optional: sync from upstream API if configured
    if (config.upstream_source && process.env[`PLATFORM_API_URL_${platformId.toUpperCase()}`]) {
      try {
        const url = process.env[`PLATFORM_API_URL_${platformId.toUpperCase()}`];
        const key = process.env[`PLATFORM_API_KEY_${platformId.toUpperCase()}`];
        const headers = key ? { Authorization: `Bearer ${key}` } : {};
        const upstream = await fetch(`${url}/platform-settings`, { headers })
          .then(r => r.ok ? r.json() : null);
        if (upstream) config = applyUpstreamConfig(config, upstream);
      } catch (_) { /* upstream sync optional */ }
    }

    return res.json({ config });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const existing = getPlatform(platformId);
    const updated  = applyUpstreamConfig(existing, body);
    savePlatform({ ...updated, platform_id: platformId });
    return res.json({ config: updated });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
