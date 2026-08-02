import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Clock, Users, FileText, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import DettaglioSquadraModal from './DettaglioSquadraModal';

export default function ClassificaEvento({ squadre, evento }) {
  const [selectedSquadra, setSelectedSquadra] = useState(null);

  const formatTempo = (secondi) => {
    if (!secondi) return '--:--';
    const ore = Math.floor(secondi / 3600);
    const minuti = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;
    
    if (ore > 0) {
      return `${ore}h ${minuti}m ${sec}s`;
    }
    return `${minuti}m ${sec}s`;
  };

  const calcolaTempoTotale = (squadra) => {
    if (!squadra.tempo_inizio || !squadra.tempo_fine) return null;
    return Math.floor((new Date(squadra.tempo_fine) - new Date(squadra.tempo_inizio)) / 1000);
  };

  const calcolaPunteggio = (squadra) => {
    let punti = 0;
    const tappeCompletate = squadra.tappa_corrente || 0;
    
    for (let i = 0; i < tappeCompletate; i++) {
      if (squadra.tappe_saltate?.includes(i)) {
        punti += 0;
      } else if (squadra.aiuti_usati?.includes(i)) {
        punti += 5;
      } else {
        punti += 10;
      }
    }
    
    // Sottrai le penalità per errori
    const penalitaErrori = (squadra.errori_per_tappa || []).reduce((sum, n) => sum + (n * 2), 0);
    
    return Math.max(0, punti - penalitaErrori);
  };

  const squadreOrdinate = [...squadre]
    .map(s => ({ ...s, tempoTotale: calcolaTempoTotale(s), punteggio: calcolaPunteggio(s) }))
    .sort((a, b) => {
      // Prima per punteggio
      if (b.punteggio !== a.punteggio) {
        return b.punteggio - a.punteggio;
      }
      // A parità di punteggio, chi ha impiegato meno tempo
      if (a.completata && b.completata) {
        return (a.tempoTotale || Infinity) - (b.tempoTotale || Infinity);
      }
      return 0;
    });

  const getMedaglia = (posizione) => {
    switch(posizione) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-400">{posizione + 1}</span>;
    }
  };

  const getPosizioneBorder = (posizione) => {
    switch(posizione) {
      case 0: return 'border-2 border-accent';
      case 1: case 2: return 'border-2 border-border';
      default: return '';
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="flex items-center gap-2 font-bold text-lg">
          <Trophy className="w-6 h-6 text-accent" />
          Classifica {evento?.nome || ''}
        </h2>
      </div>

      {squadreOrdinate.length === 0 ? (
        <div className="p-8 text-center opacity-60">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Nessuna squadra iscritta</p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {squadreOrdinate.map((squadra, index) => (
            <motion.div
              key={squadra.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass rounded-xl p-4 ${getPosizioneBorder(index)}`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-shrink-0">
                  {getMedaglia(index)}
                </div>

                <div className="flex-1 min-w-[150px]">
                  <h3 className="font-bold">{squadra.nome_squadra}</h3>
                  <p className="text-sm opacity-70">
                    {squadra.referente_nome} {squadra.referente_cognome}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedSquadra(squadra)}
                  className="glass rounded-full"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Dettagli
                </Button>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent" />
                    <span className="font-bold">{squadra.punteggio}</span>
                  </div>

                  {squadra.completata && squadra.tempoTotale && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{formatTempo(squadra.tempoTotale)}</span>
                    </div>
                  )}

                  {squadra.completata ? (
                    <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-success">
                      Completato
                    </span>
                  ) : squadra.tempo_inizio ? (
                    <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-warning">
                      In gioco
                    </span>
                  ) : (
                    <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-muted">
                      Non iniziato
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <DettaglioSquadraModal
        isOpen={!!selectedSquadra}
        onClose={() => setSelectedSquadra(null)}
        squadra={selectedSquadra}
      />
    </div>
  );
}