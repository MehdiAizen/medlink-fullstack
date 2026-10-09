import { loginUser, getUserById } from './auth.service.js';

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const data = await loginUser(email, password);
        res.json(data);
    } catch (err) {
        // Renvoie une erreur 401 (Non autorisé)
        res.status(401).json({ error: err.message });
    }
}

export async function getMe(req, res) {
    try {
        // req.user est injecté par le middleware authenticate
        const user = await getUserById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}