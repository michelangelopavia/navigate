import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    setMostraSuggerimento(aiutoUsato);
    setTempoTrascorso(0);
  }, [numeroTappa]);

  // Ripristina il suggerimento se aiutoUsato arriva true dopo un remount
  useEffect(() => {
    if (aiutoUsato) setMostraSuggerimento(true);
  }, [aiutoUsato]);

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

  const getDifficoltaClass = (diff) => {
    switch (diff) {
      case 'facile': return 'glass-success';
      case 'media': return 'glass-warning';
      case 'difficile': return 'glass-danger';
      default: return 'glass-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={errore ? 'animate-shake' : ''}
    >
      <div className="glass rounded-[28px] overflow-hidden">
        {/* Header */}
        <div className="glass-tappa p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{t('stage')} {numeroTappa}/10</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium uppercase px-3 py-1 rounded-full ${getDifficoltaClass(tappa.difficolta)}`}>
                {tappa.difficolta}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${aiutoUsato ? 'glass-warning' : 'glass'}`}>
                {aiutoUsato ? '5 pt' : '10 pt'}
              </span>
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

        <div className="p-6 space-y-4">
          {/* Indovinello */}
          <div className="border border-border rounded-2xl p-4">
            <p className="text-lg font-medium leading-relaxed">
              {getLocalized(tappa, 'indovinello') || tappa.indovinello || 'Indovinello non disponibile'}
            </p>
          </div>

          {/* Suggerimento (se usato) */}
          {mostraSuggerimento && (tappa.suggerimento || tappa.suggerimento_en) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-warning rounded-2xl p-4"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">{t('hint')}:</p>
                  <p>{getLocalized(tappa, 'suggerimento')}</p>
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
              className={`text-lg py-6 rounded-xl ${errore ? 'border-destructive' : ''}`}
              disabled={isLoading || isVerifying}
            />

            {tentativi > 0 && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {t('wrong')}. {language === 'it' ? 'Tentativi' : 'Attempts'}: {tentativi}
              </p>
            )}

            <Button
              type="submit"
              variant="ghost"
              className="w-full glass-tappa rounded-full text-lg py-6"
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
                className="flex-1 rounded-full border-accent"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {t('useHint')} (-5 pt)
              </Button>
            )}

            {/* Bottone Salta */}
            <Button
              variant="ghost"
              onClick={onSalta}
              disabled={!puoSaltare || isLoading}
              className={`flex-1 rounded-full ${puoSaltare
                ? 'glass-danger'
                : 'border border-border opacity-50'}`}
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
        </div>
      </div>
    </motion.div>
  );
}
