import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Send, Loader2, SkipForward, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";

export default function TappaCard({
  tappa,
  numeroTappa,
  onRispostaCorretta,
  onRispostaSbagliata,
  onUsaAiuto,
  onSalta,
  aiutoUsato,
  tempoInizioTappa,
  isLoading
}) {
  const { t, getLocalized, language } = useLanguage();
  const [risposta, setRisposta] = useState('');
  const [errore, setErrore] = useState(false);
  const [tentativi, setTentativi] = useState(0);
  const [mostraSuggerimento, setMostraSuggerimento] = useState(false);
  const [tempoTrascorso, setTempoTrascorso] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const TEMPO_SALTA = 15 * 60; // 15 minuti in secondi

  // Reset stati quando cambia la tappa
  useEffect(() => {
    setRisposta('');
    setErrore(false);
    setTentativi(0);
    setMostraSuggerimento(aiutoUsato); // Mostra solo se già usato in questa tappa
    setTempoTrascorso(0);
  }, [numeroTappa]);

  useEffect(() => {
    if (!tempoInizioTappa) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - tempoInizioTappa) / 1000);
      setTempoTrascorso(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoInizioTappa]);

  const puoSaltare = tempoTrascorso >= TEMPO_SALTA;
  const tempoRimanenteSalta = Math.max(0, TEMPO_SALTA - tempoTrascorso);

  const formatTempoRimanente = (secondi) => {
    const min = Math.floor(secondi / 60);
    const sec = secondi % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!risposta.trim() || isVerifying) return;

    setIsVerifying(true);
    try {
      const token = localStorage.getItem('navigate_token');
      const res = await fetch(`/api/tappe/${tappa.id}/verify-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ risposta }),
      });
      const { correct } = await res.json();

      if (correct) {
        onRispostaCorretta();
      } else {
        setErrore(true);
        setTentativi(t => t + 1);
        onRispostaSbagliata?.();
        setTimeout(() => setErrore(false), 500);
      }
    } catch {
      setErrore(true);
      setTimeout(() => setErrore(false), 500);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUsaAiuto = () => {
    setMostraSuggerimento(true);
    onUsaAiuto();
  };

  const getDifficoltaColor = (diff) => {
    switch(diff) {
      case 'facile': return 'bg-green-100 text-green-700 border-green-300';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'difficile': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={errore ? 'animate-shake' : ''}
    >
      <Card className="overflow-hidden shadow-lg border-2 border-[#022b3a]/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{t('stage')} {numeroTappa}/10</span>
            <div className="flex items-center gap-2">
              <Badge className={getDifficoltaColor(tappa.difficolta)}>
                {tappa.difficolta}
              </Badge>
              <Badge className={`${aiutoUsato ? 'bg-yellow-500' : 'bg-white text-[#022b3a]'}`}>
                {aiutoUsato ? '5 pt' : '10 pt'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Immagine */}
        {tappa.immagine_url && (
          <img
            src={tappa.immagine_url}
            alt={getLocalized(tappa, 'titolo')}
            className="w-full h-48 object-cover"
          />
        )}

        <CardContent className="p-6 space-y-4">
          {/* Indovinello */}
          <div className="bg-[#bfdbf7]/30 p-4 rounded-lg border border-[#022b3a]/10">
            <p className="text-lg text-gray-800 font-medium leading-relaxed">
              {getLocalized(tappa, 'indovinello') || tappa.indovinello || 'Indovinello non disponibile'}
            </p>
          </div>

          {/* Suggerimento (se usato) */}
          {mostraSuggerimento && (tappa.suggerimento || tappa.suggerimento_en) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#FFD800]/20 p-4 rounded-lg border border-[#FFD800]"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-[#FFD800] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">{t('hint')}:</p>
                  <p className="text-gray-700">{getLocalized(tappa, 'suggerimento')}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form risposta */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={risposta}
              onChange={(e) => setRisposta(e.target.value)}
              placeholder={t('yourAnswer')}
              className={`text-lg py-6 ${errore ? 'border-red-500 bg-red-50' : 'border-[#1f7a8c]'}`}
              disabled={isLoading || isVerifying}
            />

            {tentativi > 0 && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {t('wrong')}. {language === 'it' ? 'Tentativi' : 'Attempts'}: {tentativi}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#1f7a8c] hover:bg-[#022b3a] text-lg py-6"
              disabled={isLoading || isVerifying || !risposta.trim()}
            >
              {isLoading || isVerifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t('submit')}
                </>
              )}
            </Button>
          </form>

          {/* Azioni: Aiuto e Salta */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Bottone Aiuto */}
            {!aiutoUsato && !mostraSuggerimento && (tappa.suggerimento || tappa.suggerimento_en) && (
              <Button
                variant="outline"
                onClick={handleUsaAiuto}
                className="flex-1 border-[#FFD800] text-[#022b3a] hover:bg-[#FFD800]/20"
              >
                <Lightbulb className="w-4 h-4 mr-2 text-[#FFD800]" />
                {t('useHint')} (-5 pt)
              </Button>
            )}

            {/* Bottone Salta */}
            <Button
              variant="outline"
              onClick={onSalta}
              disabled={!puoSaltare || isLoading}
              className={`flex-1 ${puoSaltare
                ? 'border-[#db222a] text-[#db222a] hover:bg-[#db222a]/10'
                : 'border-gray-300 text-gray-400'}`}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              {puoSaltare ? (
                `${t('skip')} (0 pt)`
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTempoRimanente(tempoRimanenteSalta)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
