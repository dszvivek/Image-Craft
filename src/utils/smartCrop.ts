export interface Point {
  x: number;
  y: number;
}

export interface SmartCropResult {
  x: number; // Normalized left [0, 1]
  y: number; // Normalized top [0, 1]
  w: number; // Normalized width [0, 1]
  h: number; // Normalized height [0, 1]
  type: 'document' | 'face' | 'saliency' | 'center';
  corners?: Point[]; // Raw document corners relative to actual image pixels
}

// Solver for 8x8 system of linear equations using Gaussian elimination
// Used to compute homography matrix for perspective warping
function solveLinearSystem(A: number[][], B: number[]): number[] {
  const n = B.length;
  for (let i = 0; i < n; i++) {
    // Search for maximum in this column
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    const tempRow = A[maxRow];
    A[maxRow] = A[i];
    A[i] = tempRow;
    const tempB = B[maxRow];
    B[maxRow] = B[i];
    B[i] = tempB;

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      B[k] += c * B[i];
    }
  }

  // Solve equation Ax=B for an upper triangular matrix A
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = B[i] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      B[k] -= A[k][i] * x[i];
    }
  }
  return x;
}

// Compute 3x3 homography matrix mapping src corners to dest corners
function getHomographyMatrix(src: Point[], dest: Point[]): number[] {
  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dest[i].x;
    const dy = dest[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    B.push(dx);

    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    B.push(dy);
  }

  const h = solveLinearSystem(A, B);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1.0];
}

// Lock crop box to target aspect ratio while centering on target bounding box
function fitCropBoxToAspect(
  box: { x: number; y: number; w: number; h: number },
  targetAspect: number,
  imgW: number,
  imgH: number
): { x: number; y: number; w: number; h: number } {
  // Convert target normalized bounds to pixels
  const pxX = box.x * imgW;
  const pxY = box.y * imgH;
  const pxW = box.w * imgW;
  const pxH = box.h * imgH;

  // Center coordinate of target
  const cx = pxX + pxW / 2;
  const cy = pxY + pxH / 2;

  // Fit aspect ratio around target center
  let finalW = pxW;
  let finalH = pxH;

  const currentAspect = pxW / pxH;
  if (currentAspect > targetAspect) {
    // Target is wider than requested aspect: expand height
    finalH = finalW / targetAspect;
    if (finalH > imgH) {
      finalH = imgH;
      finalW = finalH * targetAspect;
    }
  } else {
    // Target is taller than requested aspect: expand width
    finalW = finalH * targetAspect;
    if (finalW > imgW) {
      finalW = imgW;
      finalH = finalW / targetAspect;
    }
  }

  // Re-center box coordinates
  let left = cx - finalW / 2;
  let top = cy - finalH / 2;

  // Clamp boundaries
  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + finalW > imgW) left = imgW - finalW;
  if (top + finalH > imgH) top = imgH - finalH;

  return {
    x: left / imgW,
    y: top / imgH,
    w: finalW / imgW,
    h: finalH / imgH,
  };
}

