import { Router } from 'express';
import { login, getMe } from './auth.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

// Route publique : tout le monde peut essayer de se connecter
router.post('/login', login);

// Route protégée : il faut un token valide pour récupérer ses infos
router.get('/me', authenticate, getMe);

export default router;