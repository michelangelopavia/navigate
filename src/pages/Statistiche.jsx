import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BarChart3, ArrowLeft, Loader2, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/Header';

const Pct = ({ value, count }) => {
  if (value === null) return <span className="opacity-40">—</span>;
  return (
    <span>
      <span className="font-medium">{value}%</span>{' '}
      <span className="text-xs opacity-60">({count})</span>
    </span>
  );
};

export default function Statistiche() {
  const [eventoId, setEventoId] = useState('tutte');

  // Query separata e sempre non filtrata: serve solo a sapere quali luoghi sono nello
  // scope dell'admin loggato, così il menu degli eventi non si svuota quando si
  // seleziona un evento specifico (che restituirebbe un solo luogo dall'endpoint).
  const { data: scopeData = [] } = useQuery({
    queryKey: ['statistiche-tappe', 'tutte'],
    queryFn: () => base44.statistiche.tappe(),
  });

  const { data: statistiche = [], isLoading } = useQuery({
    queryKey: ['statistiche-tappe', eventoId],
    queryFn: () => base44.statistiche.tappe(eventoId === 'tutte' ? undefined : eventoId),
  });

  const { data: eventi = [] } = useQuery({
    queryKey: ['eventi'],
    queryFn: () => base44.entities.Evento.list(),
  });

  const luogoIdsInScope = new Set(scopeData.map((l) => l.luogo_id));
  const eventiFiltrabili = eventi.filter((e) => luogoIdsInScope.has(e.luogo_id));
  const eventoSelezionato = eventoId === 'tutte' ? null : eventiFiltrabili.find((e) => e.id === eventoId);

  // Con un evento filtrato, il backend restituisce comunque una card per ogni sede
  // (anche quelle senza nessuna squadra in quell'evento) — le nascondiamo qui per
  // non suggerire che l'evento abbia coinvolto sedi con cui non c'entra nulla.
  const statisticheVisibili = eventoSelezionato
    ? statistiche.filter((luogo) => luogo.tappe.some((t) => t.giocata > 0))
    : statistiche;

  return (
    <div className="min-h-screen bg-liquid-page">
      <Header />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon" className="glass rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {eventoSelezionato ? `Statistiche — ${eventoSelezionato.nome}` : 'Statistiche per Tappa'}
            </h1>
            <p className="opacity-70 text-sm">Quali tappe sono più difficili, saltate o richiedono aiuto</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 max-w-xs">
          <Calendar className="w-4 h-4 opacity-60 shrink-0" />
          <Select value={eventoId} onValueChange={setEventoId}>
            <SelectTrigger>
              <SelectValue placeholder="Tutte le partite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutte">Tutte le partite</SelectItem>
              {eventiFiltrabili.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin opacity-50" />
          </div>
        ) : statisticheVisibili.length === 0 ? (
          <div className="glass rounded-2xl text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="opacity-70">
              {eventoSelezionato ? 'Nessuna sede ha ancora squadre in questo evento' : 'Nessun luogo da mostrare'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {statisticheVisibili.map((luogo) => {
              const tappeOrdinate = [...luogo.tappe].sort(
                (a, b) => (b.pct_sbagliata ?? -1) - (a.pct_sbagliata ?? -1)
              );
              return (
                <div key={luogo.luogo_id} className="glass rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <h2 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                      {eventoSelezionato ? (
                        <>
                          <Calendar className="w-5 h-5 text-accent" />
                          {eventoSelezionato.nome}
                          <span className="text-xs font-medium px-3 py-1 rounded-full glass inline-flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {luogo.luogo_nome}
                          </span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 text-accent" />
                          {luogo.luogo_nome}
                        </>
                      )}
                    </h2>
                  </div>
                  <div className="p-5 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tappa</TableHead>
                          <TableHead>Giocata</TableHead>
                          <TableHead>Sbagliata</TableHead>
                          <TableHead>Saltata</TableHead>
                          <TableHead>Suggerimento usato</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tappeOrdinate.map((t) => (
                          <TableRow key={t.tappa_id}>
                            <TableCell className="font-medium">{t.titolo}</TableCell>
                            <TableCell>{t.giocata}</TableCell>
                            <TableCell><Pct value={t.pct_sbagliata} count={t.sbagliata} /></TableCell>
                            <TableCell><Pct value={t.pct_saltata} count={t.saltata} /></TableCell>
                            <TableCell><Pct value={t.pct_aiuto} count={t.aiuto} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
