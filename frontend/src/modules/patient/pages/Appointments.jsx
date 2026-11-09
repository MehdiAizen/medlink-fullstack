import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/axiosConfig';

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
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
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

  const isPractitioner = user?.role === 'practitioner';

  const load = () => {
    setLoading(true);
    setError('');

    const fetchList = isPractitioner
      ? api.practitioner.appointments.list()
      : api.patient.appointments.list();

    fetchList
      .then((response) => {
        const appointmentsArray = Array.isArray(response) ? response : (response.data || []);
        setList(appointmentsArray);
      })
      .catch((err) => setError(err.message || 'Erreur de chargement des rendez-vous'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user?.role]);

  const updateStatus = async (id, status) => {
    try {
      await api.practitioner.appointments.updateStatus(id, status);
      load();
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  // Filtrage des rendez-vous
  const filteredAppointments = list.filter(appt => {
    // Filtre par clinique
    if (clinicFilter !== 'all' && appt.clinique_ville !== clinicFilter) return false;
    
    // Filtre par statut
    if (statusFilter !== 'all' && appt.status !== statusFilter) return false;
    
    // Filtre par date
    if (dateFilter !== 'all') {
      const apptDate = new Date(appt.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        const apptDay = new Date(apptDate);
        apptDay.setHours(0, 0, 0, 0);
        if (apptDay.getTime() !== today.getTime()) return false;
      } else if (dateFilter === 'week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        if (apptDate < today || apptDate > weekFromNow) return false;
      } else if (dateFilter === 'month') {
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        if (apptDate < today || apptDate > monthFromNow) return false;
      }
    }
    
    return true;
  });

  // Statistiques
  const stats = {
    total: filteredAppointments.length,
    pending: filteredAppointments.filter(a => a.status === 'pending').length,
    confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length,
    cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length,
  };

  // Liste unique des cliniques
  const clinics = [...new Set(list.map(a => a.clinique_ville).filter(Boolean))];

  // Grouper par date
  const groupedByDate = filteredAppointments.reduce((acc, appt) => {
    const date = new Date(appt.appointment_date).toLocaleDateString('fr-FR', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200 m-6">⚠️ {error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {isPractitioner ? 'Agenda médical multi-sites' : 'Mes rendez-vous'}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {isPractitioner
            ? 'Gérez les consultations de vos patients across Sousse, Sfax et Tunis'
            : 'Consultez et suivez vos rendez-vous'}
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-xs text-gray-500">Confirmés</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Terminés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre par clinique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinique</label>
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Toutes les cliniques</option>
              {clinics.map(clinic => (
                <option key={clinic} value={clinic}>{clinic}</option>
              ))}
            </select>
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois-ci</option>
            </select>
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        {/* Récapitulatif des filtres */}
        {(clinicFilter !== 'all' || dateFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} rendez-vous trouvé{filteredAppointments.length > 1 ? 's' : ''}
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

      {/* Liste des rendez-vous groupés par date */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-900 font-medium text-lg">Aucun rendez-vous trouvé</p>
          <p className="text-gray-500 text-sm mt-1">
            {list.length === 0 
              ? "Vous n'avez aucun rendez-vous pour le moment." 
              : "Aucun rendez-vous ne correspond à vos critères de recherche."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dayAppts]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
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
                          <span className="text-xs font-medium uppercase text-gray-500">Heure</span>
                          <span className="text-lg font-bold">{appt.appointment_time?.slice(0, 5)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-lg">
                              {isPractitioner ? appt.patient_name : (appt.doctor_name || appt.practitioner_name)}
                            </p>
                            {appt.clinique_ville && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {appt.clinique_ville}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {appt.reason || appt.type || 'Consultation'}
                            {appt.clinique_nom && ` • ${appt.clinique_nom}`}
                          </p>
                        </div>
                      </div>

                      {/* Statut et Actions */}
                      <div className="flex items-center gap-3 lg:shrink-0">
                        {statusBadge(appt.status)}
                        
                        {isPractitioner && appt.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(appt.id, 'confirmed')}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              ✓ Confirmer
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                            >
                              ✕ Annuler
                            </button>
                          </div>
                        )}
                        
                        {isPractitioner && appt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            ✓ Terminer
                          </button>
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
    </div>
  );
}