import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Clock, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import RegistrazioneForm from '@/components/registration/RegistrazioneForm';
import Header from '@/components/Header';

export default function Iscrizione() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));
  const eventoId = searchParams.get('evento');
  const luogoId = searchParams.get('luogo');
  const queryClient = useQueryClient();

  // Aggiorna i parametri quando cambia l'URL
  useEffect(() => {
    const handleUrlChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const [user, setUser] = useState(null);
  const [iscritto, setIscritto] = useState(false);
  const [squadraCreata, setSquadraCreata] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // Redirect to login if not authenticated
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
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
    queryKey: ['luogo', luogoId || evento?.luogo_id],
    queryFn: async () => {
      const id = luogoId || evento?.luogo_id;
      const luoghi = await base44.entities.Luogo.filter({ id });
      return luoghi[0];
    },
    enabled: !!(luogoId || evento?.luogo_id)
  });

  const { data: tappe = [] } = useQuery({
    queryKey: ['tappe', luogo?.id],
    queryFn: () => base44.entities.Tappa.filter({ luogo_id: luogo.id }),
    enabled: !!luogo?.id
  });

  // Verifica se la finestra dell'evento è già aperta (stessa logica di Gioca.jsx)
  const isEventoInFinestra = () => {
    if (!evento) return false;
    const now = new Date();
    return now >= new Date(evento.data_inizio) && now <= new Date(evento.data_fine);
  };

  // Squadre precedenti dell'utente per pre-compilare
  const { data: squadrePrecedenti = [] } = useQuery({
    queryKey: ['squadre-utente', user?.id],
    queryFn: () => base44.entities.Squadra.filter({ user_id: user.id }, '-created_date', 1),
    enabled: !!user?.id
  });

  const createSquadraMutation = useMutation({
    mutationFn: async (data) => {
      const squadraData = {
        ...data,
        user_id: user.id,
        tipo_gioco: eventoId ? 'evento' : 'libero',
        luogo_id: luogo?.id,
        evento_id: eventoId || null,
        tappa_corrente: 0,
        completata: false,
        tempi_tappe: []
      };

      const squadra = await base44.entities.Squadra.create(squadraData);

      // Notifica per admin — l'iscrizione è un evento raro (una volta per squadra),
      // a differenza della progressione di gioco (tappa_superata/gioco_completato,
      // fino a 10 volte per squadra) che invece resta solo per evento
      await base44.entities.Notifica.create({
        tipo: 'nuova_iscrizione',
        squadra_id: squadra.id,
        squadra_nome: data.nome_squadra,
        evento_id: eventoId || null,
        messaggio: `Nuova squadra iscritta: ${data.nome_squadra} ${eventoId ? '(evento)' : `(${luogo?.nome})`}`
      });

      // L'email di iscrizione la invia il backend (POST /api/squadre), a admin sede + email_gestori

      return squadra;
    },
    onSuccess: (squadra) => {
      setSquadraCreata(squadra);
      setIscritto(true);
      queryClient.invalidateQueries(['squadre']);
      queryClient.invalidateQueries(['mie-squadre']);
    }
  });

  // Verifica tappe sufficienti
  const tappeFacili = tappe.filter((t) => t.difficolta === 'facile').length;
  const tappeMedie = tappe.filter((t) => t.difficolta === 'media').length;
  const tappeDifficili = tappe.filter((t) => t.difficolta === 'difficile').length;
  const tappeOk = tappeFacili >= 4 && tappeMedie >= 4 && tappeDifficili >= 2;

  if (!user) {
    return (
      <div className="min-h-screen bg-liquid-page text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </div>);

  }

  if (!luogoId && !eventoId) {
    // Mostra selezione luogo/evento
    return <SelezioneLuogoEvento user={user} onSelect={() => setSearchParams(new URLSearchParams(window.location.search))} />;
  }

  if (iscritto && squadraCreata) {
    return (
      <div className="min-h-screen bg-liquid-page text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full">

            <div className="glass rounded-[28px] p-6 md:p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h1 className="text-2xl font-bold uppercase tracking-wide mb-6">Iscrizione Completata!</h1>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm opacity-60">Squadra</p>
                  <p className="text-xl font-bold">{squadraCreata.nome_squadra}</p>
                </div>
                <div>
                  <p className="text-sm opacity-60">{eventoId ? 'Evento' : 'Luogo'}</p>
                  <p className="font-semibold">{evento?.nome || luogo?.nome}</p>
                  {evento &&
                  <p className="text-sm opacity-60">
                      {format(new Date(evento.data_inizio), 'EEEE d MMMM yyyy, HH:mm', { locale: it })}
                    </p>
                  }
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {eventoId && !isEventoInFinestra() ?
                <div className="glass-muted rounded-2xl p-4">
                    <Clock className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">
                      Potrai giocare durante la finestra dell'evento
                    </p>
                  </div> :

                <Link to={createPageUrl(`Gioca?squadra=${squadraCreata.id}`)}>
                    <Button variant="ghost" className="w-full glass-dark rounded-full text-lg py-6 font-bold">
                      Inizia a Giocare Ora
                    </Button>
                  </Link>
                }

                <Link to={createPageUrl('Home')}>
                  <Button variant="ghost" className="w-full glass rounded-full">
                    Torna alla Home
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-liquid-page text-foreground">
      <Header />
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Info Luogo/Evento */}
        <div className={`mb-6 glass rounded-[22px] p-4 ${eventoId ? 'glass-accent' : ''}`}>
          <div className="flex items-center gap-3">
            {eventoId ?
            <>
                <Trophy className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h2 className="font-bold">{evento?.nome}</h2>
                  <p className="text-sm opacity-80">
                    {evento && format(new Date(evento.data_inizio), 'EEEE d MMMM yyyy, HH:mm', { locale: it })}
                  </p>
                </div>
              </> :

            <>
                <MapPin className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h2 className="font-bold">{luogo?.nome}</h2>
                  <p className="text-sm opacity-70">{luogo?.citta} - Gioco Libero</p>
                </div>
              </>
            }
          </div>
        </div>

        {!tappeOk &&
        <div className="mb-6 glass rounded-[22px] p-4 text-center">
            <p className="text-destructive">
              Questo luogo non ha ancora abbastanza tappe configurate. Torna più tardi!
            </p>
          </div>
        }

        <RegistrazioneForm
          luogo={luogo}
          evento={evento}
          squadraPrecedente={squadrePrecedenti[0]}
          onSubmit={(data) => createSquadraMutation.mutate(data)}
          isLoading={createSquadraMutation.isPending}
          disabled={!tappeOk}
          user={user} />

      </div>
    </div>);

}

