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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-[#022b3a]">
            Come si gioca
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 pr-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#bfdbf7] rounded-lg">
              <Star className="w-5 h-5 text-[#1f7a8c]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">10 Tappe da completare</p>
              <p className="text-sm text-gray-600">Risolvi gli indovinelli per scoprire i luoghi nascosti</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Sistema Punteggio</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-green-600">10 punti</span> per ogni risposta corretta<br />
                <span className="font-medium text-red-600">-2 punti</span> per ogni risposta sbagliata
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#1f7a8c]/10 rounded-lg">
              <Star className="w-5 h-5 text-[#1f7a8c]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Attenzione alla Lettura!</p>
              <p className="text-sm text-gray-600">
                Leggi con attenzione ogni indovinello. Le risposte sbagliate tolgono punti!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#e1e5f2] rounded-lg">
              <Lightbulb className="w-5 h-5 text-[#022b3a]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Aiuto disponibile</p>
              <p className="text-sm text-gray-600">
                Usa il suggerimento ma guadagnerai solo <span className="font-medium text-[#1f7a8c]">5 punti</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#db222a]/10 rounded-lg">
              <SkipForward className="w-5 h-5 text-[#db222a]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Salta la domanda</p>
              <p className="text-sm text-gray-600">
                Dopo 15 minuti puoi saltare, ma otterrai <span className="font-medium text-[#db222a]">0 punti</span>
              </p>
            </div>
          </div>

          {!isEvento && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#022b3a]/10 rounded-lg">
                <Timer className="w-5 h-5 text-[#022b3a]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Finestra di Gioco</p>
                <p className="text-sm text-gray-600">
                  Hai <span className="font-medium text-[#022b3a]">12 ore</span> per completare tutte le tappe (incluse pause e letture)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#bfdbf7] rounded-lg">
              <Clock className="w-5 h-5 text-[#1f7a8c]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Tempo di Gioco</p>
              <p className="text-sm text-gray-600">
                Viene conteggiato solo il tempo tra domanda e risposta. Il tempo dedicato agli approfondimenti non conta!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#bfdbf7] rounded-lg">
              <Trophy className="w-5 h-5 text-[#FFD800]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Classifica</p>
              <p className="text-sm text-gray-600">
                Vince chi ha più punti. A parità, chi impiega meno tempo effettivo!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Problemi tecnici?</p>
              <p className="text-sm text-gray-600">
                Puoi segnalare malfunzionamenti in qualsiasi momento tramite il pulsante a fondo pagina
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onStart}
            className="w-full bg-[#1f7a8c] hover:bg-[#022b3a] text-lg py-6"
          >
            Ho capito, inizia!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}