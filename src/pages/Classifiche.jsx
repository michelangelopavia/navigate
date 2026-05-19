import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, MapPin, Calendar, ArrowLeft, Star, Clock, Medal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function Classifiche() {
  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.filter({ attivo: true })
  });

  const { data: eventi = [] } = useQuery({
    queryKey: ['eventi'],
    queryFn: () => base44.entities.Evento.list('-data_inizio')
  });

  const { data: squadre = [] } = useQuery({
    queryKey: ['squadre-complete'],
    queryFn: () => base44.entities.Squadra.filter({ completata: true })
  });

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

  const calcolaTempoTotale = (squadra) => {
    if (!squadra.tempo_inizio || !squadra.tempo_fine) return Infinity;
    return Math.floor((new Date(squadra.tempo_fine) - new Date(squadra.tempo_inizio)) / 1000);
  };

  const formatTempo = (secondi) => {
    if (!secondi || secondi === Infinity) return '--:--';
    const ore = Math.floor(secondi / 3600);
    const minuti = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;
    if (ore > 0) return `${ore}h ${minuti}m`;
    return `${minuti}m ${sec}s`;
  };

  const ordinaSquadre = (squadreList) => {
    return [...squadreList]
      .map(s => ({ ...s, punteggio: calcolaPunteggio(s), tempoTotale: calcolaTempoTotale(s) }))
      .sort((a, b) => {
        if (b.punteggio !== a.punteggio) return b.punteggio - a.punteggio;
        return a.tempoTotale - b.tempoTotale;
      });
  };

  const getMedaglia = (posizione) => {
    switch(posizione) {
      case 0: return <Trophy className="w-6 h-6 text-[#FFD800]" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-400">{posizione + 1}</span>;
    }
  };

  const ClassificaCard = ({ titolo, icona, squadreList, colore }) => {
    const top5 = ordinaSquadre(squadreList).slice(0, 5);
    
    if (top5.length === 0) return null;

    return (
      <Card className="overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${colore} text-white py-4`}>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icona}
            {titolo}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {top5.map((squadra, index) => (
              <motion.div
                key={squadra.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center gap-4 ${index === 0 ? 'bg-[#FFD800]/10' : ''}`}
              >
                <div className="flex-shrink-0">
                  {getMedaglia(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{squadra.nome_squadra}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#FFD800]" />
                    <span className="font-bold text-[#053c5e]">{squadra.punteggio}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTempo(squadra.tempoTotale)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#053c5e]/5 to-[#1f7a8c]/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="text-[#053c5e]">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#053c5e]">Classifiche</h1>
            <p className="text-gray-500">I migliori esploratori di NAVIGATE</p>
          </div>
        </div>

        {/* Classifiche per Luogo */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#053c5e] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1f7a8c]" />
            Gioco Libero - Per Luogo
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {luoghi.map(luogo => {
              const squadreLuogo = squadre.filter(s => s.luogo_id === luogo.id && s.tipo_gioco === 'libero');
              return (
                <ClassificaCard
                  key={luogo.id}
                  titolo={`${luogo.nome} (${luogo.citta})`}
                  icona={<MapPin className="w-5 h-5" />}
                  squadreList={squadreLuogo}
                  colore="from-[#1f7a8c] to-[#053c5e]"
                />
              );
            })}
          </div>
          {luoghi.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">Nessun luogo disponibile</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Classifiche Eventi */}
        <div>
          <h2 className="text-xl font-bold text-[#053c5e] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1f7a8c]" />
            Eventi
          </h2>
          <div className="grid gap-6">
            {eventi.map(evento => {
              const squadreEvento = squadre.filter(s => s.evento_id === evento.id);
              const luogo = luoghi.find(l => l.id === evento.luogo_id);
              return (
                <Card key={evento.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#053c5e] to-[#1f7a8c] text-white">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#FFD800]" />
                        {evento.nome}
                      </div>
                      {evento.concluso ? (
                        <Badge className="bg-gray-500">
                          Concluso
                        </Badge>
                      ) : (
                        <Badge className="bg-[#FFD800] text-[#053c5e] pointer-events-none">
                          In corso
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm opacity-80">
                      {luogo?.nome} • {evento.data_inizio && format(new Date(evento.data_inizio), 'dd MMM yyyy', { locale: it })}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {squadreEvento.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        Nessuna squadra ha completato l'evento
                      </div>
                    ) : (
                      <div className="divide-y">
                        {ordinaSquadre(squadreEvento).slice(0, 10).map((squadra, index) => (
                          <div
                            key={squadra.id}
                            className={`p-4 flex items-center gap-4 ${index === 0 ? 'bg-[#FFD800]/10' : ''}`}
                          >
                            <div className="flex-shrink-0">
                              {getMedaglia(index)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate">{squadra.nome_squadra}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-[#FFD800]" />
                                <span className="font-bold text-[#053c5e]">{squadra.punteggio}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{formatTempo(squadra.tempoTotale)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {eventi.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">Nessun evento</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}