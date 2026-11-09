import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/api/axiosConfig';

// ✅ Composant StatCard amélioré avec un design plus moderne
function StatCard({ label, value, icon, color, subtext }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-4xl font-bold ${color} group-hover:scale-105 transition-transform origin-left`}>
            {value || 0}
          </p>
          {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${color.replace('text-', 'bg-').replace('600', '50').replace('500', '50')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ✅ Composant StatusBadge avec des bordures subtiles
function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${map[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
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
          setData({
            stats: response.stats,
            today: response.today || [],
          });
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

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mb-4" />
        <p className="text-gray-500 font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-bold">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const isPatient = user?.role === 'patient';
  const displayName = isPatient ? user?.full_name : `Dr. ${user?.full_name}`;

  return (
    <div className="space-y-8 fade-in p-2">
      {/* ✅ En-tête avec salutation et date */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bonjour, {displayName} 👋
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* ✅ Statistiques avec design amélioré */}
      <div className="grid gap-6 md:grid-cols-3">
        {isPatient ? (
          <>
            <StatCard label="RDV à venir" value={data?.stats?.upcoming_appointments} icon="📅" color="text-teal-600" subtext="Prochainement" />
            <StatCard label="Documents médicaux" value={data?.stats?.medical_records} icon="📋" color="text-blue-600" subtext="Dossiers complets" />
            <StatCard label="Résultats d'analyses" value={data?.stats?.lab_results} icon="🧪" color="text-purple-600" subtext="Derniers bilans" />
          </>
        ) : (
          <>
            <StatCard label="RDV aujourd'hui" value={data?.stats?.today_appointments} icon="📅" color="text-teal-600" subtext="Consultations du jour" />
            <StatCard label="En attente" value={data?.stats?.pending_appointments} icon="⏳" color="text-amber-600" subtext="À confirmer" />
            <StatCard label="Patients suivis" value={data?.stats?.total_patients} icon="👥" color="text-emerald-600" subtext="Patientèle active" />
          </>
        )}
      </div>

      {/* ✅ Liste des RDV avec design "Carte" amélioré */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isPatient ? 'Prochains rendez-vous' : 'Agenda du jour'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {isPatient ? 'Vos consultations à venir' : 'Résumé de votre journée de travail'}
            </p>
          </div>
          <Link 
            to={isPatient ? "/app/appointments" : "/app/agenda"} 
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:gap-2 transition-all"
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
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <p className="text-gray-900 font-semibold text-lg">
                {isPatient ? 'Aucun rendez-vous à venir.' : 'Aucun rendez-vous prévu aujourd\'hui.'}
              </p>
              <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                {isPatient 
                  ? 'Profitez de ce temps libre ou prenez un nouveau rendez-vous.' 
                  : 'C\'est le moment idéal pour rattraper vos comptes-rendus en retard.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(isPatient ? data?.upcoming : data?.today)?.map((a) => (
                <div 
                  key={a.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Bloc Heure stylisé */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl text-teal-700 border border-teal-100 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Heure</span>
                      <span className="text-lg font-bold">{a.appointment_time?.slice(0, 5)}</span>
                    </div>
                    
                    <div>
                      <p className="font-bold text-gray-900 text-base group-hover:text-teal-700 transition-colors">
                        {isPatient ? a.doctor_name : a.patient_name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1 flex-wrap">
                        <span>{a.reason || a.type || 'Consultation'}</span>
                        {a.clinique_ville && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
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
                      <p className="text-xs text-gray-400 hidden sm:block">{a.specialty}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Actions rapides Praticien avec design moderne */}
      {!isPatient && (
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/app/patients" className="group flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-2xl text-white shadow-md group-hover:scale-110 transition-transform">
              🔍
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors">Rechercher un patient</p>
              <p className="text-sm text-gray-500">Accéder aux dossiers médicaux et historiques</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link to="/app/disponibilites" className="group flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-2xl text-white shadow-md group-hover:scale-110 transition-transform">
              ⏰
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Gérer mes disponibilités</p>
              <p className="text-sm text-gray-500">Ajouter des créneaux ou signaler des absences</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}