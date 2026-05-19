import React from 'react';
import { LanguageProvider } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      {children}
      {currentPageName !== 'Home' && (
        <Link 
          to={createPageUrl('Home')}
          className="fixed bottom-6 right-6 bg-[#1f7a8c] hover:bg-[#022b3a] text-white p-3 rounded-full shadow-lg z-50 transition-all hover:scale-110"
          aria-label="Torna alla Home"
        >
          <Home className="w-6 h-6" />
        </Link>
      )}
    </LanguageProvider>
  );
}