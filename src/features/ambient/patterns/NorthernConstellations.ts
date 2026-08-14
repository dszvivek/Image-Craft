/**
 * Northern Constellations Generator Pattern
 * Floating glowing star nodes connected by delicate faint constellation lines.
 */

import { PatternRegistry } from '../engine/PatternRegistry';
import type { PatternGenerator, RenderContext } from '../engine/PatternRegistry';
import { getPaletteColor } from '../engine/PaletteManager';

interface StarNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colorPos: number;
  pulsePhase: number;
}

export class NorthernConstellationsPattern implements PatternGenerator {
  public id = 'constellations';
  public name = 'Northern Constellations';
  public description = 'Glowing star nodes connected by faint sky map lines.';

  private nodes: StarNode[] = [];
  private numNodes = 75;

  public init(ctx: RenderContext): void {
    this.nodes = [];
    const count = ctx.reducedMotion ? 35 : this.numNodes;
    const w = ctx.width || 800;
    const h = ctx.height || 600;

    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x: ctx.rng.range(0, w),
        y: ctx.rng.range(0, h),
        vx: ctx.rng.range(-15, 15) * ctx.dpr,
        vy: ctx.rng.range(-15, 15) * ctx.dpr,
        size: ctx.rng.range(1.5, 3.5) * ctx.dpr,
        colorPos: ctx.rng.next(),
        pulsePhase: ctx.rng.range(0, Math.PI * 2),
      });
    }
  }

  public update(ctx: RenderContext): void {
    const motionFactor = ctx.reducedMotion ? 0.3 : 1.0;
    const w = ctx.width || 800;
    const h = ctx.height || 600;

    for (const node of this.nodes) {
      node.x += node.vx * ctx.deltaTime * motionFactor;
      node.y += node.vy * ctx.deltaTime * motionFactor;
      node.pulsePhase += ctx.deltaTime * 2;

      // Bounce off screen edges
      if (node.x < 0 || node.x > w) node.vx *= -1;
      if (node.y < 0 || node.y > h) node.vy *= -1;
    }
  }

  public render(ctx: RenderContext): void {
    const { ctx: c } = ctx;
    c.save();

    const maxDist = 130 * ctx.dpr;
    const maxDistSq = maxDist * maxDist;

    // Draw faint constellation connection lines between close nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.25;
          const lineColor = getPaletteColor(ctx.palette, n1.colorPos, alpha);

          c.strokeStyle = lineColor;
          c.lineWidth = 1 * ctx.dpr;
          c.beginPath();
          c.moveTo(n1.x, n1.y);
          c.lineTo(n2.x, n2.y);
          c.stroke();
        }
      }
    }

    // Draw star nodes
    for (const n of this.nodes) {
      const pulse = 0.6 + Math.sin(n.pulsePhase) * 0.4;
      const starColor = getPaletteColor(ctx.palette, n.colorPos, pulse * 0.8);

      c.fillStyle = starColor;
      c.beginPath();
      c.arc(n.x, n.y, n.size * pulse, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  public resize(ctx: RenderContext): void {
    this.init(ctx);
  }

  public destroy(): void {
    this.nodes = [];
  }
}

// Register factory
PatternRegistry.register('constellations', () => new NorthernConstellationsPattern());
