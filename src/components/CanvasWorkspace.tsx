import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Line, Group } from 'react-konva';
import Konva from 'konva';
import { useFrameStore } from '../store/frameStore';
import { DraggableSlot } from './DraggableSlot';
import { SlotSamplePhoto } from './SlotSamplePhoto';
import { useKonvaImage } from '../hooks/useKonvaImage';
import { SAMPLE_PHOTOS } from '../utils/samplePhotos';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Grid, 
  Eye, 
  EyeOff, 
  Sliders, 
  Image as ImageIcon,
  Move,
  Info
} from 'lucide-react';

export const CanvasWorkspace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const {
    canvasWidth,
    canvasHeight,
    frameImg,
    positions,
    selectedSlotIndex,
    setSelectedSlotIndex,
    updatePosition,
    zoom,
    setZoom,
    pan,
    setPan,
    showGrid,
    setShowGrid,
    snapToGrid,
    gridSize,
    frameOpacity,
    setFrameOpacity,
    showSamplePhotos,
    setShowSamplePhotos,
    showSlotBorders,
    setShowSlotBorders,
  } = useFrameStore();

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [frameImage, frameLoadStatus] = useKonvaImage(frameImg);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Resize observer to keep stage container size synced
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setContainerSize({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit to screen helper
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || canvasWidth <= 0 || canvasHeight <= 0) return;
    const padding = 60;
    const availW = Math.max(200, containerRef.current.clientWidth - padding * 2);
    const availH = Math.max(200, containerRef.current.clientHeight - padding * 2);

    const scale = Math.min(availW / canvasWidth, availH / canvasHeight, 1.2);
    setZoom(Number(scale.toFixed(3)));

    const centeredX = Math.round((containerRef.current.clientWidth - canvasWidth * scale) / 2);
    const centeredY = Math.round((containerRef.current.clientHeight - canvasHeight * scale) / 2);
    setPan({ x: centeredX, y: centeredY });
  }, [canvasWidth, canvasHeight, setZoom, setPan]);

  // Auto-fit on initial mount or when canvas dimensions change significantly
  useEffect(() => {
    fitToScreen();
  }, [canvasWidth, canvasHeight]);

  // Handle Spacebar key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Zoom via mouse wheel
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.08;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.15, Math.min(3.0, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setZoom(Number(newScale.toFixed(3)));
    setPan(newPos);
  };

  // Deselect if clicking on empty stage space
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current || e.target.name() === 'canvas-bg' || e.target.name() === 'grid-rect') {
      setSelectedSlotIndex(null);
    }
  };

  // Render grid lines for calibration
  const renderGridLines = () => {
    if (!showGrid) return null;
    const lines = [];
    const step = 50; // visual grid spacing

    for (let x = step; x < canvasWidth; x += step) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, canvasHeight]}
          stroke={x % (step * 2) === 0 ? 'rgba(79, 70, 229, 0.18)' : 'rgba(203, 213, 225, 0.35)'}
          strokeWidth={x % (step * 2) === 0 ? 1.5 : 1}
          listening={false}
        />
      );
    }

    for (let y = step; y < canvasHeight; y += step) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, canvasWidth, y]}
          stroke={y % (step * 2) === 0 ? 'rgba(79, 70, 229, 0.18)' : 'rgba(203, 213, 225, 0.35)'}
          strokeWidth={y % (step * 2) === 0 ? 1.5 : 1}
          listening={false}
        />
      );
    }

    return <Group name="grid-lines">{lines}</Group>;
  };

  return (
    <div className="relative flex-1 h-full w-full bg-slate-950/95 overflow-hidden select-none flex flex-col">
      {/* Canvas Top Micro-Toolbar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-[11px] text-slate-300">
            <span className="text-indigo-400 font-semibold">{canvasWidth}</span> ×{' '}
            <span className="text-indigo-400 font-semibold">{canvasHeight}</span> px
            <span className="text-slate-500 ml-1">
              ({(canvasWidth / canvasHeight).toFixed(2)} : 1)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => setShowSamplePhotos(!showSamplePhotos)}
              title="Toggle Sample Photos (Layer 1)"
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-[11px] ${
                showSamplePhotos
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Sample Photos</span>
            </button>

            <button
              onClick={() => setShowSlotBorders(!showSlotBorders)}
              title="Toggle Slot Calibration Wireframe (Layer 2)"
              className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-[11px] ${
                showSlotBorders
                  ? 'bg-indigo-600/90 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Slot Wireframe</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <span className="text-[11px] text-slate-400">Frame Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={frameOpacity}
              onChange={(e) => setFrameOpacity(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              title="Adjust overlay opacity to see slot calibration under the frame"
            />
            <span className="font-mono text-[11px] text-slate-400 w-8">
              {Math.round(frameOpacity * 100)}%
            </span>
          </div>
        </div>

        {/* Viewport & Zoom tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Canvas Grid"
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={() => setZoom(Math.max(0.15, zoom - 0.1))}
            className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-[11px] text-slate-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="p-1.5 text-slate-400 hover:text-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={fitToScreen}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/60"
            title="Fit Frame to Viewport"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div
        ref={containerRef}
        className={`flex-1 w-full h-full relative cursor-${
          isSpacePressed ? 'grab' : 'default'
        } bg-dot-pattern`}
      >
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          onWheel={handleWheel}
          onClick={handleStageClick}
          draggable={isSpacePressed}
          x={pan.x}
          y={pan.y}
          scaleX={zoom}
          scaleY={zoom}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setPan({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
          {/* ========================================================= */}
          {/* LAYER 1 (BOTTOM): Canvas background & Sample User Photos   */}
          {/* ========================================================= */}
          <Layer>
            {/* Outer Artboard Shadow & White/Transparent Base Card */}
            <Rect
              name="canvas-bg"
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="#FFFFFF"
              shadowColor="rgba(0,0,0,0.5)"
              shadowBlur={30}
              shadowOffset={{ x: 0, y: 15 }}
              shadowOpacity={0.6}
            />

            {/* Layer 1 Sample User Photos rendered inside slots */}
            {showSamplePhotos &&
              positions.map((pos, idx) => (
                <SlotSamplePhoto
                  key={`photo-slot-${idx}`}
                  index={idx}
                  position={pos}
                  imageUrl={SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length].url}
                />
              ))}

            {/* Grid Calibration Lines */}
            {renderGridLines()}
          </Layer>

          {/* ========================================================= */}
          {/* LAYER 2 (MIDDLE): Bounding boxes, draggable slots, badges */}
          {/* ========================================================= */}
          <Layer>
            {positions.map((pos, idx) => (
              <DraggableSlot
                key={`slot-${idx}`}
                index={idx}
                position={pos}
                isSelected={selectedSlotIndex === idx}
                onSelect={(selectedIdx) => setSelectedSlotIndex(selectedIdx)}
                onChange={(slotIdx, newPos) => updatePosition(slotIdx, newPos)}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                showBorders={showSlotBorders}
                showSamplePhotos={showSamplePhotos}
              />
            ))}
          </Layer>

          {/* ========================================================= */}
          {/* LAYER 3 (TOP): The uploaded transparent frame PNG overlay */}
          {/* ========================================================= */}
          <Layer listening={false}>
            {frameImage && frameLoadStatus === 'loaded' && (
              <KonvaImage
                image={frameImage}
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                opacity={frameOpacity}
                listening={false}
              />
            )}

            {/* Canvas Outer Boundary Accent Line */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              stroke="rgba(99, 102, 241, 0.4)"
              strokeWidth={2}
              listening={false}
            />
          </Layer>
        </Stage>

        {/* Viewport Floating Info Hint */}
        <div className="absolute bottom-3 left-4 pointer-events-none flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Hold <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 border border-slate-700">Space</kbd> + Drag to Pan • Scroll to Zoom • Drag or Resize Slot handles
          </span>
        </div>
      </div>
    </div>
  );
};
