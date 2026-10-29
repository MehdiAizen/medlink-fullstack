import pool from '../utils/db.js';

export function logAction(action, ressource = null) {
    return async (req, res, next) => {
        try {
            await pool.query(
                `INSERT INTO journal_audit (utilisateur_id, action, ressource, adresse_ip) VALUES ($1, $2, $3, $4)`,
                [req.user?.id || null, action, ressource, req.ip]
            );
        } catch (err) {
            console.error('Erreur journalisation:', err);
        }
        next();
    };
}