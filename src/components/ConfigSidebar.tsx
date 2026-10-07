import React, { useRef, useState } from 'react';
import { useFrameStore } from '../store/frameStore';
import { PRESET_FRAMES } from '../utils/presets';
import { 
  Upload, 
  Sparkles, 
  Layers, 
  SlidersHorizontal, 
  FileJson, 
  Download, 
  Plus, 
  Trash2, 
  Copy, 
  AlignCenter, 
  AlignVerticalSpaceAround, 
  AlignHorizontalSpaceAround, 
  Maximize, 
  Check, 
  FolderDown, 
  FileUp,
  Image,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const ConfigSidebar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'metadata' | 'slots' | 'presets'>('metadata');

  const {
    id,
    name,
    subtitle,
    theme,
    canvasWidth,
    canvasHeight,
    photoCount,
    positions,
    selectedSlotIndex,
    snapToGrid,
    gridSize,
    assetPathPrefix,
    updateMetadata,
    setDimensions,
    setFrameImage,
    setPhotoCount,
    updatePosition,
    addSlot,
    removeSlot,
    duplicateSlot,
    setSelectedSlotIndex,
    alignSlots,
    setSnapToGrid,
    setGridSize,
    setAssetPathPrefix,
    loadPreset,
    loadFromJson,
    autoArrangeSlots,
    setIsExportModalOpen,
  } = useFrameStore();

  // Handle transparent PNG upload and auto-dimension detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Natural dimension detection
        const detectedWidth = img.naturalWidth;
        const detectedHeight = img.naturalHeight;
        setFrameImage(dataUrl, detectedWidth, detectedHeight);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle JSON Import
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        loadFromJson(json);
      } catch (err) {
        alert('Invalid JSON file format. Please check your configuration.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedSlot = selectedSlotIndex !== null ? positions[selectedSlotIndex] : null;

  return (
    <aside className="w-96 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl select-none">
      {/* App & Frame Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Soreaja Frame Setup
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Admin
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Photobox Frame & Slot Calibrator</p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mt-3 p-1 bg-slate-950/70 rounded-lg border border-slate-800 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex-1 py-1.5 rounded-md text-center transition-colors ${
              activeTab === 'metadata'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Config & Asset
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 py-1.5 rounded-md text-center transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'slots'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <span>Slots</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-300 font-mono">
              {positions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-md text-center transition-colors ${
              activeTab === 'presets'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs text-slate-300">
        {/* ======================================================== */}
        {/* TAB 1: METADATA & ASSET MANAGEMENT                        */}
        {/* ======================================================== */}
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            {/* Frame Asset Upload Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Base Frame PNG Overlay
                </span>
                <span className="text-[10px] text-slate-400">Alpha Transparency</span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 bg-slate-900/50 hover:bg-slate-900 rounded-lg p-4 text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Image className="w-7 h-7 mx-auto text-slate-400 group-hover:text-indigo-400 mb-1.5 transition-colors" />
                <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                  Click to Upload Transparent Frame
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PNG with cutouts • Auto-detects canvas dimensions
                </p>
              </div>

              {/* Dimension Detect Display & Custom Sizing */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400 font-medium">Canvas Dimensions:</span>
                  <span className="font-mono text-indigo-400 font-semibold">
                    {canvasWidth} × {canvasHeight} px
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={canvasWidth}
                      onChange={(e) => setDimensions(Number(e.target.value) || 200, canvasHeight)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={canvasHeight}
                      onChange={(e) => setDimensions(canvasWidth, Number(e.target.value) || 200)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-slate-400">Aspect:</span>
                  <button
                    onClick={() => setDimensions(600, 1800, true)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  >
                    1:3 Strip
                  </button>
                  <button
                    onClick={() => setDimensions(1200, 1200, true)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  >
                    1:1 Quad
                  </button>
                  <button
                    onClick={() => setDimensions(800, 1200, true)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  >
                    2:3 Duo
                  </button>
                  <button
                    onClick={() => setDimensions(1200, 1800, true)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  >
                    Postcard
                  </button>
                </div>
              </div>
            </div>

            {/* Frame Metadata Form */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-200 text-xs block">
                Metadata Attributes
              </span>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Frame ID <span className="text-indigo-400 font-mono text-[10px]">(unique slug)</span>
                  </label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => updateMetadata({ id: e.target.value })}
                    placeholder="e.g. soreaja-strip-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Frame Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateMetadata({ name: e.target.value })}
                    placeholder="e.g. Soreaja Sunset Strip (4-Cut)"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => updateMetadata({ subtitle: e.target.value })}
                    placeholder="e.g. Classic Korean Photobox 4-Cut Vertical"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Theme Tag</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => updateMetadata({ theme: e.target.value })}
                    placeholder="e.g. Dark Minimalist, Pastel Romance, Retro"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Asset Path Mapping Configuration */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">
                  Production Asset Path
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Phase 4 Spec</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Maps exported URLs to target backend asset folder path:
              </p>
              <input
                type="text"
                value={assetPathPrefix}
                onChange={(e) => setAssetPathPrefix(e.target.value)}
                placeholder="/assets/frames"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
              <div className="text-[10px] text-slate-500 font-mono break-all bg-slate-950 p-2 rounded border border-slate-800/80">
                frameImg: <span className="text-slate-300">{assetPathPrefix}/{id || 'frame'}.png</span>
              </div>
            </div>

            {/* Import Existing Configuration */}
            <div className="pt-1">
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleJsonImport}
                className="hidden"
              />
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700/80"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import Existing JSON Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SLOTS CALIBRATION & REAL-TIME ALIGNMENT           */}
        {/* ======================================================== */}
        {activeTab === 'slots' && (
          <div className="space-y-4">
            {/* Slot Count & Dynamic Generation */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">
                  Photo Slot Count: <span className="text-indigo-400 font-mono">{photoCount}</span>
                </span>
                <span className="text-[10px] text-slate-400">1 to 12 Slots</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={photoCount}
                  onChange={(e) => setPhotoCount(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => autoArrangeSlots(photoCount)}
                  className="px-2.5 py-1 text-[11px] rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 transition-colors"
                  title="Auto-arrange slots symmetrically on the canvas"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto-Align</span>
                </button>
              </div>

              {/* Snapping controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Snap to Grid</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Step:</span>
                  {[5, 10, 20].map((step) => (
                    <button
                      key={step}
                      onClick={() => setGridSize(step)}
                      className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                        gridSize === step
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {step}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Slot Precise Inspection */}
            {selectedSlot ? (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 shadow-lg shadow-indigo-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Slot #{selectedSlotIndex! + 1} Selected
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateSlot(selectedSlotIndex!)}
                      title="Duplicate slot"
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeSlot(selectedSlotIndex!)}
                      title="Delete slot"
                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Numerical coordinate inputs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">X Position</label>
                    <input
                      type="number"
                      value={selectedSlot.x}
                      onChange={(e) =>
                        updatePosition(selectedSlotIndex!, { x: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Y Position</label>
                    <input
                      type="number"
                      value={selectedSlot.y}
                      onChange={(e) =>
                        updatePosition(selectedSlotIndex!, { y: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Width</label>
                    <input
                      type="number"
                      value={selectedSlot.width}
                      onChange={(e) =>
                        updatePosition(selectedSlotIndex!, { width: Math.max(10, Number(e.target.value) || 10) })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Height</label>
                    <input
                      type="number"
                      value={selectedSlot.height}
                      onChange={(e) =>
                        updatePosition(selectedSlotIndex!, { height: Math.max(10, Number(e.target.value) || 10) })
                      }
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Aspect: {(selectedSlot.width / selectedSlot.height).toFixed(2)}</span>
                  <span>Right: {selectedSlot.x + selectedSlot.width}px</span>
                  <span>Bottom: {selectedSlot.y + selectedSlot.height}px</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-slate-400 text-xs">
                Select a slot on canvas or below to adjust coordinates
              </div>
            )}

            {/* Quick Alignment Utilities */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <span className="font-semibold text-slate-200 text-xs block">
                Alignment & Distribution
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alignSlots('centerX')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                >
                  <AlignCenter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Center X</span>
                </button>
                <button
                  onClick={() => alignSlots('centerY')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                >
                  <AlignCenter className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                  <span>Center Y</span>
                </button>
                <button
                  onClick={() => alignSlots('distributeV')}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                >
                  <AlignVerticalSpaceAround className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Distribute V</span>
                </button>
                <button
                  onClick={() => alignSlots('matchWidth')}
                  disabled={selectedSlotIndex === null}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-[11px] transition-colors"
                >
                  <Maximize className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Equal Width</span>
                </button>
              </div>
            </div>

            {/* Slot List Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Active Slots List</span>
                <button
                  onClick={() => addSlot()}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Slot</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {positions.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSlotIndex(idx)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedSlotIndex === idx
                        ? 'bg-indigo-950/40 border-indigo-500/80 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-300">
                        {idx + 1}
                      </span>
                      <div className="font-mono text-[11px]">
                        <span>x:{p.x} y:{p.y}</span>
                        <span className="text-slate-500 ml-1.5">
                          {p.width}×{p.height}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlot(idx);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Remove slot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: BUILT-IN TEMPLATES & PRESETS                      */}
        {/* ======================================================== */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select a photobox template preset with pre-calibrated slots and design overlays:
            </p>

            <div className="space-y-2.5">
              {PRESET_FRAMES.map((preset) => {
                const isActive = id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
                        {preset.name}
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300">
                            Active
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {preset.photoCount} Shots
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2">
                      {preset.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2 font-mono">
                      <span>{preset.canvasWidth} × {preset.canvasHeight} px</span>
                      <span className="text-indigo-400">{preset.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Quick Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synced to Schema</span>
        </span>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
        >
          <span>Preview JSON</span>
          <FileJson className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
