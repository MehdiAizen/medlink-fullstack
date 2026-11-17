import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import SessionTimeout from './SessionTimeout';

// 1. Mocker les hooks de react-router et AuthContext
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Mocker la fonction alert pour qu'elle ne bloque pas le test
global.alert = vi.fn();

describe('SessionTimeout Component (US-40)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Permet de contrôler le temps virtuellement
  });

  it('devrait déconnecter l\'utilisateur après 15 minutes d\'inactivité', () => {
    // Rendu du composant
    render(<SessionTimeout />);

    // Avancer le temps de 15 minutes (900 000 ms)
    vi.advanceTimersByTime(15 * 60 * 1000);

    // Vérifier que logout a été appelé
    expect(mockLogout).toHaveBeenCalledTimes(1);

    // Vérifier que la navigation vers /login a été déclenchée
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });

    // Vérifier que l'alerte a été affichée
    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining('Votre session a expiré après 15 minutes')
    );
  });

  it('devrait réinitialiser le minuteur lors d\'une activité utilisateur', () => {
    render(<SessionTimeout />);

    // Avancer de 14 minutes (pas encore expiré)
    vi.advanceTimersByTime(14 * 60 * 1000);

    // Simuler une activité (ex: mouvement de souris)
    window.dispatchEvent(new Event('mousemove'));

    // Avancer de 2 minutes supplémentaires (total 16 min, mais le timer a été reset à 14min)
    vi.advanceTimersByTime(2 * 60 * 1000);

    // Le logout ne doit PAS avoir été appelé car l'activité a réinitialisé le compteur
    expect(mockLogout).not.toHaveBeenCalled();
  });
});