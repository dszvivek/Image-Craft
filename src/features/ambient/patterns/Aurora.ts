/**
 * Aurora Ribbon Generator Pattern
 * Large translucent flowing gradient ribbons and silk light curtains.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Ribbon {
  yOffset: number;
  amplitude: number;
  frequency: number;
  speed: number;
  palettePos: number;
  height: number;
}

export class AuroraPattern implements PatternGenerator {
  public id = 'aurora';
  public name = 'Aurora';
  public description = 'Translucent flowing gradient ribbons and silk curtains.';

  private ribbons: Ribbon[] = [];

  public init(ctx: RenderContext): void {
    this.ribbons = [];
    const count = ctx.reducedMotion ? 3 : 5;
    const h = ctx.height || 600;
    for (let i = 0; i < count; i++) {
      this.ribbons.push({
        yOffset: (0.2 + (i / count) * 0.6) * h,
        amplitude: ctx.rng.range(50, 120) * ctx.dpr,
        frequency: ctx.rng.range(0.001, 0.003) / ctx.dpr,
        speed: ctx.rng.range(0.1, 0.3) * (i % 2 === 0 ? 1 : -1),
        palettePos: i / count,
        height: ctx.rng.range(150, 300) * ctx.dpr,
      });
    }
  }

  public update(): void {
    // Ribbon shapes are computed procedurally during render via render time
  }

  public render(ctx: RenderContext): void {
    const { ctx: c, width, height } = ctx;
    const time = ctx.elapsedTime;
    const speedFactor = ctx.reducedMotion ? 0.3 : 1.0;

    c.save();
    c.globalCompositeOperation = 'screen';

    for (let rIndex = 0; rIndex < this.ribbons.length; rIndex++) {
      const r = this.ribbons[rIndex];
      const color1 = getPaletteColor(ctx.palette, r.palettePos, 0.35);
      const color2 = getPaletteColor(ctx.palette, (r.palettePos + 0.3) % 1.0, 0);

      const yBase = r.yOffset;
      const gradient = c.createLinearGradient(0, Math.max(0, yBase - r.height / 2), 0, yBase + r.height / 2);
      gradient.addColorStop(0, color2);
      gradient.addColorStop(0.5, color1);
      gradient.addColorStop(1, color2);

      c.fillStyle = gradient;
      c.beginPath();
      c.moveTo(0, height);

      const step = 20 * ctx.dpr;
      for (let x = 0; x <= width + step; x += step) {
        const wave1 = Math.sin(x * r.frequency + time * r.speed * speedFactor) * r.amplitude;
        const wave2 = Math.cos(x * r.frequency * 1.5 - time * r.speed * 0.8 * speedFactor) * (r.amplitude * 0.4);
        const y = yBase + wave1 + wave2;

        c.lineTo(x, y);
      }

      c.lineTo(width, height);
      c.closePath();
      c.fill();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.ribbons = [];
  }
}

// Register factory
PatternRegistry.register('aurora', () => new AuroraPattern());
