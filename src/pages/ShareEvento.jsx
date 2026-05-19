import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function ShareEvento() {
  const [metaData, setMetaData] = useState(null);
  
  useEffect(() => {
    const loadEventMeta = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventoId = urlParams.get('id');
      
      if (!eventoId) {
        window.location.href = '/';
        return;
      }

      try {
        const eventi = await base44.entities.Evento.filter({ id: eventoId });
        const evento = eventi[0];
        
        if (evento) {
          const meta = {
            title: evento.og_title || evento.nome || 'NAVIGATE',
            description: evento.og_description || (evento.descrizione ? evento.descrizione.replace(/<[^>]*>/g, '').substring(0, 200) : ''),
            image: evento.immagine_copertina || 'https://neunoi.it/wp-content/uploads/2025/12/Logo-neunoi.png'
          };
          
          setMetaData(meta);
          
          // Update meta tags
          document.title = meta.title;
          
          const updateMetaTag = (property, content) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
              element = document.createElement('meta');
              element.setAttribute('property', property);
              document.head.appendChild(element);
            }
            element.setAttribute('content', content);
          };
          
          updateMetaTag('og:title', meta.title);
          updateMetaTag('og:description', meta.description);
          updateMetaTag('og:image', meta.image);
          updateMetaTag('og:type', 'event');
          updateMetaTag('og:url', window.location.href);
          
          updateMetaTag('twitter:title', meta.title);
          updateMetaTag('twitter:description', meta.description);
          updateMetaTag('twitter:image', meta.image);
          updateMetaTag('twitter:card', 'summary_large_image');
        }
        
        // Redirect to detail page after a brief moment
        setTimeout(() => {
          window.location.href = `${window.location.pathname}#/DettaglioEvento?id=${eventoId}`;
        }, 500);
        
      } catch (err) {
        console.error('Error loading event:', err);
        window.location.href = '/';
      }
    };
    
    loadEventMeta();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bfdbf7]/30 to-[#022b3a]/5">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1f7a8c] mx-auto mb-4" />
        <p className="text-gray-600">Caricamento evento...</p>
        {metaData && (
          <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-bold text-xl mb-2">{metaData.title}</h2>
            <p className="text-gray-600 text-sm">{metaData.description}</p>
            {metaData.image && (
              <img src={metaData.image} alt={metaData.title} className="mt-4 w-full rounded" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}