/**
 * The palette, lifted from the design sheet.
 *
 * The island is black because the notch is black — the object has to read as
 * part of the hardware, so nothing here is a surface colour except the one that
 * is not a colour at all.
 */
export const C = {
  ink: '#000000',
  well: '#0A0A0A',
  text: '#F2EDE7',
  body: '#E4DDD5',
  muted: '#A69C93',
  dim: '#9E958C',
  faint: '#8A817A',
  ghost: '#7C736C',
  dead: '#4A443F',
  green: '#5FBE86',
  yellow: '#E0B04A',
  red: '#D46A5A',
  buddy: '#C97C5C',
  buddyInk: '#141210',
  hair: 'rgba(255,255,255,.08)',
  hover: 'rgba(255,255,255,.06)',
  press: 'rgba(255,255,255,.04)'
} as const;

export const MONO = "ui-monospace,'SF Mono',Menlo,monospace";
export const SANS = "-apple-system,'SF Pro Text','Helvetica Neue',Helvetica,sans-serif";

/** The panel is a fixed width so the notch always sits dead centre of it. */
export const PANEL_W = 472;

import type { Status } from '../shared/types';

export function lightColor(s: Status): string {
  if (s === 'working') return C.green;
  if (s === 'asking') return C.yellow;
  if (s === 'done' || s === 'failed') return C.red;
  return C.dead;
}

export function glow(color: string, strength = 0.85): string {
  // The lights are the only thing on the island that emit rather than sit, so
  // each one carries its own bloom rather than a shared filter.
  const rgb =
    color === C.green ? '95,190,134' : color === C.yellow ? '224,176,74' : color === C.red ? '212,106,90' : '0,0,0';
  return `0 0 10px rgba(${rgb},${strength})`;
}
