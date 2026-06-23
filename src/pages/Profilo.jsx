import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, ArrowLeft, Trophy, Clock, MapPin, Calendar,
  Play, CheckCircle, LogOut, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

export default function Profilo() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1f7a8c] border-t-transparent rounded-full" />
      </div>
    );
  }

  const squadreCompletate = mieSquadre.filter(s => s.completata);
  const squadreInCorso = mieSquadre.filter(s => !s.completata);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 via-white to-[#022b3a]/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <Button variant="ghost" onClick={logout} className="text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>

        {/* Profilo Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.full_name || 'Giocatore'}</h1>
                <p className="opacity-90">{user?.email}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#1f7a8c]">{mieSquadre.length}</p>
                <p className="text-sm text-gray-500">Giocate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{squadreCompletate.length}</p>
                <p className="text-sm text-gray-500">Completate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{squadreInCorso.length}</p>
                <p className="text-sm text-gray-500">In corso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Squadre in corso */}
        {squadreInCorso.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
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
                  <Card className="border-blue-200 bg-blue-50">
                   <CardContent className="p-4">
                     <div className="flex items-center justify-between">
                       <div className="flex-1 pr-4">
                         <div className="flex items-center justify-between mb-1">
                           <h3 className="font-bold text-gray-800">{squadra.nome_squadra}</h3>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                               if (confirm('Sei sicuro di voler annullare questa iscrizione?')) {
                                 deleteSquadraMutation.mutate(squadra.id);
                               }
                             }}
                             className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                           >
                             <X className="w-4 h-4" />
                           </Button>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-gray-500">
                           <MapPin className="w-4 h-4" />
                           {squadra.evento_id 
                             ? getEventoNome(squadra.evento_id) || 'Evento'
                             : getLuogoNome(squadra.luogo_id)}
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                           <Badge className="bg-blue-100 text-blue-700">
                             Tappa {squadra.tappa_corrente}/{10}
                           </Badge>
                           {!squadra.tempo_inizio && (
                             <Badge variant="outline">Non iniziato</Badge>
                           )}
                         </div>
                       </div>
                       <Link to={createPageUrl(`Gioca?squadra=${squadra.id}`)}>
                         <Button className="bg-blue-500 hover:bg-blue-600">
                           <Play className="w-4 h-4 mr-1" />
                           {squadra.tempo_inizio ? 'Continua' : 'Inizia'}
                         </Button>
                       </Link>
                     </div>
                   </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Storico completate */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Giocate Completate
          </h2>
          
          {squadreCompletate.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">Nessuna giocata completata ancora</p>
                <Link to={createPageUrl('Iscrizione')}>
                  <Button className="mt-4 bg-[#1f7a8c] hover:bg-[#022b3a]">
                    Inizia una nuova caccia
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
                    <Card className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <h3 className="font-bold text-gray-800">{squadra.nome_squadra}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <MapPin className="w-4 h-4" />
                              {squadra.evento_id 
                                ? getEventoNome(squadra.evento_id) || 'Evento'
                                : getLuogoNome(squadra.luogo_id)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(squadra.tempo_fine || squadra.created_date), 'dd MMM yyyy', { locale: it })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-[#1f7a8c]">
                              <Clock className="w-4 h-4" />
                              <span className="font-bold">{formatTempo(tempoTotale)}</span>
                            </div>
                            <Badge className="bg-green-100 text-green-700 mt-1">
                              10/10 tappe
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nuova giocata */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl('Iscrizione')}>
            <Button className="bg-[#1f7a8c] hover:bg-[#022b3a]">
              <Play className="w-4 h-4 mr-2" />
              Inizia una nuova caccia al tesoro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}