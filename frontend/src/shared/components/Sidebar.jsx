import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-medlink.jpg';

const patientNav = [
  { to: '/app', label: 'Tableau de bord', icon: '📊' },
  { to: '/app/appointments', label: 'Mes rendez-vous', icon: '📅' },
  { to: '/app/book', label: 'Prendre RDV', icon: '➕' },
  { to: '/app/records', label: 'Dossier médical', icon: '📋' },
  { to: '/app/results', label: 'Mes résultats', icon: '🧪' },
];

const practitionerNav = [
  { to: '/app', label: 'Tableau de bord', icon: '📊' },
  { to: '/app/appointments', label: 'Agenda multi-sites', icon: '📅' },
  { to: '/app/disponibilites', label: 'Mes disponibilités', icon: '⏰' },
  { to: '/app/patients', label: 'Mes patients', icon: '🔍' },
  { to: '/app/records', label: 'Dossiers médicaux', icon: '📋' },
  { to: '/app/comptes-rendus', label: 'Comptes-rendus', icon: '📝' },
  { to: '/app/publier-resultats', label: 'Publier résultats', icon: '💉' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isPractitioner = user?.role === 'practitioner';
  const nav = isPractitioner ? practitionerNav : patientNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = isPractitioner
    ? user?.specialty || 'Praticien'
    : user?.role === 'admin'
    ? 'Administrateur'
    : 'Patient';

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-outline-variant bg-white">
      {/* Logo et titre */}
      <div className="flex items-center gap-3 border-b border-outline-variant px-6 py-5">
        <img src={logo} alt="MedLink Logo" className="h-12 w-auto object-contain" />
        <div>
          <h1 className="font-display text-xl font-bold text-on-surface">MedLink</h1>
          <p className="text-xs text-on-variant">Espace sécurisé</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-variant">
          {isPractitioner ? 'Menu praticien' : 'Menu principal'}
        </p>

        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link-inactive'
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Profil + déconnexion */}
      <div className="border-t border-outline-variant p-4">
        <div className="mb-4 rounded-xl bg-surface-low p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">
                {user?.full_name}
              </p>
              <p className="truncate text-xs text-on-variant">{roleLabel}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-outline-variant bg-white px-4 py-3 text-sm font-semibold text-on-surface transition hover:border-error hover:bg-error-container hover:text-error"
        >
          <span>🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}