/**
 * Scene Transition Manager (Crossfader)
 * Handles smooth 5-10 second morphing / crossfading between pattern changes.
 */

import type { PatternGenerator, RenderContext } from './PatternRegistry';

export class TransitionManager {
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private previousPattern: PatternGenerator | null = null;
  private isTransitioning = false;
  private transitionProgress = 0; // 0..1
  private transitionDuration = 7; // seconds (5-10s)

  public startTransition(
    current: PatternGenerator | null,
    duration = 7
  ): void {
    if (!current) return;
    this.previousPattern = current;
    this.transitionProgress = 0;
    this.transitionDuration = Math.max(1, duration);
    this.isTransitioning = true;
  }

  public updateAndRenderPrevious(
    ctx: RenderContext,
    mainCtx: CanvasRenderingContext2D,
    activePatternId?: string
  ): void {
    if (!this.isTransitioning || !this.previousPattern) return;

    this.transitionProgress += ctx.deltaTime / this.transitionDuration;
    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      if (this.previousPattern) {
        // Only call destroy if it's not currently active
        if (this.previousPattern.id !== activePatternId) {
          try {
            this.previousPattern.destroy();
          } catch (e) {
            console.error('Error destroying previous pattern:', e);
          }
        }
        this.previousPattern = null;
      }
      return;
    }

    // Lazy create offscreen canvas buffer for previous pattern
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
    }
    if (
      this.offscreenCanvas.width !== ctx.width ||
      this.offscreenCanvas.height !== ctx.height
    ) {
      this.offscreenCanvas.width = ctx.width;
      this.offscreenCanvas.height = ctx.height;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    if (this.offscreenCtx) {
      this.offscreenCtx.clearRect(0, 0, ctx.width, ctx.height);
      const subContext: RenderContext = {
        ...ctx,
        canvas: this.offscreenCanvas,
        ctx: this.offscreenCtx,
      };

      try {
        this.previousPattern.update(subContext);
        this.previousPattern.render(subContext);
      } catch (e) {
        console.error('Error rendering transition pattern:', e);
      }

      // Composite previous pattern with decaying alpha
      const previousAlpha = 1 - this.transitionProgress;
      mainCtx.save();
      mainCtx.globalAlpha = previousAlpha;
      mainCtx.drawImage(this.offscreenCanvas, 0, 0);
      mainCtx.restore();
    }
  }

  public get activeTransition(): boolean {
    return this.isTransitioning;
  }

  public destroy(): void {
    if (this.previousPattern) {
      try {
        this.previousPattern.destroy();
      } catch (e) {
        console.error('Error destroying transition pattern on cleanup:', e);
      }
      this.previousPattern = null;
    }
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.isTransitioning = false;
  }
}
