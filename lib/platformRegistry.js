// lib/platformRegistry.js
// Platform Registry — manages multiple service platforms in PHLedger.
// Each platform has a preset config (fee rates, currency, cancellation policy).
// The user can add custom platforms or use a preset.

import fs from 'fs';
import path from 'path';
import { DEFAULT_PLATFORM_CONFIG, applyUpstreamConfig } from './platformFee.js';

// ─── Built-in platform presets ──────────────────────────────────────────
export const PLATFORM_PRESETS = [
  {
    preset_id:    'silverconnect',
    platform_id:  'silverconnect',
    platform_name: 'SilverConnect Global',
    description:  'Aged care & elder companion services (AU/CN/CA)',
    icon:         'heart-pulse',
    color:        '#0073E6',
    platform_fee_rate: 0.15,
    provider_rate:     0.85,
    currency:         'AUD',
    gst_rate:          0.10,
    upstream_source:  'silverconnect-global',
    cancellation_policy: {
      full_refund_hours: 24, partial_refund_hours: 2,
      partial_refund_rate: 0.50, no_show_refund_rate: 0.00,
      platform_fee_refundable: true, cancellation_fee_rate: 0.05,
    },
  },
  {
    preset_id:    'transport',
    platform_id:  'transport',
    platform_name: 'Transport Platform',
    description:  'Ride-share, freight & delivery services',
    icon:         'truck',
    color:        '#00875A',
    platform_fee_rate: 0.20,
    provider_rate:     0.80,
    currency:         'AUD',
    gst_rate:          0.10,
    upstream_source:  null,
    cancellation_policy: {
      full_refund_hours: 1, partial_refund_hours: 0.25,
      partial_refund_rate: 0.50, no_show_refund_rate: 0.00,
      platform_fee_refundable: false, cancellation_fee_rate: 0.10,
    },
  },
  {
    preset_id:    'education',
    platform_id:  'education',
    platform_name: 'Education Platform',
    description:  'Online tutoring, courses & coaching',
    icon:         'mortarboard',
    color:        '#6554C0',
    platform_fee_rate: 0.10,
    provider_rate:     0.90,
    currency:         'AUD',
    gst_rate:          0.10,
    upstream_source:  null,
    cancellation_policy: {
      full_refund_hours: 48, partial_refund_hours: 4,
      partial_refund_rate: 0.75, no_show_refund_rate: 0.00,
      platform_fee_refundable: true, cancellation_fee_rate: 0.02,
    },
  },
  {
    preset_id:    'home_services',
    platform_id:  'home_services',
    platform_name: 'Home Services Platform',
    description:  'Cleaning, repairs, gardening & maintenance',
    icon:         'house-gear',
    color:        '#FF8B00',
    platform_fee_rate: 0.12,
    provider_rate:     0.88,
    currency:         'AUD',
    gst_rate:          0.10,
    upstream_source:  null,
    cancellation_policy: {
      full_refund_hours: 24, partial_refund_hours: 2,
      partial_refund_rate: 0.50, no_show_refund_rate: 0.00,
      platform_fee_refundable: true, cancellation_fee_rate: 0.05,
    },
  },
  {
    preset_id:    'healthcare',
    platform_id:  'healthcare',
    platform_name: 'Healthcare Platform',
    description:  'Allied health, telehealth & medical services',
    icon:         'hospital',
    color:        '#BF2600',
    platform_fee_rate: 0.08,
    provider_rate:     0.92,
    currency:         'AUD',
    gst_rate:          0.00,   // healthcare often GST-exempt
    upstream_source:  null,
    cancellation_policy: {
      full_refund_hours: 24, partial_refund_hours: 4,
      partial_refund_rate: 0.50, no_show_refund_rate: 0.00,
      platform_fee_refundable: true, cancellation_fee_rate: 0.00,
    },
  },
  {
    preset_id:    'custom',
    platform_id:  'custom',
    platform_name: 'Custom Platform',
    description:  'Configure your own fee rates and policy',
    icon:         'sliders',
    color:        '#42526E',
    platform_fee_rate: 0.15,
    provider_rate:     0.85,
    currency:         'AUD',
    gst_rate:          0.10,
    upstream_source:  null,
    cancellation_policy: {
      full_refund_hours: 24, partial_refund_hours: 2,
      partial_refund_rate: 0.50, no_show_refund_rate: 0.00,
      platform_fee_refundable: true, cancellation_fee_rate: 0.05,
    },
  },
];

// ─── File store (server-side only) ─────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'sc_data');
const REGISTRY_FILE = path.join(DATA_DIR, 'platforms.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load all registered platforms.
 * If none saved yet, seeds from PLATFORM_PRESETS (silverconnect preset only).
 */
export function loadPlatforms() {
  ensureDir();
  if (!fs.existsSync(REGISTRY_FILE)) {
    // Seed with SilverConnect as the default registered platform
    const seed = [{ ...PLATFORM_PRESETS[0], registered_at: new Date().toISOString() }];
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
}

/**
 * Save a platform config (upsert by platform_id).
 */
export function savePlatform(config) {
  const platforms = loadPlatforms();
  const idx = platforms.findIndex(p => p.platform_id === config.platform_id);
  const record = { ...config, updated_at: new Date().toISOString() };
  if (idx >= 0) platforms[idx] = record;
  else platforms.push({ ...record, registered_at: new Date().toISOString() });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(platforms, null, 2));
  return record;
}

/**
 * Get a single platform config by id.
 * Falls back to DEFAULT_PLATFORM_CONFIG if not found.
 */
export function getPlatform(platformId) {
  const platforms = loadPlatforms();
  return platforms.find(p => p.platform_id === platformId) || { ...DEFAULT_PLATFORM_CONFIG, platform_id: platformId };
}

/**
 * Remove a platform from the registry.
 */
export function removePlatform(platformId) {
  const platforms = loadPlatforms().filter(p => p.platform_id !== platformId);
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(platforms, null, 2));
}

/**
 * Return the data file path for a given platform and data type.
 * e.g. platformDataPath('silverconnect', 'bookings') → sc_data/silverconnect_bookings.json
 */
export function platformDataPath(platformId, dataType) {
  ensureDir();
  return path.join(DATA_DIR, `${platformId}_${dataType}.json`);
}
