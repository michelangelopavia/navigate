import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  MapPin, Calendar, Users, Bell, AlertCircle, Settings, Loader2, UserCog, AlertTriangle, BarChart3
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import Header from '@/components/Header';

import NotifichePanel from '@/components/admin/NotifichePanel';
import ClassificaEvento from '@/components/admin/ClassificaEvento';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to={createPageUrl('Home')} replace />;
  }

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.list()
  });

  const { data: tappe = [] } = useQuery({
    queryKey: ['tappe'],
    queryFn: () => base44.entities.Tappa.list()
  });

  const { data: eventi = [] } = useQuery({
    queryKey: ['eventi'],
    queryFn: () => base44.entities.Evento.list('-created_date')
  });

  const { data: squadre = [] } = useQuery({
    queryKey: ['squadre'],
    queryFn: () => base44.entities.Squadra.list('-created_date')
  });

  const { data: notifiche = [] } = useQuery({
    queryKey: ['notifiche'],
    queryFn: () => base44.entities.Notifica.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: richiesteAiuto = [] } = useQuery({
    queryKey: ['richieste-aiuto'],
    queryFn: () => base44.entities.RichiestaAiuto.filter({ risolta: false }),
    refetchInterval: 5000
  });

  const updateNotificaMutation = useMutation({
    mutationFn: (id) => base44.entities.Notifica.update(id, { letta: true }),
    onSuccess: () => queryClient.invalidateQueries(['notifiche'])
  });

  const segnaTutteLetteMutation = useMutation({
    mutationFn: async () => {
      const nonLette = notifiche.filter(n => !n.letta);
      for (const n of nonLette) {
        await base44.entities.Notifica.update(n.id, { letta: true });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['notifiche'])
  });

  const notificheNonLette = notifiche.filter(n => !n.letta).length;

  const [eventoSelezionato, setEventoSelezionato] = useState(null);
  const squadreEvento = eventoSelezionato 
    ? squadre.filter(s => s.evento_id === eventoSelezionato.id)
    : [];

  const navItems = [
    { to: 'GestioneLuoghi', icon: MapPin, label: 'Luoghi' },
    { to: 'GestioneTappe', icon: MapPin, label: 'Tappe' },
    { to: 'GestioneEventi', icon: Calendar, label: 'Eventi' },
    { to: 'GestioneSegnalazioni', icon: AlertTriangle, label: 'Segnalazioni' },
    { to: 'Statistiche', icon: BarChart3, label: 'Statistiche' },
    { to: 'ImpostazioniSEO', icon: Settings, label: 'SEO' },
  ];

  const statCards = [
    { icon: MapPin, value: luoghi.length, label: 'Luoghi', variant: 'glass-muted' },
    { icon: MapPin, value: tappe.length, label: 'Tappe', variant: 'glass-accent' },
    { icon: Calendar, value: eventi.length, label: 'Eventi', variant: 'glass-warning' },
    { icon: Users, value: squadre.length, label: 'Squadre', variant: 'glass-success' },
    { icon: Bell, value: notificheNonLette, label: 'Notifiche', variant: 'glass-danger' },
  ];

  return (
    <div className="min-h-screen bg-liquid-page">
      <Header />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Titolo + nav */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pannello Admin</h1>
            <p className="opacity-70">Gestione Caccia al Tesoro</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={createPageUrl(to)} className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="glass rounded-full w-full sm:w-auto justify-center">
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
            {user?.role === 'super_admin' && (
              <Link to={createPageUrl('AssegnaAdminSede')} className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="glass rounded-full w-full sm:w-auto justify-center">
                  <UserCog className="w-4 h-4 mr-2" />
                  Assegna Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statCards.map(({ icon: Icon, value, label, variant }) => (
            <div key={label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${variant}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm opacity-70">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Richieste Aiuto */}
        {richiesteAiuto.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-8">
            <div className="glass-warning rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2 font-bold w-fit">
              <AlertCircle className="w-5 h-5" />
              Richieste di Aiuto Attive ({richiesteAiuto.length})
            </div>
            <div className="space-y-2">
              {richiesteAiuto.map(r => (
                <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{r.squadra_nome} - Tappa {r.tappa_numero}</p>
                    {r.messaggio && <p className="text-sm opacity-70">{r.messaggio}</p>}
                  </div>
                  <Link to={createPageUrl(`GestioneRichieste`)}>
                    <Button size="sm" variant="ghost" className="glass-dark rounded-full">Gestisci</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Notifiche */}
          <div className="md:col-span-1">
            <NotifichePanel
              notifiche={notifiche}
              onSegnaLetta={(id) => updateNotificaMutation.mutate(id)}
              onChiudiTutte={() => segnaTutteLetteMutation.mutate()}
            />
          </div>

          {/* Classifica Evento */}
          <div className="md:col-span-2">
            <div className="glass rounded-2xl p-5 mb-4">
              <h2 className="text-lg font-bold mb-3">Classifica Evento</h2>
              <div className="flex flex-wrap gap-2">
                {eventi.map(e => (
                  <Button
                    key={e.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setEventoSelezionato(e)}
                    className={`rounded-full ${eventoSelezionato?.id === e.id ? 'glass-accent' : 'glass'}`}
                  >
                    {e.nome}
                  </Button>
                ))}
              </div>
            </div>

            {eventoSelezionato && (
              <ClassificaEvento
                squadre={squadreEvento}
                evento={eventoSelezionato}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}