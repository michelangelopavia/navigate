import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Globe, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ImpostazioniSEO() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    site_title: '',
    site_description: '',
    site_image: '',
    site_url: ''
  });

  const { data: impostazioni, isLoading } = useQuery({
    queryKey: ['impostazioni-seo'],
    queryFn: async () => {
      const settings = await base44.entities.ImpostazioniSito.filter({ chiave: 'seo_defaults' });
      if (settings[0]) {
        setFormData({
          site_title: settings[0].site_title || '',
          site_description: settings[0].site_description || '',
          site_image: settings[0].site_image || '',
          site_url: settings[0].site_url || ''
        });
      }
      return settings[0];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (impostazioni) {
        return base44.entities.ImpostazioniSito.update(impostazioni.id, data);
      } else {
        return base44.entities.ImpostazioniSito.create({
          chiave: 'seo_defaults',
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['impostazioni-seo']);
      alert('Impostazioni salvate con successo!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Impostazioni SEO e Social</h1>
            <p className="text-gray-500 text-sm">Gestisci i meta tag di default per il sito</p>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Meta Tag di Default
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Info:</strong> Questi sono i valori predefiniti usati quando si condivide il sito sui social 
                  (per pagine senza meta tag specifici come eventi).
                </p>
              </div>

              <div>
                <Label htmlFor="site_title">Titolo del Sito</Label>
                <Input
                  id="site_title"
                  value={formData.site_title}
                  onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                  placeholder="NAVIGATE - Perdetevi nella città, giocando!"
                />
              </div>

              <div>
                <Label htmlFor="site_description">Descrizione del Sito</Label>
                <Textarea
                  id="site_description"
                  value={formData.site_description}
                  onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                  placeholder="Descrizione che apparirà quando qualcuno condivide il link del sito..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="site_image">Immagine di Default (URL)</Label>
                <Input
                  id="site_image"
                  value={formData.site_image}
                  onChange={(e) => setFormData({ ...formData, site_image: e.target.value })}
                  placeholder="https://esempio.com/immagine-default.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Immagine mostrata nelle anteprime social</p>
                {formData.site_image && (
                  <img 
                    src={formData.site_image} 
                    alt="Preview" 
                    className="mt-2 w-48 h-48 object-cover rounded border" 
                  />
                )}
              </div>

              <div>
                <Label htmlFor="site_url">URL Base del Sito</Label>
                <Input
                  id="site_url"
                  value={formData.site_url}
                  onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                  placeholder="https://tuosito.it"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-500 hover:bg-purple-600"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salva Impostazioni
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}