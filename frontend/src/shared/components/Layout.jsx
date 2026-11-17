import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import SessionTimeout from './SessionTimeout';

export default function Layout() {
    // 1. Récupérer les éléments nécessaires depuis le contexte
    // (Assurez-vous que votre AuthContext exporte bien 'user', 'setUser' et 'keycloak')
    const { user, setUser, keycloak } = useAuth();

    // 2. Définir les fonctions de déconnexion AVANT le return
    const logout = async () => {
        setUser(null);
        if (keycloak) {
            await keycloak.logout({
                redirectUri: window.location.origin + '/login',
            });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    };

    // 3. Retourner le JSX propre et structuré
    return (
        <div className="flex min-h-screen bg-surface">
            {/* Surveillance de la session */}
            <SessionTimeout />

            {/* Barre latérale */}
            <Sidebar />

            {/* Contenu principal */}
            <div className="ml-72 flex min-w-0 flex-1 flex-col">
                
                {/* Navbar : on lui passe la fonction de déconnexion en prop */}
                <Navbar onLogout={handleLogout} />

                {/* Zone de contenu dynamique */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}