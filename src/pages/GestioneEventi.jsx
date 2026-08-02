import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, Plus, ArrowLeft, Edit, Trash2, Users,
  Save, Loader2, MapPin, Globe, Mail, X, Share2, Copy, Check
} from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import Header from '@/components/Header';

export default function GestioneEventi() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const puoModificare = (luogoId) => isSuperAdmin || (user?.sedi_ids || []).includes(luogoId);
  const [showForm, setShowForm] = useState(false);
  const [eventoEdit, setEventoEdit] = useState(null);
  const [eventoDelete, setEventoDelete] = useState(null);
  const [showIscrittiModal, setShowIscrittiModal] = useState(false);
  const [eventoIscritti, setEventoIscritti] = useState(null);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    nome_en: '',
    luogo_id: '',
    data_inizio: '',
    data_fine: '',
    descrizione: '',
    descrizione_en: '',
    attivo: true,
    concluso: false,
    email_gestori: [],
    og_image_url: '',
    og_title: '',
    og_description: ''
  });
  const [emailInput, setEmailInput] = useState('');
  const [showEnglish, setShowEnglish] = useState(false);

  const { data: eventi = [] } = useQuery({
    queryKey: ['eventi'],
    queryFn: () => base44.entities.Evento.list('-data_inizio')
  });

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi'],
    queryFn: () => base44.entities.Luogo.list()
  });

  const luoghiAssegnabili = isSuperAdmin ? luoghi : luoghi.filter(l => (user?.sedi_ids || []).includes(l.id));

  const { data: squadre = [] } = useQuery({
    queryKey: ['squadre'],
    queryFn: () => base44.entities.Squadra.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Evento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventi']);
      setShowForm(false);
      resetForm();
      toast.success('Evento creato con successo!');
    },
    onError: () => {
      toast.error('Errore nella creazione dell\'evento', {
        description: 'Riprova tra qualche istante.'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Evento.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventi']);
      setShowForm(false);
      setEventoEdit(null);
      resetForm();
      toast.success('Evento aggiornato con successo!');
    },
    onError: () => {
      toast.error('Errore nel salvataggio dell\'evento', {
        description: 'Riprova tra qualche istante.'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Evento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventi']);
      setEventoDelete(null);
      toast.success('Evento eliminato');
    },
    onError: () => {
      toast.error('Errore nell\'eliminazione dell\'evento', {
        description: 'Riprova tra qualche istante.'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      nome_en: '',
      luogo_id: luoghiAssegnabili[0]?.id || '',
      data_inizio: '',
      data_fine: '',
      descrizione: '',
      descrizione_en: '',
      attivo: true,
      concluso: false,
      email_gestori: [],
      og_image_url: '',
      og_title: '',
      og_description: ''
    });
    setEmailInput('');
  };

  const openEdit = (evento) => {
    setEventoEdit(evento);
    // Converti da UTC a ora locale per datetime-local
    const dataInizioDate = new Date(evento.data_inizio);
    const dataFineDate = new Date(evento.data_fine);
    
    const dataInizioLocal = evento.data_inizio
      ? new Date(dataInizioDate.getTime() - dataInizioDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : '';
    const dataFineLocal = evento.data_fine
      ? new Date(dataFineDate.getTime() - dataFineDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : '';
    
    setFormData({
      nome: evento.nome,
      nome_en: evento.nome_en || '',
      luogo_id: evento.luogo_id,
      data_inizio: dataInizioLocal,
      data_fine: dataFineLocal,
      descrizione: evento.descrizione || '',
      descrizione_en: evento.descrizione_en || '',
      attivo: evento.attivo,
      concluso: evento.concluso,
      email_gestori: evento.email_gestori || [],
      og_image_url: evento.og_image_url || '',
      og_title: evento.og_title || '',
      og_description: evento.og_description || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // datetime-local fornisce una stringa senza timezone, interpretata come ora locale
    // new Date() la interpreta correttamente come ora locale e toISOString() converte in UTC
    const dataToSend = {
      ...formData,
      data_inizio: new Date(formData.data_inizio).toISOString(),
      data_fine: new Date(formData.data_fine).toISOString()
    };
    if (eventoEdit) {
      updateMutation.mutate({ id: eventoEdit.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const getSquadreEvento = (eventoId) => {
    return squadre.filter(s => s.evento_id === eventoId).length;
  };

  const getLuogoNome = (luogoId) => {
    const luogo = luoghi.find(l => l.id === luogoId);
    return luogo ? `${luogo.nome} (${luogo.citta})` : 'N/D';
  };

  const openIscrittiModal = (evento) => {
    setEventoIscritti(evento);
    setShowIscrittiModal(true);
    setCopiedEmails(false);
  };

  const getSquadreIscritte = (eventoId) => {
    return squadre.filter(s => s.evento_id === eventoId);
  };

  const copiaEmailIscritti = (eventoId) => {
    const squadreEvento = getSquadreIscritte(eventoId);
    const emails = squadreEvento.map(s => s.referente_email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
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
              <h1 className="text-2xl font-bold">Gestione Eventi</h1>
              <p className="opacity-70 text-sm">Crea e gestisci le competizioni</p>
            </div>
          </div>
          {(isSuperAdmin || luoghiAssegnabili.length > 0) && (
            <Button
              onClick={() => { setEventoEdit(null); resetForm(); setShowForm(true); }}
              variant="ghost"
              className="btn-glass-accent rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Evento
            </Button>
          )}
        </div>

        {/* Lista Eventi */}
        <div className="space-y-4">
          {eventi.map((evento, index) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="glass rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Calendar className="w-5 h-5 text-accent" />
                      <h3 className="font-bold text-lg">{evento.nome}</h3>
                      {evento.concluso ? (
                        <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-muted">Concluso</span>
                      ) : evento.attivo ? (
                        <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-success">Attivo</span>
                      ) : (
                        <span className="text-xs font-medium uppercase px-3 py-1 rounded-full glass-warning">Bozza</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70 mb-2">
                      <MapPin className="w-4 h-4" />
                      {getLuogoNome(evento.luogo_id)}
                    </div>
                    <p className="text-sm opacity-70 mb-2">
                      <strong>Inizio:</strong> {evento.data_inizio ? format(new Date(evento.data_inizio), 'dd MMM yyyy, HH:mm', { locale: it }) : 'N/D'}
                      <br />
                      <strong>Fine:</strong> {evento.data_fine ? format(new Date(evento.data_fine), 'dd MMM yyyy, HH:mm', { locale: it }) : 'N/D'}
                    </p>
                    {evento.descrizione && (
                      <div
                        className="text-sm opacity-70 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: evento.descrizione }}
                      />
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4 opacity-60" />
                      <span className="text-sm opacity-70">
                        {getSquadreEvento(evento.id)} squadre iscritte
                      </span>
                    </div>
                    {evento.email_gestori && evento.email_gestori.length > 0 && (
                      <div className="flex items-start gap-2 mt-2">
                        <Mail className="w-4 h-4 opacity-60 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {evento.email_gestori.map((email, idx) => (
                            <span key={idx} className="text-xs px-3 py-1 rounded-full glass">
                              {email}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Link to={createPageUrl(`Classifica?evento=${evento.id}`)}>
                        <Button variant="ghost" size="sm" className="glass rounded-full">
                          Classifica
                        </Button>
                      </Link>
                      <ShareButton eventoId={evento.id} variant="ghost" className="glass rounded-full" />
                      {getSquadreEvento(evento.id) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openIscrittiModal(evento)}
                          className="glass rounded-full"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Iscritti
                        </Button>
                      )}
                    </div>
                    {puoModificare(evento.luogo_id) && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="glass rounded-full"
                          onClick={() => openEdit(evento)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="glass-danger rounded-full"
                          onClick={() => setEventoDelete(evento)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {eventi.length === 0 && (
            <div className="glass rounded-2xl text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="opacity-70">Nessun evento creato</p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-w-lg mx-auto max-h-[90vh] overflow-hidden p-0">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
            <DialogHeader>
              <DialogTitle>
                {eventoEdit ? 'Modifica Evento' : 'Nuovo Evento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Evento *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Es. Caccia al Tesoro Primavera"
                  required
                />
                {showEnglish && (
                  <div className="mt-2">
                    <Label className="text-sm opacity-80">🇬🇧 Name (English)</Label>
                    <Input
                      value={formData.nome_en}
                      onChange={(e) => setFormData({ ...formData, nome_en: e.target.value })}
                      placeholder="English event name"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="luogo_id">Luogo *</Label>
                <Select
                  value={formData.luogo_id}
                  onValueChange={(value) => setFormData({ ...formData, luogo_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un luogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {luoghiAssegnabili.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.nome} ({l.citta})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inizio">Data/Ora Inizio *</Label>
                  <Input
                    id="data_inizio"
                    type="datetime-local"
                    value={formData.data_inizio}
                    onChange={(e) => setFormData({ ...formData, data_inizio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fine">Data/Ora Fine *</Label>
                  <Input
                    id="data_fine"
                    type="datetime-local"
                    value={formData.data_fine}
                    onChange={(e) => setFormData({ ...formData, data_fine: e.target.value })}
                    required
                  />
                </div>
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
                <ReactQuill
                  theme="snow"
                  value={formData.descrizione}
                  onChange={(value) => setFormData({ ...formData, descrizione: value })}
                  placeholder="Descrizione dell'evento..."
                  className="bg-white rounded-md"
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                />
                {showEnglish && (
                  <div className="mt-3">
                    <Label className="text-sm opacity-80">🇬🇧 Description (English)</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.descrizione_en}
                      onChange={(value) => setFormData({ ...formData, descrizione_en: value })}
                      placeholder="English description..."
                      className="bg-white rounded-md"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ]
                      }}
                    />
                  </div>
                )}
              </div>
                                                        <div className="flex items-center justify-between">
                                                          <Label htmlFor="attivo">Iscrizioni Aperte</Label>
                <Switch
                  id="attivo"
                  checked={formData.attivo}
                  onCheckedChange={(checked) => setFormData({ ...formData, attivo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="concluso">Evento Concluso</Label>
                <Switch
                  id="concluso"
                  checked={formData.concluso}
                  onCheckedChange={(checked) => setFormData({ ...formData, concluso: checked })}
                />
              </div>

              {/* Social & SEO */}
              <div className="glass rounded-xl space-y-4 p-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg glass-accent">
                    <Globe className="w-4 h-4" />
                  </div>
                  Immagine di Copertina & Social
                </h4>

                <div>
                  <Label htmlFor="og_image_url">Immagine di Copertina (URL)</Label>
                  <Input
                    id="og_image_url"
                    value={formData.og_image_url}
                    onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })}
                    placeholder="https://esempio.com/immagine.jpg"
                  />
                  <p className="text-xs opacity-70 mt-1">Usata per condivisione social e promozione</p>
                  {formData.og_image_url && (
                    <img src={formData.og_image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-xl border border-border" />
                  )}
                </div>

                <div>
                  <Label htmlFor="og_title">Titolo Social</Label>
                  <Input
                    id="og_title"
                    value={formData.og_title}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    placeholder="Es. Caccia al Tesoro nella Kalsa"
                  />
                  <p className="text-xs opacity-70 mt-1">Titolo mostrato quando si condivide il link</p>
                </div>

                <div>
                  <Label htmlFor="og_description">Descrizione Breve Social</Label>
                  <Textarea
                    id="og_description"
                    value={formData.og_description}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    placeholder="Descrizione breve per social (max 200 caratteri)"
                    rows={2}
                  />
                  <p className="text-xs opacity-70 mt-1">Descrizione breve mostrata nelle anteprime social</p>
                </div>
              </div>

              {/* Email Gestori */}
              <div>
                <Label>
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Gestori (riceveranno notifiche iscrizioni)
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="gestore@email.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (emailInput && !formData.email_gestori.includes(emailInput)) {
                          setFormData({ ...formData, email_gestori: [...formData.email_gestori, emailInput] });
                          setEmailInput('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="glass rounded-full"
                    onClick={() => {
                      if (emailInput && !formData.email_gestori.includes(emailInput)) {
                        setFormData({ ...formData, email_gestori: [...formData.email_gestori, emailInput] });
                        setEmailInput('');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.email_gestori.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.email_gestori.map((email, idx) => (
                      <span key={idx} className="glass rounded-full pl-3 pr-1 py-1 text-xs flex items-center gap-1">
                        {email}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              email_gestori: formData.email_gestori.filter((_, i) => i !== idx)
                            });
                          }}
                          className="p-1 rounded-full hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" className="glass rounded-full" onClick={() => setShowForm(false)}>
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="btn-glass-accent rounded-full"
                  disabled={createMutation.isPending || updateMutation.isPending || !formData.luogo_id}
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

        {/* Iscritti Modal */}
        <Dialog open={showIscrittiModal} onOpenChange={setShowIscrittiModal}>
          <DialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px] max-w-2xl mx-auto max-h-[90vh] overflow-hidden p-0">
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="pr-6">
                <Users className="w-5 h-5 inline mr-2" />
                Squadre Iscritte - {eventoIscritti?.nome}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="glass rounded-xl p-3">
                <p className="text-sm">
                  <strong>{getSquadreIscritte(eventoIscritti?.id).length}</strong> squadre iscritte
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copiaEmailIscritti(eventoIscritti?.id)}
                  className="glass rounded-full mt-2"
                >
                  {copiedEmails ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copia tutte le email
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {getSquadreIscritte(eventoIscritti?.id).map((squadra, idx) => (
                  <div key={squadra.id} className="glass rounded-xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold">{squadra.nome_squadra}</h4>
                      <span className="text-xs font-medium px-3 py-1 rounded-full glass-accent whitespace-nowrap">{squadra.altri_giocatori?.length + 1 || 1} giocatori</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Referente:</strong> {squadra.referente_nome} {squadra.referente_cognome}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-60" />
                        <span className="opacity-80">{squadra.referente_email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(squadra.referente_email);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </p>
                      {squadra.referente_telefono && (
                        <p className="opacity-70">
                          <strong>Tel:</strong> {squadra.referente_telefono}
                        </p>
                      )}
                      {squadra.altri_giocatori && squadra.altri_giocatori.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs opacity-70 mb-1">Altri giocatori:</p>
                          <div className="flex flex-wrap gap-1">
                            {squadra.altri_giocatori.map((g, i) => (
                              <span key={i} className="text-xs px-3 py-1 rounded-full glass-muted">
                                {g.nome} {g.cognome} ({g.eta} anni)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {getSquadreIscritte(eventoIscritti?.id).length === 0 && (
                <div className="text-center py-8 opacity-70">
                  Nessuna squadra iscritta
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="ghost"
                className="glass rounded-full"
                onClick={() => {
                  setShowIscrittiModal(false);
                  setEventoIscritti(null);
                }}
              >
                Chiudi
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!eventoDelete} onOpenChange={() => setEventoDelete(null)}>
          <AlertDialogContent className="panel-surface border-none rounded-[28px] sm:rounded-[28px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questo evento?</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare "{eventoDelete?.nome}". Le squadre iscritte perderanno l'accesso.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="glass rounded-full">Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(eventoDelete.id)}
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