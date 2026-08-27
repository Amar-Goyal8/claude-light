/** Number and string shaping shared by the daemon and the island. No platform. */

export function ellipsis(s: string, max: number): string {
  const t = (s ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max - 1) + '…';
}

/** `61.3k`, `210k`, `1.2M`. Four characters is all the wing has. */
export function tokens(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n < 1000) return String(Math.round(n));
  const k = n / 1000;
  if (k < 100) return k.toFixed(1).replace(/\.0$/, '') + 'k';
  if (k < 1000) return Math.round(k) + 'k';
  return (k / 1000).toFixed(1).replace(/\.0$/, '') + 'M';
}

/** `4m 12s`, `1h 06m`. Always two parts, so the width never jumps. */
export function duration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
}
