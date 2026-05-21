# Onboarding Tecnico Completo - Progetto Navigate

Questo documento rappresenta la sintesi finale dell'analisi tecnica approfondita condotta per l'onboarding sul progetto "Navigate". È redatto per fornire una guida chiara a sviluppatori junior, garantendo al contempo un rigore professionale per futuri interventi di manutenzione.

---

## 1. Sintesi delle Fasi di Analisi

### Fase 1: Architettura e Filesystem
Il progetto segue un'architettura **Client-Server** con una separazione netta tra i due "cervelli":
*   **Frontend (React/Vite)**: Gestisce l'interfaccia utente e la logica di gioco. Si accende tramite [src/main.jsx](file:///c:/Users/Emanuela/Documents/navigate/src/main.jsx) e segue una mappa dinamica definita in [src/pages.config.js](file:///c:/Users/Emanuela/Documents/navigate/src/pages.config.js).
*   **Backend (Node.js/Express)**: Gestisce la persistenza dei dati e l'autenticazione. Si accende via [backend/server.js](file:///c:/Users/Emanuela/Documents/navigate/backend/server.js).

### Fase 2: Il Cuore dei Dati (Database)
Utilizziamo **SQLite** gestito tramite **Sequelize ORM**. 
*   I **Modelli** sono gli "stampi" che dicono al DB che forma devono avere i dati (es. [Tappa](file:///c:/Users/Emanuela/Documents/navigate/entities/Tappa), [Squadra](file:///c:/Users/Emanuela/Documents/navigate/entities/Squadra)). 
*   Le relazioni sono centralizzate in [backend/src/models/index.js](file:///c:/Users/Emanuela/Documents/navigate/backend/src/models/index.js), garantendo che Sequelize sappia, ad esempio, che un [Luogo](file:///c:/Users/Emanuela/Documents/navigate/entities/Luogo) possiede molte `Tappe`.

### Fase 3: Logica di Business e API
Il backend espone degli **Endpoint** (citofoni) protetti da **Middleware** (buttafuori). 
*   Il file [auth.js](file:///c:/Users/Emanuela/Documents/navigate/backend/src/routes/auth.js) controlla il "braccialetto" (JWT Token) dell'utente.
*   Le rotte (es. [squadre.js](file:///c:/Users/Emanuela/Documents/navigate/backend/src/routes/squadre.js)) sono volutamente semplici: ricevono dati e li salvano, senza elaborazioni complesse.

### Fase 4: Frontend e Game Loop
Il vero motore dell'app vive nel browser dell'utente.
*   [Iscrizione.jsx](file:///c:/Users/Emanuela/Documents/navigate/src/pages/Iscrizione.jsx): Decide il percorso di 10 tappe.
*   [Gioca.jsx](file:///c:/Users/Emanuela/Documents/navigate/src/pages/Gioca.jsx): Gestisce timer, punteggi e validazione delle risposte. È il centro operativo di tutta l'esperienza.

---

## 2. Il "Peccato Originale" dell'Architettura

L'applicazione è **Frontend-Heavy**: quasi tutta la logica di business e di controllo risiede nel client (browser).
*   **Perché succede?** È una scelta che semplifica lo sviluppo iniziale e rende il server estremamente leggero, poiché non deve fare calcoli complicati.
*   **Il limite**: Questa scelta crea una **fiducia cieca** nel client. Il backend non verifica se i dati ricevuti (punteggi, tempi) siano reali o manipolati.

---

## 3. Analisi Vulnerabilità e Fragilità

| # | Vulnerabilità | Gravità | Perché succede (Il Ragionamento) |
|---|---|---|---|
| 1 | **Manipolazione Punteggio** | **CRITICA** | Il backend salva il numero che riceve dal frontend senza ricalcolarlo. |
| 2 | **Controllo Risposta lato Client** | **CRITICA** | Il backend non conosce le risposte; si fida del frontend che dice: "ha indovinato". |
| 3 | **Manipolazione del Tempo** | **ALTA** | Il backend registra solo l'inizio e la fine inviati dal client, senza verificare la coerenza. |
| 4 | **Percorso JSON (Senza Integrità)** | **ALTA** | Sequelize non può proteggere un dato salvato come "testo JSON". Se una tappa sparisce, il percorso si rompe. |
| 5 | **Validazione date Evento** | **MEDIA** | Il DB non ha vincoli (Constraint). Se il codice non controlla, le date possono essere illogiche. |
| 6 | **Lingue Hardcoded** | **MEDIA** | Le lingue sono colonne fisse (`nome_en`). Aggiungere una lingua richiede di modificare la struttura fisica del DB. |
| 7 | **Sync con `alter: true`** | **MEDIA** | In produzione, Sequelize potrebbe modificare tabelle e cancellare dati senza un comando manuale umano. |
| 8 | **Cartella `entities/` non usata** | **INFORMA** | Residuo di versioni precedenti o documentazione. Crea confusione in chi legge il codice. |
| 9 | **Fiducia eccessiva nel client** | **ALTA** | È il problema strutturale che causa i punti 1, 2 e 3. |

---

## 4. Azioni Concrete e Roadmap

### A. Cosa fare subito (Urgenze)
1.  **Attenzione Operativa**: Evitare assolutamente di cancellare `Tappe` o `Luoghi` se ci sono gare attive nel weekend (rischio crash punto 4).
2.  **Configurazione Sicura**: Assicurarsi che in produzione `alter: true` sia disattivato (punto 7).

### B. Cosa migliorare nel futuro (Refactoring)
1.  **Backend "Intelligente"**: Spostare la verifica della risposta dell'indovinello sul backend. L'utente invia la parola, il server controlla e risponde "Sì/No".
2.  **Ricalcolo Punteggio**: Il server dovrebbe calcolare il punteggio sommando i punti delle tappe superate, ignorando i numeri "inventati" dal client.
3.  **Tabella di Join**: Sostituire il campo JSON `percorso` con una tabella vera (`SquadraTappa`) per avere foreign key protette.

### C. Cosa pulire
1.  **Rimuovere `entities/`**: Una volta confermato che non serve per documentazione esterna, va tolta per chiarezza.

---

## 5. Conclusione: Da dove iniziamo?

La nostra **Roadmap di lavoro** seguirà questo ordine di priorità:
1.  **Analisi dei BUG esistenti**: Confrontare i tuoi appunti con questa mappa per vedere se i bug derivano da queste fragilità (es. il punto 4 o il punto 9).
2.  **Stabilizzazione**: Risolvere i bug che bloccano l'esperienza utente.
3.  **Protezione**: Iniziare a spostare le prime logiche (es. controllo risposte) sul backend.
