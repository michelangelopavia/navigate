import client from './client';

// Converte un valore sort Base44 ('-created_date') in query param _sort
const createEntity = (endpoint) => ({
  list: () =>
    client.get(`/${endpoint}`).then((r) => r.data),

  filter: (params, sort, limit) => {
    const query = { ...params };
    if (sort)  query._sort  = sort;
    if (limit) query._limit = limit;
    return client.get(`/${endpoint}`, { params: query }).then((r) => r.data);
  },

  create: (data) =>
    client.post(`/${endpoint}`, data).then((r) => r.data),

  bulkCreate: (items) =>
    Promise.all(items.map((data) => client.post(`/${endpoint}`, data).then((r) => r.data))),

  update: (id, data) =>
    client.put(`/${endpoint}/${id}`, data).then((r) => r.data),

  delete: (id) =>
    client.delete(`/${endpoint}/${id}`).then((r) => r.data),
});

export const entities = {
  Squadra:          createEntity('squadre'),
  Tappa:            createEntity('tappe'),
  Luogo:            createEntity('luoghi'),
  Evento:           createEntity('eventi'),
  Notifica:         createEntity('notifiche'),
  RichiestaAiuto:   {
    ...createEntity('richieste-aiuto'),
    // Usato lato giocatore (Gioca.jsx): legge solo le richieste della propria squadra,
    // a differenza di .filter() che chiama l'endpoint admin-only.
    mie: (squadraId) =>
      client.get('/richieste-aiuto/mie', { params: { squadra_id: squadraId } }).then((r) => r.data),
  },
  Segnalazione:     createEntity('segnalazioni'),
  ImpostazioniSito: createEntity('impostazioni-sito'),
};

export const statistiche = {
  tappe: (eventoId) =>
    client.get('/statistiche/tappe', { params: eventoId ? { evento_id: eventoId } : {} }).then((r) => r.data),
};

export const adminLuoghi = {
  list: () =>
    client.get('/admin-luoghi').then((r) => r.data),

  listUsers: () =>
    client.get('/admin-luoghi/users').then((r) => r.data),

  assign: (email, luogo_id) =>
    client.post('/admin-luoghi', { email, luogo_id }).then((r) => r.data),

  remove: (id) =>
    client.delete(`/admin-luoghi/${id}`).then((r) => r.data),
};

export const auth = {
  me: () =>
    client.get('/auth/me').then((r) => r.data),

  isAuthenticated: () =>
    !!localStorage.getItem('navigate_token'),

  login: (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data),

  register: (data) =>
    client.post('/auth/register', data).then((r) => r.data),

  logout: () => {
    localStorage.removeItem('navigate_token');
  },

  redirectToLogin: (returnUrl) => {
    const url = returnUrl ? `/Login?return=${encodeURIComponent(returnUrl)}` : '/Login';
    window.location.href = url;
  },
};
