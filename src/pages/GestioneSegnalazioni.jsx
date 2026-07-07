import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, ArrowLeft, Trash2, Loader2, Users, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export default function GestioneSegnalazioni() {
  const queryClient = useQueryClient();
  const [segnalazioneDelete, setSegnalazioneDelete] = useState(null);

  const { data: segnalazioni = [], isLoading } = useQuery({
    queryKey: ['segnalazioni'],
    queryFn: () => base44.entities.Segnalazione.list('-created_date'),
  });

  const { data: squadre = [] } = useQuery({
    queryKey: ['squadre'],
    queryFn: () => base44.entities.Squadra.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Segnalazione.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['segnalazioni']);
      setSegnalazioneDelete(null);
      toast.success('Segnalazione eliminata');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nell\'eliminazione');
    },
  });

  const getSquadraNome = (squadraId) => {
    if (!squadraId) return null;
    const squadra = squadre.find((s) => s.id === squadraId);
    return squadra?.nome_squadra || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Segnalazioni</h1>
            <p className="text-gray-500 text-sm">Segnalazioni ricevute dai giocatori</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : segnalazioni.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nessuna segnalazione</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {segnalazioni.map((s, index) => {
              const squadraNome = getSquadraNome(s.squadra_id);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {squadraNome && (
                              <Badge className="bg-orange-100 text-orange-700">
                                <Users className="w-3 h-3 mr-1" />
                                {squadraNome}
                              </Badge>
                            )}
                            {s.user_email && (
                              <Badge variant="outline">
                                <Mail className="w-3 h-3 mr-1" />
                                {s.user_email}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{s.descrizione}</p>
                          <p className="text-xs text-gray-400">
                            {(s.createdAt || s.created_at)
                              ? format(new Date(s.createdAt || s.created_at), 'dd MMM yyyy HH:mm', { locale: it })
                              : '—'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 shrink-0"
                          onClick={() => setSegnalazioneDelete(s)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!segnalazioneDelete} onOpenChange={() => setSegnalazioneDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questa segnalazione?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(segnalazioneDelete.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
