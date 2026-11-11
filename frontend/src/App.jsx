import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './shared/context/AuthContext';
import Layout from './shared/components/Layout';

// 1. Import de la Landing Page et du Login
import Landing from './shared/pages/Landing';
import Login from './modules/auth/pages/Login';

// 2. Import des pages de l'application (Dashboard, etc.)
import Dashboard from './shared/pages/Dashboard';
import Appointments from './modules/patient/pages/Appointments';
import BookAppointment from './modules/patient/pages/BookAppointment';
import Records from './modules/patient/pages/Records';
import Results from './modules/patient/pages/Results';

// 3. Back-office administrateur (NOUVEAU)
import AdminDashboard from './modules/admin/pages/Admin';
import AdminUsers from './modules/admin/pages/AdminUsers';
import AdminCliniques from './modules/admin/pages/AdminCliniques';
import AdminAudit from './modules/admin/pages/AdminAudit';

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

// Réserve une route à certains rôles (NOUVEAU)
function RoleRoute({ roles, children }) {
    const { user } = useAuth();
    return roles.includes(user?.role) ? children : <Navigate to="/app" replace />;
}

// Chaque rôle a son propre tableau de bord sur /app (NOUVEAU)
function DashboardRouter() {
    const { user } = useAuth();
    return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
}

export default function App() {
    return (
        <Routes>
            {/* ✅ Route publique : Page d'accueil */}
            <Route path="/" element={<Landing />} />

            {/* ✅ Route publique : Page de connexion */}
            <Route path="/login" element={<Login />} />

            {/* ✅ Routes protégées : Application (accessible uniquement si connecté) */}
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* On utilise DashboardRouter au lieu de Dashboard */}
                <Route index element={<DashboardRouter />} />

                <Route path="appointments" element={<Appointments />} />
                <Route path="book" element={<BookAppointment />} />
                <Route path="records" element={<Records />} />
                <Route path="results" element={<Results />} />

                {/* Routes Admin (NOUVEAU) */}
                <Route path="admin/users" element={<RoleRoute roles={['admin']}><AdminUsers /></RoleRoute>} />
                <Route path="admin/cliniques" element={<RoleRoute roles={['admin']}><AdminCliniques /></RoleRoute>} />
                <Route path="admin/audit" element={<RoleRoute roles={['admin']}><AdminAudit /></RoleRoute>} />
            </Route>

            {/* Redirection des pages inexistantes vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}