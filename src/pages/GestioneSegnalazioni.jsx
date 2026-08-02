import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, ArrowLeft, Trash2, Loader2, Users, Mail, CheckCircle
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
import Header from '@/components/Header';

export default function GestioneSegnalazioni() {
  const queryClient = useQueryClient();
  const [segnalazioneDelete, setSegnalazioneDelete] = useState(null);
  const [note, setNote] = useState({});

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

  const risolviMutation = useMutation({
    mutationFn: ({ id, note_admin }) =>
      base44.entities.Segnalazione.update(id, { risolta: true, note_admin }),
    onSuccess: () => {
      queryClient.invalidateQueries(['segnalazioni']);
      toast.success('Segnalazione segnata come risolta');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nell\'aggiornamento');
    },
  });

  const segnalazioniAttive = segnalazioni.filter((s) => !s.risolta);
  const segnalazioniRisolte = segnalazioni.filter((s) => s.risolta);

  const getSquadraNome = (squadraId) => {
    if (!squadraId) return null;
    const squadra = squadre.find((s) => s.id === squadraId);
    return squadra?.nome_squadra || null;
  };

  return (
    <div className="min-h-screen bg-liquid-page">
      <Header />
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon" className="glass rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Segnalazioni</h1>
            <p className="opacity-70 text-sm">Segnalazioni ricevute dai giocatori</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin opacity-50" />
          </div>
        ) : segnalazioni.length === 0 ? (
          <div className="glass rounded-2xl text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="opacity-70">Nessuna segnalazione</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                Attive ({segnalazioniAttive.length})
              </h2>

              {segnalazioniAttive.length === 0 ? (
                <div className="glass rounded-2xl text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="opacity-70">Nessuna segnalazione in attesa</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {segnalazioniAttive.map((s, index) => {
                    const squadraNome = getSquadraNome(s.squadra_id);
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="glass rounded-2xl p-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {squadraNome && (
                                  <span className="text-xs font-medium px-3 py-1 rounded-full glass-accent inline-flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {squadraNome}
                                  </span>
                                )}
                                {s.user_email && (
                                  <span className="text-xs font-medium px-3 py-1 rounded-full glass inline-flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {s.user_email}
                                  </span>
                                )}
                              </div>
                              <p className="mb-2">{s.descrizione}</p>
                              <p className="text-xs opacity-60">
                                {(s.createdAt || s.created_at)
                                  ? format(new Date(s.createdAt || s.created_at), 'dd MMM yyyy HH:mm', { locale: it })
                                  : '—'}
                              </p>
                            </div>
                            <div className="md:w-64 flex flex-col gap-2">
                              <Textarea
                                placeholder="Nota interna (opzionale)..."
                                value={note[s.id] || ''}
                                onChange={(e) => setNote({ ...note, [s.id]: e.target.value })}
                                rows={2}
                              />
                              <Button
                                onClick={() => risolviMutation.mutate({ id: s.id, note_admin: note[s.id] })}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="glass-danger rounded-full"
                                onClick={() => setSegnalazioneDelete(s)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Elimina
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {segnalazioniRisolte.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Risolte ({segnalazioniRisolte.length})
                </h2>

                <div className="space-y-3">
                  {segnalazioniRisolte.map((s) => {
                    const squadraNome = getSquadraNome(s.squadra_id);
                    return (
                      <div key={s.id} className="glass rounded-xl p-4 opacity-75">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {squadraNome && <span className="font-medium">{squadraNome}</span>}
                              <span className="text-xs font-medium px-3 py-1 rounded-full glass-success">Risolta</span>
                            </div>
                            <p className="text-sm opacity-70">{s.descrizione}</p>
                            {s.note_admin && (
                              <p className="text-sm opacity-70 mt-2 pl-4 border-l-2 border-border">
                                {s.note_admin}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="glass-danger rounded-full shrink-0"
                            onClick={() => setSegnalazioneDelete(s)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <AlertDialog open={!!segnalazioneDelete} onOpenChange={() => setSegnalazioneDelete(null)}>
          <AlertDialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questa segnalazione?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="glass rounded-full">Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(segnalazioneDelete.id)}
                className="glass-danger rounded-full"
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
