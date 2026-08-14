/**
 * Pattern Registry & Factory Interface
 * Stores pattern generator factories to guarantee isolated instance creation.
 */

import type { Palette } from './PaletteManager';
import type { SeededRandom } from './SeededRandom';

export interface PointerState {
  x: number; // Normalized 0..1 or canvas px
  y: number;
  isDown: boolean;
  isHover: boolean;
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  deltaTime: number; // seconds
  elapsedTime: number; // total active seconds
  pointer: PointerState;
  palette: Palette;
  rng: SeededRandom;
  speedMultiplier: number;
  intensity: number; // 0..1 mode intensity
  reducedMotion: boolean;
  subtleInteraction: boolean;
}

export interface PatternGenerator {
  id: string;
  name: string;
  description: string;
  init(ctx: RenderContext): void;
  update(ctx: RenderContext): void;
  render(ctx: RenderContext): void;
  resize(ctx: RenderContext): void;
  destroy(): void;
}

export type PatternFactory = () => PatternGenerator;

class PatternRegistryClass {
  private factories: Map<string, PatternFactory> = new Map();
  private metadata: Map<string, { id: string; name: string; description: string }> = new Map();

  public register(id: string, factory: PatternFactory): void {
    this.factories.set(id, factory);
    // Create a temporary instance to harvest metadata safely
    try {
      const temp = factory();
      this.metadata.set(id, { id: temp.id, name: temp.name, description: temp.description });
    } catch (e) {
      console.error(`Failed to register pattern factory ${id}:`, e);
    }
  }

  public create(id: string): PatternGenerator | null {
    const factory = this.factories.get(id);
    if (factory) {
      return factory();
    }
    // Fallback to first registered pattern factory if id not found
    const firstFactory = Array.from(this.factories.values())[0];
    return firstFactory ? firstFactory() : null;
  }

  public getAllMetadata(): { id: string; name: string; description: string }[] {
    return Array.from(this.metadata.values());
  }

  public getIds(): string[] {
    return Array.from(this.factories.keys());
  }
}

export const PatternRegistry = new PatternRegistryClass();
