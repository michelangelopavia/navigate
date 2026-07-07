import { entities, auth, adminLuoghi, statistiche } from './entities';
import client from './client';

// Compatibilità drop-in con il vecchio @base44/sdk.
// Tutte le pagine importano `base44` da qui — nessuna modifica necessaria.
export const base44 = {
  entities,
  auth,
  adminLuoghi,
  statistiche,
  integrations: {
    Core: {
      SendEmail: (/** @type {{to:string,subject:string,body:string}} */ { to, subject, body }) =>
        client.post('/integrations/email', { to, subject, body }).then((/** @type {any} */ r) => r.data),
    },
  },
  appLogs: {
    logUserInApp: () => Promise.resolve(),
  },
};
