import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const patientNav = [
  { to: '/', label: 'Tableau de bord', icon: '📊' },
  { to: '/appointments', label: 'Mes rendez-vous', icon: '📅' },
  { to: '/book', label: 'Prendre RDV', icon: '➕' },
  { to: '/records', label: 'Dossier médical', icon: '📋' },
  { to: '/results', label: 'Mes résultats', icon: '🧪' },
];

const doctorNav = [
  { to: '/', label: 'Tableau de bord', icon: '📊' },
  { to: '/appointments', label: 'Agenda', icon: '📅' },
  { to: '/records', label: 'Dossiers patients', icon: '📋' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'doctor' ? doctorNav : patientNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-outline-variant/40 bg-primary text-white">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-xl">
            🩺
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">MedLink</h1>
            <p className="text-xs text-white/60">Espace sécurisé</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3">
            <p className="truncate text-sm font-semibold">{user?.full_name}</p>
            <p className="truncate text-xs text-white/50">
              {user?.role === 'doctor' ? user?.specialty || 'Médecin' : 'Patient'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-20 border-b border-outline-variant/40 bg-white/80 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-primary">
                Bonjour, {user?.full_name?.split(' ')[0]}
              </h2>
              <p className="text-sm text-on-variant">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-info capitalize">{user?.role}</span>
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
