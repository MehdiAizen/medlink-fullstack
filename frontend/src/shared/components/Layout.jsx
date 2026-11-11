import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import SessionTimeout from './SessionTimeout';

export default function Layout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-surface">
            {/* ✅ Active la surveillance du timeout de session ici */}
            <SessionTimeout />

            {/* Sidebar fixe à gauche (largeur w-72 = 18rem = 288px, donc ml-72 est parfait) */}
            <Sidebar />

            {/* Contenu principal à droite de la sidebar */}
            <div className="ml-72 flex flex-1 flex-col">
                <Navbar />

                <main className="flex-1 p-8 overflow-y-auto">
                    {/* C'est ici que s'affichent les pages : Dashboard, Appointments, etc. */}
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}