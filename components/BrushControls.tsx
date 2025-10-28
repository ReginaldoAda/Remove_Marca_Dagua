
import React from 'react';
import { Brush, Eraser } from 'lucide-react';

interface BrushControlsProps {
    isBrushActive: boolean;
    onToggleBrush: () => void;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    onClearMask: () => void;
}

const BrushControls: React.FC<BrushControlsProps> = ({
    isBrushActive,
    onToggleBrush,
    brushSize,
    onBrushSizeChange,
    onClearMask,
}) => {
    return (
        <div className="w-full mt-6 p-4 bg-slate-900/60 rounded-lg border border-slate-700 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <p className="text-sm font-medium text-slate-300 hidden sm:block">Ferramentas de Pincel:</p>
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleBrush}
                    title={isBrushActive ? "Desativar Pincel" : "Ativar Pincel"}
                    className={`p-2 rounded-full transition-colors ${isBrushActive ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                    <Brush className="w-5 h-5" />
                </button>
                <button
                    onClick={onClearMask}
                    title="Limpar Marcação"
                    className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                    <Eraser className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <label htmlFor="brushSize" className="text-sm text-slate-400">Tamanho:</label>
                <input
                    id="brushSize"
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                    className="w-full sm:w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
};

export default BrushControls;
