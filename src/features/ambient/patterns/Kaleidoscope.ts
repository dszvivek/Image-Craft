/**
 * Kaleidoscope Pattern Generator
 * Hypnotic, symmetrical geometric transformations.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

export class KaleidoscopePattern implements PatternGenerator {
  public id = 'kaleidoscope';
  public name = 'Kaleidoscope';
  public description = 'Hypnotic, symmetrical geometric transformations.';

  private segments = 8;

  public init(ctx: RenderContext): void {
    this.segments = ctx.reducedMotion ? 6 : 8;
  }

  public update(): void {
    // Symmetrical geometry updates in real-time frame
  }

  public render(ctx: RenderContext): void {
    const { ctx: c, width, height } = ctx;
    const time = ctx.elapsedTime * 0.15;
    const speedFactor = ctx.reducedMotion ? 0.3 : 1.0;

    c.save();
    c.translate(width / 2, height / 2);

    const angleStep = (Math.PI * 2) / this.segments;
    const radius = Math.min(width, height) * 0.35;

    for (let i = 0; i < this.segments; i++) {
      c.save();
      c.rotate(i * angleStep + time * speedFactor);
      if (i % 2 === 1) {
        c.scale(1, -1);
      }

      for (let j = 0; j < 4; j++) {
        const t = (j / 4 + time * 0.2) % 1.0;
        const color = getPaletteColor(ctx.palette, t, 0.4);

        c.fillStyle = color;
        c.strokeStyle = getPaletteColor(ctx.palette, (t + 0.5) % 1.0, 0.6);
        c.lineWidth = 2 * ctx.dpr;

        c.beginPath();
        const r = radius * (0.3 + j * 0.2) * (1 + Math.sin(time + j) * 0.1);
        c.moveTo(0, 0);
        c.lineTo(r * Math.cos(angleStep * 0.5), r * Math.sin(angleStep * 0.5));
        c.lineTo(r * Math.cos(angleStep * 0.2), r * Math.sin(angleStep * 0.8));
        c.closePath();
        c.fill();
        c.stroke();
      }

      c.restore();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    // No cleanup required
  }
}

// Register factory
PatternRegistry.register('kaleidoscope', () => new KaleidoscopePattern());
