import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  HelpCircle, ArrowLeft, CheckCircle, Clock, MapPin, User,
  MessageSquare, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header';

export default function GestioneRichieste() {
  const queryClient = useQueryClient();
  const [risposte, setRisposte] = React.useState({});

  const { data: richieste = [], isLoading } = useQuery({
    queryKey: ['richieste-aiuto-tutte'],
    queryFn: () => base44.entities.RichiestaAiuto.list('-created_date'),
    refetchInterval: 5000
  });

  const risolviMutation = useMutation({
    mutationFn: async ({ id, risposta }) => {
      return base44.entities.RichiestaAiuto.update(id, {
        risolta: true,
        risposta
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['richieste-aiuto-tutte']);
      toast.success('Richiesta segnata come risolta');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nell\'aggiornamento della richiesta');
    }
  });

  const richiesteAttive = richieste.filter(r => !r.risolta);
  const richiesteRisolte = richieste.filter(r => r.risolta);

  return (
    <div className="min-h-screen bg-liquid-page">
      <Header />
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon" className="glass rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Richieste di Aiuto</h1>
            <p className="opacity-70 text-sm">Supporta le squadre in difficoltà</p>
          </div>
        </div>

        {/* Richieste Attive */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            Richieste Attive ({richiesteAttive.length})
          </h2>

          {richiesteAttive.length === 0 ? (
            <div className="glass rounded-2xl text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="opacity-70">Nessuna richiesta in attesa</p>
            </div>
          ) : (
            <div className="space-y-4">
              {richiesteAttive.map((richiesta, index) => (
                <motion.div
                  key={richiesta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="glass rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User className="w-4 h-4 text-accent" />
                          <span className="font-bold">{richiesta.squadra_nome}</span>
                          <span className="text-xs font-medium px-3 py-1 rounded-full glass-accent inline-flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Tappa {richiesta.tappa_numero + 1}
                          </span>
                        </div>
                        {richiesta.tappa_titolo && (
                          <p className="text-sm opacity-70 mb-2">
                            Luogo: {richiesta.tappa_titolo}
                          </p>
                        )}
                        {richiesta.messaggio && (
                          <div className="glass rounded-xl p-3 mb-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 opacity-60 mt-0.5" />
                              <p className="text-sm opacity-80">{richiesta.messaggio}</p>
                            </div>
                          </div>
                        )}
                        <p className="text-xs opacity-60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(richiesta.createdAt || richiesta.created_at)
                            ? format(new Date(richiesta.createdAt || richiesta.created_at), 'dd MMM HH:mm', { locale: it })
                            : '—'}
                        </p>
                      </div>
                      <div className="md:w-64">
                        <Textarea
                          placeholder="Scrivi una risposta (opzionale)..."
                          value={risposte[richiesta.id] || ''}
                          onChange={(e) => setRisposte({ ...risposte, [richiesta.id]: e.target.value })}
                          rows={2}
                          className="mb-2"
                        />
                        <Button
                          onClick={() => risolviMutation.mutate({
                            id: richiesta.id,
                            risposta: risposte[richiesta.id]
                          })}
                          variant="ghost"
                          className="w-full glass-success rounded-full"
                          disabled={risolviMutation.isPending}
                        >
                          {risolviMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Segna come Risolta
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Richieste Risolte */}
        {richiesteRisolte.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 opacity-60" />
              Richieste Risolte ({richiesteRisolte.length})
            </h2>

            <div className="space-y-3">
              {richiesteRisolte.slice(0, 10).map((richiesta) => (
                <div key={richiesta.id} className="glass rounded-xl p-4 opacity-75">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-medium">{richiesta.squadra_nome}</span>
                      <span className="opacity-50 mx-2">•</span>
                      <span className="text-sm opacity-70">Tappa {richiesta.tappa_numero + 1}</span>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full glass-success">Risolta</span>
                  </div>
                  {richiesta.risposta && (
                    <p className="text-sm opacity-70 mt-2 pl-4 border-l-2 border-border">
                      {richiesta.risposta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}