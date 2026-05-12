// =============================================================================
// Device Fingerprint & PII hashing
// NĐ 13/2023: minimization — never store raw IP/UA, only SHA-256 hashes.
// =============================================================================

import crypto from 'crypto';

const PEPPER = process.env.FINGERPRINT_PEPPER ?? 'acf-default-pepper-change-in-prod';

export function hashPii(value: string): string {
  return crypto
    .createHash('sha256')
    .update(`${PEPPER}:${value}`)
    .digest('hex');
}

// Client-side collector returns these signals → server hashes
export interface FingerprintSignals {
  canvasHash: string;       // canvas drawing hash
  userAgent: string;
  screenResolution: string; // "1920x1080"
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
}

export function computeDeviceFingerprint(signals: FingerprintSignals): string {
  const composite = [
    signals.canvasHash,
    signals.userAgent,
    signals.screenResolution,
    signals.timezone,
    signals.language,
    signals.platform,
    String(signals.hardwareConcurrency),
  ].join('|');
  return hashPii(composite);
}

// ---------------------------------------------------------------------------
// ASN / Datacenter detection (Self-check #4)
// Production: use MaxMind GeoLite2-ASN. Here: heuristic by ASN prefix.
// ---------------------------------------------------------------------------

const DATACENTER_ASNS = new Set([
  'AS16509',  // Amazon AWS
  'AS15169',  // Google Cloud
  'AS8075',   // Microsoft Azure
  'AS14061',  // DigitalOcean
  'AS20473',  // Choopa / Vultr
  'AS63949',  // Linode
  'AS16276',  // OVH
  'AS24940',  // Hetzner
  'AS46606',  // Unified Layer
  'AS9009',   // M247 (popular VPN backbone)
]);

export interface IpIntel {
  asn?: string;
  country?: string;
  isDatacenter: boolean;
}

export async function lookupIpIntel(ipAddress: string): Promise<IpIntel> {
  // Stub: in prod call MaxMind / IP-API. Here we return a deterministic-but-fake
  // result so tests are stable.
  const last = parseInt(ipAddress.split('.').pop() ?? '0', 10);
  const fakeAsn = last % 7 === 0 ? 'AS16509' : `AS${65000 + (last % 1000)}`;
  return {
    asn: fakeAsn,
    country: 'VN',
    isDatacenter: DATACENTER_ASNS.has(fakeAsn),
  };
}

export function isDatacenterAsn(asn: string | undefined): boolean {
  if (!asn) return false;
  return DATACENTER_ASNS.has(asn);
}
