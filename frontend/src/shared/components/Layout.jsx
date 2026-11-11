import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
const logout = async () => {
  setUser(null);

  await keycloak.logout({
    redirectUri: window.location.origin + '/login',
  });
};
 const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
  }
};

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