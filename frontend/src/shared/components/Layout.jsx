
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import SessionTimeout from './SessionTimeout';

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-surface">

            {/* Surveillance de la session */}
            <SessionTimeout />

            {/* Barre latérale */}
            <Sidebar />

            {/* Contenu principal */}
            <div className="ml-72 flex min-w-0 flex-1 flex-col">

                <Navbar />

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>

                <Footer />

            </div>
        </div>
    );
}
