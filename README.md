# Google Auth - OAuth2 Application

Une application Express.js pour l'authentification avec Google OAuth2.

## Structure du projet

```
.
├── src/
│   ├── config/
│   │   └── env.js              # Configuration et variables d'environnement
│   ├── controllers/
│   │   └── authController.js   # Logique métier de l'authentification
│   ├── middleware/
│   │   └── auth.js             # Middleware d'authentification
│   ├── routes/
│   │   └── authRoutes.js       # Routes d'authentification
│   └── app.js                  # Configuration Express
├── server.js                   # Point d'entrée du serveur
├── package.json
├── .env                        # Variables d'environnement (à créer)
└── .env.example               # Exemple de variables d'environnement
```

## Installation

1. Cloner le projet
2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Créer un fichier `.env` basé sur `.env.example` :
   ```bash
   cp .env.example .env
   ```

4. Remplir les variables d'environnement dans `.env`

## Démarrage

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Routes

- `GET /` - Page d'accueil
- `GET /login` - Page de connexion
- `GET /auth/google` - Initier la connexion Google
- `GET /auth/google/callback` - Callback de Google (géré automatiquement)
- `GET /profile` - Récupérer le profil de l'utilisateur (protégé)
- `GET /logout` - Déconnexion

## Architecture

### Config (`src/config/env.js`)
Centralise toutes les variables d'environnement et les constantes.

### Controllers (`src/controllers/authController.js`)
Contient la logique métier :
- Génération de l'URL OAuth
- Échange du code contre un token
- Récupération du profil utilisateur
- Logout

### Middleware (`src/middleware/auth.js`)
Middleware de vérification :
- `isAuthenticated` - Protège les routes
- `isNotAuthenticated` - Empêche les utilisateurs connectés d'accéder aux pages de login

### Routes (`src/routes/authRoutes.js`)
Définit les endpoints OAuth2 et les routes protégées.

## Sécurité

✅ Protection CSRF avec le paramètre `state`
✅ Cookies HttpOnly et SameSite
✅ Validation des paramètres
✅ Gestion sécurisée des sessions
