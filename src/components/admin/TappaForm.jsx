import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, MapPin, Lightbulb, Globe } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function TappaForm({ isOpen, onClose, onSubmit, tappa, luoghi = [], isLoading }) {
  const [formData, setFormData] = useState({
    titolo: '',
    titolo_en: '',
    indovinello: '',
    indovinello_en: '',
    risposta_corretta: '',
    risposta_corretta_en: '',
    risposte_alternative: [],
    risposte_alternative_en: [],
    suggerimento: '',
    suggerimento_en: '',
    difficolta: 'facile',
    luogo_id: '',
    immagine_url: '',
    approfondimento: '',
    approfondimento_en: '',
    associazione: '',
    link_associazione: ''
  });

  const [showEnglish, setShowEnglish] = useState(false);

  useEffect(() => {
    if (tappa) {
      setFormData({
        titolo: tappa.titolo || '',
        titolo_en: tappa.titolo_en || '',
        indovinello: tappa.indovinello || '',
        indovinello_en: tappa.indovinello_en || '',
        risposta_corretta: tappa.risposta_corretta || '',
        risposta_corretta_en: tappa.risposta_corretta_en || '',
        risposte_alternative: tappa.risposte_alternative || [],
        risposte_alternative_en: tappa.risposte_alternative_en || [],
        suggerimento: tappa.suggerimento || '',
        suggerimento_en: tappa.suggerimento_en || '',
        difficolta: tappa.difficolta || 'facile',
        luogo_id: tappa.luogo_id || '',
        immagine_url: tappa.immagine_url || '',
        approfondimento: tappa.approfondimento || '',
        approfondimento_en: tappa.approfondimento_en || '',
        associazione: tappa.associazione || '',
        link_associazione: tappa.link_associazione || ''
      });
    } else {
      setFormData({
        titolo: '',
        titolo_en: '',
        indovinello: '',
        indovinello_en: '',
        risposta_corretta: '',
        risposta_corretta_en: '',
        risposte_alternative: [],
        risposte_alternative_en: [],
        suggerimento: '',
        suggerimento_en: '',
        difficolta: 'facile',
        luogo_id: luoghi[0]?.id || '',
        immagine_url: '',
        approfondimento: '',
        approfondimento_en: '',
        associazione: '',
        link_associazione: ''
      });
    }
  }, [tappa, luoghi]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            {tappa ? 'Modifica Tappa' : 'Nuova Tappa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="luogo_id">Luogo *</Label>
              <Select
                value={formData.luogo_id}
                onValueChange={(value) => setFormData({ ...formData, luogo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un luogo" />
                </SelectTrigger>
                <SelectContent>
                  {luoghi.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nome} ({l.citta})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="titolo">Titolo/Luogo *</Label>
              <Input
                id="titolo"
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                placeholder="Es. Piazza del Duomo"
                required
              />
              {showEnglish && (
                <Input
                  className="mt-2"
                  value={formData.titolo_en}
                  onChange={(e) => setFormData({ ...formData, titolo_en: e.target.value })}
                  placeholder="🇬🇧 English title"
                />
              )}
            </div>
            
            <div>
              <Label htmlFor="difficolta">Difficoltà *</Label>
              <Select
                value={formData.difficolta}
                onValueChange={(value) => setFormData({ ...formData, difficolta: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facile">🟢 Facile (tappe 1-4)</SelectItem>
                  <SelectItem value="media">🟡 Media (tappe 5-8)</SelectItem>
                  <SelectItem value="difficile">🔴 Difficile (tappe 9-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Label htmlFor="indovinello">Indovinello *</Label>
            <Textarea
              id="indovinello"
              value={formData.indovinello}
              onChange={(e) => setFormData({ ...formData, indovinello: e.target.value })}
              placeholder="Scrivi l'indovinello che i giocatori dovranno risolvere..."
              rows={4}
              required
            />
            {showEnglish && (
              <Textarea
                className="mt-2"
                value={formData.indovinello_en}
                onChange={(e) => setFormData({ ...formData, indovinello_en: e.target.value })}
                placeholder="🇬🇧 English riddle (important for wordplay!)"
                rows={4}
              />
            )}
          </div>

          <div>
            <Label htmlFor="risposta_corretta">Risposta Corretta *</Label>
            <Input
              id="risposta_corretta"
              value={formData.risposta_corretta}
              onChange={(e) => setFormData({ ...formData, risposta_corretta: e.target.value })}
              placeholder="La risposta principale"
              required
            />
            {showEnglish && (
              <Input
                className="mt-2"
                value={formData.risposta_corretta_en}
                onChange={(e) => setFormData({ ...formData, risposta_corretta_en: e.target.value })}
                placeholder="🇬🇧 English correct answer"
              />
            )}
          </div>

          <div>
            <Label htmlFor="risposte_alternative">Risposte Alternative</Label>
            <Input
              id="risposte_alternative"
              value={(formData.risposte_alternative || []).join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                risposte_alternative: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="blu, blue, azzurro (separate da virgola)"
            />
            {showEnglish && (
              <Input
                className="mt-2"
                value={(formData.risposte_alternative_en || []).join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  risposte_alternative_en: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="🇬🇧 English alternatives (comma separated)"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Varianti accettate, separate da virgola. Il sistema tollera anche piccoli errori di battitura.
            </p>
          </div>

          <div>
            <Label htmlFor="suggerimento" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#1f7a8c]" />
              Suggerimento (Aiuto)
            </Label>
            <Textarea
              id="suggerimento"
              value={formData.suggerimento}
              onChange={(e) => setFormData({ ...formData, suggerimento: e.target.value })}
              placeholder="Suggerimento che appare se il giocatore chiede aiuto (costa 5 punti)"
              rows={2}
            />
            {showEnglish && (
              <Textarea
                className="mt-2"
                value={formData.suggerimento_en}
                onChange={(e) => setFormData({ ...formData, suggerimento_en: e.target.value })}
                placeholder="🇬🇧 English hint"
                rows={2}
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Se il giocatore usa l'aiuto, guadagna solo 5 punti invece di 10
            </p>
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

          <div>
            <Label htmlFor="approfondimento">Approfondimento</Label>
            <Textarea
              id="approfondimento"
              value={formData.approfondimento}
              onChange={(e) => setFormData({ ...formData, approfondimento: e.target.value })}
              placeholder="Informazioni che appariranno dopo aver indovinato..."
              rows={3}
            />
            {showEnglish && (
              <Textarea
                className="mt-2"
                value={formData.approfondimento_en}
                onChange={(e) => setFormData({ ...formData, approfondimento_en: e.target.value })}
                placeholder="🇬🇧 English learn more content"
                rows={3}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="associazione">Associazione collegata</Label>
              <Input
                id="associazione"
                value={formData.associazione}
                onChange={(e) => setFormData({ ...formData, associazione: e.target.value })}
                placeholder="Nome associazione"
              />
            </div>
            <div>
              <Label htmlFor="link_associazione">Link Associazione</Label>
              <Input
                id="link_associazione"
                value={formData.link_associazione}
                onChange={(e) => setFormData({ ...formData, link_associazione: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isLoading || !formData.luogo_id}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {tappa ? 'Salva Modifiche' : 'Crea Tappa'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}