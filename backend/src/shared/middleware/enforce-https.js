export function enforceHTTPS(req, res, next) {
    // En production, le proxy (Nginx) ajoute cet en-tête
    // En local, on peut le simuler ou accepter localhost pour le dev
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

    // Pour faciliter le dev local, on accepte aussi localhost sans HTTPS,
    // mais on bloque si c'est une IP externe non sécurisée.
    if (!isSecure && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
        return res.status(403).json({ error: 'HTTPS requis. Connexion non sécurisée refusée (US-44).' });
    }
    next();
}