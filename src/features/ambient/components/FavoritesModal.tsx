/**
 * Favorites Scenes Browser Modal
 */

import React, { useState, useEffect } from 'react';
import { Bookmark, X, Trash2, Share2, Sparkles } from 'lucide-react';
import { loadFavorites, removeFavorite } from '../storage/ambientStorage';
import type { FavoriteScene } from '../storage/ambientStorage';
import { PALETTES } from '../engine/PaletteManager';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScene: (scene: FavoriteScene) => void;
  onShareScene: (seed: number, mode: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  onSelectScene,
  onShareScene,
}) => {
  const [favorites, setFavorites] = useState<FavoriteScene[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFavorites(loadFavorites());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeFavorite(id);
    setFavorites(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 text-white rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">Saved Favorites</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm font-semibold">No favorited scenes yet</p>
              <p className="text-xs text-slate-500">
                Click the heart icon during any scene to save it here.
              </p>
            </div>
          ) : (
            favorites.map((fav) => {
              const pal = PALETTES[fav.paletteId] || PALETTES.lavender;
              return (
                <div
                  key={fav.id}
                  onClick={() => {
                    onSelectScene(fav);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {/* Palette Swatch Preview */}
                    <div
                      className="w-10 h-10 rounded-lg border border-white/20 shrink-0 flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: pal.background }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{
                          backgroundColor: pal.colors[0]
                            ? `hsl(${pal.colors[0].h}, ${pal.colors[0].s}%, ${pal.colors[0].l}%)`
                            : '#fff',
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                        {fav.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Mode: <span className="capitalize">{fav.mode}</span> | Seed: #{fav.seed}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareScene(fav.seed, fav.mode);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Share Seed"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(fav.id, e)}
                      className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Favorite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
