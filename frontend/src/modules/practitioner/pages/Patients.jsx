import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/axiosConfig';

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recherche avec debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPatients = async (search) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.practitioner.patients.search(search);
      
      if (response.success) {
        setPatients(response.data);
      } else {
        setError(response.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('Erreur recherche patients:', err);
      setError('Impossible de charger les patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDossier = (patientId, patientName) => {
    navigate(`/app/dossiers/${patientId}`, { state: { patientName } });
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Mes patients</h1>
        <p className="text-gray-500 mt-1">
          Recherche parmi les patients que vous avez reçus en consultation (US-22)
        </p>
      </header>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          💡 Tapez au moins 1 caractère pour lancer la recherche
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Liste des patients */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Résultats ({patients.length} patient{patients.length > 1 ? 's' : ''})
          </h2>
          <span className="text-sm text-gray-500">
            🔒 Accès restreint à votre patientèle
          </span>
        </div>

        {patients.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <div 
                key={patient.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-teal-700">
                      {patient.full_name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patient.full_name}</p>
                    <p className="text-sm text-gray-500">
                      📞 {patient.phone || 'Non renseigné'} • ✉️ {patient.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📅 Dernier RDV : {patient.last_appointment 
                        ? new Date(patient.last_appointment).toLocaleDateString('fr-FR')
                        : 'Aucun'} 
                      • {patient.total_appointments} consultation(s)
                    </p>
                  </div>
                </div>

                {/* Bouton Voir le dossier (US-23) */}
                <button
                  onClick={() => handleViewDossier(patient.id, patient.full_name)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Voir le dossier
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-medium">
              {searchTerm ? 'Aucun patient ne correspond à votre recherche.' : 'Aucun patient trouvé.'}
            </p>
            <p className="text-sm mt-1">
              Les patients apparaissent ici après leur première consultation avec vous.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}