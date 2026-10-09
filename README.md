# 🏥 MedLink - Portail Médical Sécurisé

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**MedLink** est une application fullstack de type **Monolithe Modulaire**, conçue pour gérer les rendez-vous, les dossiers médicaux et l'administration de trois cliniques partenaires en Tunisie.

Le projet est développé avec une approche **DevSecOps**, visant à renforcer la sécurité de l'application, la protection des données personnelles et la qualité du code, en s'appuyant sur les bonnes pratiques OWASP et les exigences applicables en matière de protection des données.

---

## 📑 Table des matières

- [Architecture du projet](#-architecture-du-projet)
- [Répartition de l'équipe et User Stories](#-répartition-de-léquipe--user-stories-backlog)
- [Installation et démarrage](#-installation-et-démarrage)
- [Comptes de démonstration](#-comptes-de-démonstration)
- [Sécurité et conformité](#️-sécurité--conformité-devsecops)
- [Guide de travail Git](#-guide-de-travail-git-pour-léquipe)
- [Technologies utilisées](#-technologies-utilisées)

---

## 🏗️ Architecture du projet

Le projet vise une architecture **Monolithe Modulaire** : les fonctionnalités sont séparées par domaine métier tout en restant intégrées dans une application unique.

```text
medlink-fullstack/
├── backend/
│   └── src/
│       ├── modules/              # Modules métier envisagés
│       │   ├── auth/             # Membre 1 : authentification
│       │   ├── patient/          # Membre 2 : espace patient
│       │   ├── practitioner/     # Membre 3 : espace praticien
│       │   ├── admin/            # Membre 4 : administration
│       │   └── core-security/    # Membre 5 : sécurité transverse
│       ├── shared/               # Ressources partagées
│       ├── middleware/           # Middlewares Express
│       ├── routes/               # Routes API
│       ├── db.js                 # Connexion à la base de données
│       ├── index.js              # Point d'entrée du backend
│       └── seed.js               # Initialisation des données
├── frontend/
│   ├── src/
│   │   ├── components/           # Composants React réutilisables
│   │   ├── context/              # Contextes React
│   │   ├── pages/                # Pages de l'application
│   │   ├── api.js                # Appels à l'API
│   │   ├── App.jsx               # Composant principal
│   │   ├── index.css             # Styles globaux
│   │   └── main.jsx              # Point d'entrée React
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── docker-compose.yml            # Configuration Docker éventuelle
└── README.md
```

> **Remarque :** cette arborescence présente les fichiers actuels connus et les modules métier envisagés. Adapte-la si l'organisation du code évolue. Le dépôt utilise actuellement `routes/`, `middleware/` et `db.js` dans le backend ; ne crée pas de dossiers supplémentaires uniquement pour correspondre à ce schéma.

---

## 👥 Répartition de l'équipe et User Stories (Backlog)

Chaque membre est responsable de son périmètre fonctionnel, de son code, de ses tests et de la prise en compte de la sécurité.

| Membre | Rôle / Module | User Stories clés | Livrables attendus |
|---|---|---|---|
| **Membre 1** | Authentification | US-01, 02, 03, 17, 34, 40, 41, 42 | Connexion, MFA/TOTP, protection contre la force brute, JWT, politique de mots de passe |
| **Membre 2** | Espace patient | US-04 à US-16 | Profil, rendez-vous, résultats, consentement et historique |
| **Membre 3** | Espace praticien | US-18 à US-26, US-39 | Agenda multi-sites, comptes rendus, contrôle d'accès |
| **Membre 4** | Back-office administrateur | US-27 à US-32, US-46, US-50, US-51 | Gestion des comptes, cliniques et statistiques |
| **Membre 5** | Sécurité transverse et DevSecOps | US-33, US-35 à US-39, US-43 à US-49, US-58 à US-66 | RBAC, journal d'audit, chiffrement, tests de sécurité et CI/CD |

**Important :** cette répartition reprend le backlog communiqué pour le projet. Vérifiez les numéros et les exigences de chaque User Story dans le backlog officiel avant de considérer les fonctionnalités comme terminées.

---

## 🚀 Installation et démarrage

### 1. Prérequis

Installer les outils suivants :

- [Node.js](https://nodejs.org/) — version 18 ou supérieure recommandée.
- npm — installé avec Node.js.
- [Git](https://git-scm.com/).
- [Docker](https://www.docker.com/) et Docker Compose si le projet utilise une base de données conteneurisée.

### 2. Cloner le dépôt

```bash
git clone https://github.com/souhajomaa/medlink-fullstack.git
cd medlink-fullstack
```

### 3. Configurer la base de données

Si le fichier `docker-compose.yml` configure correctement le service de base de données, démarrer les conteneurs :

```bash
docker compose up -d
```

Vérifier leur état :

```bash
docker compose ps
```

**Remarque :** les variables, les identifiants, le nom du service et le port de la base doivent correspondre à la configuration réelle du projet.

### 4. Configurer et démarrer le backend

```bash
cd backend
npm install
```

Créer un fichier `backend/.env` avec les variables adaptées au code du projet.

Exemple à adapter :

```dotenv
PORT=4000
JWT_SECRET=remplacer_par_un_secret_long_et_aleatoire
JWT_EXPIRES_IN=24h

DB_HOST=localhost
DB_PORT=5432
DB_USER=medlink
DB_PASSWORD=remplacer_par_un_mot_de_passe
DB_NAME=medlink
```

> Ne partagez jamais votre fichier `.env` ni vos vrais secrets. Les variables ci-dessus sont un exemple de configuration PostgreSQL ; adaptez-les au pilote de base de données effectivement utilisé par le backend.

Si le script `seed.js` initialise bien la base et que les variables requises sont configurées, exécuter :

```bash
node src/seed.js
```

Puis démarrer le serveur selon les scripts définis dans `backend/package.json` :

```bash
npm run dev
```

Si le script `dev` n'existe pas, consultez `package.json` et utilisez le script de démarrage réellement défini.

### 5. Configurer et démarrer le frontend

Ouvrir un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend Vite est configuré pour utiliser le port `3000`. Ouvrir :

http://localhost:3000

Le proxy Vite redirige les requêtes commençant par `/api` vers :

http://localhost:4000

Le backend doit donc écouter sur le port `4000`, ou la configuration du proxy doit être adaptée.

---

## 🔑 Comptes de démonstration

Les comptes de démonstration dépendent des données créées par le script `seed.js`.

Exemple de comptes prévus, **à vérifier dans le code avant utilisation** :

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Patient | `patient@medlink.tn` | À confirmer dans le seed (demo: password123)|
| Médecin | `doctor@medlink.tn` | À confirmer dans le seed |
| Administrateur | `admin@medlink.tn` | À confirmer dans le seed |

N'utilisez pas de mots de passe de démonstration en production. Si des comptes de test existent, ils doivent être réservés à l'environnement de développement.

---

## 🛡️ Sécurité et conformité DevSecOps

La sécurité constitue un axe important du projet MedLink.

Les objectifs comprennent notamment :

- **Authentification :** gestion sécurisée des sessions ou des jetons, expiration des jetons et MFA si cette fonctionnalité est implémentée.
- **Contrôle d'accès :** autorisations par rôle et vérification de l'accès aux ressources, en particulier aux dossiers médicaux.
- **Protection des données :** limitation de l'exposition des données personnelles et protection des informations sensibles.
- **Traçabilité :** journalisation des événements de sécurité et des accès pertinents.
- **Chiffrement :** protection des données en transit via HTTPS/TLS et chiffrement des données au repos lorsque nécessaire.
- **Tests de sécurité :** tests des autorisations, validation des entrées, gestion des erreurs et analyse des vulnérabilités.
- **DevSecOps :** intégration progressive de contrôles de sécurité dans le processus de développement et le pipeline CI/CD.

Les exigences relatives à la protection des données personnelles en Tunisie doivent être vérifiées au regard de la législation applicable et des recommandations de l'INPDP. La présence de ces objectifs dans le README ne signifie pas, à elle seule, que la conformité réglementaire ou la sécurité de l'application a été validée.

### Outils de sécurité envisagés

- OWASP ZAP pour les tests dynamiques de sécurité.
- ESLint pour l'analyse statique du code JavaScript.
- GitHub Actions pour automatiser les vérifications et les tests.
- Tests automatisés des rôles et des autorisations.

Ces outils doivent être configurés et exécutés avant de déclarer les contrôles correspondants opérationnels.

---

## 🔄 Guide de travail Git pour l'équipe

Pour faciliter la collaboration, le projet utilise des branches et des Pull Requests (PR).

**Règle d'équipe recommandée :** ne pas pousser directement sur `main` ou `dev`. Les modifications passent par une branche de fonctionnalité et une Pull Request.

### Étape 1 — Configuration initiale

À effectuer une seule fois par la personne qui crée la branche `dev` :

```bash
git clone https://github.com/souhajomaa/medlink-fullstack.git
cd medlink-fullstack

git checkout -b dev
git push -u origin dev
```

Si `dev` existe déjà sur GitHub, utiliser plutôt :

```bash
git fetch origin
git checkout -b dev origin/dev
```

### Étape 2 — Commencer une tâche

Avant de commencer une nouvelle fonctionnalité :

```bash
git checkout dev
git pull origin dev
git checkout -b feature/membre1-auth-login
```

Utiliser un nom de branche explicite, par exemple :

- `feature/membre1-auth-login`
- `feature/membre2-patient-appointments`
- `feature/membre3-practitioner-dashboard`
- `feature/membre4-admin-users`
- `feature/membre5-security-audit`

### Étape 3 — Ajouter et committer les modifications

Vérifier les fichiers modifiés :

```bash
git status
git diff
```

Ajouter les fichiers nécessaires et créer un commit :

```bash
git add .
git commit -m "feat(auth): implement login and JWT (US-02)"
```

Envoyer la branche sur GitHub :

```bash
git push -u origin feature/membre1-auth-login
```

Éviter d'inclure des fichiers `.env`, des secrets, `node_modules/` ou des fichiers générés.

### Étape 4 — Créer une Pull Request

1. Ouvrir le dépôt : https://github.com/souhajomaa/medlink-fullstack
2. Cliquer sur **Compare & pull request**.
3. Sélectionner `dev` comme branche de destination (*base*).
4. Sélectionner la branche `feature/...` comme branche source (*compare*).
5. Décrire les modifications et mentionner les User Stories concernées.
6. Demander une revue de code à un autre membre de l'équipe.
7. Fusionner la PR après validation des tests et approbation.

### Étape 5 — Synchroniser après la fusion

Après la fusion de la Pull Request :

```bash
git checkout dev
git pull origin dev
git branch -d feature/membre1-auth-login
```

Pour supprimer également la branche distante si elle n'a pas été supprimée automatiquement par GitHub :

```bash
git push origin --delete feature/membre1-auth-login
```

### Bonnes pratiques Git

- Faire des commits courts et explicites.
- Une branche par fonctionnalité ou correction.
- Synchroniser régulièrement la branche `dev`.
- Ne jamais committer de secrets ou de données médicales réelles.
- Tester le code avant d'ouvrir une Pull Request.
- Ne pas utiliser `git push --force` sur les branches partagées.
- Protéger `main` et `dev` avec les règles de branche GitHub si les droits du dépôt le permettent.

---

## 🧰 Technologies utilisées

| Technologie | Utilisation |
|---|---|
| React 18 | Interface utilisateur |
| Vite | Serveur de développement et build frontend |
| Tailwind CSS 3 | Styles et interface responsive |
| Node.js | Environnement d'exécution backend |
| Express | API HTTP, si utilisé dans le backend |
| PostgreSQL | Base de données prévue, à confirmer dans la configuration |
| Docker Compose | Orchestration locale des services, si configurée |
| Git et GitHub | Gestion du code source et collaboration |
| OWASP ZAP | Tests dynamiques de sécurité envisagés |

---

## 🎓 Contexte académique

Projet réalisé dans le cadre du module **PR-CYBERSECURITY-AND-CODING (5CC)**.

L'objectif est de développer une application fullstack de gestion médicale en intégrant les bonnes pratiques de développement collaboratif, de sécurité applicative et de DevSecOps.

---

*MedLink — Développement, collaboration et sécurité dès la conception.*
