import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    }
  });

  const richiesteAttive = richieste.filter(r => !r.risolta);
  const richiesteRisolte = richieste.filter(r => r.risolta);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Richieste di Aiuto</h1>
            <p className="text-gray-500 text-sm">Supporta le squadre in difficoltà</p>
          </div>
        </div>

        {/* Richieste Attive */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Richieste Attive ({richiesteAttive.length})
          </h2>

          {richiesteAttive.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
                <p className="text-gray-500">Nessuna richiesta in attesa</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {richiesteAttive.map((richiesta, index) => (
                <motion.div
                  key={richiesta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-blue-800">{richiesta.squadra_nome}</span>
                            <Badge className="bg-orange-100 text-orange-700">
                              <MapPin className="w-3 h-3 mr-1" />
                              Tappa {richiesta.tappa_numero + 1}
                            </Badge>
                          </div>
                          {richiesta.tappa_titolo && (
                            <p className="text-sm text-gray-600 mb-2">
                              Luogo: {richiesta.tappa_titolo}
                            </p>
                          )}
                          {richiesta.messaggio && (
                            <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-700">{richiesta.messaggio}</p>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 flex items-center gap-1">
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
                            className="w-full bg-green-500 hover:bg-green-600"
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Richieste Risolte */}
        {richiesteRisolte.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Richieste Risolte ({richiesteRisolte.length})
            </h2>

            <div className="space-y-3">
              {richiesteRisolte.slice(0, 10).map((richiesta) => (
                <Card key={richiesta.id} className="bg-gray-50 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-700">{richiesta.squadra_nome}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-sm text-gray-500">Tappa {richiesta.tappa_numero + 1}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Risolta</Badge>
                    </div>
                    {richiesta.risposta && (
                      <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-green-300">
                        {richiesta.risposta}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}