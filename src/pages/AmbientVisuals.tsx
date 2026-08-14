/**
 * Ambient Generative Visuals Page ("A quiet place on the internet")
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Maximize2, 
  Eye
} from 'lucide-react';
import { useAmbientEngine, MODES } from '../features/ambient/hooks/useAmbientEngine';
import { AmbientCanvas } from '../features/ambient/components/AmbientCanvas';
import { FloatingControls } from '../features/ambient/components/FloatingControls';
import { SettingsDrawer } from '../features/ambient/components/SettingsDrawer';
import { BreathingOverlay } from '../features/ambient/components/BreathingOverlay';
import { FavoritesModal } from '../features/ambient/components/FavoritesModal';
import { DeskClockOverlay } from '../features/ambient/components/DeskClockOverlay';
import { saveFavorite, loadFavorites } from '../features/ambient/storage/ambientStorage';
import type { FavoriteScene } from '../features/ambient/storage/ambientStorage';
import { PALETTES } from '../features/ambient/engine/PaletteManager';

export const AmbientVisuals: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlMode = searchParams.get('mode') || 'calm';
  const urlSeed = searchParams.get('seed') ? parseInt(searchParams.get('seed')!, 10) : undefined;

  const [isImmersive, setIsImmersive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [showDeskClock, setShowDeskClock] = useState(false);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);

  // Timers
  const [activeTimerMinutes, setActiveTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const {
    canvasRef,
    engine,
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
  } = useAmbientEngine(urlMode, urlSeed);

  // Sync state seed & mode to URL without app refresh
  useEffect(() => {
    setSearchParams(
      { mode: activeMode, seed: seed.toString() },
      { replace: true }
    );
  }, [activeMode, seed, setSearchParams]);

  // Mode Timer Countdown Effect
  useEffect(() => {
    if (activeTimerMinutes === null && !isPomodoroActive) {
      setRemainingSeconds(null);
      setIsSessionComplete(false);
      return;
    }

    const duration = isPomodoroActive ? 25 : (activeTimerMinutes || 25);
    setRemainingSeconds(duration * 60);
    setIsSessionComplete(false);

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (isPomodoroActive) {
            // Pomodoro Routine: Switch Focus (25m) -> Break (5m) -> Repeat
            if (activeMode === 'focus') {
              changeMode('break');
              showToast('Focus 25m complete! Enjoy your 5m visual break.');
            } else {
              changeMode('focus');
              showToast('Break 5m complete! Starting 25m Focus session.');
            }
          } else {
            setIsSessionComplete(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimerMinutes, isPomodoroActive, activeMode, changeMode]);

  const handleSelectTimer = (minutes: number | null) => {
    if (isPomodoroActive) setIsPomodoroActive(false);
    setActiveTimerMinutes(minutes);
  };

  const handleTogglePomodoro = () => {
    setIsPomodoroActive((prev) => {
      const next = !prev;
      if (next) {
        changeMode('focus');
        setActiveTimerMinutes(null);
        showToast('Started 25m Focus + 5m Break Pomodoro Routine!');
      }
      return next;
    });
  };

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
      } else if (e.key === 'n' || e.key === 'N') {
        nextScene();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsImmersive((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBreathingActive((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        setIsSettingsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isImmersive) {
        setIsImmersive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause, nextScene, isImmersive]);

  // High-Res Wallpaper PNG Exporter
  const handleDownloadWallpaper = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `imagecraft-ambient-${activeMode}-seed-${seed}.png`;
    link.href = dataUrl;
    link.click();
    showToast('Wallpaper exported as high-res PNG!');
  }, [canvasRef, activeMode, seed]);

  // Favorite Scene Handling
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const favs = loadFavorites();
    const match = favs.some((f) => f.seed === seed && f.mode === activeMode);
    setIsFavorited(match);
  }, [seed, activeMode]);

  const handleToggleFavorite = () => {
    if (!isFavorited) {
      saveFavorite({
        name: `${MODES[activeMode]?.name || 'Scene'} #${seed.toString().slice(-4)}`,
        mode: activeMode,
        seed,
        patternId: settings.patternId,
        paletteId: settings.paletteId,
      });
      setIsFavorited(true);
      showToast('Scene saved to Favorites!');
    } else {
      showToast('Scene already in Favorites.');
    }
  };

  // Share URL Generator
  const handleShare = useCallback(
    (customSeed?: number, customMode?: string) => {
      const targetSeed = customSeed || seed;
      const targetMode = customMode || activeMode;
      const shareUrl = `${window.location.origin}/ambient?mode=${targetMode}&seed=${targetSeed}`;

      if (navigator.share) {
        navigator
          .share({
            title: 'ImagePlumber Ambient Visuals',
            text: 'A quiet place on the internet — living generative artwork.',
            url: shareUrl,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl);
        showToast('Share link copied to clipboard!');
      }
    },
    [seed, activeMode]
  );

  const handleSelectFavoriteScene = (fav: FavoriteScene) => {
    changeMode(fav.mode);
    changeSeed(fav.seed);
    if (fav.paletteId) changePalette(fav.paletteId);
    if (fav.patternId) changePattern(fav.patternId);
    setIsImmersive(true);
  };

  return (
    <div className={
      isImmersive
        ? "fixed inset-0 z-50 bg-slate-950 text-white w-screen h-screen overflow-hidden select-none font-sans"
        : "relative w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans select-none overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-slate-950 text-white"
    }>
      
      {/* Background Generative Canvas with Double-Tap Fullscreen Gesture */}
      <div className="absolute inset-0 z-0">
        <AmbientCanvas
          canvasRef={canvasRef}
          engine={engine}
          onDoubleTap={() => setIsImmersive(!isImmersive)}
        />
      </div>

      {/* Subtle Overlay Dimmer */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-700 pointer-events-none ${
        isImmersive ? 'bg-black/10' : 'bg-slate-950/75 backdrop-blur-sm'
      }`} />

      {/* Desk Clock & Date Overlay */}
      <DeskClockOverlay
        isVisible={showDeskClock}
      />

      {/* Guided Breathing Visualization Overlay */}
      <BreathingOverlay
        isActive={isBreathingActive}
        onClose={() => setIsBreathingActive(false)}
      />

      {/* Session Completion Overlay Modal */}
      {isSessionComplete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-lg animate-fade-in">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center mx-auto text-teal-300">
              <Sparkles className="w-7 h-7 animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Your session is complete.</h2>
              <p className="text-sm text-slate-300">Ready to continue your day, or stay in peaceful ambient space?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsSessionComplete(false);
                  setActiveTimerMinutes(null);
                  setIsImmersive(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition cursor-pointer"
              >
                Return
              </button>
              <button
                onClick={() => {
                  setIsSessionComplete(false);
                  setActiveTimerMinutes(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xl border border-indigo-400/30 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Landing Experience Content (Shown when NOT in full immersive mode) */}
      {!isImmersive && (
        <div className="relative z-20 flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col justify-between">
          {/* Header Tagline */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-extrabold uppercase tracking-widest text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              A Quiet Place on the Internet
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Slow down for a few minutes.
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
              Continuously evolving generative visuals for calming down, focusing, visual breaks, sleep, or ambient digital art.
            </p>
          </div>

          {/* Core Primary CTAs & Mode Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-10">
            {Object.values(MODES).map((mode) => {
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    changeMode(mode.id);
                    setIsImmersive(true);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/40 border-indigo-400/60 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-white/10 hover:bg-slate-900/90 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-black text-white group-hover:text-indigo-300 transition">
                      {mode.name}
                    </span>
                    <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quick Preset Worlds */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block text-center">
              Featured Preset Worlds
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.values(PALETTES).map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    changePalette(pal.id);
                    setIsImmersive(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-2"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white/30"
                    style={{
                      backgroundColor: pal.colors[0]
                        ? `hsl(${pal.colors[0].h}, ${pal.colors[0].s}%, ${pal.colors[0].l}%)`
                        : '#fff',
                    }}
                  />
                  {pal.name}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Launch Button */}
          <div className="text-center pt-8">
            <button
              onClick={() => setIsImmersive(true)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer uppercase text-xs tracking-wider inline-flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Enter Full Experience
            </button>
          </div>
        </div>
      )}

      {/* Floating Control Bar Overlay (Active during immersive mode) */}
      {isImmersive && (
        <FloatingControls
          activeMode={activeMode}
          onModeChange={(m) => changeMode(m)}
          activePatternId={settings.patternId}
          onPatternSelect={(p) => changePattern(p)}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onNextScene={nextScene}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onToggleBreathing={() => setIsBreathingActive(!isBreathingActive)}
          isBreathingActive={isBreathingActive}
          onShare={() => handleShare()}
          onFavorite={handleToggleFavorite}
          isFavorited={isFavorited}
          activeTimerMinutes={activeTimerMinutes}
          remainingSeconds={remainingSeconds}
          onSelectTimer={handleSelectTimer}
          onExitImmersive={() => setIsImmersive(false)}
          onDownloadWallpaper={handleDownloadWallpaper}
          showDeskClock={showDeskClock}
          onToggleDeskClock={() => setShowDeskClock((prev) => !prev)}
          isPomodoroActive={isPomodoroActive}
          onTogglePomodoro={handleTogglePomodoro}
          autoHideEnabled={settings.autoHideControls}
        />
      )}

      {/* Settings Drawer Panel */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onPatternSelect={(p) => changePattern(p)}
        onPaletteSelect={(p) => changePalette(p)}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onSelectScene={handleSelectFavoriteScene}
        onShareScene={(s, m) => handleShare(s, m)}
      />
    </div>
  );
};

export default AmbientVisuals;
