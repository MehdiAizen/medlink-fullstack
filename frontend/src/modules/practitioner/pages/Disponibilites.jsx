import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/axiosConfig';

export default function Disponibilites() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État du formulaire
  const [form, setForm] = useState({
    clinique_id: '1',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '17:00',
    type: 'disponible',
    motif: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.practitioner.disponibilites.list();
      if (response.success) setSlots(response.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setMessage({ type: 'error', text: "Impossible de charger les disponibilités." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation simple côté client
    if (form.date_fin < form.date_debut) {
      setMessage({ type: 'error', text: "La date de fin ne peut pas être avant la date de début." });
      return;
    }

    try {
      const response = await api.practitioner.disponibilites.create(form);
      if (response.success) {
        setMessage({ type: 'success', text: 'Période ajoutée avec succès !' });
        // Réinitialiser les heures par défaut, mais garder la clinique et le type
        setForm(prev => ({ ...prev, heure_debut: '08:00', heure_fin: '17:00', motif: '' }));
        fetchSlots();
      } else {
        setMessage({ type: 'error', text: response.message || "Erreur lors de l'ajout." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Erreur réseau lors de l'ajout." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) return;
    
    try {
      setDeletingId(id);
      const response = await api.practitioner.disponibilites.delete(id); // Assure-toi d'avoir cette méthode dans api.js
      if (response.success) {
        setMessage({ type: 'success', text: 'Créneau supprimé.' });
        fetchSlots();
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Erreur lors de la suppression." });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500 flex items-center justify-center h-64">Chargement des données...</div>;

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de mes disponibilités</h1>
        <p className="text-gray-500">Définissez vos plages horaires de consultation ou signalez vos absences.</p>
      </header>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une période</h2>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* ✅ Grid ajustée pour 6 champs (3 colonnes sur grand écran) */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinique</label>
            <select 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={form.clinique_id}
              onChange={(e) => setForm({ ...form, clinique_id: e.target.value })}
            >
              <option value="1">Clinique El Amen (Sousse)</option>
              <option value="2">Clinique Taoufik (Sfax)</option>
              <option value="3">Clinique Pasteur (Tunis)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="disponible">🟢 Disponible</option>
              <option value="absence">🔴 Absence / Congé</option>
              <option value="bloque">🟠 Créneau bloqué</option>
            </select>
          </div>

          {/* ✅ AJOUT : Champ Date Début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input 
              type="date" 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={form.date_debut}
              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
            />
          </div>

          {/* ✅ AJOUT : Champ Date Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input 
              type="date" 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={form.date_fin}
              onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
            <input 
              type="time" 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={form.heure_debut}
              onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
            <input 
              type="time" 
              required
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={form.heure_fin}
              onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
            />
          </div>

          {form.type === 'absence' && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif de l'absence</label>
              <input 
                type="text" 
                required={form.type === 'absence'}
                placeholder="Ex: Congés annuels, Formation, Conférence..."
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
              />
            </div>
          )}

          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <button 
              type="submit" 
              className="w-full md:w-auto px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              + Ajouter cette période
            </button>
          </div>
        </form>
      </div>

      {/* Liste des périodes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Historique de mes périodes</h2>
          <span className="text-sm text-gray-500">{slots.length} période(s) enregistrée(s)</span>
        </div>
        
        {slots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Clinique</th>
                  <th className="px-6 py-3">Période</th>
                  <th className="px-6 py-3">Horaires</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Motif</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {slot.clinic_name} <span className="text-gray-500 text-xs">({slot.clinic_city})</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {new Date(slot.date_debut).toLocaleDateString('fr-FR')} 
                      {slot.date_fin !== slot.date_debut && ` au ${new Date(slot.date_fin).toLocaleDateString('fr-FR')}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {slot.heure_debut.substring(0, 5)} - {slot.heure_fin.substring(0, 5)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slot.type === 'disponible' ? 'bg-emerald-50 text-emerald-700' :
                        slot.type === 'absence' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {slot.type === 'disponible' ? 'Disponible' : 
                         slot.type === 'absence' ? 'Absence' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate" title={slot.motif}>
                      {slot.motif || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* ✅ AJOUT : Bouton de suppression */}
                      <button 
                        onClick={() => handleDelete(slot.id)}
                        disabled={deletingId === slot.id}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer ce créneau"
                      >
                        {deletingId === slot.id ? (
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">Aucune période définie pour le moment.</p>
            <p className="text-sm mt-1">Utilisez le formulaire ci-dessus pour ajouter vos disponibilités.</p>
          </div>
        )}
      </div>
    </div>
  );
}