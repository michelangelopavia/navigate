import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Calendar, MapPin, Clock, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import RegistrazioneForm from '@/components/registration/RegistrazioneForm';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1f7a8c] border-t-transparent rounded-full" />
      </div>);

  }

  if (!luogoId && !eventoId) {
    // Mostra selezione luogo/evento
    return <SelezioneLuogoEvento user={user} onSelect={() => setSearchParams(new URLSearchParams(window.location.search))} />;
  }

  if (iscritto && squadraCreata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full">

          <Card className="text-center overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white">
              <CheckCircle className="w-20 h-20 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Iscrizione Completata!</h1>
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-gray-500">Squadra</p>
                <p className="text-xl font-bold text-gray-800">{squadraCreata.nome_squadra}</p>
              </div>
              <div>
                <p className="text-gray-500">{eventoId ? 'Evento' : 'Luogo'}</p>
                <p className="font-semibold text-gray-800">{evento?.nome || luogo?.nome}</p>
                {evento &&
                <p className="text-sm text-gray-500">
                    {format(new Date(evento.data_inizio), 'EEEE d MMMM yyyy, HH:mm', { locale: it })}
                  </p>
                }
              </div>
              
              <div className="flex flex-col gap-4 pt-2">
                {eventoId && !isEventoInFinestra() ?
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-800 font-medium">
                      Potrai giocare durante la finestra dell'evento
                    </p>
                  </div> :

                <Link to={createPageUrl(`Gioca?squadra=${squadraCreata.id}`)}>
                    <Button className="w-full bg-[#FFD800] hover:bg-[#FFD800]/80 text-[#022b3a] text-lg py-6 font-bold">
                      Inizia a Giocare Ora
                    </Button>
                  </Link>
                }

                <Link to={createPageUrl('Home')}>
                  <Button variant="outline" className="w-full">
                    Torna alla Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>

        {/* Info Luogo/Evento */}
        <Card className={`mb-6 ${eventoId ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200' : 'bg-gradient-to-r from-[#bfdbf7]/50 to-[#bfdbf7]/30 border-[#1f7a8c]/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {eventoId ?
              <>
                  <Trophy className="w-8 h-8 text-blue-600" />
                  <div>
                    <h2 className="font-bold text-blue-800">{evento?.nome}</h2>
                    <p className="text-sm text-blue-600">
                      {evento && format(new Date(evento.data_inizio), 'EEEE d MMMM yyyy, HH:mm', { locale: it })}
                    </p>
                  </div>
                </> :

              <>
                  <MapPin className="w-8 h-8 text-[#1f7a8c]" />
                  <div>
                    <h2 className="font-bold text-[#022b3a]">{luogo?.nome}</h2>
                    <p className="text-sm text-[#1f7a8c]">{luogo?.citta} - Gioco Libero</p>
                  </div>
                </>
              }
            </div>
          </CardContent>
        </Card>

        {!tappeOk &&
        <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <p className="text-red-700">
                Questo luogo non ha ancora abbastanza tappe configurate. Torna più tardi!
              </p>
            </CardContent>
          </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-[#bfdbf7]/30 via-white to-[#022b3a]/5 p-4">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Scegli dove giocare</h1>

        {/* Eventi */}
        {eventi.length > 0 &&
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-500" />
              Eventi con Classifica
            </h2>
            <div className="space-y-3">
              {eventi.map((evento) =>
            <Card
              key={evento.id}
              className="hover:shadow-md transition-shadow cursor-pointer border-blue-200"
              onClick={() => handleSelectEvento(evento.id)}>

                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">{evento.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(evento.data_inizio), 'dd MMM yyyy, HH:mm', { locale: it })}
                      </p>
                    </div>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                      Partecipa
                    </Button>
                  </CardContent>
                </Card>
            )}
            </div>
            </div>
        }

            {/* Luoghi */}
            {luoghi.length > 0 &&
        <div className="mb-8 mt-8">
            <h2 className="text-gray-700 mb-4 text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1f7a8c]" />
              Gioco Libero - Scegli un Luogo
            </h2>
            <div className="space-y-3">
              {luoghi.map((luogo) =>
            <Card
              key={luogo.id}
              className="hover:shadow-md transition-shadow cursor-pointer border-[#1f7a8c]/30"
              onClick={() => handleSelectLuogo(luogo.id)}>

                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">{luogo.nome}</h3>
                      <p className="text-sm text-gray-500">{luogo.citta}</p>
                    </div>
                    <Button size="sm" className="bg-[#1f7a8c] hover:bg-[#022b3a]">
                      Seleziona
                    </Button>
                  </CardContent>
                </Card>
            )}
            </div>
            </div>
        }
            </div>
            </div>);

}