import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { BarChart3, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const Pct = ({ value, count }) => {
  if (value === null) return <span className="text-gray-400">—</span>;
  return (
    <span>
      <span className="font-medium">{value}%</span>{' '}
      <span className="text-xs text-gray-400">({count})</span>
    </span>
  );
};

export default function Statistiche() {
  const { data: statistiche = [], isLoading } = useQuery({
    queryKey: ['statistiche-tappe'],
    queryFn: () => base44.statistiche.tappe(),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistiche per Tappa</h1>
            <p className="text-gray-500 text-sm">Quali tappe sono più difficili, saltate o richiedono aiuto</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : statistiche.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nessun luogo da mostrare</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {statistiche.map((luogo) => {
              const tappeOrdinate = [...luogo.tappe].sort(
                (a, b) => (b.pct_sbagliata ?? -1) - (a.pct_sbagliata ?? -1)
              );
              return (
                <Card key={luogo.luogo_id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      {luogo.luogo_nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
