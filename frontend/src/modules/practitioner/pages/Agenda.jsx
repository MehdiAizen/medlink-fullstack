import { useState, useEffect } from 'react';
import { api } from '../../../shared/api/axiosConfig';

export default function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed

  useEffect(() => {
    fetchAgenda();
  }, []);

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const response = await api.practitioner.appointments.list();
      // ✅ Sécurité : on extrait bien le tableau
      const data = Array.isArray(response) ? response : (response.data || []);
      setAppointments(data);
    } catch (err) {
      console.error("Erreur chargement agenda:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ US-20 : Changer le statut d'un RDV
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.practitioner.appointments.updateStatus(id, newStatus);
      setAppointments(prev => 
        prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt)
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  // Filtrage
  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  // Grouper par date pour l'affichage "Agenda"
  const groupedByDate = filteredAppointments.reduce((acc, appt) => {
    const date = new Date(appt.appointment_date).toLocaleDateString('fr-FR', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Agenda Multi-Sites (US-19)</h1>
          <p className="text-on-variant">Vue unifiée de vos consultations à Sousse, Sfax et Tunis.</p>
        </div>
        
        {/* Filtres de statut (US-20) */}
        <div className="flex gap-2 bg-surface p-1 rounded-lg border border-outline-variant shadow-sm">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'pending', label: 'En attente' },
            { key: 'confirmed', label: 'Confirmés' },
            { key: 'completed', label: 'Terminés' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f.key ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Liste groupée par jour */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-outline-variant shadow-sm">
          <p className="text-on-variant text-lg">📅 Aucun rendez-vous trouvé pour ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, dayAppts]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-on-surface mb-4 capitalize flex items-center gap-2 border-b border-outline-variant pb-2">
                📅 {date}
                <span className="text-sm font-normal text-on-variant bg-gray-100 px-2 py-0.5 rounded-full">{dayAppts.length} RDV</span>
              </h2>
              
              <div className="space-y-3">
                {dayAppts.map((appt) => (
                  <div key={appt.id} className="bg-surface rounded-xl border border-outline-variant p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    
                    {/* Heure et Patient */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary-50 rounded-lg text-teal-700 shrink-0">
                        <span className="text-xs font-medium uppercase">Heure</span>
                        <span className="text-lg font-bold">{appt.appointment_time?.slice(0, 5)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-lg">{appt.patient_name}</p>
                        <p className="text-sm text-on-variant flex items-center gap-2 mt-1">
                          <span>{appt.reason || appt.type || 'Consultation'}</span>
                          <span className="text-gray-300">•</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                            🏥 {appt.clinique_nom} ({appt.clinique_ville})
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Statut et Actions (US-20) */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                        appt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        appt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmé' : 
                         appt.status === 'pending' ? 'En attente' : 
                         appt.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>

                      {appt.status === 'pending' && (
                        <button onClick={() => handleStatusChange(appt.id, 'confirmed')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">✓ Confirmer</button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button onClick={() => handleStatusChange(appt.id, 'completed')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">✓ Terminer</button>
                      )}
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <button onClick={() => handleStatusChange(appt.id, 'cancelled')} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200">✕ Annuler</button>
                      )}
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