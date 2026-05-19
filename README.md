# NAVIGATE — Caccia al Tesoro

App web per cacce al tesoro urbane. Frontend React (Vite) + backend Node.js (Express + Sequelize).

## Struttura del progetto

```
navigate/
├── src/              # Frontend React
├── backend/          # Backend Node.js
│   ├── src/
│   │   ├── models/   # Sequelize ORM
│   │   ├── routes/   # API Express
│   │   ├── middleware/
│   │   └── services/
│   └── scripts/      # Script di utilità
└── DATA/             # Dati di esempio (CSV)
```

## Requisiti

- Node.js >= 18
- npm >= 9

## Installazione su un nuovo PC

### 1. Clona il repository

```bash
git clone https://github.com/michelangelopavia/navigate.git
cd navigate
```

### 2. Installa le dipendenze

```bash
# Dipendenze frontend
npm install

# Dipendenze backend
cd backend
npm install
cd ..
```

### 3. Configura le variabili d'ambiente del backend

```bash
cd backend
cp .env.example .env
```

Apri `backend/.env` e modifica almeno:
- `JWT_SECRET` → una stringa lunga e casuale (es. genera con `openssl rand -hex 64`)
- `FRONTEND_URL` → porta del frontend (default `http://localhost:5173`)

### 4. Avvia il backend

```bash
cd backend
npm run dev
```

Il database SQLite viene creato automaticamente al primo avvio (`backend/database.dev.sqlite`).

### 5. Popola il database (primo avvio)

In un **secondo terminale**:

```bash
cd backend
npm run setup
```

Questo comando:
- Crea l'utente admin (`admin@navigate.it` / `Admin1234!`)
- Importa i dati di esempio dalla cartella `DATA/` (Palermo Kalsa)

### 6. Avvia il frontend

In un **terzo terminale** (dalla root del progetto):

```bash
npm run dev
```

L'app è disponibile su `http://localhost:5173` (o la porta indicata da Vite).

## Credenziali di default

| Campo    | Valore           |
|----------|------------------|
| Email    | admin@navigate.it |
| Password | Admin1234!       |

> Cambia la password dopo il primo accesso.

## Script disponibili

### Backend (`cd backend`)

| Comando                 | Descrizione                              |
|-------------------------|------------------------------------------|
| `npm run dev`           | Avvia il backend con auto-reload         |
| `npm start`             | Avvia il backend (produzione)            |
| `npm run setup`         | Crea admin + importa dati di esempio     |
| `npm run create-admin`  | Crea/promuove utente admin               |
| `npm run import-data`   | Importa i CSV dalla cartella `DATA/`     |

### Frontend (root)

| Comando         | Descrizione                    |
|-----------------|--------------------------------|
| `npm run dev`   | Avvia il frontend in sviluppo  |
| `npm run build` | Build di produzione in `dist/` |

## Deploy su Keliweb (cPanel + Phusion Passenger)

1. Fai il build del frontend: `npm run build`
2. Carica il repository sul server via Git
3. Configura le variabili d'ambiente nel pannello cPanel
4. Il file entry point è `backend/server.js`
5. La cartella `dist/` viene servita automaticamente dal backend in modalità produzione

## Variabili d'ambiente

Vedi `backend/.env.example` per la lista completa con descrizioni.
