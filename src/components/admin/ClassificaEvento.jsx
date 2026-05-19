import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Clock, MapPin, Users, FileText, Star } from 'lucide-react';
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

  const getPosizioneStyle = (posizione) => {
    switch(posizione) {
      case 0: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300';
      case 1: return 'bg-gradient-to-r from-gray-50 to-slate-100 border-gray-300';
      case 2: return 'bg-gradient-to-r from-orange-50 to-amber-50 border-amber-300';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Classifica {evento?.nome || ''}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {squadreOrdinate.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nessuna squadra iscritta</p>
          </div>
        ) : (
          <div className="divide-y">
            {squadreOrdinate.map((squadra, index) => (
              <motion.div
                key={squadra.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border-l-4 ${getPosizioneStyle(index)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getMedaglia(index)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{squadra.nome_squadra}</h3>
                    <p className="text-sm text-gray-500">
                      {squadra.referente_nome} {squadra.referente_cognome}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSquadra(squadra)}
                      className="text-[#1f7a8c] hover:bg-[#bfdbf7]/30"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Dettagli
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FFD800]" />
                      <span className="font-bold text-[#053c5e]">{squadra.punteggio}</span>
                    </div>
                    
                    {squadra.completata && squadra.tempoTotale && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{formatTempo(squadra.tempoTotale)}</span>
                      </div>
                    )}
                    
                    {squadra.completata ? (
                      <Badge className="bg-green-100 text-green-800">
                        Completato
                      </Badge>
                    ) : squadra.tempo_inizio ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        In gioco
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Non iniziato
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <DettaglioSquadraModal
        isOpen={!!selectedSquadra}
        onClose={() => setSelectedSquadra(null)}
        squadra={selectedSquadra}
      />
    </Card>
  );
}