// Componente per selezionare luogo o evento
function SelezioneLuogoEvento({ user, onSelect }) {
  const navigate = useNavigate();

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

  const handleSelectLuogo = (luogoId) => {
    navigate(createPageUrl(`Iscrizione?luogo=${luogoId}`));
    onSelect();
  };

  const handleSelectEvento = (eventoId) => {
    navigate(createPageUrl(`Iscrizione?evento=${eventoId}`));
    onSelect();
  };

  return (
    <div className="min-h-screen bg-liquid-page text-foreground">
      <Header />
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Scegli dove giocare</h1>
        </div>

        {/* Eventi */}
        {eventi.length > 0 &&
        <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Eventi con Classifica
            </h2>
            <div className="space-y-3">
              {eventi.map((evento) =>
            <div
              key={evento.id}
              className="glass rounded-[22px] p-4 flex items-center justify-between cursor-pointer"
              onClick={() => handleSelectEvento(evento.id)}>

                  <div>
                    <h3 className="font-bold">{evento.nome}</h3>
                    <p className="text-sm opacity-60">
                      {format(new Date(evento.data_inizio), 'dd MMM yyyy, HH:mm', { locale: it })}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="glass-dark rounded-full">
                    Partecipa
                  </Button>
                </div>
            )}
            </div>
            </div>
        }

            {/* Luoghi */}
            {luoghi.length > 0 &&
        <div className="mb-8 mt-8">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Gioco Libero - Scegli un Luogo
            </h2>
            <div className="space-y-3">
              {luoghi.map((luogo) =>
            <div
              key={luogo.id}
              className="glass rounded-[22px] p-4 flex items-center justify-between cursor-pointer"
              onClick={() => handleSelectLuogo(luogo.id)}>

                  <div>
                    <h3 className="font-bold">{luogo.nome}</h3>
                    <p className="text-sm opacity-60">{luogo.citta}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="glass-dark rounded-full">
                    Seleziona
                  </Button>
                </div>
            )}
            </div>
            </div>
        }
            </div>
            </div>);

}
