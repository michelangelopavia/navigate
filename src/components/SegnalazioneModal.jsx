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

export default function SegnalazioneModal({ isOpen, onClose, userEmail, squadraId, eventoId }) {
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

    // Invia email ai gestori dell'evento, se la segnalazione è legata a un evento
    if (eventoId) {
      const eventi = await base44.entities.Evento.filter({ id: eventoId });
      const evento = eventi[0];
      if (evento?.email_gestori?.length > 0) {
        for (const emailGestore of evento.email_gestori) {
          try {
            await base44.integrations.Core.SendEmail({
              to: emailGestore,
              subject: '🚨 Segnalazione malfunzionamento - NAVIGATE',
              body: `
Nuova segnalazione di malfunzionamento:

Messaggio: ${messaggio}

Dettagli:
- Email utente: ${userEmail || 'Non loggato'}
- Squadra ID: ${squadraId || 'N/A'}
- Pagina: ${window.location.href}
- Data: ${new Date().toLocaleString('it-IT')}
              `
            });
          } catch (e) {
            console.error('Errore invio email:', e);
          }
        }
      }
    }

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
          <DialogTitle className="flex items-center gap-2 text-[#db222a]">
            <AlertTriangle className="w-5 h-5" />
            Segnala un problema
          </DialogTitle>
        </DialogHeader>
        
        {inviata ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Segnalazione inviata!</h3>
            <p className="text-gray-600">Grazie per la tua segnalazione. Risolveremo il problema il prima possibile.</p>
            <Button onClick={handleClose} className="mt-4 bg-[#1f7a8c]">
              Chiudi
            </Button>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Hai riscontrato un problema tecnico? Descrivilo qui sotto e lo risolveremo il prima possibile.
              </p>
              <Textarea
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                placeholder="Descrivi il problema riscontrato..."
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
                className="bg-[#db222a] hover:bg-[#aa0000]"
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