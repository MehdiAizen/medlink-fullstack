# MedLink — Application Full-Stack

Prototype fonctionnel d'une plateforme médicale sécurisée (espaces patient & praticien).

## Stack technique

| Composant       | Technologie                      |
|-----------------|----------------------------------|
| **Frontend**    | React.js + Vite + Tailwind CSS   |
| **Backend**     | Node.js + Express (API REST)     |
| **Base de données** | PostgreSQL                   |
| **Auth**        | JWT (JSON Web Tokens)            |

## Prérequis

- **Node.js** ≥ 18
- **Docker** & Docker Compose (pour PostgreSQL)
- **npm** ou **yarn**

## Démarrage rapide

### 1. Lancer PostgreSQL

```bash
cd medlink-fullstack
docker compose up -d
```

Attendez ~5 secondes que la base soit prête.

### 2. Backend

```bash
cd backend
npm install
npm run seed      # crée les tables + données de démo
npm run dev       # démarre l'API sur http://localhost:4000
```

### 3. Frontend

Ouvrez un **nouveau terminal** :

```bash
cd frontend
npm install
npm run dev       # démarre sur http://localhost:3000
```

### 4. Ouvrir l'application

Allez sur **http://localhost:3000**

---

## Comptes de démonstration

| Rôle     | Email                    | Mot de passe  |
|----------|--------------------------|---------------|
| Patient  | `patient@medlink.tn`     | `password123` |
| Patient  | `sara.patient@medlink.tn`| `password123` |
| Médecin  | `doctor@medlink.tn`      | `password123` | (Cardiologie)
| Médecin  | `pediatre@medlink.tn`    | `password123` | (Pédiatrie)
| Médecin  | `generaliste@medlink.tn` | `password123` | (Médecine Générale)

---

## Fonctionnalités

### Espace Patient
- Tableau de bord (stats + prochains RDV)
- Liste des rendez-vous
- Prise de rendez-vous en ligne
- Dossier médical (comptes-rendus)
- Résultats d'analyses biologiques

### Espace Praticien
- Tableau de bord (agenda du jour, patients)
- Agenda médical (confirmer / annuler / terminer RDV)
- Consultation des dossiers patients

---

## Structure du projet

```
medlink-fullstack/
├── docker-compose.yml      # PostgreSQL
├── README.md
├── backend/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── index.js
│       ├── db.js
│       ├── seed.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           ├── appointments.js
│           ├── records.js
│           └── dashboard.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── context/AuthContext.jsx
        ├── components/Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Appointments.jsx
            ├── BookAppointment.jsx
            ├── Records.jsx
            └── Results.jsx
```

---

## API REST (aperçu)

| Méthode | Endpoint                      | Description                |
|---------|-------------------------------|----------------------------|
| POST    | `/api/auth/login`             | Connexion                  |
| GET     | `/api/auth/me`                | Profil courant             |
| GET     | `/api/dashboard`              | Stats tableau de bord      |
| GET     | `/api/appointments`           | Liste RDV                  |
| POST    | `/api/appointments`           | Créer un RDV (patient)     |
| PATCH   | `/api/appointments/:id`       | Changer statut (médecin)   |
| GET     | `/api/records`                | Dossiers médicaux          |
| GET     | `/api/records/results`        | Résultats labo (patient)   |

---

## Notes

- Le frontend proxy les appels `/api` vers le backend (port 4000).
- Les données sont réinitialisées à chaque `npm run seed`.
- En production : changer `JWT_SECRET`, activer HTTPS, et configurer un hébergement HDS si nécessaire.
