import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Lightbulb, SkipForward, Clock, Star, Timer, AlertTriangle } from "lucide-react";

export default function RegoleModal({ isOpen, onClose, onStart, isEvento = false }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-w-md max-h-[90vh] overflow-hidden p-0">
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Come si gioca
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 pr-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-accent flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">10 Tappe da completare</p>
              <p className="text-sm opacity-70">Risolvi gli indovinelli per scoprire i luoghi nascosti</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-success flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Sistema Punteggio</p>
              <p className="text-sm opacity-70">
                <span className="font-medium">10 punti</span> per ogni risposta corretta<br />
                <span className="font-medium">-2 punti</span> per ogni risposta sbagliata
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-muted flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Attenzione alla Lettura!</p>
              <p className="text-sm opacity-70">
                Leggi con attenzione ogni indovinello. Le risposte sbagliate tolgono punti!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-warning flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Aiuto disponibile</p>
              <p className="text-sm opacity-70">
                Usa il suggerimento ma guadagnerai solo <span className="font-medium">5 punti</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-danger flex items-center justify-center flex-shrink-0">
              <SkipForward className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Salta la domanda</p>
              <p className="text-sm opacity-70">
                Dopo 15 minuti puoi saltare, ma otterrai <span className="font-medium">0 punti</span>
              </p>
            </div>
          </div>

          {!isEvento && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg glass-muted flex items-center justify-center flex-shrink-0">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Finestra di Gioco</p>
                <p className="text-sm opacity-70">
                  Hai <span className="font-medium">12 ore</span> per completare tutte le tappe (incluse pause e letture)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-accent flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Tempo di Gioco</p>
              <p className="text-sm opacity-70">
                Viene conteggiato solo il tempo tra domanda e risposta. Il tempo dedicato agli approfondimenti non conta!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-accent flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Classifica</p>
              <p className="text-sm opacity-70">
                Vince chi ha più punti. A parità, chi impiega meno tempo effettivo!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg glass-warning flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Problemi tecnici?</p>
              <p className="text-sm opacity-70">
                Puoi segnalare malfunzionamenti in qualsiasi momento tramite il pulsante a fondo pagina
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onStart}
            variant="ghost"
            className="w-full glass-dark rounded-full text-lg py-6"
          >
            Ho capito, inizia!
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
