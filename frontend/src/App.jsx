import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/context/AuthContext';
import Layout from './shared/components/Layout';

// 1. Import de la Landing Page et du Login
import Landing from './shared/pages/Landing';
import Login from './modules/auth/pages/Login';
import Signup from './modules/auth/pages/Signup';
import SignupPractitioner from './modules/auth/pages/SignupPractitioner';

// 2. Import des pages de l'application (Dashboard, etc.)
import Dashboard from './shared/pages/Dashboard';
import Appointments from './modules/patient/pages/Appointments';
import BookAppointment from './modules/patient/pages/BookAppointment';
import Records from './modules/patient/pages/Records';
import Results from './modules/patient/pages/Results';

// 3. Import des pages PRATICIEN (US-18 à US-26)
import Disponibilites from './modules/practitioner/pages/Disponibilites';
import Agenda from './modules/practitioner/pages/Agenda';
import Patients from './modules/practitioner/pages/Patients';
import DossiersMedicaux from './modules/practitioner/pages/DossiersMedicaux';
import ComptesRendus from './modules/practitioner/pages/ComptesRendus';
import PublierResultats from './modules/practitioner/pages/PublierResultats';

// Composant de protection des routes
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    return (
        <Routes>
            {/* Route publique : Page d'accueil */}
            <Route path="/" element={<Landing />} />

            {/* Route publique : Page de connexion */}
            <Route path="/login" element={<Login />} />

            {/* ✅ Route publique : Inscription patient */}
            <Route path="/signup" element={<Signup />} />

            {/* ✅ Route publique : Demande de compte praticien */}
            <Route path="/signup-practitioner" element={<SignupPractitioner />} />

            {/* Routes protégées : Application (accessible uniquement si connecté) */}
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="book" element={<BookAppointment />} />
                <Route path="records" element={<Records />} />
                <Route path="results" element={<Results />} />
                <Route path="disponibilites" element={<Disponibilites />} />  
                <Route path="agenda" element={<Agenda />} />                    
                <Route path="patients" element={<Patients />} />                
                <Route path="dossiers/:id" element={<DossiersMedicaux />} />        
                <Route path="comptes-rendus" element={<ComptesRendus />} />      
                <Route path="publier-resultats" element={<PublierResultats />} /> 
            </Route>

            {/* Redirection des pages inexistantes vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}