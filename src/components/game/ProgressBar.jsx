import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

export default function ProgressBar({ tappaCorrente, aiutiUsati = [], tappeSaltate = [], punteggio = 0 }) {
  const totaleTappe = 10;
  const progressPercent = (tappaCorrente / totaleTappe) * 100;

  return (
    <div className="glass rounded-[22px] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium opacity-70">
          Progresso: {tappaCorrente}/{totaleTappe}
        </span>
        <div className="flex items-center gap-1 glass-accent px-3 py-1 rounded-full">
          <Star className="w-4 h-4" />
          <span className="font-bold">{punteggio} pt</span>
        </div>
      </div>

      <div className="h-3 rounded-full overflow-hidden mb-3 bg-[oklch(15%_0_0_/_0.08)]">
        <motion.div
          className="h-full glass-accent"
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
                    ? 'glass-muted'
                    : conAiuto
                      ? 'glass-warning'
                      : 'glass-accent'
                  : corrente
                    ? 'glass-dark ring-2 ring-accent ring-offset-2'
                    : 'bg-[oklch(15%_0_0_/_0.08)] opacity-60'
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
