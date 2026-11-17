import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
} from 'react';

import { api } from '../api/axiosConfig';
import keycloak from '../keycloak.js';
import { useIdleLogout } from '../hooks/useIdleLogout.js';

const AuthContext = createContext(null);

// keycloak.init() ne peut être appelé qu'une seule fois par instance.
// En développement, React.StrictMode exécute les effets deux fois :
// on partage donc la même promesse d'initialisation entre les deux exécutions.
let keycloakInitPromise = null;

function initKeycloakOnce() {
    if (!keycloakInitPromise) {
        keycloakInitPromise = keycloak.init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
            checkLoginIframe: false,
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html', // 👈 LIGNE AJOUTÉE ICI
        });
    }
    return keycloakInitPromise;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const logoutInProgress = useRef(false);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const authenticated = await initKeycloakOnce();

                if (authenticated) {
                    try { sessionStorage.removeItem('medlink-login-attempt'); } catch { /* ignoré */ }

                    // Rafraîchit automatiquement le token s'il expire pendant la navigation
                    keycloak.onTokenExpired = () => {
                        keycloak.updateToken(30).catch(() => {
                            console.warn('Session expirée, déconnexion...');
                            if (mounted) setUser(null);
                        });
                    };

                    const profile = await api.auth.me();

                    if (mounted) {
                        setUser(profile);
                    }
                }
            } catch (error) {
                console.error('Erreur Keycloak :', error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const login = async () => {
        await keycloak.login({
            redirectUri: window.location.origin + '/app',
        });
    };
    const logout = () => {
        // 1. On génère l'URL de déconnexion de Keycloak manuellement
        const logoutUrl = keycloak.createLogoutUrl({
            redirectUri: window.location.origin + '/login',
        });

        // 2. On vide le stockage local par sécurité
        localStorage.clear();
        sessionStorage.clear();

        // 3. On force le navigateur à quitter l'application pour aller sur Keycloak
        window.location.href = logoutUrl;
    };

    // US-40 : déconnexion après 15 min d'inactivité.
    useIdleLogout(!!user, () => {
        logout().catch(() => {});
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth doit être utilisé à l’intérieur d’un AuthProvider'
        );
    }

    return context;
}