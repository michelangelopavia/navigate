import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Calendar, Users, Bell, Trophy, AlertCircle, Home, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import NotifichePanel from '@/components/admin/NotifichePanel';
import ClassificaEvento from '@/components/admin/ClassificaEvento';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pannello Admin</h1>
            <p className="text-gray-500">Gestione Caccia al Tesoro</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to={createPageUrl('GestioneLuoghi')}>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <MapPin className="w-4 h-4 mr-2" />
                Luoghi
              </Button>
            </Link>
            <Link to={createPageUrl('GestioneTappe')}>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <MapPin className="w-4 h-4 mr-2" />
                Tappe
              </Button>
            </Link>
            <Link to={createPageUrl('GestioneEventi')}>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Eventi
              </Button>
            </Link>
            <Link to={createPageUrl('ImpostazioniSEO')}>
              <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                <Settings className="w-4 h-4 mr-2" />
                SEO
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{luoghi.length}</p>
                  <p className="text-sm text-gray-500">Luoghi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tappe.length}</p>
                  <p className="text-sm text-gray-500">Tappe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{eventi.length}</p>
                  <p className="text-sm text-gray-500">Eventi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{squadre.length}</p>
                  <p className="text-sm text-gray-500">Squadre</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notificheNonLette}</p>
                  <p className="text-sm text-gray-500">Notifiche</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Richieste Aiuto */}
        {richiesteAiuto.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                Richieste di Aiuto Attive ({richiesteAiuto.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {richiesteAiuto.map(r => (
                  <div key={r.id} className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.squadra_nome} - Tappa {r.tappa_numero}</p>
                      {r.messaggio && <p className="text-sm text-gray-500">{r.messaggio}</p>}
                    </div>
                    <Link to={createPageUrl(`GestioneRichieste`)}>
                      <Button size="sm" variant="outline">Gestisci</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Classifica Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {eventi.map(e => (
                    <Button
                      key={e.id}
                      variant={eventoSelezionato?.id === e.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEventoSelezionato(e)}
                      className={eventoSelezionato?.id === e.id ? 'bg-orange-500' : ''}
                    >
                      {e.nome}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

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