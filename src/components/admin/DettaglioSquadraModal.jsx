import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-w-3xl mx-auto max-h-[90vh] overflow-hidden p-0">
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl">
            Report Dettagliato: {squadra.nome_squadra}
          </DialogTitle>
        </DialogHeader>

        {/* Riepilogo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-2xl p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{puntiTotali}</p>
            <p className="text-xs opacity-70">Punti Totali</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{tappeCompletate}/10</p>
            <p className="text-xs opacity-70">Tappe</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-lg font-bold">{formatTempo(tempoTotale)}</p>
            <p className="text-xs opacity-70">Tempo Totale</p>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{squadra.aiuti_usati?.length || 0}</p>
            <p className="text-xs opacity-70">Aiuti Usati</p>
          </div>
        </div>

        {/* Dettaglio Tappe */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg mb-4">Dettaglio per Tappa</h3>

          {tappeConDettagli.map((item) => {
            const variante =
              item.completata && item.saltata ? 'glass-danger' :
              item.completata && item.aiutoUsato ? 'glass-warning' :
              item.completata ? 'glass-success' :
              item.corrente ? 'glass-accent' :
              null;
            return (
            <div
              key={item.numero}
              className="glass rounded-2xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Icona Status */}
                  <div className={`mt-1 p-1.5 rounded-lg ${variante || ''}`}>
                    {item.completata && item.saltata ? (
                      <XCircle className="w-5 h-5" />
                    ) : item.completata ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : item.corrente ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                  </div>

                  {/* Info Tappa */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold whitespace-nowrap">
                        Tappa {item.numero}
                      </h4>
                      {item.tappa && (
                        <span className="text-sm opacity-80">
                          - {item.tappa.titolo}
                        </span>
                      )}
                    </div>

                    {/* Risposta */}
                    {item.tappa && item.completata && (
                      <div className="text-sm opacity-80 mb-2">
                        <p>
                          <span className="font-medium">Risposta:</span> {item.tappa.risposta_corretta}
                        </p>
                        {item.errori > 0 && (
                          <p className="mt-1">
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
                            <span className="glass-dark rounded-full px-3 py-1 text-xs font-medium inline-flex items-center">
                              <XCircle className="w-3 h-3 mr-1" />
                              Saltata
                            </span>
                          ) : item.aiutoUsato ? (
                            <span className="glass-dark rounded-full px-3 py-1 text-xs font-medium inline-flex items-center">
                              <Lightbulb className="w-3 h-3 mr-1" />
                              Con Aiuto
                            </span>
                          ) : (
                            <span className="glass-dark rounded-full px-3 py-1 text-xs font-medium inline-flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completata
                            </span>
                          )}
                        </>
                      )}

                      {item.corrente && (
                        <span className="glass-dark rounded-full px-3 py-1 text-xs font-medium">
                          In Corso
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tempo e Punteggio */}
                {item.completata && (
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 pl-8 sm:pl-0">
                    {item.tempo > 0 && (
                      <div className="flex items-center gap-1 text-sm opacity-80 order-2 sm:order-1 sm:mb-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTempo(item.tempo)}</span>
                      </div>
                    )}
                    <div className="text-lg font-bold order-1 sm:order-2">
                      {item.punteggio > 0 ? '+' : ''}{item.punteggio} pt
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Note */}
        {!squadra.completata && squadra.tempo_inizio && (
          <div className="mt-4 glass rounded-xl p-3">
            <p className="text-sm">
              ℹ️ <strong>Squadra ancora in gioco.</strong> I dati mostrati sono aggiornati in tempo reale.
            </p>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}