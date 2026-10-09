import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm text-on-variant">{label}</p>
      </div>
    </div>
  );
}

function statusBadge(status) {
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
  return <span className={map[status] || 'badge-info'}>{labels[status] || status}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg bg-error-container p-4 text-error">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isPatient = user?.role === 'patient';

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isPatient ? (
          <>
            <StatCard
              label="RDV à venir"
              value={data.stats.upcoming_appointments}
              icon="📅"
              color="bg-surface-highest"
            />
            <StatCard
              label="Documents médicaux"
              value={data.stats.medical_records}
              icon="📋"
              color="bg-surface-container"
            />
            <StatCard
              label="Résultats d’analyses"
              value={data.stats.lab_results}
              icon="🧪"
              color="bg-surface-high"
            />
          </>
        ) : (
          <>
            <StatCard
              label="RDV aujourd’hui"
              value={data.stats.today_appointments}
              icon="📅"
              color="bg-surface-highest"
            />
            <StatCard
              label="En attente"
              value={data.stats.pending_appointments}
              icon="⏳"
              color="bg-warning-container"
            />
            <StatCard
              label="Patients suivis"
              value={data.stats.total_patients}
              icon="👥"
              color="bg-surface-container"
            />
          </>
        )}
      </div>

      {/* Upcoming / Today list */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-primary">
            {isPatient ? 'Prochains rendez-vous' : 'Agenda du jour'}
          </h3>
          <Link to="/appointments" className="btn-ghost text-sm">
            Voir tout →
          </Link>
        </div>

        {(isPatient ? data.upcoming : data.today)?.length === 0 ? (
          <p className="py-8 text-center text-sm text-on-variant">
            {isPatient
              ? 'Aucun rendez-vous à venir.'
              : 'Aucun rendez-vous prévu aujourd’hui.'}
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {(isPatient ? data.upcoming : data.today).map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-primary">
                    {isPatient ? a.doctor_name : a.patient_name}
                  </p>
                  <p className="text-sm text-on-variant">
                    {isPatient && a.specialty && `${a.specialty} · `}
                    {a.reason || a.type}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {new Date(a.appointment_date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-on-variant">
                      {a.appointment_time?.slice(0, 5)}
                    </p>
                  </div>
                  {statusBadge(a.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {isPatient && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/book"
            className="card flex items-center gap-4 transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl text-white">
              ➕
            </div>
            <div>
              <p className="font-semibold text-primary">Prendre un rendez-vous</p>
              <p className="text-sm text-on-variant">
                Consultez les disponibilités
              </p>
            </div>
          </Link>
          <Link
            to="/results"
            className="card flex items-center gap-4 transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl text-white">
              🧪
            </div>
            <div>
              <p className="font-semibold text-primary">Mes résultats</p>
              <p className="text-sm text-on-variant">Analyses et bilans</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
