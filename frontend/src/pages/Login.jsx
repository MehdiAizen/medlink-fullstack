import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('patient@medlink.tn');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🩺</span>
            <span className="font-display text-2xl font-bold">MedLink</span>
          </div>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Votre santé,<br />en toute confiance.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Accédez à votre espace patient ou praticien sécurisé. Dossiers médicaux,
            rendez-vous et résultats d’analyses en un seul endroit.
          </p>
        </div>
        <p className="text-sm text-white/40">© 2026 MedLink — Cliniques partenaires Tunisie</p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🩺</span>
              <span className="font-display text-xl font-bold text-primary">MedLink</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-primary">Connexion sécurisée</h2>
          <p className="mt-1 text-sm text-on-variant">
            Identifiez-vous pour accéder à votre espace
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-outline-variant/50 bg-surface-low p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-variant">
              Comptes de démonstration
            </p>
            <div className="space-y-1.5 text-sm">
              <button
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white"
                onClick={() => {
                  setEmail('patient@medlink.tn');
                  setPassword('password123');
                }}
              >
                <span className="font-medium text-primary">Patient</span>
                <span className="ml-2 text-on-variant">patient@medlink.tn</span>
              </button>
              <button
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white"
                onClick={() => {
                  setEmail('doctor@medlink.tn');
                  setPassword('password123');
                }}
              >
                <span className="font-medium text-primary">Médecin</span>
                <span className="ml-2 text-on-variant">doctor@medlink.tn</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-on-variant">Mot de passe : password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
