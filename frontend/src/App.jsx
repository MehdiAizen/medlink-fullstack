import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/context/AuthContext';
import Layout from './shared/components/Layout';

// Pages publiques
import Landing from './shared/pages/Landing';
import Login from './modules/auth/pages/Login';
import Signup from './modules/auth/pages/Signup';
import SignupPractitioner from './modules/auth/pages/SignupPractitioner';

// Pages de l'application
import Dashboard from './shared/pages/Dashboard';
import Appointments from './modules/patient/pages/Appointments';
import BookAppointment from './modules/patient/pages/BookAppointment';
import Records from './modules/patient/pages/Records';
import Results from './modules/patient/pages/Results';

// Pages praticien (US-18 à US-26)
import Disponibilites from './modules/practitioner/pages/Disponibilites';
import Agenda from './modules/practitioner/pages/Agenda';
import Patients from './modules/practitioner/pages/Patients';
import DossiersMedicaux from './modules/practitioner/pages/DossiersMedicaux';
import ComptesRendus from './modules/practitioner/pages/ComptesRendus';
import PublierResultats from './modules/practitioner/pages/PublierResultats';

// Pages admin
import AdminUsers from './modules/admin/pages/AdminUsers';
import AdminCliniques from './modules/admin/pages/AdminClinique';
import AdminAudit from './modules/admin/pages/AdminAudit';

// Protection : utilisateur connecté
function PrivateRoute({ children }) {
    const { user, loading, authError, logout } = useAuth();
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }
    // Session Keycloak valide mais profil refusé par l'API : on affiche l'erreur
    // au lieu de relancer la connexion en boucle.
    if (!user && authError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
                <h1 className="text-xl font-bold">Connexion impossible</h1>
                <p className="max-w-md text-sm text-on-variant">{authError}</p>
                <button className="btn-primary" onClick={() => logout().catch(() => {})}>
                    Se déconnecter
                </button>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// Protection : rôle requis (le backend contrôle aussi, ceci évite les pages vides)
function RoleRoute({ roles, children }) {
    const { user } = useAuth();
    if (!roles.includes(user?.role)) return <Navigate to="/app" replace />;
    return children;
}

export default function App() {
    return (
        <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup-practitioner" element={<SignupPractitioner />} />

            {/* Routes protégées */}
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />

                {/* Patient et praticien */}
                <Route path="appointments" element={<Appointments />} />
                <Route path="records" element={<Records />} />

                {/* Patient */}
                <Route path="book" element={<RoleRoute roles={['patient']}><BookAppointment /></RoleRoute>} />
                <Route path="results" element={<RoleRoute roles={['patient']}><Results /></RoleRoute>} />

                {/* Praticien */}
                <Route path="disponibilites" element={<RoleRoute roles={['practitioner']}><Disponibilites /></RoleRoute>} />
                <Route path="agenda" element={<RoleRoute roles={['practitioner']}><Agenda /></RoleRoute>} />
                <Route path="patients" element={<RoleRoute roles={['practitioner']}><Patients /></RoleRoute>} />
                <Route path="dossiers/:id" element={<RoleRoute roles={['practitioner']}><DossiersMedicaux /></RoleRoute>} />
                <Route path="comptes-rendus" element={<RoleRoute roles={['practitioner']}><ComptesRendus /></RoleRoute>} />
                <Route path="publier-resultats" element={<RoleRoute roles={['practitioner']}><PublierResultats /></RoleRoute>} />

                {/* Admin */}
                <Route path="admin/users" element={<RoleRoute roles={['admin']}><AdminUsers /></RoleRoute>} />
                <Route path="admin/cliniques" element={<RoleRoute roles={['admin']}><AdminCliniques /></RoleRoute>} />
                <Route path="admin/audit" element={<RoleRoute roles={['admin']}><AdminAudit /></RoleRoute>} />
            </Route>

            {/* Pages inexistantes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}