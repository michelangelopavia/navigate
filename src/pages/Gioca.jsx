import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Clock, MapPin, AlertCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

import TappaCard from '@/components/game/TappaCard';
import ProgressBar from '@/components/game/ProgressBar';
import ApprofondimentoModal from '@/components/game/ApprofondimentoModal';
import RegoleModal from '@/components/game/RegoleModal';
import CompletamentoCard from '@/components/game/CompletamentoCard';
import SegnalazioneModal from '@/components/SegnalazioneModal';

export default function Gioca() {
  const urlParams = new URLSearchParams(window.location.search);
  const squadraId = urlParams.get('squadra');
  const queryClient = useQueryClient();

  const [showApprofondimento, setShowApprofondimento] = useState(false);
  const [showRegole, setShowRegole] = useState(false);
  const [showSegnalazione, setShowSegnalazione] = useState(false);
  const [tappaCompletata, setTappaCompletata] = useState(null);
  const [tempoCorrente, setTempoCorrente] = useState(0);
  const [tempoInizioTappa, setTempoInizioTappa] = useState(null);
  const [aiutoUsatoTappaCorrente, setAiutoUsatoTappaCorrente] = useState(false);
  const [user, setUser] = useState(null);
  const [tempoEffettivoTappa, setTempoEffettivoTappa] = useState(0);

  const timerRef = useRef(null);
  const tempoTappaRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: squadra, isLoading: loadingSquadra } = useQuery({
    queryKey: ['squadra', squadraId],
    queryFn: async () => {
      const squadre = await base44.entities.Squadra.filter({ id: squadraId });
      return squadre[0];
    },
    enabled: !!squadraId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0
  });

  const { data: evento } = useQuery({
    queryKey: ['evento-squadra', squadra?.evento_id],
    queryFn: async () => {
      const eventi = await base44.entities.Evento.filter({ id: squadra.evento_id });
      return eventi[0];
    },
    enabled: !!squadra?.evento_id
  });

  const { data: luogo } = useQuery({
    queryKey: ['luogo-squadra', squadra?.luogo_id],
    queryFn: async () => {
      const luoghi = await base44.entities.Luogo.filter({ id: squadra.luogo_id });
      return luoghi[0];
    },
    enabled: !!squadra?.luogo_id
  });

  const { data: tappe = [] } = useQuery({
    queryKey: ['tappe'],
    queryFn: () => base44.entities.Tappa.list()
  });

  const DURATA_MAX_LIBERO = 12 * 60 * 60; // 12 ore in secondi

  // Verifica finestra evento
  const isEventoInFinestra = () => {
    if (!evento) return true;
    const now = new Date();
    return now >= new Date(evento.data_inizio) && now <= new Date(evento.data_fine);
  };

  // Verifica tempo scaduto per gioco libero (12 ore)
  const isTempoScadutoLibero = () => {
    if (evento) return false; // Gli eventi hanno la loro finestra
    if (!squadra?.tempo_inizio) return false;
    return tempoCorrente >= DURATA_MAX_LIBERO;
  };

  // Marca come completata se il tempo scade (gioco libero o evento)
  useEffect(() => {
    if (!squadra || squadra.completata || !squadra.tempo_inizio) return;

    // Gioco libero: chiudi dopo 12 ore
    if (isTempoScadutoLibero()) {
      base44.entities.Squadra.update(squadraId, {
        completata: true,
        tempo_fine: new Date().toISOString()
      }).then(() => queryClient.invalidateQueries(['squadra', squadraId]));
    }

    // Evento: chiudi automaticamente alla data_fine
    if (evento) {
      const now = new Date();
      const fineEvento = new Date(evento.data_fine);

      if (now > fineEvento) {
        base44.entities.Squadra.update(squadraId, {
          completata: true,
          tempo_fine: evento.data_fine
        }).then(() => queryClient.invalidateQueries(['squadra', squadraId]));
      }
    }
  }, [tempoCorrente, squadra?.completata, evento?.data_fine]);

  const tempoRimanenteLibero = DURATA_MAX_LIBERO - tempoCorrente;

  // Timer globale
  useEffect(() => {
    if (squadra?.tempo_inizio && !squadra?.completata) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(squadra.tempo_inizio)) / 1000);
        setTempoCorrente(elapsed);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [squadra?.tempo_inizio, squadra?.completata]);

  // Timer effettivo tappa (usa il timestamp salvato nel database)
  useEffect(() => {
    if (squadra?.tempo_inizio && !squadra?.completata && squadra?.tempo_inizio_tappa_corrente) {
      setAiutoUsatoTappaCorrente(squadra.aiuti_usati?.includes(squadra.tappa_corrente) || false);
      const tempoInizioTappaSalvato = new Date(squadra.tempo_inizio_tappa_corrente).getTime();
      setTempoInizioTappa(tempoInizioTappaSalvato);
      
      // Timer per tempo effettivo tappa
      tempoTappaRef.current = setInterval(() => {
        setTempoEffettivoTappa(Math.floor((Date.now() - tempoInizioTappaSalvato) / 1000));
      }, 1000);
    }
    
    return () => {
      if (tempoTappaRef.current) clearInterval(tempoTappaRef.current);
    };
  }, [squadra?.tappa_corrente, squadra?.tempo_inizio, squadra?.tempo_inizio_tappa_corrente]);

  const iniziaGiocoMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Squadra.update(squadraId, {
        aiuti_usati: [],
        tappe_saltate: [],
        punteggio: 0,
        errori_per_tappa: []
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['squadra', squadraId]);
      await queryClient.refetchQueries(['squadra', squadraId]);
      setShowRegole(false);
    }
  });

  const usaAiutoMutation = useMutation({
    mutationFn: async () => {
      const nuoviAiuti = [...(squadra.aiuti_usati || []), squadra.tappa_corrente];
      return base44.entities.Squadra.update(squadraId, {
        aiuti_usati: nuoviAiuti
      });
    },
    onSuccess: async () => {
      setAiutoUsatoTappaCorrente(true);
      await queryClient.invalidateQueries(['squadra', squadraId]);
      await queryClient.refetchQueries(['squadra', squadraId]);
    }
  });

  const rispostaSbagliataMutation = useMutation({
    mutationFn: async () => {
      const erroriAttuali = squadra.errori_per_tappa || [];
      const indiceTappa = squadra.tappa_corrente;
      const nuoviErrori = [...erroriAttuali];
      nuoviErrori[indiceTappa] = (nuoviErrori[indiceTappa] || 0) + 1;

      return base44.entities.Squadra.update(squadraId, {
        punteggio: Math.max(0, (squadra.punteggio || 0) - 2),
        errori_per_tappa: nuoviErrori
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['squadra', squadraId]);
      await queryClient.refetchQueries(['squadra', squadraId]);
    }
  });

  const completaTappaMutation = useMutation({
    mutationFn: async () => {
      const nuovaTappa = squadra.tappa_corrente + 1;
      const completata = nuovaTappa >= 10;

      // Il punteggio è già stato calcolato durante il gioco (con incrementi e decrementi)
      // Qui calcoliamo solo il punteggio della tappa appena completata
      const puntiTappaCorrente = squadra.tappe_saltate?.includes(squadra.tappa_corrente) ? 0 :
                                  squadra.aiuti_usati?.includes(squadra.tappa_corrente) ? 5 : 10;
      
      const punteggioFinale = (squadra.punteggio || 0) + puntiTappaCorrente;

      const updates = {
        tappa_corrente: nuovaTappa,
        completata,
        punteggio: punteggioFinale
      };

      await base44.entities.Squadra.update(squadraId, updates);

      // Notifica
      await base44.entities.Notifica.create({
        tipo: completata ? 'gioco_completato' : 'tappa_superata',
        squadra_id: squadraId,
        squadra_nome: squadra.nome_squadra,
        evento_id: squadra.evento_id,
        messaggio: completata 
          ? `🏆 ${squadra.nome_squadra} ha completato con ${punteggioFinale} punti!`
          : `✓ ${squadra.nome_squadra} ha superato la tappa ${nuovaTappa}`
        });

      return { nuovaTappa, completata };
    },
    onSuccess: async () => {
      setAiutoUsatoTappaCorrente(false);
      await queryClient.invalidateQueries(['squadra', squadraId]);
      await queryClient.refetchQueries(['squadra', squadraId]);
    }
  });

  const getTappaCorrente = () => {
    if (!squadra?.percorso || squadra.tappa_corrente >= 10) return null;
    const tappaId = squadra.percorso[squadra.tappa_corrente];
    return tappe.find(t => t.id === tappaId);
  };

  const formatTempo = (secondi) => {
    const ore = Math.floor(secondi / 3600);
    const minuti = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;
    if (ore > 0) {
      return `${ore}:${String(minuti).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    return `${String(minuti).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleRispostaCorretta = async () => {
    // Ferma il timer della tappa
    if (tempoTappaRef.current) clearInterval(tempoTappaRef.current);
    
    // Calcola e salva il tempo SUBITO (prima di aprire l'approfondimento)
    const tempoTappa = Math.floor((Date.now() - tempoInizioTappa) / 1000);
    
    // Salva SOLO il tempo (il punteggio verrà calcolato in completaTappaMutation)
    await base44.entities.Squadra.update(squadraId, {
      tempi_tappe: [...(squadra.tempi_tappe || []), tempoTappa]
    });
    
    // Invalida query per aggiornare UI
    await queryClient.invalidateQueries(['squadra', squadraId]);
    await queryClient.refetchQueries(['squadra', squadraId]);
    
    const tappa = getTappaCorrente();
    setTappaCompletata(tappa);
    setShowApprofondimento(true);
  };

  const handleRispostaSbagliata = () => {
    rispostaSbagliataMutation.mutate();
  };

  const handleProsegui = () => {
    setShowApprofondimento(false);
    completaTappaMutation.mutate();
  };

  const handleSalta = async () => {
    // Ferma il timer della tappa
    if (tempoTappaRef.current) clearInterval(tempoTappaRef.current);
    
    // Calcola e salva il tempo SUBITO
    const tempoTappa = Math.floor((Date.now() - tempoInizioTappa) / 1000);
    
    // Salva tempo e marca come saltata (il punteggio verrà calcolato in completaTappaMutation)
    await base44.entities.Squadra.update(squadraId, {
      tempi_tappe: [...(squadra.tempi_tappe || []), tempoTappa],
      tappe_saltate: [...(squadra.tappe_saltate || []), squadra.tappa_corrente]
    });
    
    // Invalida query
    await queryClient.invalidateQueries(['squadra', squadraId]);
    await queryClient.refetchQueries(['squadra', squadraId]);
    
    const tappa = getTappaCorrente();
    setTappaCompletata(tappa);
    setShowApprofondimento(true);
  };

  if (loadingSquadra) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bfdbf7]/30 to-[#022b3a]/5">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f7a8c]" />
      </div>
    );
  }

  if (!squadra) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <CardContent>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Squadra non trovata</h2>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-[#1f7a8c]">Torna alla Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Gioco completato
  if (squadra.completata) {
    const tempoTotale = squadra.tempo_fine && squadra.tempo_inizio
      ? Math.floor((new Date(squadra.tempo_fine) - new Date(squadra.tempo_inizio)) / 1000)
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e1e5f2]/50 to-[#bfdbf7]/30 flex items-center justify-center p-4">
        <CompletamentoCard squadra={squadra} tempoTotale={tempoTotale} />
      </div>
    );
  }

  // Evento: verifica finestra temporale
  if (evento && !isEventoInFinestra()) {
    const now = new Date();
    const inizio = new Date(evento.data_inizio);
    const fine = new Date(evento.data_fine);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 to-[#022b3a]/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#1f7a8c]" />
            {now < inizio ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Evento non ancora iniziato</h2>
                <p className="text-gray-600 mb-4">
                  L'evento inizierà il {inizio.toLocaleDateString('it-IT')} alle {inizio.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Evento terminato</h2>
                <p className="text-gray-600 mb-4">
                  L'evento è terminato il {fine.toLocaleDateString('it-IT')} alle {fine.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </>
            )}
            <Link to={createPageUrl('Home')}>
              <Button className="bg-[#1f7a8c]">Torna alla Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Non ancora iniziato
  if (!squadra.tempo_inizio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 to-[#022b3a]/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="overflow-hidden shadow-xl border-2 border-[#1f7a8c]">
            <div className="bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] p-8 text-center text-white">
              <MapPin className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Pronto a Partire?</h1>
              <p className="text-lg opacity-90">{squadra.nome_squadra}</p>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  {luogo?.nome} {luogo?.citta && `- ${luogo.citta}`}
                </p>
                <p className="text-gray-600 mb-4">
                  Una volta iniziato, il cronometro partirà. Buona fortuna!
                </p>
              </div>
              <Button 
                onClick={() => setShowRegole(true)}
                className="w-full bg-[#1f7a8c] hover:bg-[#022b3a] text-lg py-6"
                disabled={iniziaGiocoMutation.isPending}
              >
                {iniziaGiocoMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Inizia la Caccia!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <RegoleModal 
          isOpen={showRegole}
          onClose={() => setShowRegole(false)}
          onStart={() => iniziaGiocoMutation.mutate()}
          isEvento={!!evento}
        />
      </div>
    );
  }

  const tappaCorrente = getTappaCorrente();

  // Tempo scaduto per gioco libero
  if (isTempoScadutoLibero() && !squadra.completata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 to-[#022b3a]/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Clock className="w-16 h-16 mx-auto mb-4 text-[#db222a]" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tempo Scaduto!</h2>
            <p className="text-gray-600 mb-4">
              Le 12 ore a disposizione sono terminate. Hai completato {squadra.tappa_corrente}/10 tappe con {squadra.punteggio || 0} punti.
            </p>
            <Link to={createPageUrl('Classifiche')}>
              <Button className="w-full bg-[#1f7a8c] hover:bg-[#022b3a] mb-3">
                Vedi Classifiche
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="w-full">Torna alla Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 to-[#022b3a]/5 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header con timer */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500">Squadra</p>
              <p className="font-bold text-[#022b3a]">{squadra.nome_squadra}</p>
            </div>
            <div className="flex items-center gap-2 bg-[#bfdbf7]/50 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-[#1f7a8c]" />
              <span className="font-mono font-bold text-lg text-[#022b3a]">
                {formatTempo(tempoCorrente)}
              </span>
            </div>
          </div>
          {/* Indicatore tempo rimanente per gioco libero */}
          {!evento && tempoRimanenteLibero > 0 && tempoRimanenteLibero < 60 * 60 && (
            <div className="bg-[#db222a]/10 text-[#db222a] text-xs px-3 py-1 rounded-full text-center">
              ⏱ Tempo rimanente: {formatTempo(tempoRimanenteLibero)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          tappaCorrente={squadra.tappa_corrente}
          aiutiUsati={squadra.aiuti_usati || []}
          tappeSaltate={squadra.tappe_saltate || []}
          punteggio={squadra.punteggio || 0}
        />

        {/* Tappa Corrente */}
        {tappaCorrente && (
          <TappaCard
            tappa={tappaCorrente}
            numeroTappa={squadra.tappa_corrente + 1}
            onRispostaCorretta={handleRispostaCorretta}
            onRispostaSbagliata={handleRispostaSbagliata}
            onUsaAiuto={() => usaAiutoMutation.mutate()}
            onSalta={handleSalta}
            aiutoUsato={aiutoUsatoTappaCorrente}
            tempoInizioTappa={tempoInizioTappa}
            isLoading={completaTappaMutation.isPending}
          />
        )}

        {/* Info uscita e segnalazione */}
        <div className="mt-6 space-y-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-blue-800">
                💡 <strong>Puoi uscire e riprendere il gioco quando vuoi</strong> entro le {!evento ? '12 ore' : 'finestra dell\'evento'}. 
                Il tuo progresso viene salvato automaticamente.
              </p>
              <Link to={createPageUrl('Home')}>
                <Button variant="outline" size="sm" className="mt-2">
                  Torna alla Home
                </Button>
              </Link>
            </CardContent>
          </Card>
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSegnalazione(true)}
              className="text-gray-400 hover:text-[#db222a]"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Segnala un problema
            </Button>
          </div>
        </div>

        {/* Modal Approfondimento */}
        <ApprofondimentoModal
          isOpen={showApprofondimento}
          onClose={() => setShowApprofondimento(false)}
          tappa={{
            ...tappaCompletata,
            saltata: squadra.tappe_saltate?.includes(squadra.tappa_corrente)
          }}
          numeroTappa={squadra.tappa_corrente + 1}
          onProsegui={handleProsegui}
          userEmail={user?.email}
          squadraId={squadraId}
          eventoId={squadra.evento_id}
        />

        {/* Modal Segnalazione */}
        <SegnalazioneModal
          isOpen={showSegnalazione}
          onClose={() => setShowSegnalazione(false)}
          userEmail={user?.email}
          squadraId={squadraId}
          eventoId={squadra.evento_id}
        />
      </div>
    </div>
  );
}