import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Lightbulb, Clock, Trophy, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DettaglioSquadraModal({ isOpen, onClose, squadra }) {
  const { data: tappe = [] } = useQuery({
    queryKey: ['tappe'],
    queryFn: () => base44.entities.Tappa.list(),
    enabled: isOpen
  });

  if (!squadra) return null;

  const formatTempo = (secondi) => {
    if (!secondi) return '--:--';
    const ore = Math.floor(secondi / 3600);
    const minuti = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;
    
    if (ore > 0) {
      return `${ore}h ${String(minuti).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
    }
    return `${minuti}m ${String(sec).padStart(2, '0')}s`;
  };

  const getTappaInfo = (index) => {
    if (!squadra.percorso || index >= squadra.percorso.length) return null;
    const tappaId = squadra.percorso[index];
    return tappe.find(t => t.id === tappaId);
  };

  const getTappaStatus = (index) => {
    const completata = index < squadra.tappa_corrente;
    const corrente = index === squadra.tappa_corrente && !squadra.completata;
    const saltata = squadra.tappe_saltate?.includes(index) || false;
    const aiutoUsato = squadra.aiuti_usati?.includes(index) || false;
    const tempo = squadra.tempi_tappe?.[index] || 0;
    const errori = squadra.errori_per_tappa?.[index] || 0;
    
    let punteggio = 0;
    if (completata) {
      if (saltata) punteggio = 0;
      else if (aiutoUsato) punteggio = 5;
      else punteggio = 10;
      
      // Sottrai penalità errori
      punteggio = Math.max(0, punteggio - (errori * 2));
    }
    
    return { completata, corrente, saltata, aiutoUsato, tempo, punteggio, errori };
  };

  const tappeConDettagli = Array.from({ length: 10 }, (_, i) => {
    const tappa = getTappaInfo(i);
    const status = getTappaStatus(i);
    return { numero: i + 1, tappa, ...status };
  });

  const tappeCompletate = tappeConDettagli.filter(t => t.completata).length;
  const puntiTotali = squadra.punteggio || 0;
  const tempoTotale = squadra.tempo_inizio && squadra.tempo_fine 
    ? Math.floor((new Date(squadra.tempo_fine) - new Date(squadra.tempo_inizio)) / 1000)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#022b3a]">
            Report Dettagliato: {squadra.nome_squadra}
          </DialogTitle>
        </DialogHeader>

        {/* Riepilogo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-[#FFD800]" />
              <p className="text-2xl font-bold text-[#022b3a]">{puntiTotali}</p>
              <p className="text-xs text-gray-500">Punti Totali</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-gray-800">{tappeCompletate}/10</p>
              <p className="text-xs text-gray-500">Tappe</p>
            </CardContent>
          </Card>

          {tempoTotale && (
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-bold text-gray-800">{formatTempo(tempoTotale)}</p>
                <p className="text-xs text-gray-500">Tempo Totale</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[#FFD800]" />
              <p className="text-2xl font-bold text-gray-800">{squadra.aiuti_usati?.length || 0}</p>
              <p className="text-xs text-gray-500">Aiuti Usati</p>
            </CardContent>
          </Card>
        </div>

        {/* Dettaglio Tappe */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Dettaglio per Tappa</h3>
          
          {tappeConDettagli.map((item) => (
            <Card 
              key={item.numero}
              className={`border-l-4 ${
                item.completata && item.saltata ? 'border-red-400 bg-red-50/30' :
                item.completata && item.aiutoUsato ? 'border-yellow-400 bg-yellow-50/30' :
                item.completata ? 'border-green-400 bg-green-50/30' :
                item.corrente ? 'border-blue-400 bg-blue-50/30' :
                'border-gray-300'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icona Status */}
                    <div className="mt-1">
                      {item.completata && item.saltata ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : item.completata ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : item.corrente ? (
                        <AlertCircle className="w-6 h-6 text-blue-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>

                    {/* Info Tappa */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">
                          Tappa {item.numero}
                        </h4>
                        {item.tappa && (
                          <span className="text-sm text-gray-600">
                            - {item.tappa.titolo}
                          </span>
                        )}
                      </div>

                      {/* Risposta */}
                      {item.tappa && item.completata && (
                        <div className="text-sm text-gray-600 mb-2">
                          <p>
                            <span className="font-medium">Risposta:</span> {item.tappa.risposta_corretta}
                          </p>
                          {item.errori > 0 && (
                            <p className="text-red-600 mt-1">
                              <span className="font-medium">Tentativi sbagliati:</span> {item.errori} (-{item.errori * 2} pt)
                            </p>
                          )}
                        </div>
                      )}

                      {/* Badges Status */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.completata && (
                          <>
                            {item.saltata ? (
                              <Badge className="bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Saltata
                              </Badge>
                            ) : item.aiutoUsato ? (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Con Aiuto
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completata
                              </Badge>
                            )}
                          </>
                        )}
                        
                        {item.corrente && (
                          <Badge className="bg-blue-100 text-blue-700">
                            In Corso
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tempo e Punteggio */}
                  {item.completata && (
                    <div className="text-right">
                      {item.tempo > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTempo(item.tempo)}</span>
                        </div>
                      )}
                      <div className={`text-lg font-bold ${
                        item.punteggio === 10 ? 'text-green-600' :
                        item.punteggio === 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.punteggio > 0 ? '+' : ''}{item.punteggio} pt
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        {!squadra.completata && squadra.tempo_inizio && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Squadra ancora in gioco.</strong> I dati mostrati sono aggiornati in tempo reale.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}