import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/axiosConfig';
import logo from '../../../shared/assets/logo-medlink.jpg';

// --- Règles identiques à backend/src/shared/utils/validators.js -------------
const NAME_REGEX = /^[\p{L}][\p{L}\p{M}' -]{1,49}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TN_PHONE_REGEX = /^[24579]\d{7}$/;

function normalizePhone(raw) {
  let digits = raw.replace(/[\s.\-()]/g, '');
  if (digits.startsWith('+216')) digits = digits.slice(4);
  else if (digits.startsWith('00216')) digits = digits.slice(5);
  else if (digits.startsWith('216') && digits.length === 11) digits = digits.slice(3);
  return TN_PHONE_REGEX.test(digits) ? `+216${digits}` : null;
}

const PASSWORD_CHECKS = [
  { id: 'len', label: 'Au moins 12 caractères', test: (p) => p.length >= 12 && p.length <= 128 },
  { id: 'lower', label: 'Une minuscule', test: (p) => /\p{Ll}/u.test(p) },
  { id: 'upper', label: 'Une majuscule', test: (p) => /\p{Lu}/u.test(p) },
  { id: 'digit', label: 'Un chiffre', test: (p) => /\p{Nd}/u.test(p) },
  { id: 'special', label: 'Un caractère spécial', test: (p) => /[^\p{L}\p{N}]/u.test(p) },
];

function validate(v) {
  const errors = {};
  if (!NAME_REGEX.test(v.firstName.trim())) errors.firstName = 'Prénom invalide';
  if (!NAME_REGEX.test(v.lastName.trim())) errors.lastName = 'Nom invalide';

  const email = v.email.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    errors.email = 'Adresse email invalide';
  }
  if (!normalizePhone(v.phone)) {
    errors.phone = 'Numéro tunisien invalide (ex. 22 123 456)';
  }
  if (!PASSWORD_CHECKS.every((c) => c.test(v.password)) || v.password.toLowerCase() === email) {
    errors.password = 'Le mot de passe ne respecte pas toutes les règles';
  }
  if (v.confirm !== v.password) errors.confirm = 'Les mots de passe ne correspondent pas';
  if (!v.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions d'utilisation et la politique de confidentialité";
  }
  return errors;
}

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  acceptTerms: false,
};

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Signup() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // Déjà connecté : inutile de s'inscrire.
  useEffect(() => {
    if (!loading && user) navigate('/app', { replace: true });
  }, [user, loading, navigate]);

  const clientErrors = useMemo(() => validate(values), [values]);
  const errorFor = (name) =>
    (touched[name] && clientErrors[name]) || serverErrors[name] || '';

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    // L'erreur renvoyée par le serveur n'est plus valable une fois le champ modifié.
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    setFormError('');
  };

  const blur = (name) => () => setTouched((prev) => ({ ...prev, [name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setTouched(Object.fromEntries(Object.keys(INITIAL).map((k) => [k, true])));

    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      await api.auth.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone,
        password: values.password,
        acceptTerms: values.acceptTerms,
      });
      setSuccess(values.email.trim().toLowerCase());
      setValues(INITIAL); // le mot de passe ne reste pas en mémoire dans le formulaire
    } catch (err) {
      if (err.status === 400 && err.fields && Object.keys(err.fields).length) {
        setServerErrors(err.fields);
        setFormError('Veuillez corriger les champs signalés.');
      } else if (err.status === 429) {
        setFormError('Trop de tentatives. Patientez quelques minutes avant de réessayer.');
      } else {
        // 409 (message volontairement neutre côté serveur), 500, réseau…
        setFormError(err.message || 'Inscription impossible pour le moment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Écran de succès ------------------------------------------------------
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-low px-4 py-10">
        <div className="card w-full max-w-md text-center hover:shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-container text-2xl text-success">
            ✓
          </div>
          <h1 className="mb-3 text-2xl">Vérifiez votre boîte mail</h1>
          <p className="mb-2 text-sm text-on-variant">
            Votre compte a été créé. Un email de confirmation a été envoyé à
          </p>
          <p className="mb-5 break-all font-semibold">{success}</p>
          <p className="mb-8 text-sm text-on-variant">
            Cliquez sur le lien reçu pour confirmer votre adresse, puis connectez-vous.
          </p>
          <button type="button" onClick={() => login().catch(console.error)} className="btn-primary w-full">Aller à la connexion</button>
        </div>
      </div>
    );
  }

  // --- Formulaire -----------------------------------------------------------
  const inputProps = (name, extra = {}) => ({
    id: name,
    name,
    value: values[name],
    onChange: set(name),
    onBlur: blur(name),
    'aria-invalid': errorFor(name) ? 'true' : 'false',
    'aria-describedby': errorFor(name) ? `${name}-error` : undefined,
    className: `input ${errorFor(name) ? 'border-error focus:border-error focus:ring-error/20' : ''}`,
    ...extra,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-low px-4 py-10">
      <div className="card w-full max-w-lg hover:shadow-sm">
        <img src={logo} alt="MedLink" style={{ width: 96, height: 'auto' }} className="mx-auto mb-5" />
        <h1 className="mb-1 text-center text-2xl">Créer un compte patient</h1>
        <p className="mb-6 text-center text-sm text-on-variant">
          Accédez à vos rendez-vous et à votre dossier médical en toute sécurité.
        </p>

        {formError && (
          <div role="alert" className="mb-5 rounded-lg bg-error-container px-4 py-3 text-sm font-medium text-error">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="Prénom" error={errorFor('firstName')}>
              <input {...inputProps('firstName', { type: 'text', autoComplete: 'given-name' })} />
            </Field>
            <Field id="lastName" label="Nom" error={errorFor('lastName')}>
              <input {...inputProps('lastName', { type: 'text', autoComplete: 'family-name' })} />
            </Field>
          </div>

          <Field id="email" label="Adresse email" error={errorFor('email')}>
            <input {...inputProps('email', { type: 'email', autoComplete: 'email', placeholder: 'nom@exemple.com' })} />
          </Field>

          <Field id="phone" label="Téléphone" error={errorFor('phone')}>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border-2 border-r-0 border-outline-variant bg-surface-container px-3 text-sm font-semibold text-on-variant">
                +216
              </span>
              <input
                {...inputProps('phone', {
                  type: 'tel',
                  autoComplete: 'tel-national',
                  placeholder: '22 123 456',
                  className: `input rounded-l-none ${errorFor('phone') ? 'border-error focus:border-error focus:ring-error/20' : ''}`,
                })}
              />
            </div>
          </Field>

          <Field id="password" label="Mot de passe" error={errorFor('password')}>
            <div className="relative">
              <input
                {...inputProps('password', {
                  type: showPassword ? 'text' : 'password',
                  autoComplete: 'new-password',
                  maxLength: 128,
                  className: `input pr-24 ${errorFor('password') ? 'border-error focus:border-error focus:ring-error/20' : ''}`,
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 text-xs font-semibold text-primary hover:underline"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <ul className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2" aria-label="Règles du mot de passe">
              {PASSWORD_CHECKS.map((c) => {
                const ok = c.test(values.password);
                return (
                  <li key={c.id} className={ok ? 'text-success' : 'text-on-variant'}>
                    <span aria-hidden="true">{ok ? '✓' : '○'}</span> {c.label}
                  </li>
                );
              })}
            </ul>
          </Field>

          <Field id="confirm" label="Confirmer le mot de passe" error={errorFor('confirm')}>
            <input
              {...inputProps('confirm', {
                type: showPassword ? 'text' : 'password',
                autoComplete: 'new-password',
                maxLength: 128,
              })}
            />
          </Field>

          <div>
            <label className="flex items-start gap-3 text-sm text-on-variant">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={values.acceptTerms}
                onChange={set('acceptTerms')}
                onBlur={blur('acceptTerms')}
                aria-describedby={errorFor('acceptTerms') ? 'acceptTerms-error' : undefined}
                className="mt-0.5 h-4 w-4 rounded border-outline text-primary focus:ring-primary"
              />
              <span>
                J'accepte les conditions d'utilisation et la politique de confidentialité de MedLink.
              </span>
            </label>
            {errorFor('acceptTerms') && (
              <p id="acceptTerms-error" role="alert" className="mt-1 text-xs font-medium text-error">
                {errorFor('acceptTerms')}
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? 'Création du compte…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-variant">
          Vous avez déjà un compte ?{' '}
          <button type="button" onClick={() => login().catch(console.error)} className="font-semibold text-primary hover:underline">Se connecter</button>
        </p>
      </div>
    </div>
  );
}
