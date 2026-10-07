import { create } from 'zustand';
import { PhotoFrameState, Position, PresetFrame } from '../types/frame';
import { PRESET_FRAMES } from '../utils/presets';

interface HistoryState {
  positions: Position[];
  photoCount: number;
}

interface FrameStoreState extends PhotoFrameState {
  // UI & Viewport state
  selectedSlotIndex: number | null;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  frameOpacity: number;
  showSamplePhotos: boolean;
  showSlotBorders: boolean;
  assetPathPrefix: string;
  viewMode: 'edit' | 'preview';
  isExportModalOpen: boolean;

  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;

  // Actions
  updateMetadata: (fields: Partial<Pick<PhotoFrameState, 'id' | 'name' | 'subtitle' | 'theme'>>) => void;
  setDimensions: (width: number, height: number, scaleSlots?: boolean) => void;
  setFrameImage: (frameImg: string, naturalWidth?: number, naturalHeight?: number) => void;
  setPhotoCount: (count: number) => void;
  updatePosition: (index: number, newPos: Partial<Position>, saveHistory?: boolean) => void;
  addSlot: (customPos?: Partial<Position>) => void;
  removeSlot: (index: number) => void;
  duplicateSlot: (index: number) => void;
  setSelectedSlotIndex: (index: number | null) => void;
  alignSlots: (alignment: 'centerX' | 'centerY' | 'distributeV' | 'distributeH' | 'matchWidth' | 'matchHeight') => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setFrameOpacity: (opacity: number) => void;
  setShowSamplePhotos: (show: boolean) => void;
  setShowSlotBorders: (show: boolean) => void;
  setAssetPathPrefix: (prefix: string) => void;
  setViewMode: (mode: 'edit' | 'preview') => void;
  setIsExportModalOpen: (open: boolean) => void;
  loadPreset: (preset: PresetFrame) => void;
  loadFromJson: (json: Partial<PhotoFrameState>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoArrangeSlots: (count: number) => void;
}

// Generate sensible initial slot positions based on canvas width, height, and count
function generateDefaultPositions(count: number, width: number, height: number): Position[] {
  if (count <= 0) return [];

  const paddingX = Math.round(width * 0.08);
  const paddingTop = Math.round(height * 0.07);
  const paddingBottom = Math.round(height * 0.08);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;

  if (count === 1) {
    return [
      {
        x: paddingX,
        y: paddingTop,
        width: usableWidth,
        height: usableHeight,
      },
    ];
  }

  // 1-column vertical strip format (common for photobooth strips)
  if (width < height * 0.65 || count === 3 || count === 4) {
    const gap = Math.round(usableHeight * 0.03);
    const totalGaps = gap * (count - 1);
    const slotH = Math.round((usableHeight - totalGaps) / count);

    return Array.from({ length: count }, (_, i) => ({
      x: paddingX,
      y: Math.round(paddingTop + i * (slotH + gap)),
      width: usableWidth,
      height: slotH,
    }));
  }

  // 2-column grid format (e.g. 4-grid or 6-grid)
  const cols = 2;
  const rows = Math.ceil(count / cols);
  const gapX = Math.round(usableWidth * 0.04);
  const gapY = Math.round(usableHeight * 0.04);
  const slotW = Math.round((usableWidth - gapX * (cols - 1)) / cols);
  const slotH = Math.round((usableHeight - gapY * (rows - 1)) / rows);

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: Math.round(paddingX + col * (slotW + gapX)),
      y: Math.round(paddingTop + row * (slotH + gapY)),
      width: slotW,
      height: slotH,
    };
  });
}

const initialPreset = PRESET_FRAMES[0];

