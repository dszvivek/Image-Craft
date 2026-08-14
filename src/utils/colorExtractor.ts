import type { ColorSwatch } from '../types';

// Convert RGB to HEX string
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Calculate Euclidean distance between two colors in RGB space
const colorDistance = (c1: [number, number, number], c2: [number, number, number]): number => {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
};

/**
 * Extract dominant colors from an image element.
 * Scales down image, counts grouped color frequencies, and selects diverse high-frequency swatches.
 */
export const extractDominantColors = (
  img: HTMLImageElement,
  count: number = 6
): ColorSwatch[] => {
  const canvas = document.createElement('canvas');
  // Scale down to speed up processing and smooth out micro-variations
  const size = 100;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Map to store frequency of grouped colors
  const colorMap: Record<string, { rgb: [number, number, number]; count: number }> = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Ignore highly transparent pixels
    if (a < 128) continue;

    // Quantize color space by rounding RGB values to reduce micro-differences
    // Rounding to nearest 16 yields 4096 possible colors (16^3)
    const qr = Math.round(r / 16) * 16;
    const qg = Math.round(g / 16) * 16;
    const qb = Math.round(b / 16) * 16;
    const key = `${qr},${qg},${qb}`;

    if (colorMap[key]) {
      colorMap[key].count++;
      // Keep running average of actual colors in this bucket
      colorMap[key].rgb[0] = (colorMap[key].rgb[0] + r) / 2;
      colorMap[key].rgb[1] = (colorMap[key].rgb[1] + g) / 2;
      colorMap[key].rgb[2] = (colorMap[key].rgb[2] + b) / 2;
    } else {
      colorMap[key] = {
        rgb: [r, g, b],
        count: 1
      };
    }
  }

  // Convert map to sorted array
  const sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);

  const selectedColors: ColorSwatch[] = [];
  const minColorDistance = 60; // Ensure diversity in the palette

  for (const item of sortedColors) {
    if (selectedColors.length >= count) break;

    const rgbTuple = item.rgb.map(Math.round) as [number, number, number];
    
    // Check if this color is sufficiently different from already selected colors
    const isDiverse = selectedColors.every((swatch) => {
      // Parse HEX back to RGB or store RGB tuple
      const parts = swatch.rgb.replace(/[^\d,]/g, '').split(',').map(Number);
      return colorDistance(rgbTuple, [parts[0], parts[1], parts[2]]) > minColorDistance;
    });

    if (selectedColors.length === 0 || isDiverse) {
      selectedColors.push({
        hex: rgbToHex(rgbTuple[0], rgbTuple[1], rgbTuple[2]),
        rgb: `rgb(${rgbTuple[0]}, ${rgbTuple[1]}, ${rgbTuple[2]})`,
        percentage: Math.round((item.count / (size * size)) * 100)
      });
    }
  }

  // Fallback if we didn't extract enough diverse colors
  if (selectedColors.length < count && sortedColors.length > selectedColors.length) {
    for (const item of sortedColors) {
      if (selectedColors.length >= count) break;
      const rgbTuple = item.rgb.map(Math.round) as [number, number, number];
      const hex = rgbToHex(rgbTuple[0], rgbTuple[1], rgbTuple[2]);
      
      const alreadyExists = selectedColors.some((swatch) => swatch.hex === hex);
      if (!alreadyExists) {
        selectedColors.push({
          hex,
          rgb: `rgb(${rgbTuple[0]}, ${rgbTuple[1]}, ${rgbTuple[2]})`,
          percentage: Math.round((item.count / (size * size)) * 100)
        });
      }
    }
  }

  return selectedColors;
};
