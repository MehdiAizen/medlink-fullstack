import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adapte le chemin si besoin
import api from '../shared/api/axiosConfig'; // ✅ Utilise ton axiosConfig (adapte le chemin vers ton fichier)

export default function Dashboard() {
    const { user } = useAuth();
    // ✅ AJOUTE CETTE LIGNE POUR LE DÉBOGAGE
    console.log("🔍 DEBUG DASHBOARD - Utilisateur actuel :", user);
    const [stats, setStats] = useState({ appointmentsToday: 0, nextAppointments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Sécurité : on ne charge ces données que si l'utilisateur est bien un praticien
            if (user?.role !== 'practitioner') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // ✅ Appel via axios (axiosConfig gère déjà l'URL de base et le token JWT)
                const response = await api.practitioner.dashboard();
                console.log("✅ Réponse API reçue :", response);
                
                // Si ta route backend renvoie { success: true, data: {...} }
                if (response.success) {
                    setStats(response.data);
                    setError(null);
                } else {
                    // Si ta route renvoie directement les données
                    setStats(response); 
                    setError(null);
                }
            } catch (err) {
                console.error("❌ Erreur chargement dashboard:", err);
                setError(`Impossible de charger les données : ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]); // Se ré-exécute si l'objet user change

    if (loading) return <div className="p-6 text-on-variant">Chargement du tableau de bord...</div>;
    if (error) return <div className="p-6 text-error bg-error-container rounded-lg">{error}</div>;

    // Extraction dynamique du nom de famille pour l'affichage "Dr. Mansouri"
    const lastName = user?.full_name ? user.full_name.split(' ').pop() : 'Praticien';

    return (
        <div className="p-6 space-y-6">
            {/* ✅ En-tête dynamique (US-19) */}
            <header>
                <h1 className="text-2xl font-bold text-on-surface">
                    Bonjour, {user?.full_name?.startsWith('Dr.') ? user.full_name : `Dr. ${lastName}`} 👋
                </h1>
                <p className="text-on-variant">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant">
                    <h3 className="text-sm font-semibold text-on-variant">Rendez-vous aujourd'hui</h3>
                    <p className="text-3xl font-bold text-primary mt-2">{stats.appointmentsToday}</p>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant">
                    <h3 className="text-sm font-semibold text-on-variant">Cliniques actives</h3>
                    <p className="text-3xl font-bold text-primary mt-2">3</p> {/* Sousse, Sfax, Tunis */}
                </div>
            </div>

            {/* Prochains rendez-vous (US-19 : Agenda multi-sites) */}
            <div className="bg-surface rounded-xl shadow-sm border border-outline-variant p-6">
                <h2 className="text-lg font-bold text-on-surface mb-4">Prochains rendez-vous</h2>
                {stats.nextAppointments && stats.nextAppointments.length > 0 ? (
                    <ul className="space-y-3">
                        {stats.nextAppointments.map((rdv, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-surface-low rounded-lg">
                                <div>
                                    <p className="font-semibold text-on-surface">{rdv.patient_name}</p>
                                    <p className="text-sm text-on-variant">{rdv.appointment_date} à {rdv.appointment_time}</p>
                                </div>
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-container text-primary">
                                    {rdv.clinic_city}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-on-variant">Aucun rendez-vous à venir pour le moment.</p>
                )}
            </div>
        </div>
    );
}