export const useFrameStore = create<FrameStoreState>((set, get) => {
  const initialHistory: HistoryState[] = [
    {
      positions: initialPreset.positions,
      photoCount: initialPreset.photoCount,
    },
  ];

  const pushHistory = (newPositions: Position[], newPhotoCount: number) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      positions: JSON.parse(JSON.stringify(newPositions)),
      photoCount: newPhotoCount,
    });
    // limit history depth to 30
    if (newHistory.length > 30) newHistory.shift();
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    };
  };

  return {
    // Core PhotoFrameState matching specification
    id: initialPreset.id,
    name: initialPreset.name,
    subtitle: initialPreset.subtitle,
    theme: initialPreset.theme,
    canvasWidth: initialPreset.canvasWidth,
    canvasHeight: initialPreset.canvasHeight,
    previewImg: '',
    frameImg: initialPreset.frameImg,
    photoCount: initialPreset.photoCount,
    positions: initialPreset.positions,

    // UI Viewport
    selectedSlotIndex: 0,
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: true,
    snapToGrid: true,
    gridSize: 10,
    frameOpacity: 0.95,
    showSamplePhotos: true,
    showSlotBorders: true,
    assetPathPrefix: '/assets/frames',
    viewMode: 'edit',
    isExportModalOpen: false,

    // History
    history: initialHistory,
    historyIndex: 0,
    canUndo: false,
    canRedo: false,

    updateMetadata: (fields) => {
      set((state) => ({ ...state, ...fields }));
    },

    setDimensions: (newWidth, newHeight, scaleSlots = false) => {
      set((state) => {
        const width = Math.max(200, Math.round(newWidth));
        const height = Math.max(200, Math.round(newHeight));

        let updatedPositions = state.positions;
        if (scaleSlots && state.canvasWidth > 0 && state.canvasHeight > 0) {
          const scaleX = width / state.canvasWidth;
          const scaleY = height / state.canvasHeight;
          updatedPositions = state.positions.map((p) => ({
            x: Math.round(p.x * scaleX),
            y: Math.round(p.y * scaleY),
            width: Math.round(p.width * scaleX),
            height: Math.round(p.height * scaleY),
          }));
        } else {
          // Clamp within boundaries
          updatedPositions = state.positions.map((p) => ({
            ...p,
            x: Math.min(p.x, width - 40),
            y: Math.min(p.y, height - 40),
            width: Math.min(p.width, width - p.x),
            height: Math.min(p.height, height - p.y),
          }));
        }

        const hist = pushHistory(updatedPositions, state.photoCount);
        return {
          canvasWidth: width,
          canvasHeight: height,
          positions: updatedPositions,
          ...hist,
        };
      });
    },

    setFrameImage: (frameImg, naturalWidth, naturalHeight) => {
      set((state) => {
        const updates: Partial<FrameStoreState> = { frameImg };
        if (naturalWidth && naturalHeight && naturalWidth > 0 && naturalHeight > 0) {
          updates.canvasWidth = naturalWidth;
          updates.canvasHeight = naturalHeight;
          // If we had 0 positions or drastically different aspect ratio, regenerate
          if (state.positions.length === 0) {
            const newPos = generateDefaultPositions(state.photoCount || 4, naturalWidth, naturalHeight);
            updates.positions = newPos;
            updates.photoCount = newPos.length;
          }
        }
        return updates;
      });
    },

    setPhotoCount: (count) => {
      const targetCount = Math.max(1, Math.min(12, count));
      set((state) => {
        if (targetCount === state.photoCount && state.positions.length === targetCount) {
          return state;
        }

        let newPositions = [...state.positions];
        if (targetCount > state.positions.length) {
          // Add newly required slots
          const needed = targetCount - state.positions.length;
          const autoSlots = generateDefaultPositions(targetCount, state.canvasWidth, state.canvasHeight);
          // If existing slots were default, replace with autoSlots, otherwise append
          if (state.positions.length === 0) {
            newPositions = autoSlots;
          } else {
            for (let i = 0; i < needed; i++) {
              const template = autoSlots[state.positions.length + i] || {
                x: 60,
                y: 100 + (state.positions.length + i) * 120,
                width: Math.round(state.canvasWidth * 0.7),
                height: 250,
              };
              newPositions.push(template);
            }
          }
        } else if (targetCount < state.positions.length) {
          newPositions = state.positions.slice(0, targetCount);
        }

        const hist = pushHistory(newPositions, targetCount);
        return {
          photoCount: targetCount,
          positions: newPositions,
          selectedSlotIndex: state.selectedSlotIndex !== null && state.selectedSlotIndex >= targetCount
            ? targetCount - 1
            : state.selectedSlotIndex,
          ...hist,
        };
      });
    },

    autoArrangeSlots: (count) => {
      set((state) => {
        const slots = generateDefaultPositions(count, state.canvasWidth, state.canvasHeight);
        const hist = pushHistory(slots, count);
        return {
          photoCount: count,
          positions: slots,
          ...hist,
        };
      });
    },

    updatePosition: (index, newPos, saveHistory = true) => {
      set((state) => {
        if (index < 0 || index >= state.positions.length) return state;

        const current = state.positions[index];
        const updated: Position = {
          x: Math.round(newPos.x !== undefined ? newPos.x : current.x),
          y: Math.round(newPos.y !== undefined ? newPos.y : current.y),
          width: Math.max(20, Math.round(newPos.width !== undefined ? newPos.width : current.width)),
          height: Math.max(20, Math.round(newPos.height !== undefined ? newPos.height : current.height)),
        };

        const newPositions = [...state.positions];
        newPositions[index] = updated;

        if (saveHistory) {
          const hist = pushHistory(newPositions, state.photoCount);
          return {
            positions: newPositions,
            ...hist,
          };
        }

        return { positions: newPositions };
      });
    },

    addSlot: (customPos) => {
      set((state) => {
        const defaultW = Math.round(state.canvasWidth * 0.7);
        const defaultH = Math.round(state.canvasHeight * 0.25);
        const newPos: Position = {
          x: customPos?.x ?? Math.round((state.canvasWidth - defaultW) / 2),
          y: customPos?.y ?? Math.round(state.canvasHeight * 0.15 + state.positions.length * 50),
          width: customPos?.width ?? defaultW,
          height: customPos?.height ?? defaultH,
        };

        const newPositions = [...state.positions, newPos];
        const newCount = newPositions.length;
        const hist = pushHistory(newPositions, newCount);

        return {
          positions: newPositions,
          photoCount: newCount,
          selectedSlotIndex: newPositions.length - 1,
          ...hist,
        };
      });
    },

    removeSlot: (index) => {
      set((state) => {
        if (state.positions.length <= 1) return state; // keep at least 1 slot
        const newPositions = state.positions.filter((_, i) => i !== index);
        const newCount = newPositions.length;
        const hist = pushHistory(newPositions, newCount);

        return {
          positions: newPositions,
          photoCount: newCount,
          selectedSlotIndex: state.selectedSlotIndex === index
            ? Math.max(0, index - 1)
            : state.selectedSlotIndex !== null && state.selectedSlotIndex > index
            ? state.selectedSlotIndex - 1
            : state.selectedSlotIndex,
          ...hist,
        };
      });
    },

    duplicateSlot: (index) => {
      set((state) => {
        if (index < 0 || index >= state.positions.length) return state;
        const original = state.positions[index];
        const cloned: Position = {
          x: Math.min(state.canvasWidth - original.width, original.x + 20),
          y: Math.min(state.canvasHeight - original.height, original.y + 20),
          width: original.width,
          height: original.height,
        };

        const newPositions = [...state.positions, cloned];
        const newCount = newPositions.length;
        const hist = pushHistory(newPositions, newCount);

        return {
          positions: newPositions,
          photoCount: newCount,
          selectedSlotIndex: newPositions.length - 1,
          ...hist,
        };
      });
    },

    setSelectedSlotIndex: (index) => {
      set({ selectedSlotIndex: index });
    },

    alignSlots: (alignment) => {
      set((state) => {
        if (state.positions.length === 0) return state;
        const positions = [...state.positions];

        if (alignment === 'centerX') {
          // Center all slots horizontally relative to canvas
          const updated = positions.map((p) => ({
            ...p,
            x: Math.round((state.canvasWidth - p.width) / 2),
          }));
          const hist = pushHistory(updated, state.photoCount);
          return { positions: updated, ...hist };
        }

        if (alignment === 'centerY') {
          // Center all slots vertically relative to canvas
          const updated = positions.map((p) => ({
            ...p,
            y: Math.round((state.canvasHeight - p.height) / 2),
          }));
          const hist = pushHistory(updated, state.photoCount);
          return { positions: updated, ...hist };
        }

        if (alignment === 'distributeV' && positions.length > 2) {
          // Sort by Y position and distribute evenly between top and bottom
          const sorted = [...positions].sort((a, b) => a.y - b.y);
          const minY = sorted[0].y;
          const maxY = sorted[sorted.length - 1].y;
          const totalDistance = maxY - minY;
          const step = totalDistance / (sorted.length - 1);

          const updated = positions.map((p) => {
            const idx = sorted.indexOf(p);
            return {
              ...p,
              y: Math.round(minY + idx * step),
            };
          });
          const hist = pushHistory(updated, state.photoCount);
          return { positions: updated, ...hist };
        }

        if (alignment === 'distributeH' && positions.length > 2) {
          const sorted = [...positions].sort((a, b) => a.x - b.x);
          const minX = sorted[0].x;
          const maxX = sorted[sorted.length - 1].x;
          const totalDistance = maxX - minX;
          const step = totalDistance / (sorted.length - 1);

          const updated = positions.map((p) => {
            const idx = sorted.indexOf(p);
            return {
              ...p,
              x: Math.round(minX + idx * step),
            };
          });
          const hist = pushHistory(updated, state.photoCount);
          return { positions: updated, ...hist };
        }

        if (alignment === 'matchWidth' && state.selectedSlotIndex !== null) {
          const refW = positions[state.selectedSlotIndex].width;
          const updated = positions.map((p) => ({
            ...p,
            width: refW,
          }));
          const hist = pushHistory(updated, state.photoCount);
          return { positions: updated, ...hist };
        }

        if (alignment === 'matchHeight' && state.selectedSlotIndex !== null) {
          const refH = positions[state.selectedSlotIndex].height;
          const updated = positions.map((p) => ({
            ...p,
            height: refH,
          }));
          const hist = pushHistory(updated, state.photoCount);
          return { positions: updated, ...hist };
        }

        return state;
      });
    },

    setZoom: (zoom) => {
      set({ zoom: Math.min(3, Math.max(0.15, zoom)) });
    },

    setPan: (pan) => {
      set({ pan });
    },

    setShowGrid: (showGrid) => set({ showGrid }),
    setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
    setGridSize: (gridSize) => set({ gridSize }),
    setFrameOpacity: (frameOpacity) => set({ frameOpacity }),
    setShowSamplePhotos: (showSamplePhotos) => set({ showSamplePhotos }),
    setShowSlotBorders: (showSlotBorders) => set({ showSlotBorders }),
    setAssetPathPrefix: (assetPathPrefix) => set({ assetPathPrefix }),
    setViewMode: (viewMode) => set({ viewMode }),
    setIsExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),

    loadPreset: (preset) => {
      const hist = pushHistory(preset.positions, preset.photoCount);
      set({
        id: preset.id,
        name: preset.name,
        subtitle: preset.subtitle,
        theme: preset.theme,
        canvasWidth: preset.canvasWidth,
        canvasHeight: preset.canvasHeight,
        frameImg: preset.frameImg,
        photoCount: preset.photoCount,
        positions: JSON.parse(JSON.stringify(preset.positions)),
        selectedSlotIndex: 0,
        ...hist,
      });
    },

    loadFromJson: (json) => {
      set((state) => {
        const newPositions = Array.isArray(json.positions) ? json.positions : state.positions;
        const newCount = typeof json.photoCount === 'number' ? json.photoCount : newPositions.length;
        const hist = pushHistory(newPositions, newCount);

        return {
          id: json.id || state.id,
          name: json.name || state.name,
          subtitle: json.subtitle || state.subtitle,
          theme: json.theme || state.theme,
          canvasWidth: json.canvasWidth || state.canvasWidth,
          canvasHeight: json.canvasHeight || state.canvasHeight,
          frameImg: json.frameImg || state.frameImg,
          photoCount: newCount,
          positions: newPositions,
          selectedSlotIndex: 0,
          ...hist,
        };
      });
    },

    undo: () => {
      const state = get();
      if (state.historyIndex <= 0) return;
      const targetIndex = state.historyIndex - 1;
      const target = state.history[targetIndex];
      set({
        positions: JSON.parse(JSON.stringify(target.positions)),
        photoCount: target.photoCount,
        historyIndex: targetIndex,
        canUndo: targetIndex > 0,
        canRedo: true,
      });
    },

    redo: () => {
      const state = get();
      if (state.historyIndex >= state.history.length - 1) return;
      const targetIndex = state.historyIndex + 1;
      const target = state.history[targetIndex];
      set({
        positions: JSON.parse(JSON.stringify(target.positions)),
        photoCount: target.photoCount,
        historyIndex: targetIndex,
        canUndo: true,
        canRedo: targetIndex < state.history.length - 1,
      });
    },
  };
});
