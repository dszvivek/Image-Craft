/**
 * Water Drop Ripples Pattern Generator
 * Concentric expanding circles with gentle opacity decay.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  colorPos: number;
  lineWidth: number;
  alpha: number;
}

export class RipplesPattern implements PatternGenerator {
  public id = 'ripples';
  public name = 'Ripples';
  public description = 'Gentle expanding circles resembling water drops.';

  private ripples: Ripple[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1.2;

  public init(ctx: RenderContext): void {
    this.ripples = [];
    const count = ctx.reducedMotion ? 3 : 6;
    const w = ctx.width || 800;
    const h = ctx.height || 600;
    for (let i = 0; i < count; i++) {
      this.ripples.push(this.createRipple(ctx, ctx.rng.range(0, w), ctx.rng.range(0, h)));
    }
  }

  private createRipple(ctx: RenderContext, x: number, y: number): Ripple {
    return {
      x,
      y,
      radius: ctx.rng.range(5, 20) * ctx.dpr,
      maxRadius: ctx.rng.range(150, 350) * ctx.dpr,
      colorPos: ctx.rng.next(),
      lineWidth: ctx.rng.range(1.5, 4) * ctx.dpr,
      alpha: 0.8,
    };
  }

  public update(ctx: RenderContext): void {
    this.spawnTimer += ctx.deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      if (this.ripples.length < (ctx.reducedMotion ? 6 : 12)) {
        const w = ctx.width || 800;
        const h = ctx.height || 600;
        this.ripples.push(
          this.createRipple(ctx, ctx.rng.range(0, w), ctx.rng.range(0, h))
        );
      }
    }

    // Pointer click/hover interaction spawn
    if (ctx.subtleInteraction && ctx.pointer.isDown) {
      this.ripples.push(
        this.createRipple(ctx, ctx.pointer.x * ctx.width, ctx.pointer.y * ctx.height)
      );
    }

    const growthSpeed = (ctx.reducedMotion ? 30 : 70) * ctx.dpr;
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += growthSpeed * ctx.deltaTime;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);

      if (r.radius >= r.maxRadius || r.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();

    for (const r of this.ripples) {
      const colorStr = getPaletteColor(ctx.palette, r.colorPos, r.alpha * 0.7);

      c.strokeStyle = colorStr;
      c.lineWidth = r.lineWidth;
      c.beginPath();
      c.arc(r.x, r.y, Math.max(0.1, r.radius), 0, Math.PI * 2);
      c.stroke();

      // Inner subtle glow ring
      c.strokeStyle = getPaletteColor(ctx.palette, (r.colorPos + 0.2) % 1.0, r.alpha * 0.3);
      c.lineWidth = r.lineWidth * 0.5;
      c.beginPath();
      c.arc(r.x, r.y, Math.max(0.1, r.radius - 10 * ctx.dpr), 0, Math.PI * 2);
      c.stroke();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.ripples = [];
  }
}

// Register factory
PatternRegistry.register('ripples', () => new RipplesPattern());
