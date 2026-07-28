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
import { AlertTriangle, Send, Loader2, CheckCircle } from "lucide-react";

export default function SegnalazioneModal({ isOpen, onClose, userEmail, squadraId }) {
  const [messaggio, setMessaggio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviata, setInviata] = useState(false);

  const handleInvia = async () => {
    if (!messaggio.trim()) return;

    setIsLoading(true);

    // Crea segnalazione
    await base44.entities.Segnalazione.create({
      descrizione: messaggio.trim(),
      user_email: userEmail || 'anonimo',
      squadra_id: squadraId || null
    });

    // L'email di segnalazione la invia il backend (POST /api/segnalazioni), a admin sede + super_admin

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
      <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Segnala un problema
          </DialogTitle>
        </DialogHeader>

        {inviata ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h3 className="text-lg font-bold mb-2">Segnalazione inviata!</h3>
            <p className="opacity-70">Grazie per la tua segnalazione. Risolveremo il problema il prima possibile.</p>
            <Button onClick={handleClose} variant="ghost" className="mt-4 glass-dark rounded-full">
              Chiudi
            </Button>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm opacity-70 mb-4">
                Hai riscontrato un problema tecnico? Descrivilo qui sotto e lo risolveremo il prima possibile.
              </p>
              <Textarea
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                placeholder="Descrivi il problema riscontrato..."
                rows={4}
                className="rounded-xl"
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleClose} className="glass rounded-full">
                Annulla
              </Button>
              <Button
                onClick={handleInvia}
                disabled={isLoading || !messaggio.trim()}
                variant="ghost"
                className="glass-danger rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Segnalazione
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
