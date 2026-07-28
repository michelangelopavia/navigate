import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth as apiAuth } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import CompassLogo from '@/components/CompassLogo';

export default function ResetPassword() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Le due password non coincidono');
      return;
    }

    setLoading(true);
    try {
      await apiAuth.resetPassword(token, password);
      toast.success('Password aggiornata! Ora puoi accedere.');
      navigate(createPageUrl('Login'), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-liquid-page text-foreground flex items-center justify-center p-4">
        <div className="glass rounded-[28px] p-6 max-w-md w-full text-center">
          <CompassLogo size={40} className="mx-auto mb-3" />
          <p className="opacity-80 mb-4">Link non valido: manca il token di reset.</p>
          <Button onClick={() => navigate(createPageUrl('ForgotPassword'))} variant="ghost" className="glass-dark rounded-full">
            Richiedi un nuovo link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-liquid-page text-foreground flex flex-col">
      <div className="h-[5px] bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]" />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <CompassLogo size={40} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Scegli una nuova password</h1>
          </div>

          <div className="glass rounded-[28px] p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-xl border border-destructive text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">Nuova password</Label>
                <div className="relative mt-1">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="rounded-xl pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs opacity-60 mt-1">Minimo 8 caratteri</p>
              </div>
              <div>
                <Label htmlFor="confirm-password">Conferma password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="mt-1 rounded-xl"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" variant="ghost" className="w-full glass-dark rounded-full" disabled={loading}>
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  : <KeyRound className="w-4 h-4 mr-2" />}
                Reimposta password
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
