import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axiosConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier au chargement si un token est déjà présent
  useEffect(() => {
    const token = localStorage.getItem('medlink_token');
    if (token) {
      api.auth.me()
          .then(setUser)
          .catch(() => {
            localStorage.removeItem('medlink_token');
            setUser(null);
          })
          .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('medlink_token', data.token);
    setUser(data.user);
    return data;
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('medlink_token');
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}