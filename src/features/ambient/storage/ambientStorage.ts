/**
 * Local Storage Persistence for Settings and Favorite Scenes
 */

export interface AmbientSettings {
  speedMultiplier: number; // 0.5, 1.0, 1.5
  sceneDuration: number; // seconds: 30, 60, 90, 0 (infinite)
  paletteId: string;
  patternId: string;
  reducedMotion: boolean;
  subtleInteraction: boolean;
  autoHideControls: boolean;
}

export interface FavoriteScene {
  id: string;
  name: string;
  mode: string;
  worldId?: string;
  seed: number;
  patternId: string;
  paletteId: string;
  createdAt: number;
}

const SETTINGS_KEY = 'imagecraft_ambient_settings';
const FAVORITES_KEY = 'imagecraft_ambient_favorites';

export const DEFAULT_SETTINGS: AmbientSettings = {
  speedMultiplier: 1.0,
  sceneDuration: 60,
  paletteId: 'lavender',
  patternId: 'aurora',
  reducedMotion: false,
  subtleInteraction: true,
  autoHideControls: true,
};

export function loadSettings(): AmbientSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load ambient settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AmbientSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save ambient settings:', err);
  }
}

export function loadFavorites(): FavoriteScene[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load ambient favorites:', err);
  }
  return [];
}

export function saveFavorite(scene: Omit<FavoriteScene, 'id' | 'createdAt'>): FavoriteScene {
  const favorites = loadFavorites();
  const newFav: FavoriteScene = {
    ...scene,
    id: 'fav_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    createdAt: Date.now(),
  };
  favorites.unshift(newFav);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save ambient favorite:', err);
  }
  return newFav;
}

export function removeFavorite(id: string): FavoriteScene[] {
  const favorites = loadFavorites().filter(f => f.id !== id);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to remove ambient favorite:', err);
  }
  return favorites;
}
