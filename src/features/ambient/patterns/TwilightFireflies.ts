/**
 * Twilight Fireflies Generator Pattern
 * Soft pulsing bioluminescent embers drifting gently upwards with depth glow.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  glowRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
  colorPos: number;
}

export class TwilightFirefliesPattern implements PatternGenerator {
  public id = 'fireflies';
  public name = 'Twilight Fireflies';
  public description = 'Soft pulsing bioluminescent embers drifting gently upwards.';

  private fireflies: Firefly[] = [];

  public init(ctx: RenderContext): void {
    this.fireflies = [];
    const count = ctx.reducedMotion ? 40 : 110;
    const w = ctx.width || 800;
    const h = ctx.height || 600;

    for (let i = 0; i < count; i++) {
      this.fireflies.push({
        x: ctx.rng.range(0, w),
        y: ctx.rng.range(0, h),
        vx: ctx.rng.range(-12, 12) * ctx.dpr,
        vy: ctx.rng.range(-8, -25) * ctx.dpr,
        size: ctx.rng.range(2, 4.5) * ctx.dpr,
        glowRadius: ctx.rng.range(15, 35) * ctx.dpr,
        pulsePhase: ctx.rng.range(0, Math.PI * 2),
        pulseSpeed: ctx.rng.range(1.2, 2.8),
        colorPos: ctx.rng.next(),
      });
    }
  }

  public update(ctx: RenderContext): void {
    const motionFactor = ctx.reducedMotion ? 0.3 : 1.0;
    const h = ctx.height || 600;
    const w = ctx.width || 800;

    for (const f of this.fireflies) {
      f.x += (f.vx + Math.sin(ctx.elapsedTime * 0.4 + f.pulsePhase) * 10) * ctx.deltaTime * motionFactor;
      f.y += f.vy * ctx.deltaTime * motionFactor;
      f.pulsePhase += ctx.deltaTime * f.pulseSpeed;

      // Wrap around screen
      if (f.y < -f.glowRadius) {
        f.y = h + f.glowRadius;
        f.x = ctx.rng.range(0, w);
      }
      if (f.x < 0) f.x = w;
      if (f.x > w) f.x = 0;
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();

    for (const f of this.fireflies) {
      const pulse = Math.max(0.1, 0.5 + Math.sin(f.pulsePhase) * 0.5);
      const coreColor = getPaletteColor(ctx.palette, f.colorPos, pulse * 0.9);
      const glowColor = getPaletteColor(ctx.palette, f.colorPos, 0);

      // Outer glowing halo
      const grad = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, Math.max(1, f.glowRadius * pulse));
      grad.addColorStop(0, getPaletteColor(ctx.palette, f.colorPos, pulse * 0.4));
      grad.addColorStop(1, glowColor);

      c.fillStyle = grad;
      c.beginPath();
      c.arc(f.x, f.y, Math.max(1, f.glowRadius * pulse), 0, Math.PI * 2);
      c.fill();

      // Bright inner core
      c.fillStyle = coreColor;
      c.beginPath();
      c.arc(f.x, f.y, Math.max(0.5, f.size * pulse), 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.fireflies = [];
  }
}

// Register factory
PatternRegistry.register('fireflies', () => new TwilightFirefliesPattern());
