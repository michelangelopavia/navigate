import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

export default function ProgressBar({ tappaCorrente, aiutiUsati = [], tappeSaltate = [], punteggio = 0 }) {
  const totaleTappe = 10;
  const progressPercent = (tappaCorrente / totaleTappe) * 100;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">
          Progresso: {tappaCorrente}/{totaleTappe}
        </span>
        <div className="flex items-center gap-1 bg-[#e1e5f2] px-3 py-1 rounded-full">
          <Star className="w-4 h-4 text-[#FFD800]" />
          <span className="font-bold text-[#022b3a]">{punteggio} pt</span>
        </div>
      </div>
      
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-[#1f7a8c] to-[#022b3a]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Indicatori tappe */}
      <div className="flex justify-between">
        {Array.from({ length: totaleTappe }).map((_, i) => {
          const completata = i < tappaCorrente;
          const corrente = i === tappaCorrente;
          const saltata = tappeSaltate.includes(i);
          const conAiuto = aiutiUsati.includes(i);

          return (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${completata 
                  ? saltata 
                    ? 'bg-gray-300 text-gray-500'
                    : conAiuto
                      ? 'bg-[#FFD800] text-[#022b3a]'
                      : 'bg-[#1f7a8c] text-white'
                  : corrente
                    ? 'bg-[#022b3a] text-white ring-2 ring-[#FFD800] ring-offset-2'
                    : 'bg-gray-200 text-gray-400'
                }`}
            >
              {completata ? (
                saltata ? '–' : <Check className="w-3 h-3" />
              ) : (
                i + 1
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}