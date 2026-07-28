import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  User, Trophy, Clock, MapPin, Calendar,
  Play, CheckCircle, Trash2, Users
} from 'lucide-react';
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
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

export default function Profilo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [squadraToDelete, setSquadraToDelete] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(window.location.href);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: mieSquadre = [] } = useQuery({
    queryKey: ['mie-squadre', user?.id],
    queryFn: () => base44.entities.Squadra.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.list()
  });

  const { data: eventi = [] } = useQuery({
    queryKey: ['eventi'],
    queryFn: () => base44.entities.Evento.list()
  });

  const deleteSquadraMutation = useMutation({
    mutationFn: (squadraId) => base44.entities.Squadra.delete(squadraId),
    onSuccess: () => {
      queryClient.invalidateQueries(['mie-squadre']);
    }
  });

  const formatTempo = (secondi) => {
    if (!secondi) return '--:--';
    const ore = Math.floor(secondi / 3600);
    const minuti = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;
    
    if (ore > 0) {
      return `${ore}h ${minuti}m ${sec}s`;
    }
    return `${minuti}m ${sec}s`;
  };

  const calcolaTempoTotale = (squadra) => {
    if (!squadra.tempo_inizio || !squadra.tempo_fine) return null;
    return Math.floor((new Date(squadra.tempo_fine) - new Date(squadra.tempo_inizio)) / 1000);
  };

  const getLuogoNome = (luogoId) => {
    const luogo = luoghi.find(l => l.id === luogoId);
    return luogo ? `${luogo.nome} (${luogo.citta})` : 'N/D';
  };

  const getEventoNome = (eventoId) => {
    const evento = eventi.find(e => e.id === eventoId);
    return evento?.nome || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-liquid-page text-foreground flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const squadreCompletate = mieSquadre.filter(s => s.completata);
  const squadreInCorso = mieSquadre.filter(s => !s.completata);

  return (
    <div className="min-h-screen bg-liquid-page text-foreground">
      <Header />
      <div className="max-w-2xl mx-auto py-6 px-4">

        {/* Profilo Card */}
        <div className="mb-6 glass rounded-[28px] border-2 border-accent overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center glass-accent flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.full_name || 'Giocatore'}</h1>
                <p className="opacity-70">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{mieSquadre.length}</p>
                <p className="text-sm opacity-60">Giocate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{squadreCompletate.length}</p>
                <p className="text-sm opacity-60">Completate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{squadreInCorso.length}</p>
                <p className="text-sm opacity-60">In corso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Squadre in corso */}
        {squadreInCorso.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Giocate in Corso
            </h2>
            <div className="space-y-3">
              {squadreInCorso.map((squadra, index) => (
                <motion.div
                  key={squadra.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="glass rounded-[22px] p-4">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 flex-shrink-0" />
                      <h3 className="font-bold whitespace-nowrap">{squadra.nome_squadra}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70 mt-1">
                      <MapPin className="w-4 h-4" />
                      {squadra.evento_id
                        ? getEventoNome(squadra.evento_id) || 'Evento'
                        : getLuogoNome(squadra.luogo_id)}
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-60 mt-1">
                      <Users className="w-4 h-4" />
                      {(squadra.altri_giocatori?.length || 0) + 1} giocatori
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!squadra.tempo_inizio && (
                          <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-muted">
                            Non iniziato
                          </span>
                        )}
                        <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-accent">
                          Tappa {squadra.tappa_corrente}/{10}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSquadraToDelete(squadra.id)}
                          className="glass rounded-full text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Link to={createPageUrl(`Gioca?squadra=${squadra.id}`)}>
                          <Button variant="ghost" className="glass-dark rounded-full">
                            <Play className="w-4 h-4 mr-1" />
                            {squadra.tempo_inizio ? 'Continua' : 'Inizia'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Storico completate */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Giocate Completate
          </h2>

          {squadreCompletate.length === 0 ? (
            <div className="glass rounded-[22px] p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="opacity-60">Nessuna giocata completata ancora</p>
            </div>
          ) : (
            <div className="space-y-3">
              {squadreCompletate.map((squadra, index) => {
                const tempoTotale = calcolaTempoTotale(squadra);
                return (
                  <motion.div
                    key={squadra.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="glass rounded-[22px] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <h3 className="font-bold">{squadra.nome_squadra}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm opacity-70 mt-1">
                            <MapPin className="w-4 h-4" />
                            {squadra.evento_id
                              ? getEventoNome(squadra.evento_id) || 'Evento'
                              : getLuogoNome(squadra.luogo_id)}
                          </div>
                          <div className="flex items-center gap-2 text-sm opacity-60 mt-1">
                            <Calendar className="w-4 h-4" />
                            {(squadra.tempo_fine || squadra.createdAt || squadra.created_at)
                              ? format(new Date(squadra.tempo_fine || squadra.createdAt || squadra.created_at), 'dd MMM yyyy', { locale: it })
                              : '—'}
                          </div>
                          <div className="flex items-center gap-2 text-sm opacity-60 mt-1">
                            <Users className="w-4 h-4" />
                            {(squadra.altri_giocatori?.length || 0) + 1} giocatori
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center justify-end gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold">{formatTempo(tempoTotale)}</span>
                          </div>
                          <span className="inline-block text-xs font-medium uppercase px-3 py-1 rounded-full glass-success mt-2">
                            10/10 tappe
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nuova giocata */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl('Iscrizione')}>
            <Button variant="ghost" className="glass-dark rounded-full">
              <Play className="w-4 h-4 mr-2" />
              Inizia una nuova caccia al tesoro
            </Button>
          </Link>
        </div>
      </div>

      <AlertDialog open={!!squadraToDelete} onOpenChange={() => setSquadraToDelete(null)}>
        <AlertDialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa iscrizione?</AlertDialogTitle>
            <AlertDialogDescription>
              L'iscrizione verrà eliminata e non potrai recuperarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass rounded-full">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteSquadraMutation.mutate(squadraToDelete);
                setSquadraToDelete(null);
              }}
              className="glass-danger rounded-full"
            >
              Sì, elimina iscrizione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}