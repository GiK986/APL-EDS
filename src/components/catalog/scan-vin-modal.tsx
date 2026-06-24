'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Minus, Plus, RotateCcw, RotateCw, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { scanVinWithVision } from '@/actions/vision';
import { t, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ScanVinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vin: string) => void;
  lang: Lang;
}

type Status = 'idle' | 'scanning' | 'done' | 'error';

function isPlausibleVin(candidate: string): boolean {
  const digitCount = (candidate.match(/[0-9]/g) ?? []).length;
  const letterCount = candidate.length - digitCount;
  // Real VINs always mix letters and digits — a 17-char run of OCR noise
  // that happens to avoid I/O/Q is usually all-letters or all-digits.
  return digitCount >= 4 && letterCount >= 4;
}

function extractVinCandidate(rawText: string): string {
  // Tokenize on whitespace first, rather than stripping spaces from the whole
  // line — otherwise a label glued to the value on the same line (e.g. an
  // "(E) <VIN>" field on a registration document) collapses into one blob,
  // and the regex below can grab a 17-char window straddling both instead
  // of the real VIN.
  for (const line of rawText.split('\n')) {
    for (const token of line.split(/\s+/)) {
      const compact = token.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (compact.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(compact) && isPlausibleVin(compact)) {
        return compact;
      }
    }
  }
  return '';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Phone camera photos routinely come in at several MB, which both slows down
// OCR and can blow past the Server Action body limit once base64-encoded.
// Downscaling to a VIN-plate-readable size keeps both paths fast and small,
// falling back to the original file if anything about decoding/encoding fails.
function downscaleForOcr(file: File, maxDim = 1800, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const longestSide = Math.max(img.naturalWidth, img.naturalHeight);
      if (longestSide <= maxDim) {
        resolve(file);
        return;
      }
      const scale = maxDim / longestSide;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export function ScanVinModal({ open, onOpenChange, onConfirm, lang }: ScanVinModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [vin, setVin] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [paneSize, setPaneSize] = useState({ w: 0, h: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  // When rotated 90/270, the box swaps width and height on screen, so fit
  // against the swapped dimensions rather than the image's native ones.
  const isSideways = rotation % 180 !== 0;
  const baseScale =
    natural && paneSize.w && paneSize.h
      ? Math.min(
          paneSize.w / (isSideways ? natural.h : natural.w),
          paneSize.h / (isSideways ? natural.w : natural.h)
        )
      : 0;
  const renderedW = natural ? natural.w * baseScale * zoom : 0;
  const renderedH = natural ? natural.h * baseScale * zoom : 0;
  const onScreenW = isSideways ? renderedH : renderedW;
  const onScreenH = isSideways ? renderedW : renderedH;

  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setPaneSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
    // paneRef only mounts once an image is selected (split view), so this
    // effect must re-run when imageUrl flips to pick up the new element.
  }, [imageUrl]);

  useEffect(() => {
    if (open) return;
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatus('idle');
    setVin('');
    setDragOver(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setNatural(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPaste(e: ClipboardEvent) {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith('image/'))
        ?.getAsFile();
      if (file) {
        e.preventDefault();
        processFile(file);
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [open]);

  function resetImage() {
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatus('idle');
    setVin('');
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setNatural(null);
  }

  function zoomBy(delta: number) {
    setZoom((z) => {
      const next = Math.min(3, Math.max(1, z + delta));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function rotateBy90() {
    setRotation((r) => (r + 90) % 360);
    setPan({ x: 0, y: 0 });
  }

  function captureNatural(el: HTMLImageElement | null) {
    if (!el?.complete || !el.naturalWidth) return;
    setNatural((prev) =>
      prev && prev.w === el.naturalWidth && prev.h === el.naturalHeight
        ? prev
        : { w: el.naturalWidth, h: el.naturalHeight }
    );
  }

  function handleImagePointerMove(e: PointerEvent) {
    const drag = panDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const maxPanX = Math.max(0, (onScreenW - paneSize.w) / 2);
    const maxPanY = Math.max(0, (onScreenH - paneSize.h) / 2);
    setPan({
      x: Math.min(maxPanX, Math.max(-maxPanX, drag.startPanX + dx)),
      y: Math.min(maxPanY, Math.max(-maxPanY, drag.startPanY + dy)),
    });
  }

  function handleImagePointerUp() {
    window.removeEventListener('pointermove', handleImagePointerMove);
    window.removeEventListener('pointerup', handleImagePointerUp);
  }

  function handleImagePointerDown(e: React.PointerEvent) {
    if (zoom <= 1) return;
    e.preventDefault();
    panDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    window.addEventListener('pointermove', handleImagePointerMove);
    window.addEventListener('pointerup', handleImagePointerUp);
  }

  async function processFile(file: File) {
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setStatus('scanning');
    setVin('');

    const ocrFile = await downscaleForOcr(file);

    let candidate = '';
    let tesseractFailed = false;
    try {
      const { recognize } = await import('tesseract.js');
      const result = await recognize(ocrFile, 'eng');
      candidate = extractVinCandidate(result.data.text);
    } catch {
      tesseractFailed = true;
    }

    // Tesseract struggles with the low-contrast, embossed plates that are
    // common on VIN stickers — fall back to Google Vision when it comes up
    // empty, rather than only on a hard failure.
    if (!candidate) {
      try {
        const base64 = await fileToBase64(ocrFile);
        candidate = extractVinCandidate(await scanVinWithVision(base64));
        tesseractFailed = false;
      } catch {
        if (tesseractFailed) {
          setStatus('error');
          return;
        }
      }
    }

    setVin(candidate);
    setStatus('done');
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) processFile(file);
  }

  function handleConfirm() {
    const value = vin.trim();
    if (!value) return;
    onConfirm(value);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('scanVinFromPhoto', lang)}</DialogTitle>
        </DialogHeader>

        {!imageUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center text-sm text-muted-foreground transition-colors',
              dragOver ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <Upload className="h-6 w-6" />
            <p>{t('scanDropHint', lang)}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <div
                ref={paneRef}
                className="relative h-72 overflow-hidden rounded-lg border border-border bg-muted sm:h-96"
              >
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: renderedW || undefined,
                    height: renderedH || undefined,
                    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                    cursor: zoom > 1 ? 'grab' : 'default',
                  }}
                  onPointerDown={handleImagePointerDown}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={captureNatural}
                    src={imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-fill"
                    draggable={false}
                    onLoad={(e) => captureNatural(e.currentTarget)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1">
                <button
                  type="button"
                  onClick={() => zoomBy(-0.25)}
                  aria-label={t('zoomOut', lang)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-xs text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => zoomBy(0.25)}
                  aria-label={t('zoomIn', lang)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  aria-label={t('resetZoom', lang)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={rotateBy90}
                  aria-label={t('rotatePhoto', lang)}
                  className="ml-auto rounded-md p-1 hover:bg-muted"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="relative flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('extractedVin', lang)}
              </label>
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder={
                  status === 'scanning' ? t('scanning', lang) : t('directEntryPlaceholder', lang)
                }
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {status === 'scanning' && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  {t('scanning', lang)}
                </p>
              )}
              {status === 'error' && (
                <p className="text-sm text-destructive">{t('scanFailed', lang)}</p>
              )}
              {status === 'done' && !vin && (
                <p className="text-sm text-destructive">{t('scanNoVinFound', lang)}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={resetImage}
              >
                {t('chooseAnotherPhoto', lang)}
              </Button>
              {status === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel', lang)}
          </Button>
          <Button type="button" disabled={!vin.trim()} onClick={handleConfirm}>
            {t('confirm', lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
