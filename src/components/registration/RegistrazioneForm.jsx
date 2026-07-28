import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Trash2, Loader2, UserCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegistrazioneForm({ luogo, evento, squadraPrecedente, onSubmit, isLoading, disabled, user }) {
  const [usaPrecedente, setUsaPrecedente] = useState(false);
  const [formData, setFormData] = useState({
    nome_squadra: '',
    referente_nome: '',
    referente_cognome: '',
    referente_email: user?.email || '',
    referente_telefono: '',
    referente_eta: '',
    altri_giocatori: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (usaPrecedente && squadraPrecedente) {
      setFormData({
        nome_squadra: squadraPrecedente.nome_squadra || '',
        referente_nome: squadraPrecedente.referente_nome || '',
        referente_cognome: squadraPrecedente.referente_cognome || '',
        referente_email: squadraPrecedente.referente_email || '',
        referente_telefono: squadraPrecedente.referente_telefono || '',
        referente_eta: squadraPrecedente.referente_eta || '',
        altri_giocatori: squadraPrecedente.altri_giocatori || []
      });
    }
  }, [usaPrecedente, squadraPrecedente]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nome_squadra.trim()) newErrors.nome_squadra = 'Inserisci il nome della squadra';
    if (!formData.referente_nome.trim()) newErrors.referente_nome = 'Inserisci il nome';
    if (!formData.referente_cognome.trim()) newErrors.referente_cognome = 'Inserisci il cognome';
    if (!formData.referente_email.trim()) newErrors.referente_email = 'Inserisci l\'email';
    if (!formData.referente_eta || formData.referente_eta < 18) newErrors.referente_eta = 'Devi avere almeno 18 anni';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const addGiocatore = () => {
    if (formData.altri_giocatori.length < 9) {
      setFormData({
        ...formData,
        altri_giocatori: [...formData.altri_giocatori, { nome: '', cognome: '', eta: '' }]
      });
    }
  };

  const removeGiocatore = (index) => {
    setFormData({
      ...formData,
      altri_giocatori: formData.altri_giocatori.filter((_, i) => i !== index)
    });
  };

  const updateGiocatore = (index, field, value) => {
    const updated = [...formData.altri_giocatori];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, altri_giocatori: updated });
  };

  return (
    <div className="glass rounded-[28px] p-6 md:p-8">
      <h2 className="flex items-center gap-2 font-bold uppercase tracking-wide mb-6">
        <Users className="w-6 h-6" />
        Iscrizione Squadra
      </h2>

      {/* Opzione per recuperare dati precedenti */}
      {squadraPrecedente && (
        <div className="mb-6 p-4 glass-muted rounded-2xl">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usaPrecedente"
              checked={usaPrecedente}
              onCheckedChange={setUsaPrecedente}
            />
            <label htmlFor="usaPrecedente" className="text-sm font-medium cursor-pointer">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Usa i dati della squadra precedente ({squadraPrecedente.nome_squadra})
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome Squadra */}
        <div>
          <Label htmlFor="nome_squadra" className="text-lg font-semibold">
            Nome della Squadra *
          </Label>
          <Input
            id="nome_squadra"
            value={formData.nome_squadra}
            onChange={(e) => setFormData({ ...formData, nome_squadra: e.target.value })}
            placeholder="Es. I Cacciatori di Tesori"
            className={`mt-2 text-lg py-6 rounded-xl ${errors.nome_squadra ? 'border-destructive' : ''}`}
          />
          {errors.nome_squadra && <p className="text-destructive text-sm mt-1">{errors.nome_squadra}</p>}
        </div>

        {/* Referente */}
        <div className="p-4 rounded-2xl border border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Referente Squadra
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referente_nome">Nome *</Label>
              <Input
                id="referente_nome"
                value={formData.referente_nome}
                onChange={(e) => setFormData({ ...formData, referente_nome: e.target.value })}
                className={`rounded-xl ${errors.referente_nome ? 'border-destructive' : ''}`}
              />
              {errors.referente_nome && <p className="text-destructive text-sm mt-1">{errors.referente_nome}</p>}
            </div>

            <div>
              <Label htmlFor="referente_cognome">Cognome *</Label>
              <Input
                id="referente_cognome"
                value={formData.referente_cognome}
                onChange={(e) => setFormData({ ...formData, referente_cognome: e.target.value })}
                className={`rounded-xl ${errors.referente_cognome ? 'border-destructive' : ''}`}
              />
              {errors.referente_cognome && <p className="text-destructive text-sm mt-1">{errors.referente_cognome}</p>}
            </div>

            <div>
              <Label htmlFor="referente_email">Email *</Label>
              <Input
                id="referente_email"
                type="email"
                value={formData.referente_email}
                onChange={(e) => setFormData({ ...formData, referente_email: e.target.value })}
                className={`rounded-xl ${errors.referente_email ? 'border-destructive' : ''}`}
              />
              {errors.referente_email && <p className="text-destructive text-sm mt-1">{errors.referente_email}</p>}
            </div>

            <div>
              <Label htmlFor="referente_telefono">Telefono</Label>
              <Input
                id="referente_telefono"
                type="tel"
                value={formData.referente_telefono}
                onChange={(e) => setFormData({ ...formData, referente_telefono: e.target.value })}
                placeholder="Opzionale"
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="referente_eta">Età *</Label>
              <Input
                id="referente_eta"
                type="number"
                value={formData.referente_eta}
                onChange={(e) => setFormData({ ...formData, referente_eta: parseInt(e.target.value) || '' })}
                className={`rounded-xl ${errors.referente_eta ? 'border-destructive' : ''}`}
                min="18"
                max="120"
                placeholder="Età (minimo 18 anni)"
              />
              {errors.referente_eta && <p className="text-destructive text-sm mt-1">{errors.referente_eta}</p>}
            </div>
          </div>
        </div>

        {/* Altri Giocatori */}
        <div className="p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Altri Giocatori ({formData.altri_giocatori.length}/9)
            </h3>
            {formData.altri_giocatori.length < 9 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addGiocatore}
                className="glass-dark rounded-full"
              >
                <Plus className="w-4 h-4 mr-1" /> Aggiungi
              </Button>
            )}
          </div>

          <AnimatePresence>
            {formData.altri_giocatori.map((giocatore, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-4 gap-2 mb-3 items-end"
              >
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={giocatore.nome}
                    onChange={(e) => updateGiocatore(index, 'nome', e.target.value)}
                    placeholder="Nome"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cognome</Label>
                  <Input
                    value={giocatore.cognome}
                    onChange={(e) => updateGiocatore(index, 'cognome', e.target.value)}
                    placeholder="Cognome"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs">Età</Label>
                  <Input
                    type="number"
                    value={giocatore.eta}
                    onChange={(e) => updateGiocatore(index, 'eta', parseInt(e.target.value) || '')}
                    placeholder="Età"
                    min="1"
                    max="120"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGiocatore(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {formData.altri_giocatori.length === 0 && (
            <p className="text-sm text-center py-4 opacity-60">
              Nessun altro giocatore aggiunto. Clicca "Aggiungi" per inserirne.
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="ghost"
          className="w-full glass-dark rounded-full text-lg py-6"
          disabled={isLoading || disabled}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Iscriviti alla Caccia al Tesoro'
          )}
        </Button>
      </form>
    </div>
  );
}
