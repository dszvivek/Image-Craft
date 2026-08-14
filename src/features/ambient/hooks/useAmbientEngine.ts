/**
 * Custom React Hook Binding Canvas Element to PatternEngine
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { PatternEngine } from '../engine/PatternEngine';
import type { EngineConfig } from '../engine/PatternEngine';
import { loadSettings, saveSettings } from '../storage/ambientStorage';
import type { AmbientSettings } from '../storage/ambientStorage';
import '../patterns'; // ensure patterns register

export interface ModePreset {
  id: string;
  name: string;
  description: string;
  paletteId: string;
  patternId: string;
  intensity: number;
  speedMultiplier: number;
  timerMinutes?: number[];
}

export const MODES: Record<string, ModePreset> = {
  calm: {
    id: 'calm',
    name: 'Calm',
    description: 'Slow, organic flowing movement to unwind.',
    paletteId: 'lavender',
    patternId: 'aurora',
    intensity: 0.5,
    speedMultiplier: 0.6,
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    description: 'Subtle ambient dark space for study & coding.',
    paletteId: 'deepspace',
    patternId: 'particlegalaxy',
    intensity: 0.3,
    speedMultiplier: 0.4,
    timerMinutes: [25, 45, 60],
  },
  break: {
    id: 'break',
    name: 'Break',
    description: 'Visual break session replacing stressful timers.',
    paletteId: 'ocean',
    patternId: 'ripples',
    intensity: 0.6,
    speedMultiplier: 0.8,
    timerMinutes: [2, 5, 10, 15],
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    description: 'Progressively darker & slower visual atmosphere.',
    paletteId: 'moonlight',
    patternId: 'gradientwaves',
    intensity: 0.2,
    speedMultiplier: 0.3,
    timerMinutes: [15, 30, 60],
  },
  ambient: {
    id: 'ambient',
    name: 'Ambient',
    description: 'Screen-saver living art for displays & tablets.',
    paletteId: 'cosmic',
    patternId: 'flowfield',
    intensity: 0.7,
    speedMultiplier: 1.0,
  },
  explore: {
    id: 'explore',
    name: 'Explore',
    description: 'Discover curated visual worlds and patterns.',
    paletteId: 'sunset',
    patternId: 'kaleidoscope',
    intensity: 0.8,
    speedMultiplier: 1.0,
  },
};

export function useAmbientEngine(initialMode = 'calm', initialSeed?: number) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PatternEngine | null>(null);

  const [settings, setSettingsState] = useState<AmbientSettings>(loadSettings);
  const [activeMode, setActiveModeState] = useState<string>(initialMode);
  const [seed, setSeedState] = useState<number>(initialSeed || Math.floor(Math.random() * 89999999) + 10000000);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize engine instance once
  useEffect(() => {
    const modePreset = MODES[initialMode] || MODES.calm;

    // Detect prefers-reduced-motion OS setting
    const reducedMotionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const isSystemReducedMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;

    const engineConfig: Partial<EngineConfig> = {
      mode: initialMode,
      paletteId: modePreset.paletteId,
      patternId: modePreset.patternId,
      seed: initialSeed || seed,
      speedMultiplier: modePreset.speedMultiplier * settings.speedMultiplier,
      intensity: modePreset.intensity,
      reducedMotion: settings.reducedMotion || isSystemReducedMotion,
      subtleInteraction: settings.subtleInteraction,
      sceneDuration: settings.sceneDuration,
    };

    const engine = new PatternEngine(engineConfig);
    engineRef.current = engine;

    engine.setOnTick((seconds) => {
      setElapsedTime(Math.floor(seconds));
    });

    if (canvasRef.current) {
      engine.attachCanvas(canvasRef.current);
    }

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync canvas attachment if ref mounts later
  useEffect(() => {
    if (canvasRef.current && engineRef.current) {
      engineRef.current.attachCanvas(canvasRef.current);
    }
  }, [canvasRef.current]);

  const updateSettings = useCallback((newPartial: Partial<AmbientSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newPartial };
      saveSettings(updated);
      if (engineRef.current) {
        engineRef.current.setConfig({
          speedMultiplier: updated.speedMultiplier,
          paletteId: updated.paletteId,
          patternId: updated.patternId,
          reducedMotion: updated.reducedMotion,
          subtleInteraction: updated.subtleInteraction,
          sceneDuration: updated.sceneDuration,
        });
      }
      return updated;
    });
  }, []);

  const changeMode = useCallback((modeId: string) => {
    const preset = MODES[modeId] || MODES.calm;
    setActiveModeState(modeId);

    if (engineRef.current) {
      engineRef.current.setConfig({
        mode: modeId,
        paletteId: preset.paletteId,
        patternId: preset.patternId,
        intensity: preset.intensity,
        speedMultiplier: preset.speedMultiplier * settings.speedMultiplier,
      });
      engineRef.current.switchPattern(preset.patternId);
    }
  }, [settings.speedMultiplier]);

  const changeSeed = useCallback((newSeed: number) => {
    setSeedState(newSeed);
    if (engineRef.current) {
      engineRef.current.setConfig({ seed: newSeed });
    }
  }, []);

  const changePattern = useCallback((patternId: string) => {
    if (engineRef.current) {
      engineRef.current.switchPattern(patternId);
    }
  }, []);

  const changePalette = useCallback((paletteId: string) => {
    if (engineRef.current) {
      engineRef.current.setConfig({ paletteId });
    }
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setPaused(next);
      }
      return next;
    });
  }, []);

  const nextScene = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 89999999) + 10000000;
    changeSeed(newSeed);
  }, [changeSeed]);

  return {
    canvasRef,
    engine: engineRef.current,
    settings,
    updateSettings,
    activeMode,
    changeMode,
    seed,
    changeSeed,
    changePattern,
    changePalette,
    isPaused,
    togglePause,
    nextScene,
    elapsedTime,
  };
}
