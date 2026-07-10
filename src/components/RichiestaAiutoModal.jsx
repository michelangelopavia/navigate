import React, { useState } from "react";
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Send, Loader2, CheckCircle } from "lucide-react";

export default function RichiestaAiutoModal({ isOpen, onClose, squadraId, tappaNumero }) {
  const [messaggio, setMessaggio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviata, setInviata] = useState(false);

  const handleInvia = async () => {
    if (!messaggio.trim()) return;

    setIsLoading(true);

    await base44.entities.RichiestaAiuto.create({
      messaggio: messaggio.trim(),
      squadra_id: squadraId,
      tappa_numero: tappaNumero,
    });

    setIsLoading(false);
    setInviata(true);
  };

  const handleClose = () => {
    setMessaggio('');
    setInviata(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1f7a8c]">
            <HelpCircle className="w-5 h-5" />
            Richiedi Aiuto
          </DialogTitle>
        </DialogHeader>

        {inviata ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Richiesta inviata!</h3>
            <p className="text-gray-600">Un organizzatore ti risponderà il prima possibile.</p>
            <Button onClick={handleClose} className="mt-4 bg-[#1f7a8c]">
              Chiudi
            </Button>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Sei bloccato su questa tappa? Descrivi il problema e un organizzatore ti aiuterà.
              </p>
              <Textarea
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                placeholder="Descrivi di cosa hai bisogno..."
                rows={4}
                className="border-[#1f7a8c]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annulla
              </Button>
              <Button
                onClick={handleInvia}
                disabled={isLoading || !messaggio.trim()}
                className="bg-[#1f7a8c] hover:bg-[#022b3a]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Richiesta
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
