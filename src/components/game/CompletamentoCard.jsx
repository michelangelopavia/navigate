import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, Star, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import confetti from 'canvas-confetti';

export default function CompletamentoCard({ squadra, tempoTotale }) {
  useEffect(() => {
    // Celebrazione con confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e07b39', '#111111', '#ffffff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e07b39', '#111111', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

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

  const calcolaPunteggio = () => {
    let punti = 0;
    const tappeGiocate = squadra.tappa_corrente ?? 10;
    for (let i = 0; i < tappeGiocate; i++) {
      if (squadra.tappe_saltate?.includes(i)) {
        punti += 0;
      } else if (squadra.aiuti_usati?.includes(i)) {
        punti += 5;
      } else {
        punti += 10;
      }
    }
    return punti;
  };

  const punteggio = squadra.punteggio ?? calcolaPunteggio();
  const numGiocatori = 1 + (squadra.altri_giocatori?.length || 0);

  return (
    <div className="glass rounded-[28px] max-w-md w-full overflow-hidden">
      <div className="glass-tappa p-8 text-center">
        <Trophy className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Complimenti!</h1>
        <p className="text-lg opacity-90">Hai completato la caccia al tesoro</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm opacity-60">Squadra</p>
          <p className="text-2xl font-bold">{squadra.nome_squadra}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="glass-accent p-4 rounded-2xl">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{punteggio}</p>
            <p className="text-xs opacity-80">Punti</p>
          </div>

          <div className="border border-border p-4 rounded-2xl">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <p className="text-lg font-bold">{formatTempo(tempoTotale)}</p>
            <p className="text-xs opacity-60">Tempo</p>
          </div>

          <div className="border border-border p-4 rounded-2xl">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{numGiocatori}</p>
            <p className="text-xs opacity-60">Giocatori</p>
          </div>
        </div>

        {/* Riepilogo tappe */}
        <div className="border border-border p-4 rounded-2xl">
          <p className="text-sm text-center opacity-80">
            <span className="font-medium">Tappe completate:</span> {(squadra.tappa_corrente ?? 10) - (squadra.tappe_saltate?.length || 0)}/10
            {squadra.aiuti_usati?.length > 0 && (
              <span className="ml-2">• {squadra.aiuti_usati.length} aiuti usati</span>
            )}
            {squadra.tappe_saltate?.length > 0 && (
              <span className="ml-2">• {squadra.tappe_saltate.length} saltate</span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <Link to={createPageUrl('Classifiche')} className="block">
            <Button variant="ghost" className="w-full glass-tappa rounded-full">
              <Trophy className="w-4 h-4 mr-2" />
              Vedi Classifica
            </Button>
          </Link>
          <Link to={createPageUrl('Home')} className="block">
            <Button variant="ghost" className="w-full glass rounded-full">
              <Home className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
