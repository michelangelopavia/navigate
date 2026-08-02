import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Trophy, HelpCircle, UserPlus, AlertTriangle, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotifichePanel({ notifiche, onSegnaLetta, onChiudiTutte }) {
  const getIcona = (tipo) => {
    switch(tipo) {
      case 'tappa_superata': return <CheckCircle className="w-5 h-5" />;
      case 'gioco_completato': return <Trophy className="w-5 h-5" />;
      case 'richiesta_aiuto': return <HelpCircle className="w-5 h-5" />;
      case 'nuova_iscrizione': return <UserPlus className="w-5 h-5" />;
      case 'segnalazione': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getVariante = (tipo) => {
    switch(tipo) {
      case 'tappa_superata': return 'glass-success';
      case 'gioco_completato': return 'glass-warning';
      case 'richiesta_aiuto': return 'glass';
      case 'nuova_iscrizione': return 'glass-accent';
      case 'segnalazione': return 'glass-danger';
      default: return 'glass';
    }
  };

  const nonLette = notifiche.filter(n => !n.letta);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notifiche
            {nonLette.length > 0 && (
              <span className="glass-danger rounded-full px-2 py-0.5 text-xs font-bold">{nonLette.length}</span>
            )}
          </h2>
          {nonLette.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onChiudiTutte}
              className="rounded-full"
            >
              <Check className="w-4 h-4 mr-1" />
              Segna tutte lette
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {notifiche.length === 0 ? (
            <div className="p-8 text-center opacity-60">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nessuna notifica</p>
            </div>
          ) : (
            notifiche.map((notifica) => (
              <motion.div
                key={notifica.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass rounded-xl p-3 ${notifica.letta ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${getVariante(notifica.tipo)}`}>
                    {getIcona(notifica.tipo)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {notifica.messaggio}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {(notifica.createdAt || notifica.created_at)
                        ? format(new Date(notifica.createdAt || notifica.created_at), 'dd MMM HH:mm', { locale: it })
                        : '—'}
                    </p>
                  </div>
                  {!notifica.letta && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onSegnaLetta(notifica.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}