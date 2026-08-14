/**
 * Gradient Waves Generator Pattern
 * Sinuous overlapping waves with slowly shifting amplitude and hues.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Wave {
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  palettePos: number;
  yRatio: number;
}

export class GradientWavesPattern implements PatternGenerator {
  public id = 'gradientwaves';
  public name = 'Gradient Waves';
  public description = 'Layered sinuous waves with shifting amplitude and colors.';

  private waves: Wave[] = [];

  public init(ctx: RenderContext): void {
    this.waves = [];
    const count = ctx.reducedMotion ? 4 : 7;
    for (let i = 0; i < count; i++) {
      this.waves.push({
        amplitude: ctx.rng.range(30, 80) * ctx.dpr,
        frequency: ctx.rng.range(0.0015, 0.004) / ctx.dpr,
        phase: ctx.rng.range(0, Math.PI * 2),
        speed: ctx.rng.range(0.15, 0.45) * (i % 2 === 0 ? 1 : -1),
        palettePos: i / count,
        yRatio: 0.3 + (i / count) * 0.5,
      });
    }
  }

  public update(): void {
    // Wave paths are calculated during render time
  }

  public render(ctx: RenderContext): void {
    const { ctx: c, width, height } = ctx;
    const time = ctx.elapsedTime;
    const speedFactor = ctx.reducedMotion ? 0.3 : 1.0;

    c.save();

    for (let i = 0; i < this.waves.length; i++) {
      const w = this.waves[i];
      const color = getPaletteColor(ctx.palette, w.palettePos, 0.4);
      const yBase = height * w.yRatio;

      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, height);

      const step = 15 * ctx.dpr;
      for (let x = 0; x <= width + step; x += step) {
        const y =
          yBase +
          Math.sin(x * w.frequency + w.phase + time * w.speed * speedFactor) * w.amplitude +
          Math.cos(x * w.frequency * 0.5 - time * w.speed * 0.3 * speedFactor) * (w.amplitude * 0.5);

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
    this.waves = [];
  }
}

// Register factory
PatternRegistry.register('gradientwaves', () => new GradientWavesPattern());
