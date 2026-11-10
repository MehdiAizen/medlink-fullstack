import logo from '../../../shared/assets/logo-medlink.jpg';

// Éléments d'interface communs aux formulaires d'inscription (patient et praticien).

export const TEAL = 'bg-[#028f82] hover:bg-[#027a6f]';

// --- Petits composants d'interface (apparence uniquement) -------------------
export function Icon({ children, size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

export const ICONS = {
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4.1-5M9.9 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22" /><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  shield: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  pulse: <><path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.5-6.6 5 5 0 0 1 7.5 6.6z" /><path d="M3 12h4l2-3 3 6 2-3h2" /></>,
  building: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>,
  badge: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M15 9h3M15 13h3M6.5 16.5c.6-1.6 4.4-1.6 5 0" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
};
export const Ic = ({ name, size, className }) => <Icon size={size} className={className}>{ICONS[name]}</Icon>;

// Disposition commune : panneau turquoise à gauche (comme la page de connexion), contenu à droite.
const PATIENT_PANEL = {
  title: 'Créez votre espace santé',
  highlight: 'en quelques minutes.',
  text: "Un seul compte pour vos rendez-vous, vos dossiers médicaux et vos résultats d'analyses, dans les cliniques partenaires en Tunisie.",
  features: [
    ['calendar', 'Prenez rendez-vous en ligne avec vos praticiens'],
    ['file', "Retrouvez vos résultats d'analyses en un seul endroit"],
    ['shield', 'Vos données de santé protégées et confidentielles'],
  ],
};

export function Shell({ children, panel = PATIENT_PANEL }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[11fr_9fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0fa39a] via-[#00877a] to-[#02574f] px-12 py-14 text-white lg:sticky lg:top-0 lg:flex lg:h-screen xl:px-20">
        <div className="pointer-events-none absolute -bottom-56 -right-44 h-[520px] w-[520px] rounded-full border-[40px] border-white/[0.06]" />
        <div className="relative flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg">
            <img src={logo} alt="" className="h-11 w-11 object-contain" />
          </span>
          <span className="font-display text-3xl font-extrabold tracking-tight">
            MedLink<i className="ml-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-200 align-baseline" />
          </span>
        </div>

        <div className="relative">
          <h2 className="mb-5 font-display text-5xl font-extrabold leading-[1.1] tracking-tight !text-white xl:text-6xl">
            {panel.title}<br />
            <span className="text-emerald-200">{panel.highlight}</span>
          </h2>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/90">{panel.text}</p>
          <ul className="grid gap-4">
            {panel.features.map(([icon, text]) => (
              <li key={text} className="flex items-center gap-4 text-base text-white/95">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-white/20 bg-white/15">
                  <Ic name={icon} size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative border-t border-white/20 pt-6 text-sm text-white/75">
          © 2026 MedLink — Cliniques partenaires Tunisie
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[560px]">{children}</div>
      </main>
    </div>
  );
}

export function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#0b1b3a]">{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

// Champ avec icône à gauche (et éventuellement un élément à droite).
export function InputShell({ icon, right, passive = false, children }) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 transition group-focus-within:text-[#028f82]">
        <Ic name={icon} size={19} />
      </span>
      {children}
      {right && <span className={`absolute inset-y-0 right-3 flex items-center ${passive ? 'pointer-events-none' : ''}`}>{right}</span>}
    </div>
  );
}

