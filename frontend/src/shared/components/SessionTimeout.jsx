import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SessionTimeout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const timerRef = useRef(null);

    // Fonction qui réinitialise le minuteur à chaque action de l'utilisateur
    const resetTimer = () => {
        // 1. Annuler l'ancien minuteur s'il existe
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // 2. Démarrer un nouveau minuteur de 15 minutes (15 * 60 * 1000 ms = 900 000 ms)
        timerRef.current = setTimeout(() => {
            // Action à la fin des 15 minutes d'inactivité
            logout();
            navigate('/login', { replace: true }); // Redirige vers la page de connexion

            // Alerte utilisateur (optionnel mais recommandé pour l'UX)
            alert('⚠️ Votre session a expiré après 15 minutes d\'inactivité (US-40).\nVeuillez vous reconnecter pour des raisons de sécurité.');
        }, 15 * 60 * 1000);
    };

    useEffect(() => {
        // Liste des événements qui prouvent que l'utilisateur est actif
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Ajouter les écouteurs d'événements sur toute la fenêtre
        events.forEach((event) => window.addEventListener(event, resetTimer));

        // Démarrer le minuteur dès que le composant est monté
        resetTimer();

        // Fonction de nettoyage quand l'utilisateur se déconnecte ou quitte la page
        return () => {
            events.forEach((event) => window.removeEventListener(event, resetTimer));
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [logout, navigate]);

    // Ce composant est invisible, il ne rend rien à l'écran
    return null;
}