import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
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
import Header from '@/components/Header';

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

  const luoghiVisibili = isSuperAdmin
    ? luoghi
    : luoghi.filter((l) => (user?.sedi_ids || []).includes(l.id));

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
    <div className="min-h-screen bg-liquid-page">
      <Header />
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" size="icon" className="glass rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gestione Luoghi</h1>
              <p className="opacity-70 text-sm">Crea e gestisci i luoghi di gioco</p>
            </div>
          </div>
          {isSuperAdmin && (
            <Button
              onClick={() => { setLuogoEdit(null); resetForm(); setShowForm(true); }}
              variant="ghost"
              className="btn-glass-accent rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Luogo
            </Button>
          )}
        </div>

        {/* Lista Luoghi */}
        <div className="space-y-4">
          {luoghiVisibili.map((luogo, index) => {
            const count = getTappeCount(luogo.id);
            const isReady = count.facile >= 4 && count.media >= 4 && count.difficile >= 2;
            
            return (
              <motion.div
                key={luogo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {luogo.immagine_url && (
                      <img
                        src={luogo.immagine_url}
                        alt={luogo.nome}
                        className="w-full md:w-48 h-32 object-cover"
                      />
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <MapPin className="w-5 h-5 text-accent" />
                        <h3 className="font-bold text-lg">{luogo.nome}</h3>
                        <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass">{luogo.citta}</span>
                        {luogo.attivo ? (
                          <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-success">Attivo</span>
                        ) : (
                          <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-muted">Inattivo</span>
                        )}
                      </div>
                      {luogo.descrizione && (
                        <p className="text-sm opacity-70 mb-3">{luogo.descrizione}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs font-medium uppercase px-3 py-1 rounded-full ${count.facile >= 4 ? 'glass-success' : 'glass-danger'}`}>
                          {count.facile}/4 facili
                        </span>
                        <span className={`text-xs font-medium uppercase px-3 py-1 rounded-full ${count.media >= 4 ? 'glass-success' : 'glass-danger'}`}>
                          {count.media}/4 medie
                        </span>
                        <span className={`text-xs font-medium uppercase px-3 py-1 rounded-full ${count.difficile >= 2 ? 'glass-success' : 'glass-danger'}`}>
                          {count.difficile}/2 difficili
                        </span>
                        {isReady && (
                          <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-accent">✓ Pronto</span>
                        )}
                      </div>
                    </div>
                    {(puoModificare(luogo.id) || isSuperAdmin) && (
                      <div className="flex md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l border-border">
                        {puoModificare(luogo.id) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="glass rounded-full"
                            onClick={() => openEdit(luogo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="glass-danger rounded-full"
                            onClick={() => setLuogoDelete(luogo)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {luoghiVisibili.length === 0 && (
            <div className="glass rounded-2xl text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="opacity-70">
                {isSuperAdmin ? 'Nessun luogo creato' : 'Nessuna sede assegnata al tuo profilo'}
              </p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-h-[90vh] overflow-hidden p-0">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
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
              <div className="glass rounded-xl flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  <Label>Mostra campi inglese</Label>
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
                <Button type="button" variant="ghost" className="glass rounded-full" onClick={() => setShowForm(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="btn-glass-accent rounded-full"
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!luogoDelete} onOpenChange={() => setLuogoDelete(null)}>
          <AlertDialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questo luogo?</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare "{luogoDelete?.nome}". Le tappe associate rimarranno ma senza luogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="glass rounded-full">Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(luogoDelete.id)}
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