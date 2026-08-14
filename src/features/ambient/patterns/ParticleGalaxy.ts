/**
 * Particle Galaxy Generator Pattern
 * Orbiting cosmic dust particles and nebula star clusters.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Star {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  colorPos: number;
  twinklePhase: number;
}

export class ParticleGalaxyPattern implements PatternGenerator {
  public id = 'particlegalaxy';
  public name = 'Particle Galaxy';
  public description = 'Orbiting cosmic dust particles and gentle nebula star clusters.';

  private stars: Star[] = [];
  private centerX = 0;
  private centerY = 0;

  public init(ctx: RenderContext): void {
    this.centerX = (ctx.width || 800) / 2;
    this.centerY = (ctx.height || 600) / 2;
    this.stars = [];

    const count = ctx.reducedMotion ? 120 : 380;
    const maxRadius = Math.min(ctx.width || 800, ctx.height || 600) * 0.45;

    for (let i = 0; i < count; i++) {
      this.stars.push({
        angle: ctx.rng.range(0, Math.PI * 2),
        radius: ctx.rng.range(15 * ctx.dpr, maxRadius),
        speed: ctx.rng.range(0.05, 0.25) * (ctx.rng.boolean() ? 1 : -1),
        size: ctx.rng.range(1, 3.8) * ctx.dpr,
        colorPos: ctx.rng.next(),
        twinklePhase: ctx.rng.range(0, Math.PI * 2),
      });
    }
  }

  public update(ctx: RenderContext): void {
    const speedFactor = ctx.reducedMotion ? 0.3 : 1.0;

    for (const s of this.stars) {
      s.angle += s.speed * ctx.deltaTime * 0.5 * speedFactor;
      s.twinklePhase += ctx.deltaTime * 2;
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c, width, height } = ctx;
    c.save();

    // Central Soft Glowing Nebula Core
    const nebulaGrad = c.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, Math.min(width, height) * 0.4
    );
    nebulaGrad.addColorStop(0, getPaletteColor(ctx.palette, 0.5, 0.18));
    nebulaGrad.addColorStop(0.5, getPaletteColor(ctx.palette, 0.2, 0.08));
    nebulaGrad.addColorStop(1, getPaletteColor(ctx.palette, 0.8, 0));

    c.fillStyle = nebulaGrad;
    c.fillRect(0, 0, width, height);

    c.globalCompositeOperation = 'lighter';

    for (const s of this.stars) {
      const x = this.centerX + Math.cos(s.angle) * s.radius;
      const y = this.centerY + Math.sin(s.angle) * (s.radius * 0.6);

      const twinkle = 0.5 + Math.sin(s.twinklePhase) * 0.5;
      const colorStr = getPaletteColor(ctx.palette, s.colorPos, 0.4 + twinkle * 0.5);

      c.fillStyle = colorStr;
      c.beginPath();
      c.arc(x, y, Math.max(0.5, s.size * (0.8 + twinkle * 0.4)), 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.stars = [];
  }
}

// Register factory
PatternRegistry.register('particlegalaxy', () => new ParticleGalaxyPattern());
