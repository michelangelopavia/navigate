import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
        colors: ['#1f7a8c', '#FFD800', '#053c5e']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1f7a8c', '#FFD800', '#053c5e']
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
    <Card className="max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#FFD800]">
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#053c5e] p-8 text-center text-white">
        <Trophy className="w-20 h-20 mx-auto mb-4 text-[#FFD800]" />
        <h1 className="text-3xl font-bold mb-2">Complimenti!</h1>
        <p className="text-lg opacity-90">Hai completato la caccia al tesoro</p>
      </div>
      
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-gray-500">Squadra</p>
          <p className="text-2xl font-bold text-[#053c5e]">{squadra.nome_squadra}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-[#FFD800]/20 p-4 rounded-xl">
            <Star className="w-6 h-6 mx-auto mb-2 text-[#FFD800]" />
            <p className="text-2xl font-bold text-[#053c5e]">{punteggio}</p>
            <p className="text-xs text-gray-500">Punti</p>
          </div>
          
          <div className="bg-[#1f7a8c]/10 p-4 rounded-xl">
            <Clock className="w-6 h-6 mx-auto mb-2 text-[#1f7a8c]" />
            <p className="text-lg font-bold text-[#053c5e]">{formatTempo(tempoTotale)}</p>
            <p className="text-xs text-gray-500">Tempo</p>
          </div>
          
          <div className="bg-[#053c5e]/10 p-4 rounded-xl">
            <Users className="w-6 h-6 mx-auto mb-2 text-[#053c5e]" />
            <p className="text-2xl font-bold text-[#053c5e]">{numGiocatori}</p>
            <p className="text-xs text-gray-500">Giocatori</p>
          </div>
        </div>

        {/* Riepilogo tappe */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium">Tappe completate:</span> {(squadra.tappa_corrente ?? 10) - (squadra.tappe_saltate?.length || 0)}/10
            {squadra.aiuti_usati?.length > 0 && (
              <span className="ml-2">• <span className="text-[#FFD800]">{squadra.aiuti_usati.length} aiuti usati</span></span>
            )}
            {squadra.tappe_saltate?.length > 0 && (
              <span className="ml-2">• <span className="text-red-500">{squadra.tappe_saltate.length} saltate</span></span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <Link to={createPageUrl('Classifiche')} className="block">
            <Button className="w-full bg-[#FFD800] hover:bg-[#FFD800]/80 text-[#053c5e]">
              <Trophy className="w-4 h-4 mr-2" />
              Vedi Classifica
            </Button>
          </Link>
          <Link to={createPageUrl('Home')} className="block">
            <Button variant="outline" className="w-full border-[#1f7a8c] text-[#1f7a8c]">
              <Home className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}