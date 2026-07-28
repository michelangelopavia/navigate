import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Moon, Sun, User, Settings, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import LanguageSelector from '@/components/LanguageSelector';
import CompassLogo from '@/components/CompassLogo';
import { useAuth } from '@/lib/AuthContext';
import { auth as apiAuth } from '@/api/entities';

export default function Header() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();

  const handleLogin = () => {
    apiAuth.redirectToLogin(window.location.href);
  };

  return (
    <>
      <div className="h-[5px] bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]" />
      <div className="header-glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <CompassLogo size={22} />
            <span className="font-bold text-sm tracking-wide uppercase hidden sm:inline">NAVIGATE</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:opacity-70 transition-opacity"
              aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSelector />
            {isLoadingAuth ? (
              <div className="w-8 h-8 rounded bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link to={createPageUrl('Profilo')}>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{user?.full_name?.split(' ')[0] || t('profile')}</span>
                  </Button>
                </Link>
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <Link to={createPageUrl('AdminDashboard')}>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleLogin} variant="ghost" size="sm" className="glass-dark rounded-full">
                <LogIn className="w-4 h-4 mr-2" />
                {t('login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
