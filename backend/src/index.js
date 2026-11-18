import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from 'helmet'; // ✅ US-61
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

// Importation des modules
import authRoutes from "./modules/auth/auth.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";
import practitionerRoutes from "./modules/practitioner/practitioner.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import dashboardRoutes from "./shared/routes/dashboard.routes.js";
import { startReminderWorker } from "./modules/patient/reminder.worker.js";
import { enforceHTTPS } from './shared/middleware/enforce-https.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// =================================================================
// 🛡️ CONFIGURATION DE SÉCURITÉ (En premier)
// =================================================================
app.set('trust proxy', 1); // Pour lire les vrais en-têtes derrière Nginx/Docker
app.use(helmet());         // US-61 : En-têtes de sécurité
app.use(enforceHTTPS);     // US-44 : Forcer HTTPS

// =================================================================
// ⚙️ MIDDLEWARES GLOBAUX
// =================================================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MedLink API", version: "1.0.0" });
});

// =================================================================
// 🚀 ROUTES
// =================================================================
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/practitioner", practitionerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => res.status(404).json({ error: "Route non trouvée" }));

app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err.stack);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

// =================================================================
// ▶️ DÉMARRAGE
// =================================================================
startReminderWorker();
app.listen(PORT, () => {
  console.log(`🚀 MedLink API running on http://localhost:${PORT}`);
});
