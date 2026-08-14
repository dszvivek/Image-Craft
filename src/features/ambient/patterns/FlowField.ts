/**
 * Flow Field Generator Pattern
 * Organic particles moving through continuous vector forces with silky motion trails.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  colorPos: number;
  size: number;
}

export class FlowFieldPattern implements PatternGenerator {
  public id = 'flowfield';
  public name = 'Flow Field';
  public description = 'Organic particles gliding along continuous fluid vectors with silky trails.';

  private particles: Particle[] = [];
  private numParticles = 320;

  public init(ctx: RenderContext): void {
    this.particles = [];
    const count = ctx.reducedMotion ? 100 : this.numParticles;
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(ctx));
    }
  }

  private createParticle(ctx: RenderContext): Particle {
    const w = ctx.width || 800;
    const h = ctx.height || 600;
    return {
      x: ctx.rng.range(0, w),
      y: ctx.rng.range(0, h),
      vx: 0,
      vy: 0,
      life: ctx.rng.range(0, 1),
      maxLife: ctx.rng.range(3, 8),
      colorPos: ctx.rng.next(),
      size: ctx.rng.range(1.5, 3.5) * ctx.dpr,
    };
  }

  public update(ctx: RenderContext): void {
    const scale = 0.003 / ctx.dpr;
    const time = ctx.elapsedTime * 0.2;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life += ctx.deltaTime;

      if (p.life >= p.maxLife || p.x < 0 || p.x > ctx.width || p.y < 0 || p.y > ctx.height) {
        this.particles[i] = this.createParticle(ctx);
        continue;
      }

      // Compute vector field angle using smooth trigonometric multi-frequency math
      let angle = Math.sin(p.x * scale + time) * Math.cos(p.y * scale + time) * Math.PI * 4;

      // Subtle mouse influence
      if (ctx.subtleInteraction && ctx.pointer.isHover) {
        const dx = ctx.pointer.x * ctx.width - p.x;
        const dy = ctx.pointer.y * ctx.height - p.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = 200 * ctx.dpr;
        if (distSq < maxDist * maxDist) {
          const push = 1 - Math.sqrt(distSq) / maxDist;
          angle += Math.atan2(dy, dx) * push * 0.5;
        }
      }

      const speed = 70 * ctx.dpr;
      p.vx = p.vx * 0.94 + Math.cos(angle) * speed * 0.06;
      p.vy = p.vy * 0.94 + Math.sin(angle) * speed * 0.06;

      const motionFactor = ctx.reducedMotion ? 0.3 : 1.0;
      p.x += p.vx * ctx.deltaTime * motionFactor;
      p.y += p.vy * ctx.deltaTime * motionFactor;
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();
    c.globalCompositeOperation = 'lighter';

    for (const p of this.particles) {
      const lifeFactor = Math.sin((p.life / p.maxLife) * Math.PI);
      const colorStr = getPaletteColor(ctx.palette, p.colorPos, lifeFactor * 0.65);

      c.strokeStyle = colorStr;
      c.lineWidth = Math.max(0.5, p.size * lifeFactor);
      c.lineCap = 'round';

      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x - p.vx * 0.18, p.y - p.vy * 0.18);
      c.stroke();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.particles = [];
  }
}

// Register factory
PatternRegistry.register('flowfield', () => new FlowFieldPattern());
