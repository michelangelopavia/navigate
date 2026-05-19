import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  it: {
    // Header & Navigation
    home: "Home",
    login: "Accedi",
    logout: "Esci",
    profile: "Profilo",
    
    // Home page
    tagline: "Perdetevi nella città, giocando!",
    subtitle: "Scopri il quartiere attraverso indovinelli, monumenti e associazioni locali",
    howItWorks: "Come Funziona",
    step1Login: "Fai Login",
    step1Desc: "Accedi o registrati per iniziare",
    step2Register: "Iscrivi la Squadra",
    step2Desc: "Scegli un luogo o evento",
    step3Play: "Inizia a Giocare",
    step3Desc: "Risolvi 10 indovinelli",
    connected: "Sei connesso",
    teamRegistered: "Squadra iscritta",
    continuePlay: "Continua",
    start: "Inizia",
    register: "Iscriviti",
    viewLeaderboards: "Vedi le Classifiche",
    availableLocations: "Luoghi Disponibili",
    upcomingEvents: "Eventi in Programma",
    playHere: "Gioca qui",
    loginToPlay: "Accedi per giocare",
    participate: "Partecipa",
    loginToParticipate: "Accedi per partecipare",
    competition: "Competizione",
    projectBy: "Un progetto di",
    freePlay: "Gioco Libero",
    
    // Game
    team: "Squadra",
    stage: "Tappa",
    timeRemaining: "Tempo rimanente",
    yourAnswer: "La tua risposta",
    submit: "Invia",
    hint: "Suggerimento",
    useHint: "Usa Suggerimento",
    skip: "Salta",
    skipQuestion: "Salta questa domanda",
    correct: "Corretto!",
    wrong: "Risposta errata",
    hintUsed: "Suggerimento usato (-5 punti)",
    canSkipIn: "Puoi saltare tra",
    points: "punti",
    
    // Completion
    congratulations: "Complimenti!",
    completed: "Hai completato la caccia al tesoro!",
    totalTime: "Tempo totale",
    score: "Punteggio",
    players: "Giocatori",
    stagesCompleted: "Tappe completate",
    stagesSkipped: "Saltate",
    hintsUsed: "Con aiuto",
    viewLeaderboard: "Vedi Classifica",
    backToHome: "Torna alla Home",
    
    // Leaderboards
    leaderboards: "Classifiche",
    bestExplorers: "I migliori esploratori di NAVIGATE",
    byLocation: "Per Luogo",
    events: "Eventi",
    noLocations: "Nessun luogo disponibile",
    noEvents: "Nessun evento",
    noTeamsCompleted: "Nessuna squadra ha completato l'evento",
    ended: "Concluso",
    ongoing: "In corso",
    
    // Registration
    chooseWhereToPlay: "Scegli dove giocare",
    freePlayChoose: "Gioco Libero - Scegli un Luogo",
    eventsWithLeaderboard: "Eventi con Classifica",
    select: "Seleziona",
    registrationComplete: "Iscrizione Completata!",
    canPlayDuringEvent: "Potrai giocare durante la finestra dell'evento",
    startPlayingNow: "Inizia a Giocare Ora",
    teamName: "Nome Squadra",
    contactName: "Nome Referente",
    contactSurname: "Cognome Referente",
    contactEmail: "Email Referente",
    contactPhone: "Telefono Referente",
    contactBirthdate: "Data di Nascita Referente",
    otherPlayers: "Altri Giocatori",
    addPlayer: "Aggiungi Giocatore",
    age: "Età",
    completeRegistration: "Completa Iscrizione",
    
    // Rules
    rulesTitle: "Regole del Gioco",
    rulesObjective: "Obiettivo",
    rulesObjectiveText: "Risolvi 10 indovinelli esplorando il quartiere",
    rulesScoring: "Punteggio",
    rulesScoringText: "10 punti per risposta corretta, 5 con suggerimento, 0 se salti",
    rulesHint: "Suggerimento",
    rulesHintText: "Puoi chiedere un aiuto, ma perderai 5 punti",
    rulesSkip: "Salta",
    rulesSkipText: "Dopo 15 minuti puoi saltare (0 punti)",
    rulesTime: "Tempo",
    rulesTimeText: "Hai 5 ore per completare il gioco",
    rulesEventTime: "Per gli eventi, devi giocare nella finestra temporale indicata",
    understood: "Ho capito, iniziamo!",
    
    // Misc
    readyToStart: "Pronto a Partire?",
    timerWillStart: "Una volta iniziato, il cronometro partirà. Buona fortuna!",
    startHunt: "Inizia la Caccia!",
    teamNotFound: "Squadra non trovata",
    eventNotStarted: "Evento non ancora iniziato",
    eventEnded: "Evento terminato",
    eventWillStart: "L'evento inizierà il",
    eventEndedOn: "L'evento è terminato il",
    timeExpired: "Tempo Scaduto!",
    timeExpiredDesc: "Le 5 ore a disposizione sono terminate",
    reportProblem: "Segnala un problema",
    learnMore: "Approfondimento",
    next: "Prosegui",
    association: "Associazione"
  },
  en: {
    // Header & Navigation
    home: "Home",
    login: "Login",
    logout: "Logout",
    profile: "Profile",
    
    // Home page
    tagline: "Get lost in the city, playing!",
    subtitle: "Discover the neighborhood through riddles, monuments and local associations",
    howItWorks: "How It Works",
    step1Login: "Login",
    step1Desc: "Sign in or register to start",
    step2Register: "Register Your Team",
    step2Desc: "Choose a location or event",
    step3Play: "Start Playing",
    step3Desc: "Solve 10 riddles",
    connected: "You're connected",
    teamRegistered: "Team registered",
    continuePlay: "Continue",
    start: "Start",
    register: "Register",
    viewLeaderboards: "View Leaderboards",
    availableLocations: "Available Locations",
    upcomingEvents: "Upcoming Events",
    playHere: "Play here",
    loginToPlay: "Login to play",
    participate: "Participate",
    loginToParticipate: "Login to participate",
    competition: "Competition",
    projectBy: "A project by",
    freePlay: "Free Play",
    
    // Game
    team: "Team",
    stage: "Stage",
    timeRemaining: "Time remaining",
    yourAnswer: "Your answer",
    submit: "Submit",
    hint: "Hint",
    useHint: "Use Hint",
    skip: "Skip",
    skipQuestion: "Skip this question",
    correct: "Correct!",
    wrong: "Wrong answer",
    hintUsed: "Hint used (-5 points)",
    canSkipIn: "You can skip in",
    points: "points",
    
    // Completion
    congratulations: "Congratulations!",
    completed: "You completed the treasure hunt!",
    totalTime: "Total time",
    score: "Score",
    players: "Players",
    stagesCompleted: "Stages completed",
    stagesSkipped: "Skipped",
    hintsUsed: "With hints",
    viewLeaderboard: "View Leaderboard",
    backToHome: "Back to Home",
    
    // Leaderboards
    leaderboards: "Leaderboards",
    bestExplorers: "The best explorers of NAVIGATE",
    byLocation: "By Location",
    events: "Events",
    noLocations: "No locations available",
    noEvents: "No events",
    noTeamsCompleted: "No team has completed the event",
    ended: "Ended",
    ongoing: "Ongoing",
    
    // Registration
    chooseWhereToPlay: "Choose where to play",
    freePlayChoose: "Free Play - Choose a Location",
    eventsWithLeaderboard: "Events with Leaderboard",
    select: "Select",
    registrationComplete: "Registration Complete!",
    canPlayDuringEvent: "You can play during the event window",
    startPlayingNow: "Start Playing Now",
    teamName: "Team Name",
    contactName: "Contact First Name",
    contactSurname: "Contact Last Name",
    contactEmail: "Contact Email",
    contactPhone: "Contact Phone",
    contactBirthdate: "Contact Birthdate",
    otherPlayers: "Other Players",
    addPlayer: "Add Player",
    age: "Age",
    completeRegistration: "Complete Registration",
    
    // Rules
    rulesTitle: "Game Rules",
    rulesObjective: "Objective",
    rulesObjectiveText: "Solve 10 riddles exploring the neighborhood",
    rulesScoring: "Scoring",
    rulesScoringText: "10 points for correct answer, 5 with hint, 0 if skipped",
    rulesHint: "Hint",
    rulesHintText: "You can ask for help, but you'll lose 5 points",
    rulesSkip: "Skip",
    rulesSkipText: "After 15 minutes you can skip (0 points)",
    rulesTime: "Time",
    rulesTimeText: "You have 5 hours to complete the game",
    rulesEventTime: "For events, you must play within the indicated time window",
    understood: "Got it, let's start!",
    
    // Misc
    readyToStart: "Ready to Start?",
    timerWillStart: "Once started, the timer will begin. Good luck!",
    startHunt: "Start the Hunt!",
    teamNotFound: "Team not found",
    eventNotStarted: "Event not started yet",
    eventEnded: "Event ended",
    eventWillStart: "The event will start on",
    eventEndedOn: "The event ended on",
    timeExpired: "Time Expired!",
    timeExpiredDesc: "The 5 hours available have ended",
    reportProblem: "Report a problem",
    learnMore: "Learn more",
    next: "Continue",
    association: "Association"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('navigate_language');
    return saved || 'it';
  });

  useEffect(() => {
    localStorage.setItem('navigate_language', language);
  }, [language]);

  const t = (key) => translations[language]?.[key] || translations['it'][key] || key;
  
  // Helper per ottenere campo tradotto da entità
  const getLocalized = (entity, field) => {
    if (!entity) return '';
    if (language === 'en' && entity[`${field}_en`]) {
      return entity[`${field}_en`];
    }
    return entity[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;