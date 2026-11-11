import { Router } from 'express';
import { authenticate, requireRole } from '../../shared/middleware/auth.js';
import { logAction } from '../../shared/middleware/audit-logger.js';

const router = Router();

/**
 * Route de test et de production pour les rendez-vous praticien (US-39, US-62)
 * ⚠️ L'ORDRE EST CRUCIAL :
 * 1. authenticate : vérifie le JWT et remplit req.user
 * 2. requireRole : vérifie que req.user.role est 'practitioner' ou 'admin'
 * 3. logAction : (optionnel ici, mais obligatoire pour l'accès aux dossiers US-47)
 */
router.get('/appointments', authenticate, requireRole('practitioner', 'admin'), (req, res) => {
    // Si le code arrive ici, c'est que la sécurité a VALIDÉ l'accès
    res.status(200).json({
        message: 'Accès autorisé : Vous êtes bien un praticien ou un admin.',
        user: req.user.email
    });
});

// TODO: Aya ajoutera ici les autres routes sécurisées de la même manière

export default router;