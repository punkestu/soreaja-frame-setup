import React, { useState, useEffect } from 'react';
import { useFrameStore } from '../store/frameStore';
import { 
  generateFlattenedPreview, 
  buildExportPayload, 
  downloadFile, 
  downloadDataUrl 
} from '../utils/exportUtils';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  Image as ImageIcon, 
  Sparkles, 
  ExternalLink,
  Code2,
  Eye,
  Settings2
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    assetPathPrefix,
    id,
    name,
    subtitle,
    theme,
    canvasWidth,
    canvasHeight,
    previewImg,
    frameImg,
    photoCount,
    positions,
  } = useFrameStore();

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [useRelativePaths, setUseRelativePaths] = useState<boolean>(true);
  const [includePhotosInPreview, setIncludePhotosInPreview] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Stabilize positions dependency for useEffect
  const positionsKey = JSON.stringify(positions);

  const frameState = React.useMemo(
    () => ({
      id,
      name,
      subtitle,
      theme,
      canvasWidth,
      canvasHeight,
      previewImg,
      frameImg,
      photoCount,
      positions,
    }),
    [id, name, subtitle, theme, canvasWidth, canvasHeight, previewImg, frameImg, photoCount, positionsKey]
  );

  useEffect(() => {
    if (!isExportModalOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    generateFlattenedPreview(frameState, {
      includeSamplePhotos: includePhotosInPreview,
    })
      .then((dataUrl) => {
        if (isMounted) {
          setPreviewDataUrl(dataUrl);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate preview', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    isExportModalOpen,
    includePhotosInPreview,
    frameState,
  ]);

  if (!isExportModalOpen) return null;

  const exportPayload = buildExportPayload(frameState, {
    assetPathPrefix,
    useRelativePaths,
    previewDataUrl,
  });

  const jsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const filename = `${frameState.id || 'photobox-frame'}.json`;
    downloadFile(jsonString, filename, 'application/json');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleDownloadPreview = () => {
    if (!previewDataUrl) return;
    const filename = `${frameState.id || 'photobox-frame'}-preview.png`;
    downloadDataUrl(previewDataUrl, filename);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Export Frame Metadata & Visual Preview
              </h2>
              <p className="text-xs text-slate-400">
                Production-ready photobox JSON configuration & flattened composite PNG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Visual Preview and JSON Schema Inspector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Flattened Visual Preview (5 cols) */}
          <div className="md:col-span-5 p-5 bg-slate-950/40 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Visual Flattened Composite (previewImg)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {frameState.canvasWidth} × {frameState.canvasHeight} px
                </span>
              </div>

              {/* Flattened preview canvas image container */}
              <div className="relative aspect-auto min-h-[300px] max-h-[460px] bg-slate-950/90 rounded-xl border border-slate-800/80 flex items-center justify-center p-3 overflow-hidden shadow-inner">
                {previewDataUrl ? (
                  <div className="relative flex items-center justify-center max-h-[420px] max-w-full">
                    <img
                      src={previewDataUrl}
                      alt="Flattened photobox frame preview"
                      className="max-h-[420px] max-w-full object-contain rounded shadow-lg transition-opacity duration-200"
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center rounded">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-1.5" />
                        <span className="text-[11px] text-indigo-200 font-medium">Updating preview...</span>
                      </div>
                    )}
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering flattened high-res PNG...</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Preview rendering failed</span>
                )}
              </div>

              {/* Preview options */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePhotosInPreview}
                    onChange={(e) => setIncludePhotosInPreview(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Render Sample Photos in Slots</span>
                </label>
              </div>
            </div>

            {/* Quick PNG download button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={handleDownloadPreview}
                disabled={!previewDataUrl || isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-colors disabled:opacity-50 border border-slate-700/80"
              >
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Download Flattened Preview (.png)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Serialized JSON Metadata (7 cols) */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar bg-slate-900/70">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Serialized JSON Configuration
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Schema Valid
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-400 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useRelativePaths}
                      onChange={(e) => setUseRelativePaths(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Production Paths</span>
                  </label>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed custom-scrollbar selection:bg-indigo-900">
                  <code>{jsonString}</code>
                </pre>

                <button
                  onClick={handleCopyJson}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 shadow backdrop-blur transition-colors border border-slate-700/60"
                  title="Copy JSON to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Metadata Highlights */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">Photo Slots</span>
                  <span className="font-semibold text-indigo-400 font-mono">
                    {frameState.photoCount} calibrated
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">Canvas Canvas</span>
                  <span className="font-semibold text-slate-200 font-mono">
                    {frameState.canvasWidth}×{frameState.canvasHeight}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">Theme</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {frameState.theme || 'Default'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>

              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileJson className="w-4 h-4" />
                <span>Download Configuration (.json)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
