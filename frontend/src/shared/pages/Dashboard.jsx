import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/api/axiosConfig';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  };
  return <span className={`px-3 py-1 text-xs font-medium rounded-full ${map[status] || 'bg-gray-100 text-gray-700'}`}>{labels[status] || status}</span>;
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
          // ✅ Appel vers /dashboard (le backend sait que c'est un praticien grâce au token)
          const response = await api.practitioner.dashboard();
          
          // ✅ Le backend renvoie directement { stats, today, role }
          setData({
            stats: response.stats,
            today: response.today || [],
          });
        } else {
          // Fallback pour patient
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
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">⚠️ {error}</div>;
  }

  const isPatient = user?.role === 'patient';
  
  // ✅ CORRECTION DÉFINITIVE DU NOM :
  // Comme on a enlevé "Dr." de la BDD, on l'ajoute proprement ici seulement pour les praticiens.
  const displayName = isPatient ? user?.full_name : `Dr. ${user?.full_name}`;

  return (
    <div className="space-y-8 fade-in">
      {/* ✅ En-tête avec salutation personnalisée (Plus de "Dr. Dr.") */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {displayName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {isPatient ? (
          <>
            <StatCard label="RDV à venir" value={data?.stats?.upcoming_appointments} icon="📅" color="bg-teal-50 text-teal-600" />
            <StatCard label="Documents médicaux" value={data?.stats?.medical_records} icon="📋" color="bg-blue-50 text-blue-600" />
            <StatCard label="Résultats d'analyses" value={data?.stats?.lab_results} icon="🧪" color="bg-purple-50 text-purple-600" />
          </>
        ) : (
          <>
            <StatCard label="RDV aujourd'hui" value={data?.stats?.today_appointments} icon="📅" color="bg-teal-50 text-teal-600" />
            <StatCard label="En attente" value={data?.stats?.pending_appointments} icon="⏳" color="bg-amber-50 text-amber-600" />
            <StatCard label="Patients suivis" value={data?.stats?.total_patients} icon="👥" color="bg-emerald-50 text-emerald-600" />
          </>
        )}
      </div>

      {/* Liste des RDV */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {isPatient ? 'Prochains rendez-vous' : 'Agenda du jour'}
          </h3>
          <Link to={isPatient ? "/app/appointments" : "/app/agenda"} className="text-sm font-medium text-teal-600 hover:text-teal-700">
            Voir tout →
          </Link>
        </div>

        {(isPatient ? data?.upcoming : data?.today)?.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500">
              {isPatient ? 'Aucun rendez-vous à venir.' : 'Aucun rendez-vous prévu aujourd\'hui.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(isPatient ? data?.upcoming : data?.today)?.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-lg">
                    {isPatient ? '👨‍⚕️' : '👤'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isPatient ? a.doctor_name : a.patient_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isPatient && a.specialty && `${a.specialty} · `}
                      {a.reason || a.type || 'Consultation'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {new Date(a.appointment_date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.appointment_time?.slice(0, 5)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides Praticien (US-18, US-22) */}
      {!isPatient && (
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/app/patients" className="flex items-center gap-5 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-2xl text-white">🔍</div>
            <div>
              <p className="text-lg font-bold text-gray-900">Rechercher un patient</p>
              <p className="text-sm text-gray-500">Accéder aux dossiers médicaux</p>
            </div>
          </Link>
          <Link to="/app/disponibilites" className="flex items-center gap-5 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-600 text-2xl text-white">⏰</div>
            <div>
              <p className="text-lg font-bold text-gray-900">Gérer mes disponibilités</p>
              <p className="text-sm text-gray-500">Ajouter des créneaux ou absences</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}