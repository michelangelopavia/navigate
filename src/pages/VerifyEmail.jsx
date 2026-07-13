import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth as apiAuth } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-2 border-[#1f7a8c]/20">
        <CardContent className="p-6 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 text-[#1f7a8c] mx-auto mb-3 animate-spin" />
              <p className="text-gray-700">Verifica in corso...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-gray-700">Email confermata! Ti stiamo reindirizzando...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 mb-4">{error}</p>
              <Button onClick={() => navigate(createPageUrl('Login'))} className="bg-[#1f7a8c] hover:bg-[#022b3a]">
                Torna al login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
