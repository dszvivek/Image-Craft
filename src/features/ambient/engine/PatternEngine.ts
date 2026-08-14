/**
 * Core Canvas Pattern Engine
 * Orchestrates 60 FPS animation loop independent of React render lifecycle.
 */

import { PatternRegistry } from './PatternRegistry';
import type { PatternGenerator, PointerState, RenderContext } from './PatternRegistry';
import type { Palette } from './PaletteManager';
import { PALETTES } from './PaletteManager';
import { SeededRandom } from './SeededRandom';
import { TransitionManager } from './TransitionManager';
import { PerformanceManager } from './PerformanceManager';

export interface EngineConfig {
  mode: string;
  paletteId: string;
  patternId: string;
  seed: number;
  speedMultiplier: number;
  intensity: number;
  reducedMotion: boolean;
  subtleInteraction: boolean;
  sceneDuration: number; // seconds (0 = infinite / manual)
}

export class PatternEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;

  private activePattern: PatternGenerator | null = null;
  private transitionManager = new TransitionManager();
  private perfManager = new PerformanceManager();
  private rng: SeededRandom;

  private palette: Palette;
  private config: EngineConfig;
  private pointer: PointerState = { x: 0.5, y: 0.5, isDown: false, isHover: false };

  private isPaused = false;
  private lastTime = 0;
  private elapsedTime = 0;
  private lastSceneSwitchTime = 0;

  private onTickCallback?: (elapsedSeconds: number) => void;

  constructor(initialConfig: Partial<EngineConfig> = {}) {
    this.config = {
      mode: 'calm',
      paletteId: 'lavender',
      patternId: 'aurora',
      seed: 12345678,
      speedMultiplier: 1.0,
      intensity: 0.8,
      reducedMotion: false,
      subtleInteraction: true,
      sceneDuration: 60, // Default: auto-cycle every 60s
      ...initialConfig,
    };

    this.rng = new SeededRandom(this.config.seed);
    this.palette = PALETTES[this.config.paletteId] || PALETTES.lavender;
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.resize();
    this.switchPattern(this.config.patternId);
    this.start();
  }

  public setConfig(newConfig: Partial<EngineConfig>): void {
    const patternChanged = newConfig.patternId && newConfig.patternId !== this.config.patternId;
    const paletteChanged = newConfig.paletteId && newConfig.paletteId !== this.config.paletteId;
    const seedChanged = newConfig.seed !== undefined && newConfig.seed !== this.config.seed;

    this.config = { ...this.config, ...newConfig };

    if (seedChanged) {
      this.rng = new SeededRandom(this.config.seed);
    }

    if (paletteChanged) {
      this.palette = PALETTES[this.config.paletteId] || PALETTES.lavender;
    }

    if (patternChanged) {
      this.switchPattern(this.config.patternId);
    } else if (seedChanged && this.activePattern && this.canvas) {
      // Re-initialize active pattern if seed changes
      const renderCtx = this.getRenderContext(0);
      this.activePattern.init(renderCtx);
    }
  }

  public switchPattern(patternId: string): void {
    const freshPattern = PatternRegistry.create(patternId);
    if (!freshPattern) return;

    if (this.activePattern) {
      this.transitionManager.startTransition(this.activePattern, 5);
    }

    this.activePattern = freshPattern;
    this.config.patternId = freshPattern.id;
    this.lastSceneSwitchTime = this.elapsedTime;

    if (this.canvas && this.ctx) {
      const renderCtx = this.getRenderContext(0);
      this.activePattern.init(renderCtx);
    }
  }

  private autoCycleScene(): void {
    const ids = PatternRegistry.getIds();
    if (ids.length <= 1) return;
    const currentIndex = ids.indexOf(this.config.patternId);
    const nextIndex = (currentIndex + 1) % ids.length;
    this.switchPattern(ids[nextIndex]);
  }

  public setPointer(pointer: Partial<PointerState>): void {
    this.pointer = { ...this.pointer, ...pointer };
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public setOnTick(cb?: (elapsed: number) => void): void {
    this.onTickCallback = cb;
  }

  public resize(): void {
    if (!this.canvas) return;
    const dpr = this.perfManager.updateDpr();
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    if (width > 0 && height > 0) {
      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);

      if (this.ctx && this.activePattern) {
        const renderCtx = this.getRenderContext(0);
        this.activePattern.resize(renderCtx);
      }
    }
  }

  public start(): void {
    if (this.animFrameId !== null) return;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (now: number): void => {
    this.animFrameId = requestAnimationFrame(this.loop);

    if (this.perfManager.isHidden || this.isPaused || !this.canvas || !this.ctx) {
      this.lastTime = now;
      return;
    }

    this.perfManager.recordFrame(now);
    const rawDelta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Cap maximum delta to prevent large leaps on lag spikes
    const deltaTime = Math.min(rawDelta, 0.1) * this.config.speedMultiplier;
    this.elapsedTime += deltaTime;

    if (this.onTickCallback) {
      this.onTickCallback(this.elapsedTime);
    }

    // Ensure we have an active pattern
    if (!this.activePattern) {
      this.switchPattern(this.config.patternId);
    }

    // Auto-cycle scene smoothly when timer reaches sceneDuration (if > 0)
    if (
      this.config.sceneDuration > 0 &&
      this.elapsedTime - this.lastSceneSwitchTime >= this.config.sceneDuration
    ) {
      this.autoCycleScene();
    }

    const renderCtx = this.getRenderContext(deltaTime);

    // Clear background
    this.ctx.fillStyle = this.palette.background;
    this.ctx.fillRect(0, 0, renderCtx.width, renderCtx.height);

    // Render active pattern
    if (this.activePattern) {
      try {
        this.activePattern.update(renderCtx);
        this.activePattern.render(renderCtx);
      } catch (e) {
        console.error('Error in active pattern render loop:', e);
      }
    }

    // Render fading transition of previous pattern if active
    this.transitionManager.updateAndRenderPrevious(renderCtx, this.ctx, this.activePattern?.id);
  };

  private getRenderContext(deltaTime: number): RenderContext {
    const width = this.canvas ? this.canvas.width : 800;
    const height = this.canvas ? this.canvas.height : 600;

    return {
      canvas: this.canvas!,
      ctx: this.ctx!,
      width,
      height,
      dpr: this.perfManager.dpr,
      deltaTime,
      elapsedTime: this.elapsedTime,
      pointer: this.pointer,
      palette: this.palette,
      rng: this.rng,
      speedMultiplier: this.config.speedMultiplier,
      intensity: this.config.intensity,
      reducedMotion: this.config.reducedMotion,
      subtleInteraction: this.config.subtleInteraction,
    };
  }

  public destroy(): void {
    this.stop();
    this.transitionManager.destroy();
    this.perfManager.destroy();
    if (this.activePattern) {
      try {
        this.activePattern.destroy();
      } catch (e) {
        console.error('Error destroying active pattern:', e);
      }
      this.activePattern = null;
    }
    this.canvas = null;
    this.ctx = null;
  }
}
