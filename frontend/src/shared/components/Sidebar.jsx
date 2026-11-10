import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-medlink.jpg';

const patientNav = [
  { to: '/app', label: 'Tableau de bord', icon: '📊', description: 'Vue d\'ensemble' },
  { to: '/app/appointments', label: 'Mes rendez-vous', icon: '📅', description: 'Gérer mes RDV' },
  { to: '/app/book', label: 'Prendre RDV', icon: '➕', description: 'Nouveau rendez-vous' },
  { to: '/app/records', label: 'Dossier médical', icon: '📋', description: 'Mes documents' },
  { to: '/app/results', label: 'Mes résultats', icon: '🧪', description: 'Analyses & bilans' },
];

const practitionerNav = [
  { to: '/app', label: 'Tableau de bord', icon: '📊', description: 'Vue d\'ensemble' },
  { to: '/app/appointments', label: 'Agenda multi-sites', icon: '📅', description: 'Gérer les RDV' },
  { to: '/app/disponibilites', label: 'Mes disponibilités', icon: '⏰', description: 'Créneaux & absences' },
  { to: '/app/patients', label: 'Mes patients', icon: '🔍', description: 'Rechercher & consulter' },
  { to: '/app/records', label: 'Dossiers médicaux', icon: '📁', description: 'Historique complet' },
  { to: '/app/comptes-rendus', label: 'Comptes-rendus', icon: '📝', description: 'Rédiger & consulter' },
  { to: '/app/publier-resultats', label: 'Publier résultats', icon: '💉', description: 'Analyses & examens' },
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
    <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-gray-200 bg-white shadow-sm">
      {/* Logo et titre */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <img src={logo} alt="MedLink Logo" className="h-12 w-auto object-contain rounded-lg" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">MedLink</h1>
          <p className="text-xs text-gray-500">Espace sécurisé</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {isPractitioner ? 'Menu praticien' : 'Menu principal'}
        </p>

        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 shadow-sm border border-teal-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.label}</p>
              <p className="text-xs text-gray-400 truncate">{item.description}</p>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Profil + déconnexion */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white font-bold text-lg shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.full_name}
              </p>
              <p className="truncate text-xs text-gray-500">{roleLabel}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}