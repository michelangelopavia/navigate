import Home from './pages/Home';
import Login from './pages/Login';
import Iscrizione from './pages/Iscrizione';
import Gioca from './pages/Gioca';
import AdminDashboard from './pages/AdminDashboard';
import GestioneTappe from './pages/GestioneTappe';
import GestioneEventi from './pages/GestioneEventi';
import Classifica from './pages/Classifica';
import GestioneRichieste from './pages/GestioneRichieste';
import GestioneLuoghi from './pages/GestioneLuoghi';
import AssegnaAdminSede from './pages/AssegnaAdminSede';
import GestioneSegnalazioni from './pages/GestioneSegnalazioni';
import Profilo from './pages/Profilo';
import Classifiche from './pages/Classifiche';
import DettaglioEvento from './pages/DettaglioEvento';
import ImpostazioniSEO from './pages/ImpostazioniSEO';
import ShareEvento from './pages/ShareEvento';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Login": Login,
    "Iscrizione": Iscrizione,
    "Gioca": Gioca,
    "AdminDashboard": AdminDashboard,
    "GestioneTappe": GestioneTappe,
    "GestioneEventi": GestioneEventi,
    "Classifica": Classifica,
    "GestioneRichieste": GestioneRichieste,
    "GestioneLuoghi": GestioneLuoghi,
    "AssegnaAdminSede": AssegnaAdminSede,
    "GestioneSegnalazioni": GestioneSegnalazioni,
    "Profilo": Profilo,
    "Classifiche": Classifiche,
    "DettaglioEvento": DettaglioEvento,
    "ImpostazioniSEO": ImpostazioniSEO,
    "ShareEvento": ShareEvento,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};