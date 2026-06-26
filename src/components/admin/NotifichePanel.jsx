import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Trophy, HelpCircle, UserPlus, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotifichePanel({ notifiche, onSegnaLetta, onChiudiTutte }) {
  const getIcona = (tipo) => {
    switch(tipo) {
      case 'tappa_superata': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'gioco_completato': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'richiesta_aiuto': return <HelpCircle className="w-5 h-5 text-blue-500" />;
      case 'nuova_iscrizione': return <UserPlus className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getColore = (tipo) => {
    switch(tipo) {
      case 'tappa_superata': return 'border-l-green-500 bg-green-50';
      case 'gioco_completato': return 'border-l-yellow-500 bg-yellow-50';
      case 'richiesta_aiuto': return 'border-l-blue-500 bg-blue-50';
      case 'nuova_iscrizione': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const nonLette = notifiche.filter(n => !n.letta);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Notifiche
            {nonLette.length > 0 && (
              <Badge className="bg-red-500">{nonLette.length}</Badge>
            )}
          </CardTitle>
          {nonLette.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onChiudiTutte}
            >
              <Check className="w-4 h-4 mr-1" />
              Segna tutte lette
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {notifiche.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
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
                className={`border-l-4 p-4 ${getColore(notifica.tipo)} ${notifica.letta ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {getIcona(notifica.tipo)}
                  <div className="flex-1">
                    <p className={`text-sm ${notifica.letta ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notifica.messaggio}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(notifica.created_at), 'dd MMM HH:mm', { locale: it })}
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
      </CardContent>
    </Card>
  );
}