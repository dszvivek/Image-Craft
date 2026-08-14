/**
 * Floating Glassmorphism Dock Control Bar
 * Fixed popover stacking architecture to prevent overflow clipping.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Maximize, 
  Minimize, 
  Sliders, 
  Heart, 
  Share2, 
  Wind, 
  Clock, 
  Bookmark,
  ArrowLeft,
  Volume2,
  VolumeX,
  Download,
  Calendar,
  Sparkles,
  ChevronUp,
  Compass,
  Check,
  X
} from 'lucide-react';
import { MODES } from '../hooks/useAmbientEngine';
import { PatternRegistry } from '../engine/PatternRegistry';
import { ambientAudioSynth } from '../engine/AmbientAudioSynth';
import type { SoundType } from '../engine/AmbientAudioSynth';

interface FloatingControlsProps {
  activeMode: string;
  onModeChange: (modeId: string) => void;
  activePatternId: string;
  onPatternSelect: (patternId: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onNextScene: () => void;
  onOpenSettings: () => void;
  onOpenFavorites: () => void;
  onToggleBreathing: () => void;
  isBreathingActive: boolean;
  onShare: () => void;
  onFavorite: () => void;
  isFavorited: boolean;
  activeTimerMinutes: number | null;
  remainingSeconds: number | null;
  onSelectTimer: (minutes: number | null) => void;
  onExitImmersive?: () => void;
  onDownloadWallpaper: () => void;
  showDeskClock: boolean;
  onToggleDeskClock: () => void;
  isPomodoroActive: boolean;
  onTogglePomodoro: () => void;
  autoHideEnabled?: boolean;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  activeMode,
  onModeChange,
  activePatternId,
  onPatternSelect,
  isPaused,
  onTogglePause,
  onNextScene,
  onOpenSettings,
  onOpenFavorites,
  onToggleBreathing,
  isBreathingActive,
  onShare,
  onFavorite,
  isFavorited,
  activeTimerMinutes,
  remainingSeconds,
  onSelectTimer,
  onExitImmersive,
  onDownloadWallpaper,
  showDeskClock,
  onToggleDeskClock,
  isPomodoroActive,
  onTogglePomodoro,
  autoHideEnabled = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Popover Dropdown States
  const [activePopover, setActivePopover] = useState<'mode' | 'audio' | 'timer' | 'tools' | null>(null);

  const [currentSound, setCurrentSound] = useState<SoundType>(ambientAudioSynth.getCurrentSound());
  const [volume, setVolume] = useState(ambientAudioSynth.getVolume());

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const patterns = PatternRegistry.getAllMetadata();
  const currentPattern = patterns.find((p) => p.id === activePatternId) || patterns[0];

  // Auto-hide controls after 3.5 seconds of inactivity (PAUSED when popover is open)
  const resetIdleTimer = useCallback(() => {
    setIsVisible(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Do NOT auto-hide while a popover menu is open!
    if (autoHideEnabled && activePopover === null) {
      idleTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    }
  }, [autoHideEnabled, activePopover]);

  useEffect(() => {
    const handleActivity = () => resetIdleTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSelectSound = (sound: SoundType) => {
    ambientAudioSynth.setSound(sound);
    setCurrentSound(sound);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    ambientAudioSynth.setVolume(vol);
  };

  const togglePopover = (name: 'mode' | 'audio' | 'timer' | 'tools', e: React.SyntheticEvent) => {
    e.stopPropagation();
    setActivePopover((prev) => (prev === name ? null : name));
  };

  const currentModePreset = MODES[activeMode] || MODES.calm;
  const availableTimers = currentModePreset.timerMinutes || [];

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Top Left Exit Full Screen Button (Auto-hides on idle) */}
      {onExitImmersive && (
        <div
          className={`fixed top-4 left-4 sm:top-6 sm:left-6 z-50 transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-6 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={onExitImmersive}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xl border border-white/15 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5 shadow-2xl"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Exit Full Screen</span>
          </button>
        </div>
      )}

      {/* Outer Floating Control Container */}
      <div
        className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] transition-all duration-500 transform ${
          isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* POPOVER MENUS (Rendered OUTSIDE overflow-x-auto container) */}
        {/* ========================================================= */}

        {/* 1. VISUAL GENERATORS & ATMOSPHERE MODES POPOVER */}
        {activePopover === 'mode' && (
          <div 
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-slate-900/95 border border-white/20 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 max-h-[65vh] overflow-y-auto z-50 animate-fade-in backdrop-blur-2xl scrollbar-thin text-white"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Visual Generators ({patterns.length})
              </span>
              <button
                onClick={() => setActivePopover(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {patterns.map((pat: { id: string; name: string; description: string }) => {
                const isSelected = activePatternId === pat.id;
                return (
                  <button
                    key={pat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPatternSelect(pat.id);
                      setActivePopover(null);
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-bold leading-snug">{pat.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal line-clamp-1 leading-normal">
                        {pat.description}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-300 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Atmosphere Presets Section */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block px-1">
                Atmosphere Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(MODES).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onModeChange(mode.id);
                      setActivePopover(null);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left transition cursor-pointer ${
                      activeMode === mode.id
                        ? 'bg-indigo-600/40 border border-indigo-400 text-white'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. AUDIO SYNTH POPOVER */}
        {activePopover === 'audio' && (
          <div 
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[85vw] max-w-xs bg-slate-900/95 border border-white/20 rounded-3xl p-4 shadow-2xl flex flex-col gap-2.5 z-50 animate-fade-in backdrop-blur-2xl text-xs text-white"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                Ambient Soundscape
              </span>
              <button
                onClick={() => setActivePopover(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {[
              { id: 'off', label: 'Mute Sound' },
              { id: 'drone', label: '🧘 Deep Calm Drone (Singing Bowl / Synth)' },
              { id: 'brown', label: '🛌 Velvet Brown Noise (Deep Sleep / Focus)' },
              { id: 'ocean', label: '🌊 Ocean Waves (Rolling Tides)' },
              { id: 'rain', label: '🌧️ Gentle Rooftop Rain' },
              { id: 'wind', label: '🍃 Soft Forest Breeze' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSound(s.id as SoundType);
                }}
                className={`px-3 py-2 text-left rounded-xl transition cursor-pointer ${
                  currentSound === s.id ? 'bg-indigo-600 font-bold text-white shadow-md' : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
            {currentSound !== 'off' && (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* 3. SESSION TIMERS POPOVER */}
        {activePopover === 'timer' && (
          <div 
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[85vw] max-w-xs bg-slate-900/95 border border-white/20 rounded-3xl p-3.5 shadow-2xl flex flex-col gap-1.5 z-50 animate-fade-in backdrop-blur-2xl text-xs text-white"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Session Timers
              </span>
              <button
                onClick={() => setActivePopover(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectTimer(null);
                if (isPomodoroActive) onTogglePomodoro();
                setActivePopover(null);
              }}
              className={`px-3 py-2 text-xs text-left rounded-xl transition cursor-pointer ${
                !isPomodoroActive && activeTimerMinutes === null ? 'bg-indigo-600 font-bold text-white' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              Off / Infinite
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePomodoro();
                setActivePopover(null);
              }}
              className={`px-3 py-2 text-xs text-left rounded-xl transition cursor-pointer flex items-center justify-between ${
                isPomodoroActive ? 'bg-amber-600 text-slate-950 font-black' : 'hover:bg-white/10 text-amber-300 font-bold'
              }`}
            >
              <span>25m Focus + 5m Break</span>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
            </button>

            {availableTimers.map((mins) => (
              <button
                key={mins}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPomodoroActive) onTogglePomodoro();
                  onSelectTimer(mins);
                  setActivePopover(null);
                }}
                className={`px-3 py-2 text-xs text-left rounded-xl transition cursor-pointer ${
                  !isPomodoroActive && activeTimerMinutes === mins ? 'bg-indigo-600 font-bold text-white' : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
        )}

        {/* 4. UTILITIES POPOVER */}
        {activePopover === 'tools' && (
          <div 
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[85vw] max-w-xs bg-slate-900/95 border border-white/20 rounded-3xl p-3.5 shadow-2xl flex flex-col gap-1 z-50 animate-fade-in backdrop-blur-2xl text-xs text-white"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Ambient Utilities
              </span>
              <button
                onClick={() => setActivePopover(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Guided Breathing */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBreathing();
                setActivePopover(null);
              }}
              className={`px-3 py-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer ${
                isBreathingActive ? 'bg-teal-600 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-teal-300" />
              <span>Guided Breathing</span>
            </button>

            {/* Desk Clock */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDeskClock();
                setActivePopover(null);
              }}
              className={`px-3 py-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer ${
                showDeskClock ? 'bg-amber-600 text-slate-950 font-bold' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Desk Clock Overlay</span>
            </button>

            {/* Export Wallpaper */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadWallpaper();
                setActivePopover(null);
              }}
              className="px-3 py-2 rounded-xl text-left transition flex items-center gap-2 hover:bg-white/10 text-slate-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download Wallpaper</span>
            </button>

            {/* Favorite Scene */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite();
                setActivePopover(null);
              }}
              className="px-3 py-2 rounded-xl text-left transition flex items-center gap-2 hover:bg-white/10 text-slate-300 cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
              <span>{isFavorited ? 'Favorited' : 'Save to Favorites'}</span>
            </button>

            {/* Share URL */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
                setActivePopover(null);
              }}
              className="px-3 py-2 rounded-xl text-left transition flex items-center gap-2 hover:bg-white/10 text-slate-300 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Share Scene URL</span>
            </button>

            {/* Open Saved Favorites Browser */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenFavorites();
                setActivePopover(null);
              }}
              className="px-3 py-2 rounded-xl text-left transition flex items-center gap-2 hover:bg-white/10 text-slate-300 pt-1 border-t border-white/10 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>View Saved Scenes</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* DOCK BAR */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl text-white max-w-full overflow-x-auto scrollbar-none">
          
          {/* 1. Visual Pattern Launcher */}
          <div className="shrink-0">
            <button
              onClick={(e) => togglePopover('mode', e)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-[11px] sm:text-xs font-extrabold text-indigo-200 transition cursor-pointer flex items-center gap-1.5 shadow-inner max-w-[140px] sm:max-w-[190px]"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{currentPattern?.name || currentModePreset.name}</span>
              <ChevronUp className={`w-3 h-3 shrink-0 transition-transform ${activePopover === 'mode' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="w-px h-5 bg-white/15 my-auto shrink-0" />

          {/* 2. Playback Group */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition cursor-pointer"
              title={isPaused ? 'Resume Visuals (Space)' : 'Pause Visuals (Space)'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current text-teal-400" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextScene();
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition cursor-pointer"
              title="Next Seed Scene (N)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-white/15 my-auto shrink-0" />

          {/* 3. Utility Tools Group */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Audio Popover Button */}
            <button
              onClick={(e) => togglePopover('audio', e)}
              className={`p-2 sm:p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer ${
                currentSound !== 'off' ? 'text-teal-400 bg-teal-500/20' : 'text-slate-200 hover:text-white'
              }`}
              title="Ambient Soundscape Synth"
            >
              {currentSound !== 'off' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-70" />}
            </button>

            {/* Timers & Pomodoro Popover Button */}
            <button
              onClick={(e) => togglePopover('timer', e)}
              className={`p-2 sm:p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isPomodoroActive || remainingSeconds !== null ? 'text-amber-400 bg-amber-500/20' : 'text-slate-200 hover:text-white'
              }`}
              title="Timers & Pomodoro Routine"
            >
              <Clock className="w-4 h-4" />
              {isPomodoroActive ? (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1 rounded">POMO</span>
              ) : remainingSeconds !== null ? (
                <span className="text-[11px]">{formatTimer(remainingSeconds)}</span>
              ) : null}
            </button>

            {/* Quick Tools Popover Button */}
            <button
              onClick={(e) => togglePopover('tools', e)}
              className={`p-2 sm:p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer ${
                isBreathingActive || showDeskClock || isFavorited ? 'text-indigo-300 bg-indigo-500/20' : 'text-slate-200 hover:text-white'
              }`}
              title="Quick Ambient Tools"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Full Settings Modal Launcher */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 transition cursor-pointer shadow-md"
              title="Full Settings Modal (S)"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
