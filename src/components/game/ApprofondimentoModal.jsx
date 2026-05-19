import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  squadraId
}) {
  const saltata = tappa?.saltata || false;
  const [showSegnalazione, setShowSegnalazione] = useState(false);
  React.useEffect(() => {
    if (isOpen && !saltata) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1f7a8c', '#FFD800', '#053c5e']
      });
    }
  }, [isOpen, saltata]);

  if (!tappa) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${saltata ? 'text-gray-600' : 'text-green-600'}`}>
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
            <Badge className={`${saltata ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'} text-lg px-4 py-2`}>
              {saltata ? '📍' : '✓'} {tappa.risposta_corretta}
            </Badge>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
            <p className="text-sm text-green-700">
              ⏱️ Il tempo dedicato a questa schermata <strong>non conta</strong> nel tempo totale di gioco!
            </p>
          </div>

          {tappa.approfondimento && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📚 Scopri di più</h4>
              <p className="text-gray-700">{tappa.approfondimento}</p>
            </div>
          )}

          {tappa.associazione && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">{tappa.associazione}</h4>
              </div>
              {tappa.link_associazione && (
                <a 
                  href={tappa.link_associazione}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-600 hover:underline"
                >
                  Visita il sito <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <Button 
            onClick={onProsegui}
            className="w-full bg-[#1f7a8c] hover:bg-[#053c5e] text-lg py-6"
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
            className="w-full text-gray-400 hover:text-[#db222a]"
            >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Segnala un problema
            </Button>
            </motion.div>
            </DialogContent>
            </Dialog>

            <SegnalazioneModal
              isOpen={showSegnalazione}
              onClose={() => setShowSegnalazione(false)}
              userEmail={userEmail}
              squadraId={squadraId}
            />
            </>
            );
            }