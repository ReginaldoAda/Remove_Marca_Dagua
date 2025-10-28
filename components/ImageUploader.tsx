
import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300
        ${isDragging ? 'border-indigo-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        id="imageUpload"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center justify-center">
        <UploadCloud className="w-16 h-16 text-slate-400 mb-4" />
        <h3 className="text-xl font-semibold text-slate-200">Arraste e solte uma imagem aqui</h3>
        <p className="text-slate-400 mt-1">ou</p>
        <div className="mt-4 px-6 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors">
          Selecione um arquivo
        </div>
        <p className="text-xs text-slate-500 mt-4">PNG, JPG ou WEBP</p>
      </label>
    </div>
  );
};

export default ImageUploader;
