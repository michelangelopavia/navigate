import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth as apiAuth } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

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
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 via-white to-[#022b3a]/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#022b3a]">Password dimenticata?</h1>
          <p className="text-gray-500 text-sm">Inserisci la tua email, ti invieremo un link per reimpostarla.</p>
        </div>

        <Card className="shadow-xl border-2 border-[#1f7a8c]/20">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center py-4">
                <Mail className="w-10 h-10 text-[#1f7a8c] mx-auto mb-3" />
                <p className="text-gray-700">
                  Se l'indirizzo è registrato, riceverai a breve un'email con le istruzioni per reimpostare la password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email" type="email" required className="mt-1"
                    placeholder="tua@email.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]" disabled={loading}>
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <Mail className="w-4 h-4 mr-2" />}
                  Invia link di reset
                </Button>
              </form>
            )}

            <Link
              to={createPageUrl('Login')}
              className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-[#022b3a] mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna al login
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
