import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du client JWKS pour Keycloak
// Mehdi devra remplir ces variables dans le .env
const jwksUri = process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8080/realms/medlink/protocol/openid-connect/certs';
const issuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/medlink';

const client = jwksClient({
  jwksUri: jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Middleware d'authentification JWT (Compatible Keycloak - US-17, US-34, US-40)
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = header.split(' ')[1];

  jwt.verify(
      token,
      getKey,
      {
        issuer: issuer,
        algorithms: ['RS256'], // Algorithme par défaut de Keycloak
      },
      (err, decoded) => {
        if (err) {
          console.error('Erreur de vérification JWT:', err.message);
          return res.status(401).json({ error: 'Token invalide ou expiré' });
        }

        // Keycloak met les informations dans decoded.realm_access.roles ou decoded.resource_access
        // On normalise le rôle pour qu'il corresponde à notre logique (patient, practitioner, admin)
        const roles = decoded.realm_access?.roles || [];
        req.user = {
          id: decoded.sub, // L'ID utilisateur Keycloak
          email: decoded.email,
          role: roles.find(r => ['patient', 'practitioner', 'admin'].includes(r)) || 'patient',
          full_name: decoded.name || decoded.preferred_username,
        };

        next();
      }
  );
}

/**
 * Middleware de contrôle d'accès par rôle (RBAC - US-39)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // US-39 : "l'accès est refusé et la tentative est journalisée"
      // On pourrait appeler logAction ici, mais c'est mieux de le faire dans le contrôleur
      return res.status(403).json({ error: 'Accès non autorisé pour ce rôle' });
    }
    next();
  };
}