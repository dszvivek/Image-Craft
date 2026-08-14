/**
 * Curated Harmonious Color Palettes & Interpolation Engine
 */

export interface HSLColor {
  h: number; // 0..360
  s: number; // 0..100
  l: number; // 0..100
  a?: number; // 0..1
}

export interface Palette {
  id: string;
  name: string;
  background: string; // CSS color for canvas backdrop
  colors: HSLColor[];
}

export const PALETTES: Record<string, Palette> = {
  ocean: {
    id: 'ocean',
    name: 'Midnight Ocean',
    background: '#040d1a',
    colors: [
      { h: 200, s: 80, l: 45, a: 0.8 },
      { h: 215, s: 75, l: 55, a: 0.8 },
      { h: 185, s: 70, l: 40, a: 0.8 },
      { h: 230, s: 65, l: 60, a: 0.8 },
      { h: 175, s: 85, l: 50, a: 0.8 },
    ],
  },
  aurora: {
    id: 'aurora',
    name: 'Northern Lights',
    background: '#051118',
    colors: [
      { h: 155, s: 85, l: 50, a: 0.8 },
      { h: 175, s: 90, l: 45, a: 0.8 },
      { h: 265, s: 75, l: 60, a: 0.8 },
      { h: 130, s: 80, l: 55, a: 0.8 },
      { h: 290, s: 70, l: 50, a: 0.8 },
    ],
  },
  sunset: {
    id: 'sunset',
    name: 'Golden Sunset',
    background: '#120712',
    colors: [
      { h: 340, s: 80, l: 55, a: 0.8 },
      { h: 15, s: 85, l: 60, a: 0.8 },
      { h: 35, s: 90, l: 55, a: 0.8 },
      { h: 280, s: 65, l: 50, a: 0.8 },
      { h: 45, s: 95, l: 65, a: 0.8 },
    ],
  },
  dream: {
    id: 'dream',
    name: 'Dreamscape',
    background: '#0b0818',
    colors: [
      { h: 275, s: 70, l: 60, a: 0.8 },
      { h: 320, s: 75, l: 65, a: 0.8 },
      { h: 220, s: 80, l: 70, a: 0.8 },
      { h: 190, s: 70, l: 60, a: 0.8 },
      { h: 300, s: 65, l: 55, a: 0.8 },
    ],
  },
  forest: {
    id: 'forest',
    name: 'Quiet Forest',
    background: '#06120a',
    colors: [
      { h: 140, s: 60, l: 40, a: 0.8 },
      { h: 165, s: 65, l: 45, a: 0.8 },
      { h: 95, s: 55, l: 35, a: 0.8 },
      { h: 175, s: 70, l: 50, a: 0.8 },
      { h: 120, s: 50, l: 30, a: 0.8 },
    ],
  },
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Dust',
    background: '#080514',
    colors: [
      { h: 260, s: 85, l: 65, a: 0.8 },
      { h: 310, s: 80, l: 60, a: 0.8 },
      { h: 210, s: 90, l: 55, a: 0.8 },
      { h: 285, s: 75, l: 50, a: 0.8 },
      { h: 340, s: 70, l: 65, a: 0.8 },
    ],
  },
  moonlight: {
    id: 'moonlight',
    name: 'Moonlight',
    background: '#070b14',
    colors: [
      { h: 215, s: 40, l: 70, a: 0.8 },
      { h: 200, s: 50, l: 60, a: 0.8 },
      { h: 230, s: 45, l: 50, a: 0.8 },
      { h: 190, s: 35, l: 75, a: 0.8 },
      { h: 220, s: 30, l: 40, a: 0.8 },
    ],
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Rain',
    background: '#0d0916',
    colors: [
      { h: 260, s: 60, l: 65, a: 0.8 },
      { h: 240, s: 65, l: 70, a: 0.8 },
      { h: 280, s: 55, l: 60, a: 0.8 },
      { h: 225, s: 70, l: 65, a: 0.8 },
      { h: 295, s: 50, l: 75, a: 0.8 },
    ],
  },
  deepspace: {
    id: 'deepspace',
    name: 'Deep Space',
    background: '#020208',
    colors: [
      { h: 240, s: 90, l: 45, a: 0.8 },
      { h: 270, s: 85, l: 40, a: 0.8 },
      { h: 195, s: 95, l: 50, a: 0.8 },
      { h: 320, s: 70, l: 45, a: 0.8 },
      { h: 220, s: 80, l: 35, a: 0.8 },
    ],
  },
};

export function hslToString(hsl: HSLColor, alphaOverride?: number): string {
  const alpha = alphaOverride !== undefined ? alphaOverride : hsl.a ?? 1;
  return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${alpha})`;
}

export function interpolateHSL(c1: HSLColor, c2: HSLColor, t: number): HSLColor {
  // Shortest path for hue interpolation
  let deltaH = c2.h - c1.h;
  if (deltaH > 180) deltaH -= 360;
  if (deltaH < -180) deltaH += 360;

  const h = (c1.h + deltaH * t + 360) % 360;
  const s = c1.s + (c2.s - c1.s) * t;
  const l = c1.l + (c2.l - c1.l) * t;
  const a = (c1.a ?? 1) + ((c2.a ?? 1) - (c1.a ?? 1)) * t;

  return { h, s, l, a };
}

export function getPaletteColor(palette: Palette, position: number, alpha?: number): string {
  const colors = palette.colors;
  if (colors.length === 0) return 'hsla(0, 0%, 50%, 1)';
  if (colors.length === 1) return hslToString(colors[0], alpha);

  const p = Math.max(0, Math.min(1, position));
  const scaled = p * (colors.length - 1);
  const index = Math.floor(scaled);
  const fraction = scaled - index;

  if (index >= colors.length - 1) {
    return hslToString(colors[colors.length - 1], alpha);
  }

  const interpolated = interpolateHSL(colors[index], colors[index + 1], fraction);
  return hslToString(interpolated, alpha);
}
