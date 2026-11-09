import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../shared/utils/db.js';
import {
    createKeycloakUser,
    assignRealmRole,
    sendVerifyEmail,
    deleteKeycloakUser,
    KeycloakError,
} from '../../shared/utils/keycloakAdmin.js';

export async function loginUser(email, password) {
    // 1. Chercher l'utilisateur par email
    const result = await pool.query(
        'SELECT id, email, password_hash, full_name, role, specialty FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        throw new Error('Identifiants incorrects');
        // Note: Pour la sécurité (US-41), on dit toujours "Identifiants incorrects"
        // et jamais "Utilisateur non trouvé" pour ne pas révéler l'existence du compte.
    }

    const user = result.rows[0];

    // 2. Vérifier le mot de passe haché
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        throw new Error('Identifiants incorrects');
    }

    // 3. Générer le token JWT (US-40 : expiration 15min ou 24h selon .env)
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            specialty: user.specialty
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 4. Retourner les données sans le mot de passe
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            specialty: user.specialty
        },
    };
}

export async function getUserById(userId) {
    const result = await pool.query(
        'SELECT id, email, full_name, role, specialty, phone FROM users WHERE id = $1',
        [userId]
    );
    if (result.rows.length === 0) throw new Error('Utilisateur non trouvé');
    return result.rows[0];
}

// ---------------------------------------------------------------------------
// Inscription patient (US-01) : Keycloak d'abord, puis le profil PostgreSQL.
// ---------------------------------------------------------------------------

export class RegistrationError extends Error {
    constructor(code) {
        super(code);
        this.name = 'RegistrationError';
        // CONFLICT : email déjà utilisé | REJECTED : refus de Keycloak | FAILED : erreur technique
        this.code = code;
    }
}

// Compensation : si le profil PostgreSQL n'a pas pu être créé, on supprime
// le compte Keycloak pour ne pas laisser d'identité sans profil.
async function rollbackKeycloakUser(keycloakId) {
    try {
        await deleteKeycloakUser(keycloakId);
    } catch (err) {
        console.error(
            `COMPTE KEYCLOAK ORPHELIN à supprimer manuellement : ${keycloakId} (${err.message})`
        );
    }
}

export async function registerPatient(values, ip) {
    const { firstName, lastName, email, phone, password } = values;
    const fullName = `${firstName} ${lastName}`;

    // 1. Email déjà présent dans MedLink (insensible à la casse)
    const existing = await pool.query(
        'SELECT 1 FROM users WHERE lower(email) = $1',
        [email]
    );
    if (existing.rows.length > 0) {
        throw new RegistrationError('CONFLICT');
    }

    // 2. Création du compte dans Keycloak (le mot de passe est géré par Keycloak)
    let keycloakId;
    try {
        keycloakId = await createKeycloakUser({ email, firstName, lastName, phone, password });
    } catch (err) {
        if (err instanceof KeycloakError && err.status === 409) {
            throw new RegistrationError('CONFLICT');
        }
        if (err instanceof KeycloakError && err.status === 400) {
            throw new RegistrationError('REJECTED');
        }
        console.error('Inscription : création Keycloak échouée :', err.message);
        throw new RegistrationError('FAILED');
    }

    // 3. Rôle patient + profil PostgreSQL. En cas d'échec, on annule côté Keycloak.
    let newUserId;
    try {
        await assignRealmRole(keycloakId, 'patient');

        const inserted = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, role, phone, keycloak_id)
             VALUES ($1, NULL, $2, 'patient', $3, $4)
             RETURNING id`,
            [email, fullName, phone, keycloakId]
        );
        newUserId = inserted.rows[0].id;
    } catch (err) {
        await rollbackKeycloakUser(keycloakId);

        if (err.code === '23505') {
            throw new RegistrationError('CONFLICT');
        }
        console.error(
            `Inscription : échec après création Keycloak (${keycloakId}) :`,
            err.message
        );
        throw new RegistrationError('FAILED');
    }

    // 4. Email de vérification : un échec ne doit pas annuler l'inscription.
    //    Keycloak redemandera la vérification à la première connexion.
    try {
        await sendVerifyEmail(keycloakId);
    } catch (err) {
        console.error('Inscription : email de vérification non envoyé :', err.message);
    }

    // 5. Journal d'audit
    try {
        await pool.query(
            `INSERT INTO journal_audit (utilisateur_id, action, ressource, adresse_ip)
             VALUES ($1, 'REGISTER', $2, $3)`,
            [newUserId, "Inscription patient (CGU et politique de confidentialité acceptées)", ip || null]
        );
    } catch (err) {
        console.error('Inscription : journalisation impossible :', err.message);
    }

    return { id: newUserId };
}