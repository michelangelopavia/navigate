import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { auth as apiAuth } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { LOGO_URL } from '@/lib/branding';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1f7a8c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 via-white to-[#022b3a]/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          {LOGO_URL && (
            <img
              src={LOGO_URL}
              alt="NAVIGATE"
              className="w-16 h-16 rounded-xl object-contain mx-auto mb-3"
            />
          )}
          <h1 className="text-2xl font-bold text-[#022b3a]">NAVIGATE</h1>
          <p className="text-gray-500 text-sm">Perdetevi nella città, giocando!</p>
        </div>

        <Card className="shadow-xl border-2 border-[#1f7a8c]/20">
          <CardContent className="p-6">

            {/* Google OAuth */}
            <Button
              onClick={() => { window.location.href = '/api/auth/google'; }}
              variant="outline"
              className="w-full mb-4 border-2 hover:bg-gray-50 gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continua con Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">oppure</span>
              </div>
            </div>

            <Tabs defaultValue="login">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="login"    className="w-1/2">Accedi</TabsTrigger>
                <TabsTrigger value="register" className="w-1/2">Registrati</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
                      id="login-email" type="email" required className="mt-1"
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
                        className="pr-10"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Link
                      to={createPageUrl('ForgotPassword')}
                      className="text-xs text-[#1f7a8c] hover:text-[#022b3a] hover:underline block text-right mt-1"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]" disabled={loading}>
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
                    <Mail className="w-10 h-10 text-[#1f7a8c] mx-auto mb-3" />
                    <p className="text-gray-700 mb-4">
                      Ti abbiamo inviato un'email di conferma a <strong>{registeredEmail}</strong>. Clicca sul link per attivare l'account.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleResendVerification(registeredEmail)}
                      disabled={resendLoading}
                      className="text-sm text-[#1f7a8c] hover:text-[#022b3a] underline hover:no-underline"
                    >
                      {resendLoading ? 'Invio in corso...' : 'Non hai ricevuto l\'email? Reinvia'}
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-name">Nome completo</Label>
                    <Input
                      id="reg-name" required className="mt-1"
                      placeholder="Mario Rossi"
                      value={registerForm.full_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email" type="email" required className="mt-1"
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
                        className="pr-10"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimo 8 caratteri</p>
                  </div>
                  <Button type="submit" className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]" disabled={loading}>
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      : <UserPlus className="w-4 h-4 mr-2" />}
                    Crea Account
                  </Button>
                </form>
                )}
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
