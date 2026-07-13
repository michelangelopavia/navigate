import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Plus, Search, Edit, Trash2, ArrowLeft,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TappaForm from '@/components/admin/TappaForm';
import ImportTappeCSV from '@/components/admin/ImportTappeCSV';
import { useAuth } from '@/lib/AuthContext';

export default function GestioneTappe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const puoModificare = (luogoId) => isSuperAdmin || (user?.sedi_ids || []).includes(luogoId);
  const [search, setSearch] = useState('');
  const [filtroLivello, setFiltroLivello] = useState('tutti');
  const [filtroLuogo, setFiltroLuogo] = useState('tutti');
  const [showForm, setShowForm] = useState(false);
  const [tappaEdit, setTappaEdit] = useState(null);
  const [tappaDelete, setTappaDelete] = useState(null);

  const { data: tappe = [], isLoading } = useQuery({
    queryKey: ['tappe'],
    queryFn: () => base44.entities.Tappa.list()
  });

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.list()
  });

  const luoghiAssegnabili = isSuperAdmin ? luoghi : luoghi.filter(l => (user?.sedi_ids || []).includes(l.id));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Tappa.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tappe']);
      setShowForm(false);
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (tappeArray) => {
      return await base44.entities.Tappa.bulkCreate(tappeArray);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tappe']);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tappa.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tappe']);
      setShowForm(false);
      setTappaEdit(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tappa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tappe']);
      setTappaDelete(null);
    }
  });

  // Ordine progressivo per sede, a partire dal massimo già esistente
  // (altrimenti una tappa nuova resta sempre a ordine: 0, posizione imprevedibile in lista).
  const prossimoOrdine = (luogoId) =>
    Math.max(0, ...tappe.filter((t) => t.luogo_id === luogoId).map((t) => t.ordine || 0)) + 1;

  const handleSubmit = (data) => {
    if (tappaEdit) {
      updateMutation.mutate({ id: tappaEdit.id, data });
    } else {
      createMutation.mutate({ ...data, ordine: prossimoOrdine(data.luogo_id) });
    }
  };

  const tappeFiltrate = tappe.filter(t => {
    const matchSearch = t.titolo.toLowerCase().includes(search.toLowerCase()) ||
                       t.indovinello.toLowerCase().includes(search.toLowerCase());
    const matchLivello = filtroLivello === 'tutti' || t.difficolta === filtroLivello;
    const matchLuogo = filtroLuogo === 'tutti' || t.luogo_id === filtroLuogo;
    return matchSearch && matchLivello && matchLuogo;
  });

  const getDifficoltaColor = (diff) => {
    switch(diff) {
      case 'facile': return 'bg-green-100 text-green-800 border-green-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'difficile': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLuogoNome = (luogoId) => {
    const luogo = luoghi.find(l => l.id === luogoId);
    return luogo ? `${luogo.nome} (${luogo.citta})` : 'N/D';
  };

  // Conteggi per luogo selezionato
  const tappePerConteggio = filtroLuogo === 'tutti' ? tappe : tappe.filter(t => t.luogo_id === filtroLuogo);
  const conteggi = {
    facile: tappePerConteggio.filter(t => t.difficolta === 'facile').length,
    media: tappePerConteggio.filter(t => t.difficolta === 'media').length,
    difficile: tappePerConteggio.filter(t => t.difficolta === 'difficile').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Tappe</h1>
              <p className="text-gray-500 text-sm">Crea e modifica gli indovinelli</p>
            </div>
          </div>
          {(isSuperAdmin || luoghiAssegnabili.length > 0) && (
            <Button
              onClick={() => { setTappaEdit(null); setShowForm(true); }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuova Tappa
            </Button>
          )}
        </div>

        {/* Import CSV */}
        <ImportTappeCSV
          luoghi={luoghiAssegnabili}
          onImport={(tappeDaImportare) => {
            // Stessa logica di prossimoOrdine, ma incrementata manualmente riga per
            // riga: più righe possono condividere la stessa sede nello stesso import,
            // e non sono ancora in `tappe` per essere lette una a una.
            const prossimoPerSede = {};
            const conOrdine = tappeDaImportare.map((t) => {
              if (!(t.luogo_id in prossimoPerSede)) prossimoPerSede[t.luogo_id] = prossimoOrdine(t.luogo_id);
              const ordine = prossimoPerSede[t.luogo_id]++;
              return { ...t, ordine };
            });
            return bulkCreateMutation.mutateAsync(conOrdine);
          }}
        />

        {/* Stats per luogo */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={filtroLuogo} onValueChange={setFiltroLuogo}>
                <SelectTrigger className="w-64">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Seleziona luogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti i luoghi</SelectItem>
                  {luoghi.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.nome} ({l.citta})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2 flex-wrap">
                <Badge className={`${conteggi.facile >= 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {conteggi.facile}/4 facili (min)
                </Badge>
                <Badge className={`${conteggi.media >= 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {conteggi.media}/4 medie (min)
                </Badge>
                <Badge className={`${conteggi.difficile >= 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {conteggi.difficile}/2 difficili (min)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtri */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cerca tappe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroLivello} onValueChange={setFiltroLivello}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtra per livello" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti i livelli</SelectItem>
                  <SelectItem value="facile">🟢 Facile</SelectItem>
                  <SelectItem value="media">🟡 Media</SelectItem>
                  <SelectItem value="difficile">🔴 Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista Tappe */}
        <div className="space-y-4">
          <AnimatePresence>
            {tappeFiltrate.map((tappa, index) => (
              <motion.div
                key={tappa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <h3 className="font-bold text-gray-800">{tappa.titolo}</h3>
                          <Badge className={getDifficoltaColor(tappa.difficolta)}>
                            {tappa.difficolta}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getLuogoNome(tappa.luogo_id)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{tappa.indovinello}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Risposta: <span className="font-medium">{tappa.risposta_corretta}</span>
                        </p>
                      </div>
                      {puoModificare(tappa.luogo_id) && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { setTappaEdit(tappa); setShowForm(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => setTappaDelete(tappa)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {tappeFiltrate.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nessuna tappa trovata</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form Modal */}
        <TappaForm
          isOpen={showForm}
          onClose={() => { setShowForm(false); setTappaEdit(null); }}
          onSubmit={handleSubmit}
          tappa={tappaEdit}
          luoghi={luoghiAssegnabili}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Dialog */}
        <AlertDialog open={!!tappaDelete} onOpenChange={() => setTappaDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questa tappa?</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare "{tappaDelete?.titolo}". Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(tappaDelete.id)}
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