import React, { useEffect } from 'react';
import { useFrameStore } from '../store/frameStore';
import { PRESET_FRAMES } from '../utils/presets';
import { 
  Undo2, 
  Redo2, 
  Download, 
  Sparkles, 
  Layers, 
  Eye, 
  Edit3, 
  HelpCircle,
  Camera,
  CheckCircle2
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    name,
    subtitle,
    id,
    undo,
    redo,
    canUndo,
    canRedo,
    viewMode,
    setViewMode,
    setIsExportModalOpen,
    loadPreset,
    showSamplePhotos,
    setShowSamplePhotos,
  } = useFrameStore();

  // Keyboard shortcut listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-5 z-30 select-none">
      {/* Brand & Active Preset Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Soreaja Frame Setup
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-slate-200 font-medium truncate max-w-[200px]">{name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[10px] truncate max-w-[150px]">{id}</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden md:block" />

        {/* Quick Preset Selector Pill */}
        <div className="hidden lg:flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Templates:</span>
          {PRESET_FRAMES.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                id === p.id
                  ? 'bg-slate-800 text-indigo-400 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {p.category} {p.photoCount}-Cut
            </button>
          ))}
        </div>
      </div>

      {/* Center: Undo / Redo & Mode Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => {
              setViewMode('edit');
              setShowSamplePhotos(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-xs ${
              viewMode === 'edit' && !showSamplePhotos
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calibrate</span>
          </button>

          <button
            onClick={() => {
              setViewMode('preview');
              setShowSamplePhotos(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-xs ${
              viewMode === 'preview' || showSamplePhotos
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Simulate Photobox</span>
          </button>
        </div>
      </div>

      {/* Right: Export Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON & Preview</span>
        </button>
      </div>
    </header>
  );
};
