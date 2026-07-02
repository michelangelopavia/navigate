import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, MapPin, Users, Trophy, ArrowRight, LogIn, Clock, CheckCircle, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import MetaTags from '@/components/MetaTags';
import ShareButton from '@/components/ShareButton';

export default function DettaglioEvento() {
  const { t, getLocalized, language } = useLanguage();
  const dateLocale = language === 'en' ? enUS : it;
  
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const eventoId = searchParams.get('id');

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

  const { data: evento } = useQuery({
    queryKey: ['evento', eventoId],
    queryFn: async () => {
      const eventi = await base44.entities.Evento.filter({ id: eventoId });
      return eventi[0];
    },
    enabled: !!eventoId
  });

  const { data: luogo } = useQuery({
    queryKey: ['luogo', evento?.luogo_id],
    queryFn: async () => {
      const luoghi = await base44.entities.Luogo.filter({ id: evento.luogo_id });
      return luoghi[0];
    },
    enabled: !!evento?.luogo_id
  });

  const { data: squadreEvento = [] } = useQuery({
    queryKey: ['squadre-evento', eventoId],
    queryFn: () => base44.entities.Squadra.filter({ evento_id: eventoId }),
    enabled: !!eventoId
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (!eventoId || !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const now = new Date();
  const dataInizio = new Date(evento.data_inizio);
  const dataFine = new Date(evento.data_fine);
  const eventoInCorso = now >= dataInizio && now <= dataFine;
  const eventoTerminato = now > dataFine;

  const eventoUrl = `${window.location.origin}${createPageUrl(`DettaglioEvento?id=${eventoId}`)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 via-white to-[#022b3a]/5">
      <MetaTags
        title={evento.og_title || getLocalized(evento, 'nome')}
        description={evento.og_description || getLocalized(evento, 'descrizione')?.replace(/<[^>]*>/g, '').substring(0, 200)}
        image={evento.og_image_url}
        url={eventoUrl}
        type="event"
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#022b3a] to-[#1f7a8c] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-8 h-8 text-[#FFD800]" />
                <Badge className="bg-[#FFD800] text-[#022b3a] text-sm">
                  {t('competition')}
                </Badge>
              </div>
              <ShareButton eventoId={evento.id} variant="secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {getLocalized(evento, 'nome')}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-lg opacity-90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {format(dataInizio, 'EEEE d MMMM yyyy, HH:mm', { locale: dateLocale })}
                </span>
              </div>
              {luogo && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{getLocalized(luogo, 'nome')}</span>
                </div>
              )}
            </div>

            {eventoTerminato && (
              <Badge className="bg-gray-500 mt-4">{t('ended')}</Badge>
            )}
            {eventoInCorso && (
              <Badge className="bg-[#FFD800] text-[#022b3a] mt-4">{t('ongoing')}</Badge>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Descrizione Evento */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-[#022b3a] mb-4">
                  {language === 'it' ? 'Informazioni Evento' : 'Event Information'}
                </h2>
                {(evento.descrizione || evento.descrizione_en) ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: getLocalized(evento, 'descrizione') }}
                  />
                ) : (
                  <p className="text-gray-500">
                    {language === 'it' 
                      ? 'Nessuna descrizione disponibile' 
                      : 'No description available'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Come Partecipare */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#022b3a] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-orange-500" />
                  {language === 'it' ? 'Come Partecipare' : 'How to Participate'}
                </h2>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-orange-500">1.</span>
                    <span>
                      {language === 'it' 
                        ? 'Effettua il login o registrati se è la prima volta' 
                        : 'Log in or register if it\'s your first time'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-orange-500">2.</span>
                    <span>
                      {language === 'it' 
                        ? 'Iscriviti all\'evento compilando il form con i dati della tua squadra (fino a 10 persone)' 
                        : 'Register for the event by filling out the form with your team data (up to 10 people)'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-orange-500">3.</span>
                    <span>
                      {language === 'it' 
                        ? 'Gioca durante la finestra temporale dell\'evento (tra la data di inizio e fine)' 
                        : 'Play during the event time window (between start and end date)'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-orange-500">4.</span>
                    <span>
                      {language === 'it' 
                        ? 'Completa le 10 tappe e scala la classifica!' 
                        : 'Complete the 10 stages and climb the leaderboard!'}
                    </span>
                  </li>
                </ol>

                <div className="mt-6">
                  {loadingAuth ? (
                    <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse" />
                  ) : isAuthenticated ? (
                    <Link to={createPageUrl(`Iscrizione?evento=${evento.id}`)}>
                      <Button className="w-full bg-[#FFD800] hover:bg-[#FFD800]/80 text-[#022b3a] text-lg py-6 font-bold">
                        <Users className="w-5 h-5 mr-2" />
                        {t('participate')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={handleLogin} 
                      className="w-full bg-[#1f7a8c] hover:bg-[#022b3a] text-lg py-6"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      {t('loginToParticipate')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-[#022b3a] mb-4">
                  {language === 'it' ? 'Dettagli' : 'Details'}
                </h3>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'it' ? 'Data Inizio' : 'Start Date'}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {format(dataInizio, 'dd MMM yyyy, HH:mm', { locale: dateLocale })}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'it' ? 'Data Fine' : 'End Date'}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-red-500" />
                    {format(dataFine, 'dd MMM yyyy, HH:mm', { locale: dateLocale })}
                  </div>
                </div>

                {luogo && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {language === 'it' ? 'Luogo' : 'Location'}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-green-500" />
                      {getLocalized(luogo, 'nome')} ({luogo.citta})
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'it' ? 'Squadre Iscritte' : 'Registered Teams'}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-purple-500" />
                    {squadreEvento.length}
                  </div>
                </div>
              </CardContent>
            </Card>

            {eventoInCorso && (
              <Card className="bg-[#FFD800]/20 border-2 border-[#FFD800]">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-[#FFD800]" />
                  <p className="font-bold text-[#022b3a]">
                    {language === 'it' ? 'Evento in Corso!' : 'Event Ongoing!'}
                  </p>
                  <p className="text-sm text-gray-700">
                    {language === 'it' 
                      ? 'Iscriviti ora per partecipare' 
                      : 'Register now to participate'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Link Home */}
        <div className="text-center">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-[#1f7a8c] text-[#1f7a8c]">
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}