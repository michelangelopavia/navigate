import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ClassificaEvento from '@/components/admin/ClassificaEvento';

export default function Classifica() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventoId = urlParams.get('evento');

  const { data: evento, isLoading: loadingEvento } = useQuery({
    queryKey: ['evento', eventoId],
    queryFn: async () => {
      const eventi = await base44.entities.Evento.filter({ id: eventoId });
      return eventi[0];
    },
    enabled: !!eventoId
  });

  const { data: squadre = [], isLoading: loadingSquadre } = useQuery({
    queryKey: ['squadre-evento', eventoId],
    queryFn: () => base44.entities.Squadra.filter({ evento_id: eventoId }),
    enabled: !!eventoId,
    refetchInterval: 5000
  });

  if (loadingEvento || loadingSquadre) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl('AdminDashboard')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Pannello
          </Button>
        </Link>

        <ClassificaEvento squadre={squadre} evento={evento} />
      </div>
    </div>
  );
}