import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
// ✅ AJOUT: Imports pour gérer les chemins de fichiers (nécessaire pour le déploiement)
import path from 'path';
import { fileURLToPath } from 'url';

// Importation des modules
import authRoutes from "./modules/auth/auth.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";
import practitionerRoutes from "./modules/practitioner/practitioner.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import dashboardRoutes from "./shared/routes/dashboard.routes.js";
import { startReminderWorker } from "./modules/patient/reminder.worker.js";
import { enforceHTTPS } from './shared/middleware/enforce-https.js';

dotenv.config({
  path: "../.env"
});

const app = express();
const PORT = process.env.PORT || 4000;

// Définition de __dirname pour les modules ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================================================================
// 🛡️ CONFIGURATION DE SÉCURITÉ (Doit être en TOUT PREMIER)
// =================================================================

// 1. Faire confiance au premier proxy (Nginx/Docker/Azure)
app.set('trust proxy', 1);

// 2. En-têtes de sécurité HTTP
app.use(helmet());

// 3. FORCER HTTPS
app.use(enforceHTTPS);

// =================================================================
// ⚙️ MIDDLEWARES GLOBAUX
// =================================================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MedLink API", version: "1.0.0" });
});

// =================================================================
// 🚀 MONTAGE DES MODULES API (EN PREMIER pour la priorité)
// =================================================================
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/practitioner", practitionerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =================================================================
// 🎨 SERVIR LE FRONTEND (APRÈS les API)
// =================================================================

// 1. Servir les fichiers statiques (CSS, JS, Images) depuis le dossier 'public'
// Ce dossier sera créé par notre workflow GitHub Actions lors du déploiement
app.use(express.static(path.join(__dirname, 'public')));

// 2. Route "Catch-all" pour le SPA (React/Vite)
// Si la requête n'est pas une API et n'est pas un fichier statique, 
// on renvoie index.html pour laisser le router du frontend gérer la page
app.get('*', (req, res) => {
  // Sécurité: on s'assure de ne pas intercepter les routes API ou docs par erreur
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return res.status(404).json({ error: "Route API non trouvée" });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =================================================================
// ▶️ DÉMARRAGE
// =================================================================
startReminderWorker();

app.listen(PORT, () => {
  console.log(`🚀 MedLink API running on http://localhost:${PORT}`);
});
