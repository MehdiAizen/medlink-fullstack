# MedLink – Guide d'installation et de configuration

## 1. Présentation

MedLink est une plateforme de gestion médicale basée sur une architecture Full Stack.

### Technologies utilisées

- Frontend : React, Vite, Nginx
- Backend : Node.js, Express.js
- Base de données : PostgreSQL
- Authentification et gestion des identités : Keycloak
- Conteneurisation : Docker et Docker Compose
- Service SMTP : Gmail SMTP

## 2. Prérequis

Avant de commencer, installer :

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (facultatif pour une utilisation entièrement avec Docker)

Vérifier les installations :

```powershell
git --version
docker --version
docker compose version
```

## 3. Récupération du projet

Cloner la branche `feature/auth` :

```powershell
git clone -b feature/auth https://github.com/souhajomaa/medlink-fullstack.git
cd medlink-fullstack
```

## 4. Configuration des variables d'environnement

Créer le fichier `.env` à partir du modèle :

```powershell
Copy-Item .env.example .env
```

Ouvrir le fichier :

```powershell
notepad .env
```

Configurer les variables personnelles :

```env
PORT=4000

JWT_SECRET=GENERER_UN_SECRET_ALEATOIRE

DB_HOST=db
DB_PORT=5432
DB_USER=medlink
DB_PASSWORD=CHOISIR_UN_MOT_DE_PASSE
DB_NAME=medlink

KEYCLOAK_ADMIN=kcadmin
KEYCLOAK_ADMIN_PASSWORD=CHOISIR_UN_MOT_DE_PASSE

KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=medlink
KEYCLOAK_ISSUER=http://localhost:8081/realms/medlink
KEYCLOAK_JWKS_URL=http://keycloak:8080/realms/medlink/protocol/openid-connect/certs

KEYCLOAK_BACKEND_CLIENT_ID=medlink-backend
KEYCLOAK_BACKEND_CLIENT_SECRET=SECRET_A_GENERER_DANS_KEYCLOAK

FRONTEND_URL=http://localhost:3000
```

Ne jamais publier le fichier `.env` sur GitHub.

## 5. Démarrage avec Docker

Construire et démarrer les services :

```powershell
docker compose up -d --build
```

Vérifier les conteneurs :

```powershell
docker compose ps
```

Consulter les logs :

```powershell
docker compose logs -f
```

## 6. Accès aux applications

| Service | Adresse |
|---|---|
| Application MedLink | http://localhost:3000 |
| API Backend | http://localhost:4000 |
| Documentation Swagger | http://localhost:4000/api-docs |
| Console Keycloak | http://localhost:8081 |
| Interface Mailpit (si utilisé) | http://localhost:8025 |

## 7. Configuration de Keycloak

### 7.1. Accéder à la console

Ouvrir :

http://localhost:8081/admin

Se connecter avec les identifiants définis dans `.env`.

Le realm `medlink` est fourni dans :

```text
keycloak/import/realm-medlink.json
```

L'import automatique est activé dans Docker Compose avec :

```yaml
command: start-dev --import-realm
```

L'import est effectué lorsque le realm n'existe pas encore dans l'instance Keycloak.

### 7.2. Configurer le client Backend

Dans Keycloak :

1. Sélectionner le realm `medlink`.
2. Aller dans **Clients**.
3. Ouvrir `medlink-backend`.
4. Vérifier que **Client authentication** est activé.
5. Vérifier que **Service accounts roles** est activé.
6. Ouvrir l'onglet **Credentials**.
7. Générer ou consulter le client secret.
8. Copier le secret dans `.env` :

```env
KEYCLOAK_BACKEND_CLIENT_SECRET=VOTRE_SECRET
```

Redémarrer le backend :

```powershell
docker compose up -d --force-recreate backend
```

### 7.3. Configurer les permissions Admin API

Dans le client `medlink-backend` :

- Ajouter le client scope `kc-admin-api` comme Default Client Scope.
- Vérifier l'Audience Mapper pour inclure `medlink-backend` dans l'access token.
- Dans **Service Account Roles**, attribuer les rôles suivants de `realm-management` :

```text
view-users
view-realm
manage-users
query-users
```

Ces permissions permettent au backend de gérer les comptes utilisateurs via l'API d'administration Keycloak.

## 8. Configuration Gmail SMTP

Chaque membre peut configurer une adresse Gmail dédiée aux notifications MedLink.

### 8.1. Préparer le compte Gmail

1. Créer ou utiliser une adresse Gmail dédiée au projet.
2. Activer la validation en deux étapes.
3. Générer un mot de passe d'application Google.
4. Garder ce mot de passe confidentiel.

Documentation Google :

https://support.google.com/accounts/answer/185833

### 8.2. Configurer Keycloak

Dans la console Keycloak :

**Realm settings → Email**

Renseigner :

| Paramètre | Valeur |
|---|---|
| Host | `smtp.gmail.com` |
| Port | `587` |
| From | Votre adresse Gmail |
| From display name | `MedLink` |
| Enable SSL | OFF |
| Enable StartTLS | ON |
| Authentication | ON |
| Username | Votre adresse Gmail |
| Password | Votre mot de passe d'application Google |

Enregistrer la configuration et tester la connexion si l'option est disponible.

### 8.3. Tester les emails

Effectuer une inscription avec une adresse email accessible.

Vérifier la réception de l'email de vérification.

**Important :** ne jamais partager les identifiants Gmail ou le mot de passe d'application avec les autres membres de l'équipe.

## 9. Tester l'inscription et la connexion

1. Ouvrir http://localhost:3000.
2. Accéder à la page d'inscription.
3. Créer un compte patient.
4. Vérifier la création du compte dans Keycloak.
5. Vérifier la création du profil correspondant dans PostgreSQL.
6. Vérifier la réception de l'email de vérification.
7. Se connecter avec le compte créé.

## 10. Commandes Docker utiles

Afficher les conteneurs :

```powershell
docker compose ps
```

Consulter les logs du backend :

```powershell
docker compose logs -f backend
```

Consulter les logs Keycloak :

```powershell
docker compose logs -f keycloak
```

Redémarrer le backend :

```powershell
docker compose restart backend
```

Arrêter les services sans supprimer les volumes :

```powershell
docker compose down
```

Redémarrer les services :

```powershell
docker compose up -d
```

**Attention :** ne pas utiliser `docker compose down -v`, car cette commande supprime les volumes et les données persistantes.

## 11. Architecture du projet

```text
medlink-fullstack/
│
├── backend/
│   ├── migrations/
│   └── src/
│       ├── modules/
│       │   └── auth/
│       └── shared/
│           ├── middleware/
│           └── utils/
│
├── frontend/
│   └── src/
│       ├── modules/
│       │   └── auth/
│       └── shared/
│
├── keycloak/
│   └── import/
│       └── realm-medlink.json
│
├── keycloak-theme/
│   └── medlink/
│       └── login/
│
├── docker-compose.yml
├── .env.example
└── README_SETUP.md
```

## 12. Gestion des comptes et des données

Chaque membre de l'équipe dispose de sa propre instance locale :

- Les comptes Keycloak sont propres à chaque instance.
- La base PostgreSQL est locale.
- Les paramètres SMTP sont configurés individuellement.
- Le code source et la configuration initiale du realm sont partagés via GitHub.

Pour partager les comptes et les données entre plusieurs machines, il faudra déployer une instance centrale de Keycloak et une base PostgreSQL commune, avec une configuration sécurisée.

---

**MedLink – Installation et configuration de l'environnement de développement**