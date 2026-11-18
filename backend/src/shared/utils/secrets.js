import fs from 'fs';

export function getSecret(secretName) {
    const secretPath = `/run/secrets/${secretName}`;

    try {
        // Si on est dans Docker, le fichier existe
        if (fs.existsSync(secretPath)) {
            return fs.readFileSync(secretPath, 'utf8').trim();
        }
    } catch (error) {
        console.warn(`⚠️ Impossible de lire le secret ${secretName}, fallback sur .env`);
    }

    // Fallback pour le développement local (npm run dev)
    return process.env[secretName.toUpperCase()] || '';
}