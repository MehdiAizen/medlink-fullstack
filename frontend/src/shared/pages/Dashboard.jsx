import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/api/axiosConfig';

// ✅ Utilise les classes .stat-card et .stat-icon de ton index.css
function StatCard({ label, value, icon, bgIcon, textIcon, subtext }) {
  return (
    <div className="stat-card group hover:-translate-y-1 hover:border-primary/30">
      <div className={`stat-icon ${bgIcon} ${textIcon}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-on-variant mb-1">{label}</p>
        <p className="text-3xl font-bold text-on-surface group-hover:scale-105 transition-transform origin-left">
          {value || 0}
        </p>
        {subtext && <p className="text-xs text-on-variant mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}

// ✅ Utilise les classes .badge-* de ton index.css
function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    cancelled: 'badge-error',
    completed: 'badge-info',
  };
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  };
  return (
    <span className={map[status] || 'badge-info'}>
      {labels[status] || status}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        if (user?.role === 'practitioner') {
          const response = await api.practitioner.dashboard();
          setData({ stats: response.stats, today: response.today || [] });
        } else {
          const response = await api.dashboard(); 
          setData(response);
        }
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setError(err.message || 'Impossible de charger les données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-on-variant font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error m-6">⚠️ {error}</div>;
  }

  const isPatient = user?.role === 'patient';
  const displayName = isPatient ? user?.full_name : `Dr. ${user?.full_name}`;

  return (
    // ✅ Padding cohérent (p-6 au lieu de p-2 pour mieux respirer)
    <div className="space-y-8 fade-in p-6">
      
      {/* En-tête */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-outline-variant">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">
            Bonjour, {displayName} 👋
          </h1>
          <p className="text-on-variant mt-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        {isPatient ? (
          <>
            <StatCard label="RDV à venir" value={data?.stats?.upcoming_appointments} icon="📅" bgIcon="bg-primary-50" textIcon="text-primary" subtext="Prochainement" />
            <StatCard label="Documents médicaux" value={data?.stats?.medical_records} icon="📋" bgIcon="bg-info-container" textIcon="text-info" subtext="Dossiers complets" />
            <StatCard label="Résultats d'analyses" value={data?.stats?.lab_results} icon="🧪" bgIcon="bg-secondary-container" textIcon="text-secondary" subtext="Derniers bilans" />
          </>
        ) : (
          <>
            <StatCard label="RDV aujourd'hui" value={data?.stats?.today_appointments} icon="📅" bgIcon="bg-primary-50" textIcon="text-primary" subtext="Consultations du jour" />
            <StatCard label="En attente" value={data?.stats?.pending_appointments} icon="⏳" bgIcon="bg-warning-container" textIcon="text-warning" subtext="À confirmer" />
            <StatCard label="Patients suivis" value={data?.stats?.total_patients} icon="👥" bgIcon="bg-success-container" textIcon="text-success" subtext="Patientèle active" />
          </>
        )}
      </div>

      {/* Liste des RDV - Utilise .card pour un alignement parfait des bordures */}
      <div className="card overflow-hidden p-0">
        <div className="table-header flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface">
              {isPatient ? 'Prochains rendez-vous' : 'Agenda du jour'}
            </h3>
            <p className="text-sm text-on-variant mt-0.5">
              {isPatient ? 'Vos consultations à venir' : 'Résumé de votre journée de travail'}
            </p>
          </div>
          <Link 
            to={isPatient ? "/app/appointments" : "/app/agenda"} 
            className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:gap-2 transition-all"
          >
            Voir tout 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="p-6">
          {(isPatient ? data?.upcoming : data?.today)?.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <p className="text-on-surface font-semibold text-lg">
                {isPatient ? 'Aucun rendez-vous à venir.' : 'Aucun rendez-vous prévu aujourd\'hui.'}
              </p>
              <p className="text-on-variant text-sm mt-1 max-w-md mx-auto">
                {isPatient 
                  ? 'Profitez de ce temps libre ou prenez un nouveau rendez-vous.' 
                  : 'C\'est le moment idéal pour rattraper vos comptes-rendus en retard.'}
              </p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-outline-variant/50">
              {(isPatient ? data?.upcoming : data?.today)?.map((a) => (
                // ✅ Utilise .table-row qui gère déjà le padding, la bordure et le hover
                <div key={a.id} className="table-row flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary-50 rounded-xl text-primary border border-outline-variant shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-variant">Heure</span>
                      <span className="text-lg font-bold">{a.appointment_time?.slice(0, 5)}</span>
                    </div>
                    
                    <div>
                      <p className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                        {isPatient ? a.doctor_name : a.patient_name}
                      </p>
                      <p className="text-sm text-on-variant flex items-center gap-2 mt-1 flex-wrap">
                        <span>{a.reason || a.type || 'Consultation'}</span>
                        {a.clinique_ville && (
                          <>
                            <span className="text-outline">•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-container text-secondary">
                              {a.clinique_ville}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <StatusBadge status={a.status} />
                    {a.specialty && !isPatient && (
                      <p className="text-xs text-on-variant hidden sm:block">{a.specialty}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides - Utilise .card-hover pour un effet parfait */}
      {!isPatient && (
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/app/patients" className="card-hover flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl text-white shadow-sm group-hover:shadow-md transition-shadow">
              🔍
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Rechercher un patient</p>
              <p className="text-sm text-on-variant">Accéder aux dossiers médicaux et historiques</p>
            </div>
            <svg className="w-5 h-5 text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link to="/app/disponibilites" className="card-hover flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning text-2xl text-white shadow-sm group-hover:shadow-md transition-shadow">
              ⏰
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-on-surface group-hover:text-warning transition-colors">Gérer mes disponibilités</p>
              <p className="text-sm text-on-variant">Ajouter des créneaux ou signaler des absences</p>
            </div>
            <svg className="w-5 h-5 text-outline group-hover:text-warning group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}