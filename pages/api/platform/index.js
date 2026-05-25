// pages/api/platform/index.js
// Platform registry — list all platforms, add new, remove
import { loadPlatforms, savePlatform, removePlatform, PLATFORM_PRESETS } from '@/lib/platformRegistry';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const platforms = loadPlatforms();
    return res.json({ platforms, presets: PLATFORM_PRESETS });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!body.platform_id) return res.status(400).json({ error: 'platform_id required' });
    const record = savePlatform({ ...body, updated_at: new Date().toISOString() });
    return res.json({ platform: record });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    removePlatform(id);
    return res.json({ ok: true, removed: id });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
