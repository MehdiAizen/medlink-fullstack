import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware d'authentification JWT
 * Vérifie que le token Bearer est valide et décode les infos utilisateur
 * Utilisé par TOUS les modules (auth, patient, practitioner, admin)
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contient { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

/**
 * Middleware de contrôle d'accès par rôle (RBAC - US-39)
 * Vérifie que l'utilisateur a le rôle requis pour accéder à la route
 * Exemple : requireRole('admin', 'practitioner')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé pour ce rôle' });
    }
    next();
  };
}