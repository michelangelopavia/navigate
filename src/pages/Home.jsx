import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Trophy, ArrowRight, LogIn, UserPlus, Play, Settings, User, LogOut, Trash2, Moon, Sun } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import LanguageSelector from '@/components/LanguageSelector';
import MetaTags from '@/components/MetaTags';
import CompassLogo from '@/components/CompassLogo';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { logout } = useAuth();
  const { t, getLocalized, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const dateLocale = language === 'en' ? enUS : it;
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [squadraToDelete, setSquadraToDelete] = useState(null);

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

  // Un evento è davvero finito se non compare più tra gli eventi attivi,
  // indipendentemente da squadraInCorso.completata (che si aggiorna solo
  // visitando Gioca.jsx e può quindi essere ancora false)
  const eventoTerminato = squadraInCorso?.evento_id &&
    !eventi.some((e) => e.id === squadraInCorso.evento_id);

  const deleteSquadraMutation = useMutation({
    mutationFn: (squadraId) => base44.entities.Squadra.delete(squadraId),
    onSuccess: () => {
      queryClient.invalidateQueries(['mie-squadre']);
    }
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const stepIcon = "w-14 h-14 rounded-2xl glass-accent flex items-center justify-center flex-shrink-0";

  return (
    <div className="min-h-screen bg-liquid-page text-foreground">
      <MetaTags />

      {/* Barra gradiente */}
      <div className="h-[5px] bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]" />

      {/* Header */}
      <div className="header-glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <CompassLogo size={22} />
            <span className="font-bold text-sm tracking-wide uppercase hidden sm:inline">NAVIGATE</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:opacity-70 transition-opacity"
              aria-label={theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSelector />
            {loadingAuth ? (
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

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="glass glass-hero p-6 md:p-12 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <CompassLogo size={44} className="mx-auto mb-3" />
            <h1 className="font-medium uppercase tracking-tight leading-none text-[clamp(3rem,6.6vw,4.8rem)]">
              Navigate
            </h1>
            <p className="text-sm mt-2 max-w-xs mx-auto opacity-80">
              Perdetevi nella città, giocando!
            </p>
            <div className="text-xs opacity-60 flex items-center justify-center gap-2 mt-3">
              <span>un progetto di</span>
              <a href="https://karascio.it" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <strong>Karasciò</strong>
              </a>
            </div>
          </motion.div>

          {/* Come Funziona */}
          <div className="mt-10">
            <h2 className="text-xl font-medium uppercase mb-4">
              {t('howItWorks')}
            </h2>

            <div className="grid gap-4">
              {/* Step 1 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="glass rounded-[22px] p-5 grid grid-cols-[1fr_auto] gap-4 items-center">
                  {loadingAuth ? (
                    <div className="animate-pulse h-6 bg-muted rounded" />
                  ) : isAuthenticated ? (
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide">
                        Ciao {user?.full_name?.split(' ')[0] || 'Giocatore'}!
                      </h3>
                      <div className="w-10 h-px bg-foreground my-2" />
                      <p className="text-xs opacity-60">Sei connesso</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide">{t('step1Login')}</h3>
                      <div className="w-10 h-px bg-foreground my-2" />
                      <p className="text-xs opacity-60 mb-3">{t('step1Desc')}</p>
                      <Button onClick={handleLogin} variant="ghost" size="sm" className="glass-dark rounded-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('login')}
                      </Button>
                    </div>
                  )}
                  <div className={stepIcon}>
                    {isAuthenticated ? <span className="text-xl font-bold">✓</span> : <User className="w-6 h-6" />}
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className={`glass rounded-[22px] p-5 grid grid-cols-[1fr_auto] gap-4 items-center ${!isAuthenticated && !squadraPronta && !squadraInCorso ? 'opacity-50' : ''}`}>
                  {squadraPronta || squadraInCorso ? (
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide">{(squadraPronta || squadraInCorso)?.nome_squadra}</h3>
                      <div className="w-10 h-px bg-foreground my-2" />
                      <p className="text-xs opacity-60 mb-2">Squadra iscritta</p>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSquadraToDelete((squadraPronta || squadraInCorso).id)}
                        className="rounded-full text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide">{t('step2Register')}</h3>
                      <div className="w-10 h-px bg-foreground my-2" />
                      <p className="text-xs opacity-60 mb-3">{t('step2Desc')}</p>
                      {isAuthenticated && (
                        <Link to={createPageUrl('Iscrizione')}>
                          <Button variant="ghost" size="sm" className="glass-dark rounded-full">
                            <UserPlus className="w-4 h-4 mr-2" />
                            {t('register')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                  <div className={stepIcon}>
                    {squadraPronta || squadraInCorso ? <span className="text-xl font-bold">✓</span> : <UserPlus className="w-6 h-6" />}
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className={`glass rounded-[22px] p-5 grid grid-cols-[1fr_auto] gap-4 items-center ${!squadraPronta && !squadraInCorso ? 'opacity-50' : ''}`}>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide">
                      {eventoTerminato ? 'Evento terminato' : squadraInCorso ? t('continuePlay') : t('step3Play')}
                    </h3>
                    <div className="w-10 h-px bg-foreground my-2" />
                    <p className="text-xs opacity-60 mb-3">
                      {eventoTerminato ? 'Consulta la classifica finale' : squadraInCorso ? `${t('stage')} ${squadraInCorso.tappa_corrente + 1}/10` : t('step3Desc')}
                    </p>
                    {eventoTerminato ? (
                      <Link to={createPageUrl(`Classifica?evento=${squadraInCorso.evento_id}`)}>
                        <Button variant="ghost" size="sm" className="glass-dark rounded-full">
                          <Play className="w-4 h-4 mr-2" />
                          Vedi Classifica
                        </Button>
                      </Link>
                    ) : squadraInCorso ? (
                      <Link to={createPageUrl(`Gioca?squadra=${squadraInCorso.id}`)}>
                        <Button variant="ghost" size="sm" className="glass-dark rounded-full">
                          <Play className="w-4 h-4 mr-2" />
                          {t('continuePlay')}
                        </Button>
                      </Link>
                    ) : squadraPronta ? (
                      <Link to={createPageUrl(`Gioca?squadra=${squadraPronta.id}`)}>
                        <Button variant="ghost" size="sm" className="glass-dark rounded-full">
                          <Play className="w-4 h-4 mr-2" />
                          {t('start')}
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                  <div className={stepIcon}>
                    <Play className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Inizia a giocare */}
          <div className="flex justify-center mt-10">
            <Button variant="ghost" className="glass-dark rounded-full uppercase tracking-wide font-bold px-7">
              {t('step3Play')}
            </Button>
          </div>
        </section>

        {/* CTA Classifiche */}
        <div className="flex justify-center mb-8">
          <Link to={createPageUrl('Classifiche')}>
            <Button variant="ghost" className="btn-glass-accent rounded-full uppercase tracking-wide font-bold">
              <Trophy className="w-4 h-4 mr-2" />
              {t('viewLeaderboards')}
            </Button>
          </Link>
        </div>

        {/* Eventi */}
        {eventi.length > 0 && (
          <section className="panel-surface rounded-[28px] p-6 md:p-12 mb-10">
            <h2 className="text-2xl md:text-4xl font-medium uppercase mb-7 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {t('upcomingEvents')}
            </h2>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {eventi.map((evento, index) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="glass rounded-[22px] p-6">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <Link to={createPageUrl(`DettaglioEvento?id=${evento.id}`)}>
                        <span className="font-bold text-lg hover:underline cursor-pointer">{getLocalized(evento, 'nome')}</span>
                      </Link>
                      <Badge className="bg-accent text-accent-foreground uppercase whitespace-nowrap">
                        <Trophy className="w-3 h-3 mr-1" />
                        {t('competition')}
                      </Badge>
                    </div>
                    <div className="w-10 h-px bg-foreground mb-3" />
                    <div className="text-sm opacity-60 mb-5">
                      {format(new Date(evento.data_inizio), 'EEEE d MMMM yyyy, HH:mm', { locale: dateLocale })}
                    </div>
                    <Link to={createPageUrl(`DettaglioEvento?id=${evento.id}`)}>
                      <Button variant="ghost" className="glass-dark rounded-full w-full uppercase tracking-wide font-bold">
                        Scopri di più <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Luoghi Disponibili */}
        {luoghi.length > 0 && (
          <section className="panel-surface rounded-[28px] p-6 md:p-12 mb-10">
            <h2 className="text-2xl md:text-4xl font-medium uppercase mb-7 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              {t('availableLocations')} per Giocare in Autonomia
            </h2>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {luoghi.map((luogo, index) => (
                <motion.div
                  key={luogo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="glass rounded-[22px] overflow-hidden">
                    {luogo.immagine_url && (
                      <img src={luogo.immagine_url} alt={getLocalized(luogo, 'nome')} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold">{getLocalized(luogo, 'nome')}</h3>
                        <Badge className="bg-accent text-accent-foreground uppercase">{luogo.citta}</Badge>
                      </div>
                      <div className="w-10 h-px bg-foreground mb-4" />
                      {(luogo.descrizione || luogo.descrizione_en) && (
                        <p className="text-sm opacity-60 mb-4">{getLocalized(luogo, 'descrizione')}</p>
                      )}
                      {isAuthenticated ? (
                        <Link to={createPageUrl(`Iscrizione?luogo=${luogo.id}`)}>
                          <Button variant="ghost" className="glass-dark rounded-full w-full uppercase tracking-wide font-bold">
                            {t('playHere')} <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Button onClick={handleLogin} variant="ghost" className="glass-dark rounded-full w-full uppercase tracking-wide font-bold">
                          {t('loginToPlay')}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="glass py-6 text-center rounded-none border-x-0 border-b-0">
        <a
          href="https://karascio.it"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm opacity-65 hover:opacity-100 transition-opacity"
        >
          a project by <strong>Karasciò</strong>
        </a>
      </footer>

      <AlertDialog open={!!squadraToDelete} onOpenChange={() => setSquadraToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa iscrizione?</AlertDialogTitle>
            <AlertDialogDescription>
              L'iscrizione verrà eliminata e non potrai recuperarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteSquadraMutation.mutate(squadraToDelete);
                setSquadraToDelete(null);
              }}
              className="bg-destructive hover:opacity-90"
            >
              Sì, elimina iscrizione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
