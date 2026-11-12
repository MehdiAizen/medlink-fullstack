import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/axiosConfig';

export default function DossiersMedicaux() {
  const { id } = useParams(); // L'ID du patient vient de l'URL (/app/dossiers/:id)
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ États pour le formulaire de compte-rendu (US-24)
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patient_id: parseInt(id, 10),
    title: '',
    diagnosis: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  
  // ✅ États pour le formulaire de résultat d'examen (US-25)
  const [showResultForm, setShowResultForm] = useState(false);
  const [resultForm, setResultForm] = useState({
    patient_id: parseInt(id, 10),
    test_name: '',
    result_value: '',
    unit: '',
    reference_range: '',
    status: 'normal',
    result_date: new Date().toISOString().split('T')[0]
  });
  const [savingResult, setSavingResult] = useState(false);
  
  // Message global (succès ou erreur)
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const fetchDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      // 🚨 CET APPEL DÉCLENCHE AUTOMATIQUEMENT LA JOURNALISATION US-47 DANS LE BACKEND !
      const response = await api.practitioner.patients.records(id);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Accès refusé');
      }
    } catch (err) {
      console.error("Erreur chargement dossier:", err);
      setError("🚫 Accès non autorisé à ce dossier (Violation RBAC détectée).");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour enregistrer un compte-rendu (US-24 + US-47)
  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.practitioner.patients.addRecord(id, form);
      
      if (response.success) {
        setMessage({ type: 'success', text: '✅ Compte-rendu enregistré et journalisé !' });
        setShowForm(false);
        setForm({
          patient_id: parseInt(id, 10),
          title: '',
          diagnosis: '',
          notes: '',
          record_date: new Date().toISOString().split('T')[0]
        });
        fetchDossier(); // Recharger pour voir le nouveau compte-rendu
      } else {
        setMessage({ type: 'error', text: response.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Fonction pour publier un résultat (US-25 + US-47)
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setSavingResult(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.practitioner.patients.addResult(id, resultForm);
      
      if (response.success) {
        setMessage({ type: 'success', text: '✅ Résultat publié et journalisé !' });
        setShowResultForm(false);
        setResultForm({
          patient_id: parseInt(id, 10),
          test_name: '',
          result_value: '',
          unit: '',
          reference_range: '',
          status: 'normal',
          result_date: new Date().toISOString().split('T')[0]
        });
        fetchDossier(); // Recharger pour voir le nouveau résultat
      } else {
        setMessage({ type: 'error', text: response.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la publication.' });
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
        <span className="text-2xl">🚫</span>
        <div>
          <p className="font-bold">Accès refusé</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => navigate('/app/patients')} className="mt-2 text-sm underline hover:text-red-900">
            ← Retour à la liste des patients
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6">Aucune donnée disponible.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête du dossier */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-outline-variant shadow-sm">
        <div>
          <button onClick={() => navigate('/app/patients')} className="text-sm text-on-variant hover:text-primary mb-2 flex items-center gap-1">
            ← Retour à la liste
          </button>
          <h1 className="text-2xl font-bold text-on-surface">Dossier médical de : {data.patient?.full_name}</h1>
          <p className="text-on-variant mt-1">📞 {data.patient?.phone || 'Non renseigné'} • ✉️ {data.patient?.email}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Accès sécurisé et journalisé (US-47)
        </div>
      </div>

      {/* Message de confirmation/erreur */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Comptes-rendus (US-24, US-26) */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">📝 Comptes-rendus</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="text-sm px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {showForm ? '✕ Annuler' : '+ Nouveau compte-rendu'}
            </button>
          </div>

          {/* ✅ Formulaire de rédaction (US-24) */}
          {showForm && (
            <form onSubmit={handleSubmitRecord} className="mb-6 p-4 bg-primary-50 rounded-lg border border-teal-200 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Consultation de suivi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="Ex: HTA contrôlée"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Observations *</label>
                <textarea
                  required
                  rows="4"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Détails de la consultation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.record_date}
                  onChange={(e) => setForm({ ...form, record_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : '💾 Enregistrer le compte-rendu'}
              </button>
            </form>
          )}
          
          {/* Liste des comptes-rendus */}
          {data.records && data.records.length > 0 ? (
            <div className="space-y-4">
              {data.records.map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-on-surface">{record.title}</h3>
                    <span className="text-xs text-on-variant bg-surface px-2 py-1 rounded border">{new Date(record.record_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2"><strong className="text-on-surface">Diagnostic :</strong> {record.diagnosis || 'Non spécifié'}</p>
                  <p className="text-sm text-gray-600 italic bg-surface p-3 rounded border border-gray-100">{record.notes}</p>
                  <p className="text-xs text-gray-400 mt-2 text-right">Par Dr. {record.practitioner_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-on-variant bg-gray-50 rounded-lg border border-dashed border-gray-300">Aucun compte-rendu. Cliquez sur "+ Nouveau compte-rendu" pour en créer un.</p>
          )}
        </div>

        {/* Colonne 2 : Résultats d'examens (US-25) */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">🧪 Résultats d'examens</h2>
            <button 
              onClick={() => setShowResultForm(!showResultForm)}
              className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {showResultForm ? '✕ Annuler' : '+ Publier un résultat'}
            </button>
          </div>

          {/* ✅ Formulaire de publication (US-25) */}
          {showResultForm && (
            <form onSubmit={handleSubmitResult} className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'examen *</label>
                <input
                  type="text"
                  required
                  value={resultForm.test_name}
                  onChange={(e) => setResultForm({ ...resultForm, test_name: e.target.value })}
                  placeholder="Ex: Hémoglobine, Cholestérol..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
                  <input
                    type="text"
                    required
                    value={resultForm.result_value}
                    onChange={(e) => setResultForm({ ...resultForm, result_value: e.target.value })}
                    placeholder="Ex: 13.2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <input
                    type="text"
                    value={resultForm.unit}
                    onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })}
                    placeholder="g/dL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={resultForm.status}
                    onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="abnormal">Anormal</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeurs de référence</label>
                <input
                  type="text"
                  value={resultForm.reference_range}
                  onChange={(e) => setResultForm({ ...resultForm, reference_range: e.target.value })}
                  placeholder="Ex: 12.0 - 16.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={savingResult}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {savingResult ? 'Publication...' : '📤 Publier le résultat'}
              </button>
            </form>
          )}
          
          {/* Liste des résultats existants */}
          {data.labResults && data.labResults.length > 0 ? (
            <div className="space-y-3">
              {data.labResults.map((lab) => (
                <div key={lab.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-on-surface">{lab.test_name}</p>
                    <p className="text-sm text-gray-600 mt-1">Résultat : <strong>{lab.result_value} {lab.unit}</strong> <span className="text-gray-400 mx-1">|</span> Réf : {lab.reference_range}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    lab.status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 
                    lab.status === 'abnormal' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {lab.status === 'normal' ? 'Normal' : lab.status === 'abnormal' ? 'Anormal' : 'Critique'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-on-variant bg-gray-50 rounded-lg border border-dashed border-gray-300">Aucun résultat. Cliquez sur "+ Publier un résultat".</p>
          )}
        </div>
      </div>
    </div>
  );
}