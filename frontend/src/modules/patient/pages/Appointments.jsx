
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/axiosConfig';

// Badge de statut
function statusBadge(status) {
  const map = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full border ${
        map[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// Formater une date sans décalage de fuseau horaire
function formatDate(date) {
  if (!date) return '';

  return new Date(`${String(date).slice(0, 10)}T00:00:00`)
    .toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
}

// Date locale au format YYYY-MM-DD
function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function Appointments() {
  const { user } = useAuth();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [clinicFilter, setClinicFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Report de rendez-vous
  const [rescheduleData, setRescheduleData] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const isPractitioner = user?.role === 'practitioner';
  const isPatient = user?.role === 'patient';

  // Chargement des rendez-vous selon le rôle
  const load = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      const response = isPractitioner
        ? await api.practitioner.appointments.list()
        : await api.patient.appointments.list();

      // Supporte une réponse Axios ou une réponse déjà extraite
      const appointmentsArray = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.appointments)
            ? response.appointments
            : Array.isArray(response?.data?.appointments)
              ? response.data.appointments
              : [];

      setList(appointmentsArray);
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
      setError(
        err.message || 'Erreur de chargement des rendez-vous.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, isPractitioner]);

  useEffect(() => {
    load();
  }, [load]);

  // Modifier le statut (practitioner)
  const updateStatus = async (id, status) => {
    try {
      await api.practitioner.appointments.updateStatus(id, status);
      await load();
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du statut.');
    }
  };

  // Annuler un rendez-vous (patient)
  const cancelAppointment = async (id) => {
    if (!window.confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      return;
    }

    try {
      await api.patient.appointments.cancel(id);
      await load();
    } catch (err) {
      alert(err.message || "Erreur lors de l'annulation.");
    }
  };

  // Reporter un rendez-vous (patient)
  const handleReschedule = async (e) => {
    e.preventDefault();

    if (!rescheduleData || !newDate || !newTime) return;

    try {
      await api.patient.appointments.reschedule(rescheduleData, {
        appointment_date: newDate,
        appointment_time: newTime,
      });

      setRescheduleData(null);
      setNewDate('');
      setNewTime('');

      await load();
    } catch (err) {
      alert(err.message || 'Erreur lors du report du rendez-vous.');
    }
  };

  // Filtrage des rendez-vous
  const filteredAppointments = list.filter((appt) => {
    // Filtre clinique
    if (
      clinicFilter !== 'all' &&
      appt.clinique_ville !== clinicFilter
    ) {
      return false;
    }

    // Filtre statut
    if (
      statusFilter !== 'all' &&
      appt.status !== statusFilter
    ) {
      return false;
    }

    // Filtre date
    if (dateFilter !== 'all') {
      const apptDate = String(appt.appointment_date).slice(0, 10);
      const today = getLocalDate();

      if (dateFilter === 'today' && apptDate !== today) {
        return false;
      }

      if (dateFilter === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        const endDate = [
          weekFromNow.getFullYear(),
          String(weekFromNow.getMonth() + 1).padStart(2, '0'),
          String(weekFromNow.getDate()).padStart(2, '0'),
        ].join('-');

        if (apptDate < today || apptDate > endDate) {
          return false;
        }
      }

      if (dateFilter === 'month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);

        const endDate = [
          monthFromNow.getFullYear(),
          String(monthFromNow.getMonth() + 1).padStart(2, '0'),
          String(monthFromNow.getDate()).padStart(2, '0'),
        ].join('-');

        if (apptDate < today || apptDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Statistiques calculées après filtrage
  const stats = {
    total: filteredAppointments.length,
    pending: filteredAppointments.filter(
      (a) => a.status === 'pending'
    ).length,
    confirmed: filteredAppointments.filter(
      (a) => a.status === 'confirmed'
    ).length,
    completed: filteredAppointments.filter(
      (a) => a.status === 'completed'
    ).length,
    cancelled: filteredAppointments.filter(
      (a) => a.status === 'cancelled'
    ).length,
  };

  // Liste unique des cliniques
  const clinics = [
    ...new Set(
      list.map((a) => a.clinique_ville).filter(Boolean)
    ),
  ];

  // Grouper les rendez-vous par date
  const groupedByDate = filteredAppointments.reduce((acc, appt) => {
    const date = String(appt.appointment_date).slice(0, 10);

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(appt);
    return acc;
  }, {});

  // Chargement
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200 m-6">
        ⚠️ {error}
        <button
          onClick={load}
          className="ml-3 underline font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {isPractitioner
            ? 'Agenda médical multi-sites'
            : 'Mes rendez-vous'}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {isPractitioner
            ? 'Gérez les consultations de vos patients.'
            : 'Consultez et suivez vos rendez-vous.'}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              📅
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>

        {/* En attente */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              ⏳
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>

        {/* Confirmés */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              ✓
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.confirmed}
              </p>
              <p className="text-xs text-gray-500">Confirmés</p>
            </div>
          </div>
        </div>

        {/* Terminés */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              📋
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
              <p className="text-xs text-gray-500">Terminés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Filtre clinique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinique
            </label>

            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Toutes les cliniques</option>

              {clinics.map((clinic) => (
                <option key={clinic} value={clinic}>
                  {clinic}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine (7 jours)</option>
              <option value="month">Ce mois-ci (30 jours environ)</option>
            </select>
          </div>

          {/* Filtre statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        {/* Résumé des filtres */}
        {(clinicFilter !== 'all' ||
          dateFilter !== 'all' ||
          statusFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} rendez-vous trouvé
              {filteredAppointments.length > 1 ? 's' : ''}
            </span>

            <button
              onClick={() => {
                setClinicFilter('all');
                setDateFilter('all');
                setStatusFilter('all');
              }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des rendez-vous */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-5xl mb-4">📅</p>

          <p className="text-gray-900 font-medium text-lg">
            Aucun rendez-vous trouvé
          </p>

          <p className="text-gray-500 text-sm mt-1">
            {list.length === 0
              ? "Vous n'avez aucun rendez-vous pour le moment."
              : 'Aucun rendez-vous ne correspond à vos filtres.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {Object.entries(groupedByDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, dayAppts]) => (
              <div key={date}>

                {/* Date du groupe */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
                  📅
                  {formatDate(date)}

                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {dayAppts.length} RDV
                  </span>
                </h3>

                <div className="space-y-3">

                  {dayAppts.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        {/* Informations principales */}
                        <div className="flex items-start gap-4 flex-1">

                          <div className="flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl text-teal-700 shrink-0 border border-teal-100">
                            <span className="text-xs font-medium uppercase text-gray-500">
                              Heure
                            </span>

                            <span className="text-lg font-bold">
                              {appt.appointment_time?.slice(0, 5) || '--:--'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">

                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-lg">
                                {isPractitioner
                                  ? appt.patient_name
                                  : (appt.doctor_name || appt.practitioner_name || 'Praticien')}
                              </p>

                              {appt.clinique_ville && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                                  📍 {appt.clinique_ville}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              {appt.reason || appt.type || 'Consultation'}

                              {appt.clinique_nom &&
                                ` • ${appt.clinique_nom}`}
                            </p>

                            {!isPractitioner && appt.specialty && (
                              <p className="text-xs text-gray-500 mt-1">
                                Spécialité : {appt.specialty}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Statut et actions */}
                        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">

                          {statusBadge(appt.status)}

                          {/* Actions practitioner */}
                          {isPractitioner && appt.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(appt.id, 'confirmed')
                                }
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                ✓ Confirmer
                              </button>

                              <button
                                onClick={() =>
                                  updateStatus(appt.id, 'cancelled')
                                }
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                              >
                                ✕ Annuler
                              </button>
                            </>
                          )}

                          {isPractitioner && appt.status === 'confirmed' && (
                            <button
                              onClick={() =>
                                updateStatus(appt.id, 'completed')
                              }
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              ✓ Terminer
                            </button>
                          )}

                          {/* Actions patient */}
                          {isPatient &&
                            ['pending', 'confirmed'].includes(appt.status) && (
                              <>
                                <button
                                  onClick={() => {
                                    setRescheduleData(appt.id);
                                    setNewDate('');
                                    setNewTime('');
                                  }}
                                  className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                >
                                  Reporter
                                </button>

                                <button
                                  onClick={() =>
                                    cancelAppointment(appt.id)
                                  }
                                  className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                                >
                                  Annuler
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modale de report du rendez-vous */}
      {isPatient && rescheduleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h3 className="mb-4 text-lg font-bold text-teal-700">
              Reporter le rendez-vous
            </h3>

            <form onSubmit={handleReschedule} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouvelle date
                </label>

                <input
                  type="date"
                  required
                  min={getLocalDate()}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouvelle heure
                </label>

                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setRescheduleData(null);
                    setNewDate('');
                    setNewTime('');
                  }}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Fermer
                </button>

                <button
                  type="submit"
                  disabled={!newDate || !newTime}
                  className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  Confirmer le report
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
