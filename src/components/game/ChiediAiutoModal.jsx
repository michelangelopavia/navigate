import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Send, Loader2 } from 'lucide-react';

export default function ChiediAiutoModal({ 
  isOpen, 
  onClose, 
  onInvia,
  isLoading 
}) {
  const [messaggio, setMessaggio] = useState('');
  const [inviato, setInviato] = useState(false);

  const handleInvia = async () => {
    await onInvia(messaggio);
    setInviato(true);
    setMessaggio('');
  };

  const handleClose = () => {
    setInviato(false);
    setMessaggio('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <HelpCircle className="w-6 h-6" />
            Chiedi Aiuto
          </DialogTitle>
        </DialogHeader>

        {!inviato ? (
          <>
            <div className="space-y-4 py-4">
              <p className="text-gray-600">
                Sei bloccato? La regia riceverà una notifica e ti aiuterà!
              </p>
              <Textarea
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                placeholder="Scrivi un messaggio opzionale per la regia..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annulla
              </Button>
              <Button 
                onClick={handleInvia}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
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
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Richiesta Inviata!
            </h3>
            <p className="text-gray-600">
              La regia è stata avvisata e ti aiuterà presto.
            </p>
            <Button 
              onClick={handleClose}
              className="mt-4"
              variant="outline"
            >
              Chiudi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}