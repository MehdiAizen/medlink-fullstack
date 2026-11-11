import { createRemoteJWKSet, jwtVerify } from 'jose';
import dotenv from 'dotenv';
import pool from '../utils/db.js';

dotenv.config();

const JWKS = createRemoteJWKSet(
  new URL(process.env.KEYCLOAK_JWKS_URL)
);

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    const token = header.split(' ')[1];

    try {
        const { alg } = decodeProtectedHeader(token);

        if (alg === 'HS256') {
            if (process.env.ALLOW_LEGACY_AUTH === 'false' || !process.env.JWT_SECRET) {
                throw new Error('Authentification historique désactivée');
            }
            req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
            return next();
        }

        if (!jwks) throw new Error('Keycloak non configuré (KEYCLOAK_URL)');
        const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, algorithms: ['RS256'] });
        req.user = await resolveLocalUser(payload);
        next();
    } catch (err) {
        console.warn('[auth] token refusé :', err.message);
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.KEYCLOAK_ISSUER
    });

    if (payload.azp !== 'medlink-app') {
      return res.status(401).json({ error: 'Client non autorisé' });
    }

    const result = await pool.query(
      `SELECT id, email, full_name, role, specialty
       FROM users
       WHERE keycloak_id = $1`,
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: 'Compte Keycloak non associé à un profil MedLink'
      });
    }

    req.user = result.rows[0];
    next();

  } catch (err) {
    console.error('Erreur authentification :', err.message);
    return res.status(401).json({
      error: 'Token invalide ou expiré'
    });
  }
}

/**
 * Middleware de contrôle d'accès par rôle (RBAC)
 * Exemple : requireRole('admin', 'practitioner')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès non autorisé pour ce rôle'
      });
    }

    next();
  };
}