
import React, { useRef, useEffect, useState } from 'react';
import Spinner from './Spinner';
import { XCircle, ImageOff } from 'lucide-react';

interface ImageDisplayProps {
  label: string;
  imageUrl: string | null;
  isLoading?: boolean;
  error?: string | null;
  onClear?: () => void;
  isBrushActive?: boolean;
  brushSize?: number;
  onMaskChange?: (dataUrl: string) => void;
  maskCanvasRef?: React.RefObject<HTMLCanvasElement>;
  aspectRatio?: string | null;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  label, 
  imageUrl, 
  isLoading = false, 
  error = null, 
  onClear,
  isBrushActive = false,
  brushSize = 40,
  onMaskChange,
  maskCanvasRef,
  aspectRatio = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = maskCanvasRef?.current;
    const image = imageRef.current;

    const resizeCanvas = () => {
      if (canvas && image) {
        canvas.width = image.clientWidth;
        canvas.height = image.clientHeight;
      }
    };

    if (image) {
      image.addEventListener('load', resizeCanvas, { passive: true });
      // For cached images
      if (image.complete) {
        resizeCanvas();
      }
    }
    
    window.addEventListener('resize', resizeCanvas, { passive: true });
    
    return () => {
        if(image) image.removeEventListener('load', resizeCanvas);
        window.removeEventListener('resize', resizeCanvas);
    }

  }, [imageUrl, maskCanvasRef]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent): {x: number, y: number} | null => {
    const canvas = maskCanvasRef?.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
        };
    }
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isBrushActive) return;
    const coords = getCoords(e);
    if (!coords) return;

    const ctx = maskCanvasRef?.current?.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !isBrushActive) return;
    const coords = getCoords(e);
    if (!coords) return;
    
    const canvas = maskCanvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = maskCanvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.closePath();
    setIsDrawing(false);

    if (onMaskChange) {
        onMaskChange(canvas.toDataURL());
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-slate-300">{label}</h3>
        {onClear && (
            <button onClick={onClear} className="text-slate-400 hover:text-red-400 transition-colors" title="Limpar Imagem">
                <XCircle size={20} />
            </button>
        )}
      </div>
      <div 
        ref={containerRef}
        className="relative w-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700"
        style={{ aspectRatio: aspectRatio || '1 / 1' }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
            <Spinner />
            <p className="mt-2 text-slate-300">Removendo marca d'água...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-400 p-4 flex flex-col items-center justify-center">
            <ImageOff className="w-12 h-12 mb-2" />
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && imageUrl && (
          <>
            <img ref={imageRef} src={imageUrl} alt={label} className="max-w-full max-h-full object-contain" />
            {maskCanvasRef && (
                <canvas
                    ref={maskCanvasRef}
                    className={`absolute top-0 left-0 w-full h-full z-10 ${isBrushActive ? 'cursor-crosshair' : 'cursor-default pointer-events-none'}`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            )}
          </>
        )}
        {!isLoading && !error && !imageUrl && (
            <div className="text-center text-slate-500 flex flex-col items-center justify-center">
                <ImageOff className="w-12 h-12 mb-2" />
                <p>Aguardando resultado</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
