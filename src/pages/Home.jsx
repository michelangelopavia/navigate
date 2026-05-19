import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Trophy, ArrowRight, LogIn, UserPlus, Play, Settings, User, LogOut, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import MetaTags from '@/components/MetaTags';

export default function Home() {
  const { t, getLocalized, language } = useLanguage();
  const dateLocale = language === 'en' ? enUS : it;
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const { data: luoghi = [] } = useQuery({
    queryKey: ['luoghi-attivi'],
    queryFn: () => base44.entities.Luogo.filter({ attivo: true })
  });

  const { data: eventi = [] } = useQuery({
    queryKey: ['eventi-attivi'],
    queryFn: async () => {
      const allEventi = await base44.entities.Evento.filter({ attivo: true, concluso: false });
      const now = new Date();
      return allEventi.filter((e) => new Date(e.data_fine) > now);
    }
  });

  const { data: mieSquadre = [] } = useQuery({
    queryKey: ['mie-squadre', user?.id],
    queryFn: () => base44.entities.Squadra.filter({ user_id: user.id }),
    enabled: !!user?.id
  });

  const squadraInCorso = mieSquadre.find((s) => !s.completata && s.tempo_inizio);
  const squadraPronta = mieSquadre.find((s) => !s.completata && !s.tempo_inizio);

  const deleteSquadraMutation = useMutation({
    mutationFn: (squadraId) => base44.entities.Squadra.delete(squadraId),
    onSuccess: () => {
      queryClient.invalidateQueries(['mie-squadre']);
    }
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleLogout = () => {
    base44.auth.logout(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 via-white to-[#022b3a]/5">
      <MetaTags />
      {/* Header */}
      <div className="bg-white border-b border-[#022b3a]/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="https://neunoi.it/wp-content/uploads/2025/12/Logo-neunoi.png"
              alt="NAVIGATE"
              className="w-10 h-10 rounded-lg object-contain" />

            <div>
              <span className="font-bold text-[#022b3a] text-lg">NAVIGATE</span>
              <p className="text-xs text-gray-500">Perdetevi nella città, giocando!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {loadingAuth ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link to={createPageUrl('Profilo')}>
                  <Button variant="ghost" size="sm" className="text-[#022b3a]">
                    <User className="w-4 h-4 mr-2" />
                    {user?.full_name?.split(' ')[0] || t('profile')}
                  </Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link to={createPageUrl('AdminDashboard')}>
                    <Button variant="ghost" size="sm" className="text-[#022b3a]">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#db222a]">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleLogin} size="sm" className="bg-[#1f7a8c] hover:bg-[#022b3a]">
                <LogIn className="w-4 h-4 mr-2" />
                {t('login')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] opacity-95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/14436275/pexels-photo-14436275.jpeg?_gl=1*1rd059z*_ga*MjAxNjI4OTg0NS4xNzY0OTU0MjAz*_ga_8JE65Q40S6*czE3NjQ5NTQyMDIkbzEkZzAkdDE3NjQ5NTQyMDIkajYwJGwwJGgw)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />


        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-16 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              NAVIGATE
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-12">
              Perdetevi nella città, giocando!
            </p>
            <div className="text-xs opacity-80 flex items-center justify-center gap-2">
              <span>un progetto di</span>
              <a href="https://neunoi.it" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img 
                  src="https://neunoi.it/wp-content/uploads/2025/12/neunoi_logo_bianco.png" 
                  alt="neu [nòi]" 
                  className="h-6 inline"
                />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Come Funziona */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#022b3a] mb-8 text-center">
          {t('howItWorks')}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Step 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className={`h-full ${isAuthenticated ? 'border-green-300 bg-green-50' : 'border-[#1f7a8c]'}`}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold ${isAuthenticated ? 'bg-green-100 text-green-600' : 'bg-[#bfdbf7]/50 text-[#1f7a8c]'}`}>
                  {isAuthenticated ? '✓' : '1'}
                </div>
                {loadingAuth ? (
                  <div className="animate-pulse"><div className="h-6 bg-gray-200 rounded mb-2"></div></div>
                ) : isAuthenticated ? (
                  <>
                    <h3 className="font-bold text-lg mb-2 text-green-700">
                      Ciao {user?.full_name?.split(' ')[0] || 'Giocatore'}!
                    </h3>
                    <p className="text-green-600 text-sm">Sei connesso</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg mb-2 text-[#022b3a]">{t('step1Login')}</h3>
                    <p className="text-gray-500 text-sm mb-4">{t('step1Desc')}</p>
                    <Button onClick={handleLogin} className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]">
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('login')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className={`h-full ${squadraPronta || squadraInCorso ? 'border-green-300 bg-green-50' : isAuthenticated ? 'border-[#1f7a8c]' : 'border-gray-200 opacity-60'}`}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold ${squadraPronta || squadraInCorso ? 'bg-green-100 text-green-600' : isAuthenticated ? 'bg-[#bfdbf7]/50 text-[#1f7a8c]' : 'bg-gray-100 text-gray-400'}`}>
                  {squadraPronta || squadraInCorso ? '✓' : '2'}
                </div>
                {squadraPronta || squadraInCorso ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-green-700">{(squadraPronta || squadraInCorso)?.nome_squadra}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Sei sicuro di voler annullare questa iscrizione?')) {
                            deleteSquadraMutation.mutate((squadraPronta || squadraInCorso).id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-green-600 text-sm">Squadra iscritta</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg mb-2 text-[#022b3a]">{t('step2Register')}</h3>
                    <p className="text-gray-500 text-sm mb-4">{t('step2Desc')}</p>
                    {isAuthenticated && (
                      <Link to={createPageUrl('Iscrizione')}>
                        <Button className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]">
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t('register')}
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className={`h-full ${squadraInCorso ? 'border-[#FFD800] bg-[#FFD800]/10' : squadraPronta ? 'border-[#1f7a8c]' : 'border-gray-200 opacity-60'}`}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold ${squadraInCorso ? 'bg-[#FFD800] text-[#022b3a]' : squadraPronta ? 'bg-[#bfdbf7]/50 text-[#1f7a8c]' : 'bg-gray-100 text-gray-400'}`}>
                  3
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#022b3a]">
                  {squadraInCorso ? t('continuePlay') : t('step3Play')}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {squadraInCorso ? `${t('stage')} ${squadraInCorso.tappa_corrente + 1}/10` : t('step3Desc')}
                </p>
                {squadraInCorso ? (
                  <Link to={createPageUrl(`Gioca?squadra=${squadraInCorso.id}`)}>
                    <Button className="w-full bg-[#FFD800] hover:bg-[#FFD800]/80 text-[#022b3a]">
                      <Play className="w-4 h-4 mr-2" />
                      {t('continuePlay')}
                    </Button>
                  </Link>
                ) : squadraPronta ? (
                  <Link to={createPageUrl(`Gioca?squadra=${squadraPronta.id}`)}>
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      <Play className="w-4 h-4 mr-2" />
                      {t('start')}
                    </Button>
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Link Classifiche */}
        <div className="text-center mb-12">
          <Link to={createPageUrl('Classifiche')}>
            <Button variant="outline" className="border-[#FFD800] text-[#022b3a] hover:bg-[#FFD800]/20">
              <Trophy className="w-4 h-4 mr-2 text-[#FFD800]" />
              {t('viewLeaderboards')}
            </Button>
          </Link>
        </div>

        {/* Eventi */}
        {eventi.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#022b3a] mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#1f7a8c]" />
              {t('upcomingEvents')}
            </h2>
            <div className="grid gap-6">
              {eventi.map((evento, index) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-[#022b3a]/20">
                    <CardHeader className="bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] text-white">
                      <div className="flex items-center justify-between">
                        <Link to={createPageUrl(`DettaglioEvento?id=${evento.id}`)}>
                          <CardTitle className="text-xl hover:underline cursor-pointer">{getLocalized(evento, 'nome')}</CardTitle>
                        </Link>
                        <Badge className="bg-[#FFD800] text-[#022b3a]">
                          <Trophy className="w-3 h-3 mr-1" />
                          {t('competition')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-5 h-5" />
                          <span className="font-bold">
                            {format(new Date(evento.data_inizio), 'EEEE d MMMM yyyy, HH:mm', { locale: dateLocale })}
                          </span>
                        </div>
                        <Link to={createPageUrl(`DettaglioEvento?id=${evento.id}`)}>
                          <Button className="bg-[#022b3a] hover:bg-[#1f7a8c] w-full md:w-auto">
                            Scopri di più <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Luoghi Disponibili */}
        {luoghi.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#022b3a] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#1f7a8c]" />
              {t('availableLocations')} per Giocare in Autonomia
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {luoghi.map((luogo, index) => (
                <motion.div
                  key={luogo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-[#1f7a8c]/30">
                    {luogo.immagine_url && (
                      <img src={luogo.immagine_url} alt={getLocalized(luogo, 'nome')} className="w-full h-40 object-cover" />
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-[#022b3a]">{getLocalized(luogo, 'nome')}</h3>
                        <Badge className="bg-[#bfdbf7]/50 text-[#1f7a8c]">{luogo.citta}</Badge>
                      </div>
                      {(luogo.descrizione || luogo.descrizione_en) && (
                        <p className="text-gray-500 text-sm mb-4">{getLocalized(luogo, 'descrizione')}</p>
                      )}
                      {isAuthenticated ? (
                        <Link to={createPageUrl(`Iscrizione?luogo=${luogo.id}`)}>
                          <Button className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]">
                            {t('playHere')} <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button onClick={handleLogin} className="w-full bg-[#1f7a8c] hover:bg-[#022b3a]">
                          {t('loginToPlay')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <a 
              href="https://neunoi.it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1f7a8c] transition-colors"
            >
              a project by <strong>neu [nòi]</strong>
            </a>
            <a 
              href="https://karascio.it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1f7a8c] transition-colors"
            >
              powered by <strong>Karasciò</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}