export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PhotoFrameState {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  canvasWidth: number;
  canvasHeight: number;
  previewImg: string;
  frameImg: string;
  photoCount: number;
  positions: Position[];
}

export interface PresetFrame {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  frameImg: string;
  photoCount: number;
  positions: Position[];
  category: 'Strip' | 'Grid' | 'Polaroid' | 'Special';
}
