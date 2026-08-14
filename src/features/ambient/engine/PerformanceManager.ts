/**
 * Performance Manager
 * DPR capping, FPS measurement, hidden tab pause, and adaptive particle density.
 */

export class PerformanceManager {
  public dpr = 1;
  public fps = 60;
  public particleScale = 1.0;
  public isHidden = false;

  private frameCount = 0;
  private lastFpsCheck = performance.now();
  private visibilityHandler: () => void;

  constructor() {
    this.updateDpr();
    this.visibilityHandler = () => {
      this.isHidden = document.hidden;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler);
      this.isHidden = document.hidden;
    }
  }

  public updateDpr(): number {
    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    // Cap DPR at 2.0 max to prevent massive canvas pixel buffers on 4K/Retina displays
    this.dpr = Math.min(rawDpr, 2.0);
    return this.dpr;
  }

  public recordFrame(now: number): void {
    this.frameCount++;
    const delta = now - this.lastFpsCheck;
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastFpsCheck = now;

      // Adapt particle scaling if performance drops significantly
      if (this.fps < 35 && this.particleScale > 0.4) {
        this.particleScale = Math.max(0.4, this.particleScale - 0.1);
      } else if (this.fps > 55 && this.particleScale < 1.0) {
        this.particleScale = Math.min(1.0, this.particleScale + 0.05);
      }
    }
  }

  public destroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}
