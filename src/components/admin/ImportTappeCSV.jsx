import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportTappeCSV({ luoghi, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      'Titolo',
      'Difficoltà (facile/media/difficile)',
      'Indovinello',
      'Risposta corretta',
      'Risposte alternative (separate da virgola)',
      'Suggerimento',
      'URL immagine',
      'Approfondimento',
      'Nome associazione',
      'URL associazione',
      'Luogo (nome)'
    ];
    
    // Usa TAB come separatore per evitare problemi con virgole nei testi
    const csv = headers.join('\t') + '\n';
    const blob = new Blob([csv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_tappe.tsv';
    link.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      if (rows.length < 2) {
        setErrors(['Il file deve contenere almeno una riga di intestazione e una di dati']);
        return;
      }

      // Rileva il separatore (TAB, punto e virgola, o virgola)
      const firstRow = rows[0];
      let separator = '\t'; // Default: TAB (TSV)
      if (!firstRow.includes('\t')) {
        separator = firstRow.includes(';') ? ';' : ',';
      }

      const dataRows = rows.slice(1); // Salta l'header
      const parsed = [];
      const newErrors = [];

      dataRows.forEach((row, index) => {
        // Split by detected separator and handle quoted values
        const values = row.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
        
        // Assicurati che ci siano almeno 11 colonne, riempiendo con stringhe vuote
        while (values.length < 11) {
          values.push('');
        }

        const [
          titolo,
          difficolta,
          indovinello,
          risposta_corretta,
          risposte_alternative_str,
          suggerimento,
          immagine_url,
          approfondimento,
          associazione,
          link_associazione,
          luogo_nome
        ] = values;

        // Validazione
        if (!titolo) {
          newErrors.push(`Riga ${index + 2}: Titolo mancante`);
          return;
        }
        if (!['facile', 'media', 'difficile'].includes(difficolta.toLowerCase())) {
          newErrors.push(`Riga ${index + 2}: Difficoltà non valida (usa: facile, media o difficile)`);
          return;
        }
        if (!indovinello) {
          newErrors.push(`Riga ${index + 2}: Indovinello mancante`);
          return;
        }
        if (!risposta_corretta) {
          newErrors.push(`Riga ${index + 2}: Risposta corretta mancante`);
          return;
        }
        if (!luogo_nome) {
          newErrors.push(`Riga ${index + 2}: Luogo mancante`);
          return;
        }

        // Trova il luogo
        const luogo = luoghi.find(l => 
          l.nome.toLowerCase() === luogo_nome.toLowerCase() ||
          `${l.nome} (${l.citta})`.toLowerCase() === luogo_nome.toLowerCase()
        );

        if (!luogo) {
          newErrors.push(`Riga ${index + 2}: Luogo "${luogo_nome}" non trovato`);
          return;
        }

        // Parse risposte alternative
        const risposte_alternative = risposte_alternative_str
          ? risposte_alternative_str.split(',').map(r => r.trim()).filter(r => r)
          : [];

        parsed.push({
          titolo,
          difficolta: difficolta.toLowerCase(),
          indovinello,
          risposta_corretta,
          risposte_alternative,
          suggerimento: suggerimento || '',
          immagine_url: immagine_url || '',
          approfondimento: approfondimento || '',
          associazione: associazione || '',
          link_associazione: link_associazione || '',
          luogo_id: luogo.id,
          _luogo_nome: luogo_nome
        });
      });

      setPreview(parsed);
      setErrors(newErrors);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.length === 0 || errors.length > 0) return;

    setIsProcessing(true);
    try {
      await onImport(preview);
      setFile(null);
      setPreview([]);
      setErrors([]);
    } catch (err) {
      setErrors([`Errore durante l'importazione: ${err.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-6 border-purple-200 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" />
          Importa Tappe da TSV/CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Scarica Template TSV
          </Button>

          <label htmlFor="csv-upload" className="cursor-pointer">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <span>
                <Upload className="w-4 h-4" />
                {file ? file.name : 'Carica TSV/CSV'}
              </span>
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Errori trovati:</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {preview.length > 0 && errors.length === 0 && (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">
                  {preview.length} tappe pronte per l'importazione
                </div>
              </AlertDescription>
            </Alert>

            <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-white">
              <div className="space-y-2">
                {preview.map((tappa, i) => (
                  <div key={i} className="text-sm border-b pb-2 last:border-0">
                    <div className="font-medium">{tappa.titolo}</div>
                    <div className="text-gray-500 text-xs">
                      {tappa.difficolta} • {tappa._luogo_nome}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleImport}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? 'Importazione in corso...' : `Importa ${preview.length} Tappe`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}