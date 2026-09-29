import React, { useState, useEffect, useCallback } from 'react';
import {
  getNextSpeciesImage,
  normalizeSpecies,
  WikimediaImage,
} from '../utils/wikimediaService';
import { RefreshCw, ExternalLink, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface SpeciesFlowerPhotoProps {
  species: string;
  themeColor?: string;
}

export const SpeciesFlowerPhoto: React.FC<SpeciesFlowerPhotoProps> = ({
  species,
  themeColor = '#2563eb',
}) => {
  const [currentImage, setCurrentImage] = useState<WikimediaImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const normalized = normalizeSpecies(species);

  // Load a new non-repeating image whenever predicted species changes
  const loadImage = useCallback(
    async (isManualRefresh: boolean = false) => {
      setIsLoading(true);
      setHasError(false);
      setImageLoaded(false);

      try {
        const img = await getNextSpeciesImage(normalized, isManualRefresh);
        setCurrentImage(img);
      } catch (err) {
        console.error('Failed to load flower photo from Wikimedia:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [normalized]
  );

  useEffect(() => {
    loadImage(false);
  }, [loadImage]);

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadImage(true);
  };

  return (
    <div
      id="species-flower-photo-card"
      className="mt-4 pt-3.5 border-t border-slate-200/80"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 tracking-tight">
            Ảnh Minh Họa Loài Hoa
          </span>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Wikimedia Commons
          </span>
        </div>

        {/* Change image button */}
        <button
          type="button"
          onClick={handleRefreshClick}
          disabled={isLoading}
          title="Chọn một ảnh khác của loài hoa này từ Wikimedia Commons"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Đổi ảnh</span>
        </button>
      </div>

      {/* Image display container */}
      <div className="relative w-full h-44 sm:h-52 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs flex items-center justify-center">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mb-1.5" />
            <span className="text-xs font-bold text-slate-700">
              🔄 Đang tìm ảnh minh họa...
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Từ thư viện mở Wikimedia Commons
            </span>
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="p-4 text-center text-xs text-slate-600">
            <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">
              Không thể tải ảnh minh họa từ Wikimedia.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kết quả dự đoán SVM vẫn hoàn toàn chính xác.
            </p>
            <button
              type="button"
              onClick={() => loadImage(true)}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Thử tải lại ảnh
            </button>
          </div>
        )}

        {/* Loaded Image */}
        {currentImage && !hasError && (
          <>
            <img
              src={currentImage.thumbUrl || currentImage.url}
              alt={currentImage.cleanTitle || `Hoa Iris ${normalized}`}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />

            {/* Bottom Caption Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-6 text-white flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold truncate drop-shadow-xs" title={currentImage.cleanTitle}>
                  🌸 {currentImage.cleanTitle || `Iris ${normalized}`}
                </span>
                <span className="text-[10px] text-slate-300 drop-shadow-xs">
                  Ảnh minh họa từ Wikimedia Commons
                </span>
              </div>

              {/* View source link */}
              {currentImage.descriptionUrl && (
                <a
                  href={currentImage.descriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở trang gốc của file ảnh trên Wikimedia Commons"
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[10px] font-bold text-white transition-colors"
                >
                  <span>Xem nguồn ảnh</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer caption */}
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
        <span>Nguồn ảnh: Wikimedia Commons (Creative Commons)</span>
        <span className="font-mono text-emerald-600 font-semibold">Tự động chống lặp</span>
      </div>
    </div>
  );
};
