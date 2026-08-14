/**
 * Sakura Breeze Generator Pattern
 * Gentle floating petal shapes swaying softly sideways as they descend.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  swaySpeed: number;
  swayAmp: number;
  fallSpeed: number;
  colorPos: number;
  opacity: number;
}

export class SakuraBreezePattern implements PatternGenerator {
  public id = 'sakurabreeze';
  public name = 'Sakura Breeze';
  public description = 'Gentle floating petals swaying softly as they descend.';

  private petals: Petal[] = [];

  public init(ctx: RenderContext): void {
    this.petals = [];
    const count = ctx.reducedMotion ? 30 : 80;
    const w = ctx.width || 800;
    const h = ctx.height || 600;

    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: ctx.rng.range(0, w),
        y: ctx.rng.range(0, h),
        size: ctx.rng.range(6, 14) * ctx.dpr,
        rotation: ctx.rng.range(0, Math.PI * 2),
        rotSpeed: ctx.rng.range(-1, 1),
        swaySpeed: ctx.rng.range(0.5, 1.5),
        swayAmp: ctx.rng.range(20, 50) * ctx.dpr,
        fallSpeed: ctx.rng.range(20, 50) * ctx.dpr,
        colorPos: ctx.rng.next(),
        opacity: ctx.rng.range(0.4, 0.8),
      });
    }
  }

  public update(ctx: RenderContext): void {
    const motionFactor = ctx.reducedMotion ? 0.3 : 1.0;
    const h = ctx.height || 600;
    const w = ctx.width || 800;

    for (const p of this.petals) {
      p.y += p.fallSpeed * ctx.deltaTime * motionFactor;
      p.x += Math.sin(ctx.elapsedTime * p.swaySpeed + p.rotation) * p.swayAmp * ctx.deltaTime * motionFactor;
      p.rotation += p.rotSpeed * ctx.deltaTime * motionFactor;

      // Wrap around top
      if (p.y > h + p.size) {
        p.y = -p.size;
        p.x = ctx.rng.range(0, w);
      }
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();

    for (const p of this.petals) {
      const colorStr = getPaletteColor(ctx.palette, p.colorPos, p.opacity);

      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);

      c.fillStyle = colorStr;
      c.beginPath();
      // Draw organic petal ellipse shape
      c.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.petals = [];
  }
}

// Register factory
PatternRegistry.register('sakurabreeze', () => new SakuraBreezePattern());
