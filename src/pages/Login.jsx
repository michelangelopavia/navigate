import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { auth as apiAuth } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import CompassLogo from '@/components/CompassLogo';

export default function Login() {
  const { isAuthenticated, isLoadingAuth, login } = useAuth();
  const navigate = useNavigate();

  const [loginForm,    setLoginForm]    = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showLoginPassword,    setShowLoginPassword]    = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registeredEmail,   setRegisteredEmail]   = useState(''); // set dopo una registrazione riuscita, mostra lo schermo "controlla la tua email"
  const [notVerifiedEmail,  setNotVerifiedEmail]  = useState(''); // set se il login fallisce per email non confermata
  const [resendLoading, setResendLoading] = useState(false);

  // Se già autenticato o il token OAuth è appena arrivato, vai alla home
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // Mostra errore OAuth se presente nell'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'oauth') {
      setError('Accesso con Google non riuscito. Riprova.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotVerifiedEmail('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerifiedEmail(loginForm.email);
      }
      setError(err.response?.data?.error || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiAuth.register(registerForm);
      setRegisteredEmail(registerForm.email);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (email) => {
    setResendLoading(true);
    try {
      await apiAuth.resendVerification(email);
      toast.success('Se l\'indirizzo non è ancora confermato, riceverai una nuova email a breve.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-liquid-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
            <h1 className="font-medium uppercase tracking-tight text-3xl">Navigate</h1>
            <p className="text-sm opacity-70 mt-1">Perdetevi nella città, giocando!</p>
          </div>

          <div className="glass rounded-[28px] p-6 md:p-8">

            {/* Google OAuth */}
            <Button
              onClick={() => { window.location.href = '/api/auth/google'; }}
              variant="ghost"
              className="w-full mb-4 glass rounded-full gap-2 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continua con Google
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs uppercase opacity-60">oppure</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Tabs defaultValue="login">
              <TabsList className="w-full mb-4 h-auto p-1 rounded-full">
                <TabsTrigger value="login"    className="w-1/2 rounded-full">Accedi</TabsTrigger>
                <TabsTrigger value="register" className="w-1/2 rounded-full">Registrati</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 rounded-xl border border-destructive text-destructive text-sm">
                  {error}
                  {notVerifiedEmail && (
                    <button
                      type="button"
                      onClick={() => handleResendVerification(notVerifiedEmail)}
                      disabled={resendLoading}
                      className="block mt-2 font-medium underline hover:no-underline"
                    >
                      {resendLoading ? 'Invio in corso...' : 'Reinvia email di verifica'}
                    </button>
                  )}
                </div>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email" type="email" required className="mt-1 rounded-xl"
                      placeholder="tua@email.it"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        className="rounded-xl pr-10"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Link
                      to={createPageUrl('ForgotPassword')}
                      className="text-xs opacity-70 hover:opacity-100 hover:underline block text-right mt-1"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                  <Button type="submit" variant="ghost" className="w-full glass-dark rounded-full" disabled={loading}>
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      : <LogIn className="w-4 h-4 mr-2" />}
                    Accedi
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                {registeredEmail ? (
                  <div className="text-center py-4">
                    <Mail className="w-10 h-10 mx-auto mb-3 opacity-70" />
                    <p className="opacity-80 mb-4">
                      Ti abbiamo inviato un'email di conferma a <strong>{registeredEmail}</strong>. Clicca sul link per attivare l'account.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleResendVerification(registeredEmail)}
                      disabled={resendLoading}
                      className="text-sm opacity-70 hover:opacity-100 underline hover:no-underline"
                    >
                      {resendLoading ? 'Invio in corso...' : 'Non hai ricevuto l\'email? Reinvia'}
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-name">Nome completo</Label>
                    <Input
                      id="reg-name" required className="mt-1 rounded-xl"
                      placeholder="Mario Rossi"
                      value={registerForm.full_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email" type="email" required className="mt-1 rounded-xl"
                      placeholder="tua@email.it"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="reg-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        className="rounded-xl pr-10"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs opacity-60 mt-1">Minimo 8 caratteri</p>
                  </div>
                  <Button type="submit" variant="ghost" className="w-full glass-dark rounded-full" disabled={loading}>
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      : <UserPlus className="w-4 h-4 mr-2" />}
                    Crea Account
                  </Button>
                </form>
                )}
              </TabsContent>
            </Tabs>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
