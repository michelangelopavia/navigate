import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  MapPin, Plus, ArrowLeft, Edit, Trash2,
  Save, Loader2, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

export default function GestioneLuoghi() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const puoModificare = (luogoId) => isSuperAdmin || (user?.sedi_ids || []).includes(luogoId);
  const [showForm, setShowForm] = useState(false);
  const [luogoEdit, setLuogoEdit] = useState(null);
  const [luogoDelete, setLuogoDelete] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    nome_en: '',
    citta: '',
    descrizione: '',
    descrizione_en: '',
    immagine_url: '',
    attivo: true
  });
  const [showEnglish, setShowEnglish] = useState(false);

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.list()
  });

  const { data: tappe = [] } = useQuery({
    queryKey: ['tappe'],
    queryFn: () => base44.entities.Tappa.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Luogo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['luoghi']);
      setShowForm(false);
      resetForm();
      toast.success('Luogo creato');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nella creazione del luogo');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Luogo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['luoghi']);
      setShowForm(false);
      setLuogoEdit(null);
      resetForm();
      toast.success('Luogo aggiornato');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nell\'aggiornamento del luogo');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Luogo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['luoghi']);
      setLuogoDelete(null);
      toast.success('Luogo eliminato');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Errore nell\'eliminazione del luogo');
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      nome_en: '',
      citta: '',
      descrizione: '',
      descrizione_en: '',
      immagine_url: '',
      attivo: true
    });
  };

  const openEdit = (luogo) => {
    setLuogoEdit(luogo);
    setFormData({
      nome: luogo.nome,
      nome_en: luogo.nome_en || '',
      citta: luogo.citta,
      descrizione: luogo.descrizione || '',
      descrizione_en: luogo.descrizione_en || '',
      immagine_url: luogo.immagine_url || '',
      attivo: luogo.attivo
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (luogoEdit) {
      updateMutation.mutate({ id: luogoEdit.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTappeCount = (luogoId) => {
    const tappeLuogo = tappe.filter(t => t.luogo_id === luogoId);
    return {
      facile: tappeLuogo.filter(t => t.difficolta === 'facile').length,
      media: tappeLuogo.filter(t => t.difficolta === 'media').length,
      difficile: tappeLuogo.filter(t => t.difficolta === 'difficile').length,
      totale: tappeLuogo.length
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Luoghi</h1>
              <p className="text-gray-500 text-sm">Crea e gestisci i luoghi di gioco</p>
            </div>
          </div>
          {isSuperAdmin && (
            <Button
              onClick={() => { setLuogoEdit(null); resetForm(); setShowForm(true); }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Luogo
            </Button>
          )}
        </div>

        {/* Lista Luoghi */}
        <div className="space-y-4">
          {luoghi.map((luogo, index) => {
            const count = getTappeCount(luogo.id);
            const isReady = count.facile >= 4 && count.media >= 4 && count.difficile >= 2;
            
            return (
              <motion.div
                key={luogo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {luogo.immagine_url && (
                        <img 
                          src={luogo.immagine_url} 
                          alt={luogo.nome}
                          className="w-full md:w-48 h-32 object-cover"
                        />
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <h3 className="font-bold text-gray-800 text-lg">{luogo.nome}</h3>
                          <Badge variant="outline">{luogo.citta}</Badge>
                          {luogo.attivo ? (
                            <Badge className="bg-green-100 text-green-700">Attivo</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600">Inattivo</Badge>
                          )}
                        </div>
                        {luogo.descrizione && (
                          <p className="text-sm text-gray-500 mb-3">{luogo.descrizione}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge className={count.facile >= 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {count.facile}/4 facili
                          </Badge>
                          <Badge className={count.media >= 4 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {count.media}/4 medie
                          </Badge>
                          <Badge className={count.difficile >= 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {count.difficile}/2 difficili
                          </Badge>
                          {isReady && (
                            <Badge className="bg-blue-100 text-blue-800">✓ Pronto</Badge>
                          )}
                        </div>
                      </div>
                      {(puoModificare(luogo.id) || isSuperAdmin) && (
                        <div className="flex md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l">
                          {puoModificare(luogo.id) && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEdit(luogo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {isSuperAdmin && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => setLuogoDelete(luogo)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {luoghi.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nessun luogo creato</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                {luogoEdit ? 'Modifica Luogo' : 'Nuovo Luogo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Luogo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Es. Kalsa"
                  required
                />
                {showEnglish && (
                  <Input
                    className="mt-2"
                    value={formData.nome_en}
                    onChange={(e) => setFormData({ ...formData, nome_en: e.target.value })}
                    placeholder="🇬🇧 English name"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="citta">Città *</Label>
                <Input
                  id="citta"
                  value={formData.citta}
                  onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                  placeholder="Es. Palermo"
                  required
                />
              </div>

              {/* Toggle English */}
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <Label className="text-blue-800">Mostra campi inglese</Label>
                </div>
                <Switch checked={showEnglish} onCheckedChange={setShowEnglish} />
              </div>

              <div>
                <Label htmlFor="descrizione">Descrizione</Label>
                <Textarea
                  id="descrizione"
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  placeholder="Descrizione del quartiere/zona..."
                  rows={3}
                />
                {showEnglish && (
                  <Textarea
                    className="mt-2"
                    value={formData.descrizione_en}
                    onChange={(e) => setFormData({ ...formData, descrizione_en: e.target.value })}
                    placeholder="🇬🇧 English description"
                    rows={3}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="immagine_url">URL Immagine</Label>
                <Input
                  id="immagine_url"
                  value={formData.immagine_url}
                  onChange={(e) => setFormData({ ...formData, immagine_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="attivo">Luogo Attivo</Label>
                <Switch
                  id="attivo"
                  checked={formData.attivo}
                  onCheckedChange={(checked) => setFormData({ ...formData, attivo: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!luogoDelete} onOpenChange={() => setLuogoDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questo luogo?</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare "{luogoDelete?.nome}". Le tappe associate rimarranno ma senza luogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(luogoDelete.id)}
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