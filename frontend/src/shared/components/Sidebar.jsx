
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-medlink.jpg';

// Navigation Patient
const patientNav = [
    { to: '/app', label: 'Tableau de bord', icon: '📊' },
    { to: '/app/appointments', label: 'Mes rendez-vous', icon: '📅' },
    { to: '/app/book', label: 'Prendre RDV', icon: '➕' },
    { to: '/app/records', label: 'Dossier médical', icon: '📋' },
    { to: '/app/results', label: 'Mes résultats', icon: '🧪' },
];

// Navigation Praticien
const practitionerNav = [
    { to: '/app', label: 'Tableau de bord', icon: '📊' },
    { to: '/app/appointments', label: 'Agenda', icon: '📅' },
    { to: '/app/records', label: 'Dossiers patients', icon: '📋' },
];

// Navigation Administrateur
const adminNav = [
    { to: '/app', label: 'Tableau de bord', icon: '📊' },
    { to: '/app/admin/users', label: 'Utilisateurs', icon: '👥' },
    { to: '/app/admin/cliniques', label: 'Cliniques', icon: '🏥' },
    { to: '/app/admin/audit', label: "Journal d'audit", icon: '🛡️' },
];

// Menus associés aux rôles
const navByRole = {
    patient: patientNav,
    practitioner: practitionerNav,
    admin: adminNav,
};

// Libellés des rôles
const roleLabel = {
    patient: 'Patient',
    practitioner: 'Praticien',
    admin: 'Administrateur',
};

export default function Sidebar() {
    const { user, logout } = useAuth();

    // Sélection du menu selon le rôle de l'utilisateur
    const nav = navByRole[user?.role] || patientNav;

    // Déconnexion
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-outline-variant bg-white">

            {/* Logo et titre */}
            <div className="flex items-center gap-3 border-b border-outline-variant px-6 py-5">
                <img
                    src={logo}
                    alt="MedLink Logo"
                    className="h-12 w-auto object-contain"
                />

                <div>
                    <h1 className="font-display text-xl font-bold text-on-surface">
                        MedLink
                    </h1>
                    <p className="text-xs text-on-variant">
                        Espace sécurisé
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-4 py-6">
                <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-on-variant">
                    Menu principal
                </p>

                {nav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/app'}
                        className={({ isActive }) =>
                            isActive
                                ? 'nav-link-active'
                                : 'nav-link-inactive'
                        }
                    >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Profil utilisateur et Déconnexion */}
            <div className="border-t border-outline-variant p-4">

                {/* Profil */}
                <div className="mb-4 rounded-xl bg-surface-low p-4">
                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-on-surface">
                                {user?.full_name}
                            </p>

                            <p className="truncate text-xs text-on-variant">
                                {user?.role === 'practitioner'
                                    ? user?.specialty || roleLabel.practitioner
                                    : roleLabel[user?.role] || 'Patient'}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Bouton Déconnexion */}
                <button
                    type="button"
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
