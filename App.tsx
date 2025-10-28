
import React, { useState, useCallback, useRef } from 'react';
import { removeWatermark } from './services/geminiService';
import { fileToBase64, dataUrlToParts } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import ImageDisplay from './components/ImageDisplay';
import Button from './components/Button';
import Spinner from './components/Spinner';
import { Download, Sparkles } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import BrushControls from './components/BrushControls';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<string | null>(null);

  // State for brush masking
  const [isBrushActive, setIsBrushActive] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleClearMask = useCallback(() => {
    if (maskCanvasRef.current) {
        const canvas = maskCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setMaskDataUrl(null);
    }
  }, []);

  const resetState = useCallback((fullReset = true) => {
    if (fullReset) {
      setOriginalImage(null);
      setOriginalImageUrl(null);
      setImageAspectRatio(null);
    }
    setProcessedImageUrl(null);
    setError(null);
    setIsBrushActive(false);
    setMaskDataUrl(null);
    handleClearMask();
  }, [handleClearMask]);


  const handleImageChange = (file: File | null) => {
    if (file) {
      resetState(true);
      setOriginalImage(file);
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);

      const img = new Image();
      img.onload = () => {
        setImageAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
      };
      img.src = url;
    }
  };

  const handleRemoveWatermark = useCallback(async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    setProcessedImageUrl(null);

    try {
      const { base64: imageBase64, mimeType } = await fileToBase64(originalImage);
      
      let maskBase64: string | undefined = undefined;
      if (maskDataUrl) {
        maskBase64 = dataUrlToParts(maskDataUrl).base64;
      }

      const result = await removeWatermark(imageBase64, mimeType, maskBase64);
      
      if(result){
        setProcessedImageUrl(`data:${result.mimeType};base64,${result.base64}`);
      } else {
        throw new Error("A API não retornou uma imagem processada.");
      }

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, maskDataUrl]);
  
  const getDownloadFilename = useCallback(() => {
    if (!originalImage?.name) return "imagem_sem_marca_dagua.png";

    const nameWithoutExt = originalImage.name.includes('.')
      ? originalImage.name.substring(0, originalImage.name.lastIndexOf('.'))
      : originalImage.name;

    let processedExtension = 'png';
    if (processedImageUrl) {
      const mimeType = processedImageUrl.match(/data:image\/(.+);/)?.[1];
      processedExtension = mimeType?.split('+')[0] || 'png';
    }

    return `${nameWithoutExt}_sem_marca.${processedExtension}`;
  }, [originalImage, processedImageUrl]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-4xl p-6 md:p-8 bg-slate-800/50 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm">
          {!originalImage && <ImageUploader onImageSelect={handleImageChange} />}
          
          {originalImageUrl && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <ImageDisplay 
                  label="Original" 
                  imageUrl={originalImageUrl} 
                  onClear={() => resetState(true)}
                  isBrushActive={isBrushActive}
                  brushSize={brushSize}
                  onMaskChange={setMaskDataUrl}
                  maskCanvasRef={maskCanvasRef}
                  aspectRatio={imageAspectRatio}
                />
                <ImageDisplay 
                    label="Resultado" 
                    imageUrl={processedImageUrl} 
                    isLoading={isLoading} 
                    error={error} 
                    aspectRatio={imageAspectRatio}
                />
              </div>
              
              <BrushControls 
                isBrushActive={isBrushActive}
                onToggleBrush={() => setIsBrushActive(!isBrushActive)}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                onClearMask={handleClearMask}
              />
            </>
          )}

          {originalImage && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleRemoveWatermark} 
                disabled={isLoading}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-gray-400"
              >
                {isLoading ? (
                  <>
                    <Spinner /> Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" /> Remover Marca d'Água
                  </>
                )}
              </Button>
              {processedImageUrl && !isLoading &&(
                <a
                  href={processedImageUrl}
                  download={getDownloadFilename()}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-500">
                    <Download className="w-5 h-5 mr-2" /> Baixar Imagem
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
