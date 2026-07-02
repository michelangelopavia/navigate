import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LOGO_URL } from '@/lib/branding';

export default function MetaTags({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) {
  const { data: seoSettings } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const settings = await base44.entities.ImpostazioniSito.list();
      return settings[0] || null;
    },
    staleTime: 60000
  });

  const siteTitle = seoSettings?.og_title || 'NAVIGATE - Perdetevi nella città, giocando!';
  const defaultDescription = seoSettings?.og_description || 'Scopri la città attraverso una caccia al tesoro interattiva. Risolvi indovinelli, esplora luoghi nascosti e vivi un\'avventura unica con NAVIGATE.';
  const defaultImage = seoSettings?.og_image_url || LOGO_URL;
  
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalUrl = url || window.location.href;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (attr, attrValue, content) => {
      let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('name', 'description', finalDescription);
    
    // Open Graph
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:url', finalUrl);
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', finalDescription);
    if (finalImage) updateMetaTag('property', 'og:image', finalImage);

    // Twitter
    updateMetaTag('property', 'twitter:card', 'summary_large_image');
    updateMetaTag('property', 'twitter:url', finalUrl);
    updateMetaTag('property', 'twitter:title', fullTitle);
    updateMetaTag('property', 'twitter:description', finalDescription);
    if (finalImage) updateMetaTag('property', 'twitter:image', finalImage);
  }, [fullTitle, finalDescription, finalImage, finalUrl, type]);

  return null;
}