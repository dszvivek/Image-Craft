/**
 * Premium Ambient Settings Modal / Panel
 * Tabbed navigation, visual swatch previews, and human-friendly controls.
 */

import React, { useState } from 'react';
import { X, Sliders, Palette, Zap, Eye, RotateCcw, Check } from 'lucide-react';
import type { AmbientSettings } from '../storage/ambientStorage';
import { DEFAULT_SETTINGS } from '../storage/ambientStorage';
import { PALETTES } from '../engine/PaletteManager';
import { PatternRegistry } from '../engine/PatternRegistry';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AmbientSettings;
  onUpdateSettings: (newSettings: Partial<AmbientSettings>) => void;
  onPatternSelect: (patternId: string) => void;
  onPaletteSelect: (paletteId: string) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onPatternSelect,
  onPaletteSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'motion' | 'comfort'>('visuals');

  if (!isOpen) return null;

  const patterns = PatternRegistry.getAllMetadata();

  const handleResetDefaults = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
    onPatternSelect(DEFAULT_SETTINGS.patternId);
    onPaletteSelect(DEFAULT_SETTINGS.paletteId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900/95 border border-white/15 text-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Ambient Controls & Settings</h2>
              <p className="text-[11px] text-slate-400 font-medium">Customize your visual world and experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              title="Reset to default settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl my-4 shrink-0">
          {[
            { id: 'visuals', label: 'Visual World', icon: Palette },
            { id: 'motion', label: 'Motion & Timing', icon: Zap },
            { id: 'comfort', label: 'Comfort & Interaction', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'visuals' | 'motion' | 'comfort')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin">
          
          {/* TAB 1: VISUAL WORLD (PATTERNS & PALETTES) */}
          {activeTab === 'visuals' && (
            <div className="space-y-6">
              {/* Pattern Generator Selection */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Select Visual Generator Pattern ({patterns.length} Available)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {patterns.map((pat: { id: string; name: string; description: string }) => {
                    const isSelected = settings.patternId === pat.id;
                    return (
                      <button
                        key={pat.id}
                        onClick={() => {
                          onUpdateSettings({ patternId: pat.id });
                          onPatternSelect(pat.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold group-hover:text-indigo-300 transition">
                            {pat.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {pat.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Selection */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Select Harmonious Color Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(PALETTES).map((pal) => {
                    const isSelected = settings.paletteId === pal.id;
                    return (
                      <button
                        key={pal.id}
                        onClick={() => {
                          onUpdateSettings({ paletteId: pal.id });
                          onPaletteSelect(pal.id);
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {/* Gradient Color Swatch Strip */}
                        <div className="h-3.5 w-full rounded-lg overflow-hidden flex border border-white/20">
                          {pal.colors.slice(0, 4).map((c, i) => (
                            <div
                              key={i}
                              className="flex-1 h-full"
                              style={{ backgroundColor: `hsl(${c.h}, ${c.s}%, ${c.l}%)` }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{pal.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOTION & TIMING */}
          {activeTab === 'motion' && (
            <div className="space-y-6">
              {/* Animation Speed Segmented Controls */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold text-white">Animation Motion Speed</h3>
                  <p className="text-[11px] text-slate-400">Controls the flow and movement rate of generator particles</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: 'Slow (0.5x)', val: 0.5 },
                    { label: 'Normal (1.0x)', val: 1.0 },
                    { label: 'Fast (1.5x)', val: 1.5 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => onUpdateSettings({ speedMultiplier: item.val })}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        settings.speedMultiplier === item.val
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Scene Transition Duration Segmented Controls */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold text-white">Auto Scene Transition Interval</h3>
                  <p className="text-[11px] text-slate-400">Automatically morphs to the next visual world smoothly over time</p>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: '30 sec', val: 30 },
                    { label: '60 sec', val: 60 },
                    { label: '90 sec', val: 90 },
                    { label: 'Off', val: 0 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => onUpdateSettings({ sceneDuration: item.val })}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        settings.sceneDuration === item.val
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMFORT & INTERACTION */}
          {activeTab === 'comfort' && (
            <div className="space-y-4">
              {/* Reduced Motion Toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-white">Reduce Motion</p>
                  <p className="text-[11px] text-slate-400">Slower movement and lower particle density for visual comfort</p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    settings.reducedMotion ? 'bg-indigo-600' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.reducedMotion ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Subtle Interaction Toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-white">Subtle Interaction</p>
                  <p className="text-[11px] text-slate-400">Pointer/touch position gently influences vector forces and ripples</p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ subtleInteraction: !settings.subtleInteraction })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    settings.subtleInteraction ? 'bg-indigo-600' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.subtleInteraction ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-Hide UI Controls Toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-white">Auto-Hide Controls (3.5s)</p>
                  <p className="text-[11px] text-slate-400">Fades UI controls out after 3.5s of inactivity</p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoHideControls: !settings.autoHideControls })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    settings.autoHideControls ? 'bg-indigo-600' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.autoHideControls ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Done Action */}
        <div className="pt-4 border-t border-white/10 shrink-0 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
