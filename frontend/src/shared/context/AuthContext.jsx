import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { api } from '../api/axiosConfig';
import keycloak from '../keycloak.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        if (authenticated) {
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
    redirectUri: window.location.origin + '/login',
  });
};
  const logout = () => {
    setUser(null);

    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

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