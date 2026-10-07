import { PhotoFrameState } from '../types/frame';
import { SAMPLE_PHOTOS } from './samplePhotos';

/**
 * Renders the flattened photobox output image (Layer 1: Photos, Layer 3: Frame overlay)
 * to an HTMLCanvasElement at natural frame resolution, returning a high-res PNG Data URL.
 */
export async function generateFlattenedPreview(
  state: PhotoFrameState,
  options: {
    includeSamplePhotos?: boolean;
    photoUrls?: string[];
  } = {}
): Promise<string> {
  const { includeSamplePhotos = true, photoUrls = [] } = options;
  const canvas = document.createElement('canvas');
  canvas.width = state.canvasWidth;
  canvas.height = state.canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Layer 1: Sample or user photos rendered into each slot bounding box
  if (includeSamplePhotos && state.positions.length > 0) {
    for (let i = 0; i < state.positions.length; i++) {
      const pos = state.positions[i];
      const photoSrc = photoUrls[i] || SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length].url;

      try {
        const img = await loadImage(photoSrc);
        ctx.save();
        // Clip to slot rectangle (with slight rounding)
        ctx.beginPath();
        const radius = 8;
        ctx.roundRect
          ? ctx.roundRect(pos.x, pos.y, pos.width, pos.height, radius)
          : ctx.rect(pos.x, pos.y, pos.width, pos.height);
        ctx.clip();

        // Draw image with object-fit: cover inside slot
        drawImageCover(ctx, img, pos.x, pos.y, pos.width, pos.height);
        ctx.restore();
      } catch (err) {
        console.warn('Failed to load sample photo for slot', i, err);
        // Fallback placeholder fill
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
      }
    }
  } else {
    // If photos are disabled, fill slots with subtle neutral grey
    ctx.fillStyle = '#F1F5F9';
    for (const pos of state.positions) {
      ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
    }
  }

  // Layer 3: Frame Overlay PNG on Top
  if (state.frameImg) {
    try {
      const frameImgElement = await loadImage(state.frameImg);
      ctx.drawImage(frameImgElement, 0, 0, state.canvasWidth, state.canvasHeight);
    } catch (err) {
      console.error('Failed to load frame overlay for export', err);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Draws an image with object-fit: cover behavior inside target rectangle
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let sWidth = img.naturalWidth;
  let sHeight = img.naturalHeight;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sWidth) / 2;
  } else {
    sHeight = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Loads an HTMLImageElement asynchronously with in-memory caching
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Formats JSON payload adhering strictly to Section 3 Target Schema
 */
export function buildExportPayload(
  state: PhotoFrameState,
  options: {
    assetPathPrefix?: string;
    useRelativePaths?: boolean;
    previewDataUrl?: string;
  } = {}
) {
  const {
    assetPathPrefix = '/assets/frames',
    useRelativePaths = true,
    previewDataUrl = '',
  } = options;

  const frameFileName = `${state.id || 'frame'}.png`;
  const previewFileName = `${state.id || 'frame'}-preview.png`;

  const frameImgValue = useRelativePaths
    ? `${assetPathPrefix.replace(/\/$/, '')}/${frameFileName}`
    : state.frameImg;

  const previewImgValue = useRelativePaths
    ? `${assetPathPrefix.replace(/\/$/, '')}/${previewFileName}`
    : previewDataUrl || state.previewImg || '';

  return {
    id: state.id,
    name: state.name,
    subtitle: state.subtitle,
    theme: state.theme,
    canvasWidth: Number(state.canvasWidth),
    canvasHeight: Number(state.canvasHeight),
    previewImg: previewImgValue,
    frameImg: frameImgValue,
    photoCount: Number(state.photoCount),
    positions: state.positions.map((p) => ({
      x: Math.round(p.x),
      y: Math.round(p.y),
      width: Math.round(p.width),
      height: Math.round(p.height),
    })),
  };
}

/**
 * Triggers browser file download for text or blob
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Triggers browser download for a Data URL (e.g. image/png)
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
