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
    export default function Layout() {
        return (
            <div className="flex min-h-screen bg-surface">
                {/* ✅ Active la surveillance du timeout ici */}
                <SessionTimeout />

                <Sidebar />

                <main className="flex-1 flex flex-col min-w-0">
                    <Navbar />
                    <div className="flex-1 p-8 overflow-y-auto">
                        <Outlet /> {/* C'est ici que s'affichent Dashboard, Appointments, etc. */}
                    </div>
                </main>
            </div>
        );
    }
  return (
      <div className="flex min-h-screen bg-surface">

        <Sidebar />

          <div className="ml-72 flex flex-1 flex-col">
          <Navbar />

          <main className="flex-1 p-8">
            <Outlet />
          </main>

          <Footer />


        </div>
      </div>
  );
}