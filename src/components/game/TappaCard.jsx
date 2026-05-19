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

  // Funzione per normalizzare le stringhe
  const normalizza = (str) => {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // rimuove accenti
      .replace(/[^a-z0-9\s]/g, '') // rimuove punteggiatura
      .replace(/\s+/g, ' '); // normalizza spazi
  };

  // Calcola distanza di Levenshtein per fuzzy matching
  const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  };

  // Verifica se la risposta è accettabile
  const verificaRisposta = (input) => {
    const inputNorm = normalizza(input);
    
    // Tutte le risposte accettate (italiana + inglese)
    const risposteAccettate = [
      tappa.risposta_corretta,
      ...(tappa.risposte_alternative || []),
      ...(language === 'en' ? [tappa.risposta_corretta_en, ...(tappa.risposte_alternative_en || [])] : [])
    ].filter(Boolean);

    for (const risposta of risposteAccettate) {
      const rispostaNorm = normalizza(risposta);
      
      // Match esatto dopo normalizzazione
      if (inputNorm === rispostaNorm) return true;
      
      // Fuzzy match: tollera 1-2 errori in base alla lunghezza
      const maxErrori = rispostaNorm.length <= 4 ? 1 : 2;
      if (levenshtein(inputNorm, rispostaNorm) <= maxErrori) return true;
    }
    
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!risposta.trim()) return;

    if (verificaRisposta(risposta)) {
      onRispostaCorretta();
    } else {
      setErrore(true);
      setTentativi(t => t + 1);
      onRispostaSbagliata?.();
      setTimeout(() => setErrore(false), 500);
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
              disabled={isLoading}
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
              disabled={isLoading || !risposta.trim()}
            >
              {isLoading ? (
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