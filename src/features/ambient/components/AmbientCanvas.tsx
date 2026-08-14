/**
 * Ambient Canvas Container Component
 * Attaches touch/mouse interaction listeners, double-tap gestures, ResizeObserver, and renders canvas.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { PatternEngine } from '../engine/PatternEngine';

interface AmbientCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engine: PatternEngine | null;
  onDoubleTap?: () => void;
  className?: string;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({
  canvasRef,
  engine,
  onDoubleTap,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<number>(0);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!engine || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      engine.setPointer({ x, y, isHover: true });
    },
    [engine, canvasRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!engine || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      engine.setPointer({ x, y, isDown: true, isHover: true });

      // Double tap / double click detection (within 300ms)
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (onDoubleTap) onDoubleTap();
      }
      lastTapRef.current = now;
    },
    [engine, canvasRef, onDoubleTap]
  );

  const handlePointerUp = useCallback(() => {
    if (!engine) return;
    engine.setPointer({ isDown: false });
  }, [engine]);

  const handlePointerLeave = useCallback(() => {
    if (!engine) return;
    engine.setPointer({ isHover: false, isDown: false });
  }, [engine]);

  // ResizeObserver on canvas container
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !engine) return;

    const observer = new ResizeObserver(() => {
      engine.resize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [engine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent touch scrolling over visual canvas on touch devices
    const preventTouchScroll = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', preventTouchScroll, { passive: false });
    canvas.addEventListener('touchmove', preventTouchScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventTouchScroll);
      canvas.removeEventListener('touchmove', preventTouchScroll);
    };
  }, [canvasRef]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
};
