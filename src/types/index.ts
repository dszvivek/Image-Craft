export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  category: 'compress' | 'ai' | 'utilities' | 'social';
  badge?: string;
  performanceTag?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ColorSwatch {
  hex: string;
  rgb: string;
  percentage?: number;
}

export interface CollageLayout {
  id: string;
  name: string;
  icon: string;
  slots: number;
}

export type GridDimension = 3 | 4 | 5;
