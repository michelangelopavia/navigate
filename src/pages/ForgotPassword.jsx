import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth as apiAuth } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import CompassLogo from '@/components/CompassLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiAuth.forgotPassword(email);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

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
            <h1 className="text-2xl font-bold">Password dimenticata?</h1>
            <p className="text-sm opacity-70 mt-1">Inserisci la tua email, ti invieremo un link per reimpostarla.</p>
          </div>

          <div className="glass rounded-[28px] p-6 md:p-8">
            {sent ? (
              <div className="text-center py-4">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-70" />
                <p className="opacity-80">
                  Se l'indirizzo è registrato, riceverai a breve un'email con le istruzioni per reimpostare la password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email" type="email" required className="mt-1 rounded-xl"
                    placeholder="tua@email.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="ghost" className="w-full glass-dark rounded-full" disabled={loading}>
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <Mail className="w-4 h-4 mr-2" />}
                  Invia link di reset
                </Button>
              </form>
            )}

            <Link
              to={createPageUrl('Login')}
              className="flex items-center justify-center gap-1 text-sm opacity-70 hover:opacity-100 mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna al login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
