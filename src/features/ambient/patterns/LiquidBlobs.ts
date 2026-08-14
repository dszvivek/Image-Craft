/**
 * Liquid Blobs Generator Pattern
 * Organic lava-lamp liquid bubbles drifting, pulsing, and merging softly.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Blob {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  pulsePhase: number;
  colorPos: number;
}

export class LiquidBlobsPattern implements PatternGenerator {
  public id = 'liquidblobs';
  public name = 'Liquid Blobs';
  public description = 'Organic lava-lamp liquid bubbles floating and merging softly.';

  private blobs: Blob[] = [];

  public init(ctx: RenderContext): void {
    this.blobs = [];
    const count = ctx.reducedMotion ? 6 : 12;
    const w = ctx.width || 800;
    const h = ctx.height || 600;

    for (let i = 0; i < count; i++) {
      this.blobs.push({
        x: ctx.rng.range(0.1 * w, 0.9 * w),
        y: ctx.rng.range(0.1 * h, 0.9 * h),
        radius: ctx.rng.range(60, 140) * ctx.dpr,
        vy: ctx.rng.range(-15, -45) * ctx.dpr,
        vx: ctx.rng.range(-8, 8) * ctx.dpr,
        pulsePhase: ctx.rng.range(0, Math.PI * 2),
        colorPos: ctx.rng.next(),
      });
    }
  }

  public update(ctx: RenderContext): void {
    const motionFactor = ctx.reducedMotion ? 0.3 : 1.0;
    const h = ctx.height || 600;
    const w = ctx.width || 800;

    for (const b of this.blobs) {
      b.y += b.vy * ctx.deltaTime * motionFactor;
      b.x += Math.sin(ctx.elapsedTime * 0.5 + b.pulsePhase) * b.vx * ctx.deltaTime * motionFactor;
      b.pulsePhase += ctx.deltaTime * 0.8;

      // Wrap around top to bottom
      if (b.y + b.radius < 0) {
        b.y = h + b.radius;
        b.x = ctx.rng.range(0.1 * w, 0.9 * w);
      }
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();

    for (const b of this.blobs) {
      const pulseRadius = b.radius * (1 + Math.sin(b.pulsePhase) * 0.08);
      const color1 = getPaletteColor(ctx.palette, b.colorPos, 0.35);
      const color2 = getPaletteColor(ctx.palette, (b.colorPos + 0.25) % 1.0, 0);

      const grad = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(1, pulseRadius));
      grad.addColorStop(0, color1);
      grad.addColorStop(0.7, color1);
      grad.addColorStop(1, color2);

      c.fillStyle = grad;
      c.beginPath();
      c.arc(b.x, b.y, Math.max(1, pulseRadius), 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.blobs = [];
  }
}

// Register factory
PatternRegistry.register('liquidblobs', () => new LiquidBlobsPattern());
