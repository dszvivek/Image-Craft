import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles, Download, Play, Pause, Image as ImageIcon, Check, ShieldCheck, Info } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';

interface Point {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  edge: number;
  angle: number;
  isBg: boolean;
}

interface Theme {
  id: 'stars' | 'flowers' | 'clouds' | 'pencil' | 'ink' | 'bubbles';
  name: string;
  description: string;
  defaultBg: string;
  defaultColorMode: 'duotone' | 'original' | 'vintage' | 'neon';
  icon: string;
}

const THEMES: Theme[] = [
  { id: 'clouds', name: 'Clouds in the Sky', description: 'Volumetric clouds forming your photo in a blue sky.', defaultBg: '#0284c7', defaultColorMode: 'original', icon: '☁️' },
  { id: 'stars', name: 'Cosmic Constellation', description: 'Stars and glowing nebulae forming a constellation.', defaultBg: '#05070f', defaultColorMode: 'duotone', icon: '✨' },
  { id: 'flowers', name: 'Garden Blossom Hedge', description: 'Sakura flowers blooming on a green garden bush.', defaultBg: '#022c22', defaultColorMode: 'duotone', icon: '🌸' },
  { id: 'pencil', name: 'Fine Pencil Drawing', description: 'Classic graphite sketching on canvas grain paper.', defaultBg: '#f5f4ee', defaultColorMode: 'duotone', icon: '✏️' },
  { id: 'ink', name: 'Aged Ink Wash', description: 'Dip-pen ink lines and splatters on aged parchment.', defaultBg: '#FAF9F3', defaultColorMode: 'duotone', icon: '✒️' },
  { id: 'bubbles', name: 'Floating Soap Bubbles', description: 'Iridescent bubbles forming a glassy portrait.', defaultBg: '#040712', defaultColorMode: 'original', icon: '🫧' }
];