// Core computer vision detection pipeline
export function detectSmartCrop(img: HTMLImageElement, targetAspect: number): SmartCropResult {
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const canvas = document.createElement('canvas');

  // STEP 1: DOCUMENT DETECTION
  // Documents are usually bright quads on darker backgrounds. We search at 200x150 resolution.
  const docW = 200;
  const docH = 150;
  canvas.width = docW;
  canvas.height = docH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return fallbackCenterCrop(targetAspect, imgW, imgH);

  ctx.drawImage(img, 0, 0, docW, docH);
  const docData = ctx.getImageData(0, 0, docW, docH).data;

  // Find average luminance and bright regions
  let sumLuma = 0;
  const lumaMap = new Uint8Array(docW * docH);
  for (let idx = 0; idx < docW * docH; idx++) {
    const r = docData[idx * 4];
    const g = docData[idx * 4 + 1];
    const b = docData[idx * 4 + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    lumaMap[idx] = luma;
    sumLuma += luma;
  }
  const avgLuma = sumLuma / (docW * docH);

  // Identify document coordinates by mapping bright cluster bounds
  // (Assuming document paper is brighter than desk, threshold at avgLuma * 1.15)
  const thresh = Math.min(avgLuma * 1.15, 230);
  let minX = docW, maxX = 0, minY = docH, maxY = 0;
  const docPixels: Point[] = [];

  for (let y = 0; y < docH; y++) {
    for (let x = 0; x < docW; x++) {
      const idx = y * docW + x;
      if (lumaMap[idx] > thresh) {
        docPixels.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const docArea = docPixels.length;
  const totalArea = docW * docH;

  // If a solid cluster representing 15% to 80% of image size is detected, treat it as a document
  if (docArea > totalArea * 0.15 && docArea < totalArea * 0.85) {
    // Identify 4 corners of the quad mapping extreme distances
    let tl = { x: docW, y: docH }, tr = { x: 0, y: docH }, bl = { x: docW, y: 0 }, br = { x: 0, y: 0 };
    let minTL = Infinity, maxTR = -Infinity, minBL = Infinity, maxBR = -Infinity;

    for (const p of docPixels) {
      // Top-left corner: minimizes x + y
      if (p.x + p.y < minTL) {
        minTL = p.x + p.y;
        tl = p;
      }
      // Top-right corner: maximizes x - y
      if (p.x - p.y > maxTR) {
        maxTR = p.x - p.y;
        tr = p;
      }
      // Bottom-left corner: minimizes x - y
      if (p.x - p.y < minBL) {
        minBL = p.x - p.y;
        bl = p;
      }
      // Bottom-right corner: maximizes x + y
      if (p.x + p.y > maxBR) {
        maxBR = p.x + p.y;
        br = p;
      }
    }

    // Convert corners back to original image pixel coordinates
    const scaleX = imgW / docW;
    const scaleY = imgH / docH;

    const corners: Point[] = [
      { x: tl.x * scaleX, y: tl.y * scaleY },
      { x: tr.x * scaleX, y: tr.y * scaleY },
      { x: br.x * scaleX, y: br.y * scaleY },
      { x: bl.x * scaleX, y: bl.y * scaleY },
    ];

    // Compute bounding box containing the document corners
    const left = Math.min(tl.x, bl.x) / docW;
    const top = Math.min(tl.y, tr.y) / docH;
    const right = Math.max(tr.x, br.x) / docW;
    const bottom = Math.max(bl.y, br.y) / docH;
    const w = right - left;
    const h = bottom - top;

    const fitted = fitCropBoxToAspect({ x: left, y: top, w, h }, targetAspect, imgW, imgH);
    return {
      ...fitted,
      type: 'document',
      corners,
    };
  }

  // STEP 2: FACE DETECTION
  // Skin color analysis in YCbCr space at 160x120 resolution.
  const faceW = 160;
  const faceH = 120;
  canvas.width = faceW;
  canvas.height = faceH;
  ctx.drawImage(img, 0, 0, faceW, faceH);
  const faceData = ctx.getImageData(0, 0, faceW, faceH).data;

  let fMinX = faceW, fMaxX = 0, fMinY = faceH, fMaxY = 0;
  let facePixelsCount = 0;

  for (let y = 0; y < faceH; y++) {
    for (let x = 0; x < faceW; x++) {
      const idx = (y * faceW + x) * 4;
      const r = faceData[idx];
      const g = faceData[idx + 1];
      const b = faceData[idx + 2];

      // Convert to YCbCr
      const cb = 128 - 0.1687 * r - 0.3313 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.4187 * g - 0.0813 * b;

      // Skin tones range
      if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
        facePixelsCount++;
        if (x < fMinX) fMinX = x;
        if (x > fMaxX) fMaxX = x;
        if (y < fMinY) fMinY = y;
        if (y > fMaxY) fMaxY = y;
      }
    }
  }

  // Enforce skin blob clusters representing 1.5% to 30% of canvas as faces
  const faceAreaRatio = facePixelsCount / (faceW * faceH);
  if (faceAreaRatio > 0.015 && faceAreaRatio < 0.35) {
    // Add margin space (include forehead/hair and neck coordinates)
    const paddingX = Math.round((fMaxX - fMinX) * 0.15);
    const paddingY = Math.round((fMaxY - fMinY) * 0.25);

    let left = Math.max(0, fMinX - paddingX) / faceW;
    let top = Math.max(0, fMinY - paddingY * 1.5) / faceH; // More space for forehead
    let right = Math.min(faceW, fMaxX + paddingX) / faceW;
    let bottom = Math.min(faceH, fMaxY + paddingY) / faceH;
    let w = right - left;
    let h = bottom - top;

    const fitted = fitCropBoxToAspect({ x: left, y: top, w, h }, targetAspect, imgW, imgH);
    return {
      ...fitted,
      type: 'face',
    };
  }

  // STEP 3: SALIENCY OBJECT DETECTION
  // Edge-density + color contrast mapping at 100x100 resolution.
  const salW = 100;
  const salH = 100;
  canvas.width = salW;
  canvas.height = salH;
  ctx.drawImage(img, 0, 0, salW, salH);
  const salData = ctx.getImageData(0, 0, salW, salH).data;

  // Sobel Edge Filter & Color Contrast map
  const saliency = new Float32Array(salW * salH);
  let totalSal = 0;

  // Compute average color
  let sumR = 0, sumG = 0, sumB = 0;
  for (let idx = 0; idx < salW * salH; idx++) {
    sumR += salData[idx * 4];
    sumG += salData[idx * 4 + 1];
    sumB += salData[idx * 4 + 2];
  }
  const avgR = sumR / (salW * salH);
  const avgG = sumG / (salW * salH);
  const avgB = sumB / (salW * salH);

  for (let y = 1; y < salH - 1; y++) {
    for (let x = 1; x < salW - 1; x++) {
      // Sobel math in X and Y
      let gx = 0;
      let gy = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const pIdx = ((y + dy) * salW + (x + dx)) * 4;
          const val = 0.299 * salData[pIdx] + 0.587 * salData[pIdx+1] + 0.114 * salData[pIdx+2];

          // Sobel Kernels
          const kx = dx * (dy === 0 ? 2 : 1);
          const ky = dy * (dx === 0 ? 2 : 1);
          gx += val * kx;
          gy += val * ky;
        }
      }
      const edge = Math.sqrt(gx * gx + gy * gy);

      // Contrast from mean
      const cIdx = (y * salW + x) * 4;
      const rDiff = salData[cIdx] - avgR;
      const gDiff = salData[cIdx + 1] - avgG;
      const bDiff = salData[cIdx + 2] - avgB;
      const contrast = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

      const val = edge * 0.4 + contrast * 0.6;
      saliency[y * salW + x] = val;
      totalSal += val;
    }
  }

  // Find bounding box enclosing top 75% of saliency energy distribution
  let threshSal = totalSal * 0.08 / (salW * salH); // Threshold filter
  let sMinX = salW, sMaxX = 0, sMinY = salH, sMaxY = 0;
  let activeCount = 0;

  for (let y = 0; y < salH; y++) {
    for (let x = 0; x < salW; x++) {
      if (saliency[y * salW + x] > threshSal) {
        activeCount++;
        if (x < sMinX) sMinX = x;
        if (x > sMaxX) sMaxX = x;
        if (y < sMinY) sMinY = y;
        if (y > sMaxY) sMaxY = y;
      }
    }
  }

  if (activeCount > 0 && sMaxX > sMinX && sMaxY > sMinY) {
    const left = sMinX / salW;
    const top = sMinY / salH;
    const w = (sMaxX - sMinX) / salW;
    const h = (sMaxY - sMinY) / salH;

    const fitted = fitCropBoxToAspect({ x: left, y: top, w, h }, targetAspect, imgW, imgH);
    return {
      ...fitted,
      type: 'saliency',
    };
  }

  // STEP 4: CENTER CROP FALLBACK
  return fallbackCenterCrop(targetAspect, imgW, imgH);
}

function fallbackCenterCrop(targetAspect: number, imgW: number, imgH: number): SmartCropResult {
  const imgRatio = imgW / imgH;
  let w = 1.0;
  let h = 1.0;
  let x = 0.0;
  let y = 0.0;

  if (imgRatio > targetAspect) {
    // Image is wider than crop box
    w = (targetAspect * imgH) / imgW;
    x = (1.0 - w) / 2;
  } else {
    // Image is taller than crop box
    h = (imgW / targetAspect) / imgH;
    y = (1.0 - h) / 2;
  }

  return {
    x,
    y,
    w,
    h,
    type: 'center',
  };
}

// 3x3 Homography projection warp algorithm (pure client side)
export function warpPerspective(
  img: HTMLImageElement,
  srcCorners: Point[],
  destW: number,
  destH: number,
  canvas: HTMLCanvasElement
): void {
  canvas.width = destW;
  canvas.height = destH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw source image onto a temporary hidden canvas to read source pixels
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return;
  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

  // Map destination corners
  const destCorners: Point[] = [
    { x: 0, y: 0 },
    { x: destW, y: 0 },
    { x: destW, y: destH },
    { x: 0, y: destH },
  ];

  // Get homography matrix coefficients mapping dest coordinates to source pixels (backward mapping)
  // Maps (u, v) -> (x, y) to prevent pixel gaps in destination canvas
  const h = getHomographyMatrix(destCorners, srcCorners);

  // Allocate destination buffer
  const destImgData = ctx.createImageData(destW, destH);
  const destData = destImgData.data;

  for (let v = 0; v < destH; v++) {
    for (let u = 0; u < destW; u++) {
      // Projection math
      const divisor = h[6] * u + h[7] * v + h[8];
      const x = Math.round((h[0] * u + h[1] * v + h[2]) / divisor);
      const y = Math.round((h[3] * u + h[4] * v + h[5]) / divisor);

      const destIdx = (v * destW + u) * 4;

      if (x >= 0 && x < srcW && y >= 0 && y < srcH) {
        const srcIdx = (y * srcW + x) * 4;
        destData[destIdx] = srcData[srcIdx];
        destData[destIdx + 1] = srcData[srcIdx + 1];
        destData[destIdx + 2] = srcData[srcIdx + 2];
        destData[destIdx + 3] = srcData[srcIdx + 3];
      } else {
        // Transparent border fallback
        destData[destIdx] = 0;
        destData[destIdx + 1] = 0;
        destData[destIdx + 2] = 0;
        destData[destIdx + 3] = 0;
      }
    }
  }

  ctx.putImageData(destImgData, 0, 0);
}
