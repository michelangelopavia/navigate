import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth as apiAuth } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const token = new URLSearchParams(window.location.search).get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Link non valido: manca il token di verifica.');
      return;
    }

    apiAuth.verifyEmail(token)
      .then(({ token: jwt }) => {
        localStorage.setItem('navigate_token', jwt);
        setStatus('success');
        checkAppState().then(() => {
          navigate(createPageUrl('Home'), { replace: true });
        });
      })
      .catch((err) => {
        setStatus('error');
        setError(err.response?.data?.error || 'Errore durante la verifica dell\'email');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-liquid-page text-foreground flex items-center justify-center p-4">
      <div className="glass rounded-[28px] p-6 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin opacity-70" />
            <p className="opacity-80">Verifica in corso...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-accent" />
            <p className="opacity-80">Email confermata! Ti stiamo reindirizzando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 mx-auto mb-3 text-destructive" />
            <p className="opacity-80 mb-4">{error}</p>
            <Button onClick={() => navigate(createPageUrl('Login'))} variant="ghost" className="glass-dark rounded-full">
              Torna al login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