export const ShapeArtGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [theme, setTheme] = useState<'stars' | 'flowers' | 'clouds' | 'pencil' | 'ink' | 'bubbles'>('clouds');
  
  // Customization parameters
  const [density, setDensity] = useState<number>(4500);
  const [baseSize, setBaseSize] = useState<number>(10);
  const [edgeSensitivity, setEdgeSensitivity] = useState<number>(35);
  const [colorMode, setColorMode] = useState<'original' | 'duotone' | 'vintage' | 'neon'>('original');
  const [bgColor, setBgColor] = useState<string>('#0284c7');
  const [photoOverlay, setPhotoOverlay] = useState<number>(20);
  const [keyBackground, setKeyBackground] = useState<boolean>(true); // autokey studio backgrounds
  const [keyTolerance, setKeyTolerance] = useState<number>(45);      // chroma matching tolerance
  const [exportScale, setExportScale] = useState<number>(2);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // References
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const currentIndexRef = useRef<number>(0);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageUrl(url);
      
      const currentTheme = THEMES.find(t => t.id === theme);
      if (currentTheme) {
        setBgColor(currentTheme.defaultBg);
        setColorMode(currentTheme.defaultColorMode);
      }
    }
  };

  const handleThemeChange = (themeId: 'stars' | 'flowers' | 'clouds' | 'pencil' | 'ink' | 'bubbles') => {
    setTheme(themeId);
    const selectedTheme = THEMES.find(t => t.id === themeId);
    if (selectedTheme) {
      setBgColor(selectedTheme.defaultBg);
      setColorMode(selectedTheme.defaultColorMode);
    }
  };

  // Generate procedural sky, space, or garden backgrounds
  const drawThemeBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();

    if (theme === 'clouds') {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0c4a6e');   // deep atmosphere
      skyGrad.addColorStop(0.35, '#0284c7'); // sky blue
      skyGrad.addColorStop(0.7, '#38bdf8');  // light sky blue
      skyGrad.addColorStop(1, '#bae6fd');    // horizon sunlight
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Faint natural background clouds near borders
      for (let i = 0; i < 4; i++) {
        const cx = width * (0.15 + i * 0.25) + (Math.random() - 0.5) * 40;
        const cy = height * (0.2 + Math.random() * 0.4);
        const r = width * (0.15 + Math.random() * 0.15);
        drawVolumetricCloud(ctx, cx, cy, r, 255, 255, 255, 0.05);
      }
    } else if (theme === 'stars') {
      const spaceGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height));
      spaceGrad.addColorStop(0, '#121026');   // indigo center
      spaceGrad.addColorStop(0.6, '#070814'); // dark space
      spaceGrad.addColorStop(1, '#020205');   // absolute black
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // Faint nebulae glow
      const nebGrad = ctx.createRadialGradient(width * 0.3, height * 0.35, 10, width * 0.3, height * 0.35, width * 0.45);
      nebGrad.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      nebGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
      nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(width * 0.3, height * 0.35, width * 0.45, 0, 2 * Math.PI);
      ctx.fill();

      // Twinkling stars in the background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 150; i++) {
        ctx.globalAlpha = 0.15 + Math.random() * 0.5;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 0.4 + Math.random() * 1.0;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (theme === 'flowers') {
      const gardenGrad = ctx.createLinearGradient(0, 0, width, height);
      gardenGrad.addColorStop(0, '#064e3b');   // emerald
      gardenGrad.addColorStop(0.5, '#022c22'); // deep forest green
      gardenGrad.addColorStop(1, '#065f46');
      ctx.fillStyle = gardenGrad;
      ctx.fillRect(0, 0, width, height);

      // Out-of-focus background leaves
      ctx.fillStyle = '#047857';
      for (let i = 0; i < 90; i++) {
        ctx.globalAlpha = 0.07;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 18 + Math.random() * 32;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (theme === 'pencil') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.015)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 300; i++) {
        ctx.beginPath();
        const x = Math.random() * width;
        const y = Math.random() * height;
        const len = 20 + Math.random() * 70;
        const angle = Math.random() * Math.PI * 2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
      }
    } else if (theme === 'ink') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 3; i++) {
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const r = 50 + Math.random() * 100;
        const stain = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
        stain.addColorStop(0, 'rgba(139, 90, 43, 0.04)');
        stain.addColorStop(0.7, 'rgba(139, 90, 43, 0.01)');
        stain.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = stain;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (theme === 'bubbles') {
      const spotGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
      spotGrad.addColorStop(0, '#0d1e2d');
      spotGrad.addColorStop(0.7, '#070b12');
      spotGrad.addColorStop(1, '#020408');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  };

  const processImage = () => {
    const img = sourceImageRef.current;
    if (!img) return;

    setIsProcessing(true);
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    const maxDim = 550;
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    tempCanvas.width = width;
    tempCanvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    
    // Sample 4 corners to find average background studio color
    const getCornerAverage = () => {
      const samples = [
        0, 
        (width - 1) * 4, 
        (height - 1) * width * 4, 
        ((height - 1) * width + (width - 1)) * 4
      ];
      let r = 0, g = 0, b = 0, count = 0;
      samples.forEach(idx => {
        if (idx < pixels.length) {
          r += pixels[idx];
          g += pixels[idx + 1];
          b += pixels[idx + 2];
          count++;
        }
      });
      return { r: r / count, g: g / count, b: b / count };
    };
    const cornerColor = getCornerAverage();

    const grayscale = new Uint8Array(width * height);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      grayscale[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const edges = new Float32Array(width * height);
    const angles = new Float32Array(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const v00 = grayscale[(y - 1) * width + (x - 1)];
        const v01 = grayscale[(y - 1) * width + x];
        const v02 = grayscale[(y - 1) * width + (x + 1)];

        const v10 = grayscale[y * width + (x - 1)];
        const v12 = grayscale[y * width + (x + 1)];

        const v20 = grayscale[(y + 1) * width + (x - 1)];
        const v21 = grayscale[(y + 1) * width + x];
        const v22 = grayscale[(y + 1) * width + (x + 1)];

        const gx = -v00 + v02 - 2 * v10 + 2 * v12 - v20 + v22;
        const gy = -v00 - 2 * v01 - v02 + v20 + 2 * v21 + v22;

        edges[idx] = Math.sqrt(gx * gx + gy * gy);
        angles[idx] = Math.atan2(gy, gx);
      }
    }

    const points: Point[] = [];
    const targetPointsCount = density;
    const pixelsPerPoint = (width * height) / targetPointsCount;
    const stepSize = Math.max(4, Math.round(Math.sqrt(pixelsPerPoint)));
    const threshold = edgeSensitivity;

    for (let y = 0; y < height; y += stepSize) {
      for (let x = 0; x < width; x += stepSize) {
        const idx = Math.floor(y) * width + Math.floor(x);
        if (idx >= width * height) continue;

        const edgeVal = edges[idx];
        const angle = angles[idx];

        const jitterX = (Math.random() - 0.5) * stepSize * 0.9;
        const jitterY = (Math.random() - 0.5) * stepSize * 0.9;
        const px = Math.max(0, Math.min(width - 1, x + jitterX));
        const py = Math.max(0, Math.min(height - 1, y + jitterY));
        const pIdx = Math.floor(py) * width + Math.floor(px);
        const pixelIdx = pIdx * 4;

        // Auto-key background detection matching corner color
        const isBgPoint = keyBackground && (
          (pixels[pixelIdx + 3] < 50) || // Alpha transparency
          (Math.abs(pixels[pixelIdx] - cornerColor.r) < keyTolerance &&
           Math.abs(pixels[pixelIdx + 1] - cornerColor.g) < keyTolerance &&
           Math.abs(pixels[pixelIdx + 2] - cornerColor.b) < keyTolerance)
        );

        if (edgeVal > threshold) {
          const subStep = stepSize / 2;
          for (let sy = 0; sy < stepSize; sy += subStep) {
            for (let sx = 0; sx < stepSize; sx += subStep) {
              const subJitterX = (Math.random() - 0.5) * subStep * 0.8;
              const subJitterY = (Math.random() - 0.5) * subStep * 0.8;
              const spx = Math.max(0, Math.min(width - 1, x + sx + subJitterX));
              const spy = Math.max(0, Math.min(height - 1, y + sy + subJitterY));
              const subIdx = Math.floor(spy) * width + Math.floor(spx);
              const subPixelIdx = subIdx * 4;

              const isSubBg = keyBackground && (
                (pixels[subPixelIdx + 3] < 50) ||
                (Math.abs(pixels[subPixelIdx] - cornerColor.r) < keyTolerance &&
                 Math.abs(pixels[subPixelIdx + 1] - cornerColor.g) < keyTolerance &&
                 Math.abs(pixels[subPixelIdx + 2] - cornerColor.b) < keyTolerance)
              );

              points.push({
                x: spx / width,
                y: spy / height,
                r: pixels[subPixelIdx],
                g: pixels[subPixelIdx + 1],
                b: pixels[subPixelIdx + 2],
                edge: edges[subIdx],
                angle: angles[subIdx],
                isBg: isSubBg
              });
            }
          }
        } else {
          points.push({
            x: px / width,
            y: py / height,
            r: pixels[pixelIdx],
            g: pixels[pixelIdx + 1],
            b: pixels[pixelIdx + 2],
            edge: edgeVal,
            angle: angle,
            isBg: isBgPoint
          });
        }
      }
    }

    // Sort: flat areas first (under-painting), contour outline details last
    points.sort((a, b) => a.edge - b.edge);

    pointsRef.current = points;
    setIsProcessing(false);
    
    startDrawingAnimation();
  };

  const startDrawingAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas || pointsRef.current.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = sourceImageRef.current;
    if (img) {
      const maxCanvasDim = 800;
      let canvasW = img.naturalWidth;
      let canvasH = img.naturalHeight;
      if (canvasW > maxCanvasDim || canvasH > maxCanvasDim) {
        if (canvasW > canvasH) {
          canvasH = Math.round((canvasH * maxCanvasDim) / canvasW);
          canvasW = maxCanvasDim;
        } else {
          canvasW = Math.round((canvasW * maxCanvasDim) / canvasH);
          canvasH = maxCanvasDim;
        }
      }
      canvas.width = canvasW;
      canvas.height = canvasH;
    }

    // Generate background
    drawThemeBackground(ctx, canvas.width, canvas.height);

    // Draw overlay original photo
    if (photoOverlay > 0 && img) {
      ctx.save();
      // Adjust overlay to only draw where it is NOT background (for clean silhouette look)
      ctx.globalAlpha = photoOverlay / 100;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (theme === 'flowers') {
      drawFlowerBranches(ctx, canvas.width, canvas.height);
    }

    currentIndexRef.current = 0;
    setIsPlaying(true);
    setProgress(0);

    animateDraw();
  };

  const drawFlowerBranches = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const points = pointsRef.current;
    ctx.save();
    ctx.strokeStyle = 'rgba(110, 85, 65, 0.15)';
    ctx.lineWidth = 1.0;
    
    for (let i = 0; i < points.length; i += 20) {
      const p1 = points[i];
      if (p1.edge < edgeSensitivity + 5 || p1.isBg) continue;

      for (let j = i + 20; j < i + 120; j += 20) {
        if (j >= points.length) break;
        const p2 = points[j];
        if (p2.edge < edgeSensitivity + 5 || p2.isBg) continue;

        const dx = (p1.x - p2.x) * width;
        const dy = (p1.y - p2.y) * height;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 35) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          const cx = ((p1.x + p2.x) / 2) * width + (Math.random() - 0.5) * 4;
          const cy = ((p1.y + p2.y) / 2) * height + (Math.random() - 0.5) * 4;
          ctx.quadraticCurveTo(cx, cy, p2.x * width, p2.y * height);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  };

  const animateDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const points = pointsRef.current;

    if (!canvas || !ctx || points.length === 0) return;

    const batchSize = Math.max(15, Math.round(points.length / 100));
    const endIndex = Math.min(points.length, currentIndexRef.current + batchSize);

    for (let i = currentIndexRef.current; i < endIndex; i++) {
      const p = points[i];
      
      // Skip background points to let sky or space nebula show through
      if (p.isBg) continue;

      const cx = p.x * canvas.width;
      const cy = p.y * canvas.height;

      const detailFactor = Math.min(1.0, p.edge / 100);
      const size = Math.max(2, baseSize * (1.3 - detailFactor * 0.95));
      const luma = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;

      let color = `rgb(${p.r}, ${p.g}, ${p.b})`;
      
      if (colorMode === 'duotone') {
        if (theme === 'stars') {
          if (luma > 200) color = 'rgba(255, 236, 179, 0.95)';
          else if (luma > 100) color = 'rgba(100, 181, 246, 0.7)';
          else color = 'rgba(49, 27, 146, 0.4)';
        } else if (theme === 'flowers') {
          if (luma > 180) color = 'rgba(255, 240, 245, 0.9)';
          else if (luma > 90) color = 'rgba(244, 143, 177, 0.75)';
          else color = 'rgba(136, 14, 79, 0.7)';
        } else if (theme === 'pencil') {
          color = `rgba(33, 37, 43, ${0.35 + detailFactor * 0.5})`;
        } else if (theme === 'ink') {
          if (luma < 90) color = `rgba(13, 27, 42, ${0.7 + detailFactor * 0.25})`;
          else color = `rgba(27, 38, 59, ${0.45 + detailFactor * 0.2})`;
        } else {
          if (luma > 128) color = 'rgb(244, 107, 107)';
          else color = 'rgb(44, 62, 80)';
        }
      } else if (colorMode === 'vintage') {
        const sepiaR = (p.r * 0.393) + (p.g * 0.769) + (p.b * 0.189);
        const sepiaG = (p.r * 0.349) + (p.g * 0.686) + (p.b * 0.168);
        const sepiaB = (p.r * 0.272) + (p.g * 0.534) + (p.b * 0.131);
        color = `rgb(${Math.min(255, sepiaR)}, ${Math.min(255, sepiaG)}, ${Math.min(255, sepiaB)})`;
      } else if (colorMode === 'neon') {
        const neonColors = ['rgb(244, 63, 94)', 'rgb(168, 85, 247)', 'rgb(6, 182, 212)', 'rgb(34, 197, 94)', 'rgb(253, 224, 71)'];
        color = neonColors[(p.r + p.g + p.b) % neonColors.length];
      }

      ctx.save();
      renderPremiumShape(ctx, theme, cx, cy, size, color, p, luma, i, points);
      ctx.restore();
    }

    currentIndexRef.current = endIndex;
    setProgress(Math.round((endIndex / points.length) * 100));

    if (endIndex < points.length) {
      animationFrameRef.current = requestAnimationFrame(animateDraw);
    } else {
      setIsPlaying(false);
      animationFrameRef.current = null;
    }
  };

  const renderPremiumShape = (
    ctx: CanvasRenderingContext2D,
    themeType: string,
    cx: number,
    cy: number,
    size: number,
    color: string,
    p: Point,
    luma: number,
    i: number,
    points: Point[]
  ) => {
    if (themeType === 'clouds') {
      // White clouds for skin and clothing, faint shadow blue clouds for hair/eyes
      if (luma > 135) {
        drawVolumetricCloud(ctx, cx, cy, size * 2.5, 255, 255, 255, 0.28);
      } else {
        drawVolumetricCloud(ctx, cx, cy, size * 1.5, 176, 214, 237, 0.14);
      }

      // Feature contours: fine wispy mist lines
      if (p.edge > edgeSensitivity) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        const strokeAngle = p.angle + Math.PI / 2;
        const dx = Math.cos(strokeAngle) * size * 0.45;
        const dy = Math.sin(strokeAngle) * size * 0.45;
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
      }
    } else if (themeType === 'stars') {
      if (p.edge < edgeSensitivity) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.04;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      if (luma > 220) {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 2.0);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(0.35, color);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 2.0, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        drawStar4(ctx, cx, cy, size * 0.75);
      } else if (p.edge > edgeSensitivity) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.28, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        if (p.x % 2 === 0) drawStar4(ctx, cx, cy, size * 0.55);
        else {
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Constellation webs between nearby stars
      if (luma > 135) {
        ctx.save();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.12)';
        ctx.lineWidth = 0.4;
        const canvas = canvasRef.current;
        if (canvas) {
          for (let j = Math.max(0, i - 50); j < i; j++) {
            const prevP = points[j];
            if (prevP.isBg) continue;
            const prevLuma = 0.299 * prevP.r + 0.587 * prevP.g + 0.114 * prevP.b;
            if (prevLuma > 135) {
              const dx = cx - prevP.x * canvas.width;
              const dy = cy - prevP.y * canvas.height;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 32) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(prevP.x * canvas.width, prevP.y * canvas.height);
                ctx.stroke();
              }
            }
          }
        }
        ctx.restore();
      }
    } else if (themeType === 'flowers') {
      if (luma > 225) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 235, 235, 0.2)';
        drawFlowerWatercolor(ctx, cx, cy, size * 0.7);
        ctx.restore();
      }

      if (p.edge > edgeSensitivity) {
        ctx.strokeStyle = 'rgba(90, 80, 70, 0.35)';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        const strokeAngle = p.angle + Math.PI / 2;
        const dx = Math.cos(strokeAngle) * size * 0.5;
        const dy = Math.sin(strokeAngle) * size * 0.5;
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(cx + dx * 0.15, cy + dy * 0.15, size * 0.25, 0, 2 * Math.PI);
        ctx.fill();
      } else if (luma <= 225) {
        ctx.fillStyle = color;
        drawFlowerWatercolor(ctx, cx, cy, size);
      }
    } else if (themeType === 'pencil') {
      if (luma > 215) {
        ctx.save();
        ctx.strokeStyle = 'rgba(110, 115, 125, 0.12)';
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        const shadeAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.15;
        const dx = Math.cos(shadeAngle) * size * 0.5;
        const dy = Math.sin(shadeAngle) * size * 0.5;
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
        ctx.restore();
      }

      if (p.edge > edgeSensitivity) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        const strokeAngle = p.angle + Math.PI / 2;
        const dx = Math.cos(strokeAngle) * size * 0.65;
        const dy = Math.sin(strokeAngle) * size * 0.65;
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
      }

      if (luma <= 215) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.45;
        const shadeAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.15;
        const dx = Math.cos(shadeAngle) * size * 0.85;
        const dy = Math.sin(shadeAngle) * size * 0.85;
        
        ctx.beginPath();
        ctx.moveTo(cx - dx, cy - dy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();

        if (luma < 95) {
          ctx.beginPath();
          ctx.moveTo(cx - dy * 0.75, cy + dx * 0.75);
          ctx.lineTo(cx + dy * 0.75, cy - dx * 0.75);
          ctx.stroke();
        }
      }
    } else if (themeType === 'ink') {
      if (p.edge > edgeSensitivity) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        const strokeAngle = p.angle + Math.PI / 2;
        ctx.moveTo(cx - Math.cos(strokeAngle) * size * 0.5, cy - Math.sin(strokeAngle) * size * 0.5);
        ctx.lineTo(cx + Math.cos(strokeAngle) * size * 0.5, cy + Math.sin(strokeAngle) * size * 0.5);
        ctx.stroke();
      } else if (luma <= 220) {
        ctx.fillStyle = color;
        const shadowFactor = 1.0 - luma / 255;
        
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.5, size * 0.22 * shadowFactor), 0, 2 * Math.PI);
        ctx.fill();

        if (shadowFactor > 0.55 && Math.random() < 0.22) {
          ctx.save();
          ctx.globalAlpha = 0.45;
          for (let s = 0; s < 3; s++) {
            const sAngle = Math.random() * Math.PI * 2;
            const sDist = size * (0.35 + Math.random() * 0.45);
            ctx.beginPath();
            ctx.arc(cx + Math.cos(sAngle) * sDist, cy + Math.sin(sAngle) * sDist, size * 0.08, 0, 2 * Math.PI);
            ctx.fill();
          }
          ctx.restore();
        }
      }
      
      if (luma > 220) {
        ctx.save();
        ctx.fillStyle = 'rgba(180, 185, 195, 0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    } else if (themeType === 'bubbles') {
      drawBubbleIridescent(ctx, cx, cy, size, color, luma);
    }
  };

  const drawStar4 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - r);
    ctx.closePath();
    ctx.fill();
  };

  // Volumetric fluffy cloud particles
  const drawVolumetricCloud = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rRed: number,
    rGreen: number,
    rBlue: number,
    opacity: number
  ) => {
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
    grad.addColorStop(0, `rgba(${rRed}, ${rGreen}, ${rBlue}, ${opacity})`);
    grad.addColorStop(0.5, `rgba(${Math.max(0, rRed - 15)}, ${Math.max(0, rGreen - 10)}, ${Math.max(0, rBlue - 5)}, ${opacity * 0.65})`);
    grad.addColorStop(1, `rgba(${rRed}, ${rGreen}, ${rBlue}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const drawFlowerWatercolor = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const petals = 5;
    const rotation = (cx + cy) % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.4;
    
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (r * 0.5), Math.sin(angle) * (r * 0.5), r * 0.4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawBubbleIridescent = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, luma: number) => {
    const finalR = r * (0.4 + (luma / 255) * 0.6);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, finalR, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.07;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, finalR, 0, 2 * Math.PI);
    const grad = ctx.createLinearGradient(cx - finalR, cy - finalR, cx + finalR, cy + finalR);
    grad.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0.4)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.0;
    ctx.globalAlpha = 0.7;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - finalR * 0.3, cy - finalR * 0.3, finalR * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.restore();
  };

  const togglePlayback = () => {
    if (isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsPlaying(false);
    } else {
      if (currentIndexRef.current >= pointsRef.current.length) {
        startDrawingAnimation();
      } else {
        setIsPlaying(true);
        animateDraw();
      }
    }
  };

  useEffect(() => {
    if (imageUrl) {
      const timer = setTimeout(() => {
        processImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [theme, density, baseSize, edgeSensitivity, colorMode, bgColor, photoOverlay, keyBackground, keyTolerance]);

  const handleExport = () => {
    const points = pointsRef.current;
    if (points.length === 0 || !sourceImageRef.current) return;

    const img = sourceImageRef.current;
    const targetWidth = img.naturalWidth * exportScale;
    const targetHeight = img.naturalHeight * exportScale;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    drawThemeBackground(ctx, targetWidth, targetHeight);

    if (photoOverlay > 0) {
      ctx.save();
      ctx.globalAlpha = photoOverlay / 100;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      ctx.restore();
    }

    if (theme === 'flowers') {
      drawFlowerBranches(ctx, targetWidth, targetHeight);
    }

    points.forEach((p, idx) => {
      if (p.isBg) return;

      const cx = p.x * targetWidth;
      const cy = p.y * targetHeight;
      const detailFactor = Math.min(1.0, p.edge / 100);
      const size = Math.max(2 * exportScale, baseSize * exportScale * (1.3 - detailFactor * 0.95));
      const luma = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;

      let color = `rgb(${p.r}, ${p.g}, ${p.b})`;
      if (colorMode === 'duotone') {
        if (theme === 'stars') {
          if (luma > 200) color = 'rgba(255, 236, 179, 0.95)';
          else if (luma > 100) color = 'rgba(100, 181, 246, 0.7)';
          else color = 'rgba(49, 27, 146, 0.4)';
        } else if (theme === 'flowers') {
          if (luma > 180) color = 'rgba(255, 240, 245, 0.9)';
          else if (luma > 90) color = 'rgba(244, 143, 177, 0.75)';
          else color = 'rgba(136, 14, 79, 0.7)';
        } else if (theme === 'pencil') {
          color = `rgba(33, 37, 43, ${0.35 + detailFactor * 0.5})`;
        } else if (theme === 'ink') {
          if (luma < 90) color = `rgba(13, 27, 42, ${0.7 + detailFactor * 0.25})`;
          else color = `rgba(27, 38, 59, ${0.45 + detailFactor * 0.2})`;
        } else {
          if (luma > 128) color = 'rgb(244, 107, 107)';
          else color = 'rgb(44, 62, 80)';
        }
      } else if (colorMode === 'vintage') {
        const sepiaR = (p.r * 0.393) + (p.g * 0.769) + (p.b * 0.189);
        const sepiaG = (p.r * 0.349) + (p.g * 0.686) + (p.b * 0.168);
        const sepiaB = (p.r * 0.272) + (p.g * 0.534) + (p.b * 0.131);
        color = `rgb(${Math.min(255, sepiaR)}, ${Math.min(255, sepiaG)}, ${Math.min(255, sepiaB)})`;
      } else if (colorMode === 'neon') {
        const neonColors = ['rgb(244, 63, 94)', 'rgb(168, 85, 247)', 'rgb(6, 182, 212)', 'rgb(34, 197, 94)', 'rgb(253, 224, 71)'];
        color = neonColors[(p.r + p.g + p.b) % neonColors.length];
      }

      ctx.save();
      renderPremiumShape(ctx, theme, cx, cy, size, color, p, luma, idx, points);
      ctx.restore();
    });

    const ext = theme === 'pencil' || theme === 'ink' || theme === 'flowers' ? 'jpg' : 'png';
    const mimeType = ext === 'jpg' ? 'image/jpeg' : 'image/png';
    const name = file ? file.name.substring(0, file.name.lastIndexOf('.')) : 'shape_portrait';

    const link = document.createElement('a');
    link.download = `${name}_shapes_${theme}_${exportScale}x.${ext}`;
    link.href = exportCanvas.toDataURL(mimeType, 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setFile(null);
    setImageUrl('');
    pointsRef.current = [];
    setProgress(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [imageUrl]);

  return (
    <div className="w-full">
      <SEO 
        title="AI Contour Shape Art Generator - Turn Photos into Particle Art"
        description="Turn your photos into creative art portraits composed of stars, flowers, clouds, or hand-drawn pencil strokes. Identifies facial details and pose contours."
        keywords="AI portrait generator, contour sketch generator, shape art converter, photo to particle art, stars canvas portrait, flowers portrait art, local photo art generator"
        canonicalUrl="https://imagegiri.com/shape-art-generator"
      />

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-655 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Creative Canvas
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">AI Shape Art Generator</h1>
          <p className="text-sm text-slate-500">Scan facial patterns and pose outlines to reconstruct portraits out of beautiful organic shapes.</p>
        </div>

        {!file ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                accept="image/*"
                title="Upload photo to generate shape art"
                subtitle="Supports JPEG, PNG, WebP, GIF, BMP"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-indigo-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-655 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Computational Art</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Shape Art Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Our local Sobel edge-filter traces the detailed contours of your face (eyes, lips) and pose outline. The engine then draws tiny, high-density shapes along these lines and larger shapes in background areas to create an artistic, recognizable portrait.
                  </p>
                </div>
                <div className="w-full h-32 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 gap-1.5 font-bold text-xs select-none">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Offline Canvas Processing
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Control Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Theme Selector */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  Choose Shape Style
                </h3>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        theme === t.id
                          ? 'border-indigo-550 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500/30'
                          : 'border-slate-200/60 bg-white/70 hover:border-slate-350 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-[11px] font-black text-slate-900 leading-tight">{t.name}</div>
                      <div className="text-[9px] text-slate-455 mt-0.5 leading-snug font-medium">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders Control Panel */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 text-sm flex items-center justify-between">
                  <span>Rendering Parameters</span>
                  {isProcessing && <span className="text-[10px] text-indigo-500 animate-pulse">Scanning contours...</span>}
                </h3>

                <div className="space-y-4">
                  {/* Density */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                      <span>Density (Shape Count)</span>
                      <span className="font-mono text-slate-800">{density} shapes</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="8000"
                      step="500"
                      value={density}
                      onChange={(e) => setDensity(Number(e.target.value))}
                      className="w-full accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  {/* Base Size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                      <span>Base Shape Size</span>
                      <span className="font-mono text-slate-800">{baseSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="24"
                      step="1"
                      value={baseSize}
                      onChange={(e) => setBaseSize(Number(e.target.value))}
                      className="w-full accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  {/* Contour Sensitivity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                      <span>Contour Sensitivity</span>
                      <span className="font-mono text-slate-800">{edgeSensitivity}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={edgeSensitivity}
                      onChange={(e) => setEdgeSensitivity(Number(e.target.value))}
                      className="w-full accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  {/* Underlay Photo Overlay Opacity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                      <span>Original Photo Overlay</span>
                      <span className="font-mono text-slate-800">{photoOverlay}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      step="5"
                      value={photoOverlay}
                      onChange={(e) => setPhotoOverlay(Number(e.target.value))}
                      className="w-full accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  {/* Studio Background Removal Keying */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-655 uppercase tracking-wider">Key Out Studio Background</span>
                        <span title="Automatically ignores solid studio background colors using the averaged corner pixels.">
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={keyBackground}
                          onChange={(e) => setKeyBackground(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {keyBackground && (
                      <div className="space-y-1.5 animate-fade-in">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 uppercase tracking-widest">
                          <span>Chroma Tolerance</span>
                          <span className="font-mono text-slate-700">{keyTolerance}</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="90"
                          step="5"
                          value={keyTolerance}
                          onChange={(e) => setKeyTolerance(Number(e.target.value))}
                          className="w-full accent-indigo-650 cursor-pointer"
                        />
                      </div>
                    )}

                    <p className="text-[9px] text-slate-450 leading-relaxed font-medium">
                      Tip: For busy backgrounds, use our <Link to="/background-remover" className="text-indigo-600 hover:text-indigo-500 font-bold underline">AI Background Remover</Link> first to get a transparent cutout!
                    </p>
                  </div>

                  {/* Color Mode */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">Color Mode</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'original', name: 'Full Color' },
                        { id: 'duotone', name: 'Art Palette' },
                        { id: 'vintage', name: 'Sepia' },
                        { id: 'neon', name: 'Neon Glow' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setColorMode(mode.id as any)}
                          className={`py-2 text-[9px] font-bold border rounded-xl transition cursor-pointer text-center ${
                            colorMode === mode.id
                              ? 'bg-indigo-600 border-indigo-550 text-white shadow-sm'
                              : 'bg-white/80 border-slate-200 text-slate-655 hover:bg-slate-50'
                          }`}
                        >
                          {mode.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Color Picker */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">Canvas Background Color</span>
                    <div className="flex gap-2">
                      {['#0284c7', '#05070f', '#022c22', '#f5f4ee', '#FAF9F3', '#040712', '#ffffff'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBgColor(color)}
                          className="w-6 h-6 rounded-full border border-slate-300 cursor-pointer relative shadow-inner"
                          style={{ backgroundColor: color }}
                        >
                          {bgColor === color && (
                            <Check className={`w-3.5 h-3.5 absolute inset-0 m-auto ${
                              color === '#ffffff' || color === '#f5f4ee' || color === '#FAF9F3'
                                ? 'text-slate-800'
                                : 'text-white'
                            }`} />
                          )}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-6 cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Preview Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Canvas Box */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    Interactive Art Preview
                  </span>
                  
                  {/* Progress bar */}
                  {progress < 100 && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded shadow-xs">
                      Drawing... {progress}%
                    </span>
                  )}
                </div>

                <div 
                  className="w-full bg-[#05070f] border border-slate-955 rounded-2xl flex items-center justify-center p-2 relative shadow-inner overflow-hidden"
                  style={{ minHeight: '380px', maxHeight: '500px' }}
                >
                  {/* Hidden Image for source parsing */}
                  <img
                    ref={sourceImageRef}
                    src={imageUrl}
                    alt="Source"
                    className="hidden"
                    onLoad={processImage}
                  />

                  {/* Render Canvas */}
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[480px] object-contain rounded-lg shadow-2xl transition-all duration-300"
                  />
                </div>

                {/* Animation controls */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayback}
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> {currentIndexRef.current >= pointsRef.current.length ? 'Redraw' : 'Resume'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 hover:text-slate-800 rounded-xl transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Upload Different Image
                    </button>
                  </div>

                  {/* Export Resolution Picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">Resolution:</span>
                    <select
                      value={exportScale}
                      onChange={(e) => setExportScale(Number(e.target.value))}
                      className="p-1.5 text-xs border border-slate-200 bg-white/90 rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value={1}>1x (Screen)</option>
                      <option value={2}>2x (HD Quality)</option>
                      <option value={4}>4x (Print Quality)</option>
                    </select>
                    <button
                      onClick={handleExport}
                      disabled={progress < 1}
                      className="p-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow transition cursor-pointer"
                      title="Download Image"
                    >
                      <Download className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl flex items-start gap-2 text-[10px] text-slate-550 leading-normal font-medium mt-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-indigo-650 shrink-0 mt-0.5 animate-pulse" />
                  <span>
                    No images are sent to any cloud server! Edge scanning and pixel drawings are handled entirely in your browser window using Canvas 2D.
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="AI Shape Art Generator"
          introText="Create gorgeous computational art portraits from photographs. Traces body features and contours, then reconstructs the photo using stars, clouds, floral arrangements, or pencil strokes."
          competitorComparison={{
            alternatives: ['Photoleap', 'Midjourney Sketch', 'Shape Collage'],
            benefit: 'Standard shape collages send your private photos to remote servers. The ImageGiri Shape Art Generator renders organic coordinate sketches in client-side memory, guaranteeing 100% offline privacy and zero data leakage.'
          }}
          steps={[
            {
              title: 'Upload Image',
              description: 'Select a portrait, pose, or object photo from your mobile device or desktop.'
            },
            {
              title: 'Customize Style & Sliders',
              description: 'Choose from 6 drawing styles. Adjust the shape density, base scale, background colors, and edge thresholds.'
            },
            {
              title: 'Animate & Export',
              description: 'Watch the organic drawing play out. Pick your output print resolution and save the clean high-resolution file.'
            }
          ]}
          features={[
            'Sobel convolution filter highlights important lines and features dynamically.',
            'Multi-scale point rendering packs fine-shapes along facial traits to retain recognizable portraits.',
            '6 unique handcrafted vector-drawn drawing themes (Stars, Clouds, Flowers, Pencil, Ink, Bubbles).',
            'Full control over density, scale, background palettes, and duotone/neon filters.',
            'High-resolution up-scaler (up to 4x) for gorgeous physical prints.'
          ]}
          faq={[
            {
              q: 'How does it recognize my face and body?',
              a: 'The engine uses a local Sobel edge-detection convolution filter that calculates pixel brightness gradients, identifying outlines (eyes, lips, pose structure) and packing them with denser shapes.'
            },
            {
              q: 'Can I print these generated images?',
              a: 'Yes! Select the 4x (Print Quality) resolution before downloading. This regenerates the shape art at a much higher resolution suitable for physical canvas prints.'
            },
            {
              q: 'Are my pictures uploaded to any servers?',
              a: 'No. The image is loaded directly into local browser memory. The edge scanner and shape drawing routines run entirely client-side, making it 100% offline and secure.'
            }
          ]}
        />

      </div>
    </div>
  );
};
