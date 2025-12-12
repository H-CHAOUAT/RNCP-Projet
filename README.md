🚀 FinFamPlan
FinFamPlan est une application full-stack de gestion financière familiale.
 Elle permet l’inscription, la connexion, la gestion de session et un écran d’accueil personnalisé pour les nouveaux utilisateurs.
L’objectif final : accompagner les familles dans la gestion de leur budget, leurs dépenses et leurs objectifs financiers.


🧱 Architecture du Projet
Voici une vue globale et simple de l’architecture :
┌──────────────────────────────────────────┐
│                FRONTEND                  │
│         React + Vite + Tailwind          │
└──────────────────────────┬───────────────┘
                           │ REST API calls
                           ▼
┌──────────────────────────────────────────┐
│                BACKEND                   │
│               Spring Boot                │
│     Controllers — Services — Repos       │
│  Security: Argon2 + Spring Security      │
│  Flyway: DB migrations                   │
└──────────────────────────┬───────────────┘
                           │ JDBC
                           ▼
┌──────────────────────────────────────────┐
│               POSTGRESQL                 
│      Database 
└──────────────────────────────────────────┘


📦 Fonctionnalités Actuelles
🔐 Authentification
  -Inscription utilisateur
  -Connexion (email + mot de passe)
  -Stockage sécurisé des mots de passe via Argon2
  -Redirection automatique :
      -1ère connexion → Welcome Page
      -Connexions suivantes → Dashboard


🎨 Frontend
     -Design basé sur Atomic Design
     -UI responsive
     -TailwindCSS configuré (en local + Docker)


🐳 DevOps
  -Tout le projet tourne sous Docker Compose
  -Services :
    -Frontend
    -Backend
    -PostgreSQL Database



🛠️ Installation & Lancement
▶️ 1. Lancer avec Docker
  docker-compose up --build

    Frontend → http://localhost:5173
    Backend → http://localhost:8080
    PostgreSQL → localhost:5432


Stopper les services :
  docker-compose down


💾 Structure du Projet
project-root/
│
├── frontend/
│   ├── src/components/atoms
│   ├── src/components/molecules
│   ├── src/components/organisms
│   ├── src/pages
│   ├── App.jsx
│   └── Dockerfile
│
├── backend/
│   ├── controller/
│   ├── model/
│   ├── repository/
│   ├── config/
│   ├── service/
│   └── Dockerfile
│
└── docker-compose.yml


📘 API Documentation
🟢 POST /api/auth/register
Créer un utilisateur.
Body :
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@gmail.com",
  "password": "123456",
  "role": "PARENT"
}

Response :
{
  "message": "User registered successfully"
}


🟢 POST /api/auth/login
Connexion utilisateur.
Body :
{
  "email": "john@gmail.com",
  "password": "123456"
}

Response :
{
  "token": "example-token",
  "role": "PARENT"
}


🧪 Tests
Les tests unitaires et d'intégration seront ajoutés dans les prochaines étapes du développement.


🤝 Contributeur
👤 Hala Chaouat 


