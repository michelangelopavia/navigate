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
  RichiestaAiuto:   createEntity('richieste-aiuto'),
  Segnalazione:     createEntity('segnalazioni'),
  ImpostazioniSito: createEntity('impostazioni-sito'),
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
