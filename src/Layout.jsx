import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ArrowUp } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasHomeButton = currentPageName !== 'Home';

  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed ${hasHomeButton ? 'bottom-20' : 'bottom-6'} right-6 bg-accent hover:opacity-90 text-accent-foreground p-3 rounded shadow-lg z-50 transition-all hover:scale-110`}
            aria-label="Torna in cima"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
        {hasHomeButton && (
          <Link
            to={createPageUrl('Home')}
            className="fixed bottom-6 right-6 bg-accent hover:opacity-90 text-accent-foreground p-3 rounded shadow-lg z-50 transition-all hover:scale-110"
            aria-label="Torna alla Home"
          >
            <Home className="w-6 h-6" />
          </Link>
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}
