import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import logo from '../../../shared/assets/logo-medlink.jpg';

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Erreur de connexion :', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <img
          src={logo}
          alt="MedLink"
          className="w-24 mx-auto mb-6"
        />

        <h1 className="text-2xl font-bold mb-3">
          Bienvenue sur MedLink
        </h1>

        <p className="text-gray-600 mb-8">
          Connectez-vous pour accéder à votre espace sécurisé.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Se connecter avec Keycloak'}
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Authentification sécurisée par Keycloak
        </p>
      </div>
    </div>
  );
}