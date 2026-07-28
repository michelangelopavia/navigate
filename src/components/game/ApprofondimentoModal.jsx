import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowRight, ExternalLink, Building, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import SegnalazioneModal from '@/components/SegnalazioneModal';

export default function ApprofondimentoModal({
  isOpen,
  onClose,
  tappa,
  numeroTappa,
  onProsegui,
  userEmail,
  squadraId,
  eventoId
}) {
  const saltata = tappa?.saltata || false;
  const [showSegnalazione, setShowSegnalazione] = useState(false);
  React.useEffect(() => {
    if (isOpen && !saltata) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e07b39', '#111111', '#ffffff']
      });
    }
  }, [isOpen, saltata]);

  if (!tappa) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-w-lg mx-auto max-h-[90vh] overflow-hidden p-0">
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {saltata ? '📍' : <PartyPopper className="w-6 h-6" />}
            {saltata ? `Tappa ${numeroTappa} - Ecco la Soluzione` : `Tappa ${numeroTappa} Completata!`}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-2"
        >
          <div className="text-center py-4">
            <span className={`inline-block text-lg px-4 py-2 rounded-full ${saltata ? 'glass-muted' : 'glass-success'}`}>
              {saltata ? '📍' : '✓'} {tappa.risposta_corretta}
            </span>
          </div>

          <div className="border border-border rounded-2xl p-3 text-center">
            <p className="text-sm opacity-80">
              ⏱️ Il tempo dedicato a questa schermata <strong>non conta</strong> nel tempo totale di gioco!
            </p>
          </div>

          {tappa.approfondimento && (
            <div className="border border-border rounded-2xl p-4">
              <h4 className="font-semibold mb-2">📚 Scopri di più</h4>
              <p className="opacity-80">{tappa.approfondimento}</p>
            </div>
          )}

          {tappa.associazione && (
            <div className="border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-accent" />
                <h4 className="font-semibold">{tappa.associazione}</h4>
              </div>
              {tappa.link_associazione && (
                <a
                  href={tappa.link_associazione}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Visita il sito <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <Button
            onClick={onProsegui}
            variant="ghost"
            className="w-full glass-dark rounded-full text-lg py-6"
          >
            {numeroTappa < 10 ? (
              <>
                Vai alla Tappa {numeroTappa + 1}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Vedi Risultato Finale 🏆'
            )}
            </Button>

            <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSegnalazione(true)}
            className="w-full opacity-60 hover:opacity-100"
            >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Segnala un problema
            </Button>
            </motion.div>
            </div>
            </DialogContent>
            </Dialog>

            <SegnalazioneModal
              isOpen={showSegnalazione}
              onClose={() => setShowSegnalazione(false)}
              userEmail={userEmail}
              squadraId={squadraId}
              eventoId={eventoId}
            />
            </>
            );
            }
