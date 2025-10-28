
import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="py-6 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" />
          Removedor de Marca d'Água com IA
        </h1>
        <p className="mt-2 text-slate-400">
          Faça o upload de uma imagem e deixe a inteligência artificial fazer a mágica.
        </p>
      </div>
    </header>
  );
};

export default Header;
