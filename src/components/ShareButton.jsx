import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ eventoId, variant = "outline", size = "sm" }) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    // URL diretto dell'evento
    return `${window.location.origin}/DettaglioEvento?id=${eventoId}`;
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = getShareUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NAVIGATE - Evento',
          text: 'Partecipa a questo evento su NAVIGATE!',
          url: url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleShare}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Link Copiato
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Condividi
        </>
      )}
    </Button>
  );
}