import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/axiosConfig';

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

export default function Appointments() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');

    api.patient.appointments
      .list()
      .then(setList)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.practitioner.appointments.updateStatus(id, status);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    
    try {
      await api.patient.appointments.cancel(id);
      load(); // Recharge la liste pour voir le statut mis à jour
    } catch (err) {
      alert(err.message);
    }
  };

  const isDoctor = user?.role === 'practitioner';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-error-container p-4 text-error">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-primary">
          {isDoctor ? 'Agenda médical' : 'Mes rendez-vous'}
        </h2>
        <p className="mt-1 text-sm text-on-variant">
          {isDoctor
            ? 'Gérez les consultations de vos patients'
            : 'Consultez et suivez vos rendez-vous'}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-on-variant">Aucun rendez-vous trouvé.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-outline-variant/40 bg-surface-low">
              <tr>
                <th className="px-5 py-3 font-semibold text-on-variant">
                  {isDoctor ? 'Patient' : 'Médecin'}
                </th>
                <th className="px-5 py-3 font-semibold text-on-variant">Date</th>
                <th className="px-5 py-3 font-semibold text-on-variant">Heure</th>
                <th className="px-5 py-3 font-semibold text-on-variant">Motif</th>
                <th className="px-5 py-3 font-semibold text-on-variant">Statut</th>
                <th className="px-5 py-3 font-semibold text-on-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-surface-low/50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-primary">
                      {isDoctor ? a.patient_name : a.practitioner_name}
                    </p>
                    {!isDoctor && a.specialty && (
                      <p className="text-xs text-on-variant">{a.specialty}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {new Date(a.appointment_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-3.5">{a.appointment_time?.slice(0, 5)}</td>
                  <td className="px-5 py-3.5 text-on-variant">{a.reason || a.type}</td>
                  <td className="px-5 py-3.5">{statusBadge(a.status)}</td>
                  
                  {/* Actions pour le Médecin */}
                  {isDoctor && (
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(a.id, 'confirmed')}
                              className="rounded-md bg-success-container px-2.5 py-1 text-xs font-semibold text-success hover:opacity-80"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => updateStatus(a.id, 'cancelled')}
                              className="rounded-md bg-error-container px-2.5 py-1 text-xs font-semibold text-error hover:opacity-80"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                        {a.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(a.id, 'completed')}
                            className="rounded-md bg-surface-highest px-2.5 py-1 text-xs font-semibold text-secondary hover:opacity-80"
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Actions pour le Patient */}
                  {!isDoctor && (
                    <td className="px-5 py-3.5">
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <button
                          onClick={() => cancelAppointment(a.id)}
                          className="rounded-md bg-error-container px-2.5 py-1 text-xs font-semibold text-error hover:opacity-80"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}