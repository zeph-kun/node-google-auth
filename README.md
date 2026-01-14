# Google Auth - OAuth2 Application avec MongoDB et Tailwind CSS

Une application Express.js pour l'authentification avec Google OAuth2, persistance utilisateur dans MongoDB.

## Flux d'authentification

```mermaid
sequenceDiagram
    participant Browser as Navigateur
    participant App as Node.js App
    participant DB as Base de Données
    participant Google as Google OAuth
    participant GoogleAPI as Google API

    Browser->>App: GET /login
    App->>App: Génère state (crypto.randomBytes)
    App->>App: Stocke state en session
    App->>Browser: Génère URL auth Google + state<br/>Redirect vers Google

    Browser->>Google: GET /o/oauth2/v2/auth<br/>?client_id, redirect_uri, code, scope, state

    alt Utilisateur s'authentifie
        Google->>Browser: Redirect vers callback<br/>avec code & state
    end

    Browser->>App: GET /auth/google/callback<br/>?code=...&state=...

    App->>App: Vérifie state vs session
    App->>App: Efface state de session
    alt State invalide
        App->>Browser: Redirect /login?error=invalid_state
    else Code manquant
        App->>Browser: Redirect /login?error=missing_code
    else State valide
        App->>Google: POST /oauth2.googleapis.com/token<br/>code, client_id, client_secret, grant_type=authorization_code
        Google->>App: access_token

        App->>GoogleAPI: GET /oauth2/v1/userinfo<br/>Authorization: Bearer access_token
        GoogleAPI->>App: profile {id, email, name, picture}

        App->>DB: findOne({email: profile.email})
        alt Utilisateur existe
            DB->>App: existing user
            App->>DB: update name, picture, googleId
            DB->>App: user mis à jour
        else Nouvel utilisateur
            App->>DB: create({googleId, email, name, picture})
            DB->>App: created user
        end

        App->>App: Met à jour session.user<br/>{id, email, name, picture}
        App->>Browser: Redirect /
    end
    Note over App,DB: Gestion erreurs DB/ Axios vers /login?error
```

## Structure du projet

```
.
├── src/
│   ├── config/
│   │   ├── env.js              # Configuration et variables d'environnement
│   │   └── db.js               # Connexion MongoDB
│   ├── controllers/
│   │   ├── authController.js   # Logique OAuth2 et upsert utilisateur
│   │   └── homeController.js   # Pages publiques (home, login)
│   ├── middleware/
│   │   └── auth.js             # Protection des routes
│   ├── models/
│   │   └── User.js             # Schéma MongoDB User
│   ├── routes/
│   │   ├── authRoutes.js       # Routes d'authentification
│   │   └── homeRoutes.js       # Routes publiques
│   ├── views/
│   │   ├── home.ejs            # Page d'accueil
│   │   ├── login.ejs           # Page de connexion
│   │   └── profile.ejs         # Profil utilisateur (JSON)
│   └── app.js                  # Configuration Express + EJS
├── server.js                   # Point d'entrée du serveur
├── package.json
├── .env                        # Variables d'environnement (à créer)
├── .env.example                # Exemple de variables
├── .gitignore                  # Fichiers à ignorer
└── README.md                   # Ce fichier
```

## Prérequis

- Node.js 14+
- MongoDB (local ou cloud via MongoDB Atlas)
- npm ou yarn

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

4. Remplir les variables d'environnement dans `.env` :
   ```dotenv
   # Google OAuth2
   CLIENT_ID=your_client_id
   SECRET_ID=your_client_secret
   REDIRECT_URI=http://localhost:3000/auth/google/callback

   # Session
   SESSION_SECRET=your-secret-key

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/google-auth
   # OU pour MongoDB Atlas :
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/google-auth?retryWrites=true&w=majority

   # Environment
   NODE_ENV=development
   ```

### Configuration MongoDB

**Option 1 : MongoDB Local**
```bash
# Installer MongoDB (macOS)
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community
```

**Option 2 : MongoDB Atlas (Cloud)**
- Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Créer un cluster
- Récupérer l'URI et la mettre dans `.env`

## Démarrage

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## Routes

### Public
- `GET /` - Page d'accueil (affiche profil si connecté)
- `GET /login` - Page de connexion
- `GET /auth/google` - Initier la connexion Google

### Protégées (nécessitent authentification)
- `GET /profile` - Récupérer le profil de l'utilisateur (JSON)
- `GET /logout` - Déconnexion

## Architecture

### Config (`src/config/`)

**env.js** - Centralise toutes les variables d'environnement et constantes.

**db.js** - Gère la connexion à MongoDB avec gestion d'erreurs.

### Models (`src/models/`)

**User.js** - Schéma MongoDB :
- `googleId` : ID Google (optionnel)
- `email` : Email unique
- `name` : Nom de l'utilisateur
- `picture` : URL de la photo de profil
- `createdAt` : Date de création

### Controllers (`src/controllers/authController.js`)

Logique métier :
- **generateGoogleAuthUrl** - Génère l'URL OAuth avec protection CSRF
- **handleGoogleCallback** - Échange du code contre token + upsert utilisateur
- **logout** - Destruction de session
- **getProfile** - Récupération du profil utilisateur

### Middleware (`src/middleware/auth.js`)

- **isAuthenticated** - Protège les routes (redirige vers login si non connecté)
- **isNotAuthenticated** - Empêche l'accès aux pages de login si déjà connecté

### Routes (`src/routes/authRoutes.js`)

Endpoints OAuth2 et routes protégées appliquant les middlewares.

## Sécurité

✅ **Protection CSRF** avec le paramètre `state`
✅ **Cookies HttpOnly** et SameSite pour les sessions
✅ **Validation des paramètres** à chaque étape
✅ **Gestion sécurisée des sessions** (24h d'expiration)
✅ **Upsert utilisateur** pour éviter les doublons
✅ **.gitignore** configuré pour `.env` et `node_modules`

## Technologies utilisées

- **Express.js** - Framework web
- **EJS** - Moteur de template
- **Mongoose** - ODM MongoDB
- **express-session** - Gestion des sessions
- **axios** - Requêtes HTTP
- **dotenv** - Variables d'environnement
- **nodemon** - Rechargement automatique (dev)

## Troubleshooting

### Error: db_error
Vérifier que MongoDB est en cours d'exécution :
```bash
brew services start mongodb-community
```

### CORS issues
Les CORS ne sont pas configurées (simple app). À ajouter si nécessaire.

### Images de profil ne se chargent pas
L'application affiche l'URL de l'image en page d'accueil. Vérifier que Google OAuth retourne bien `picture`.

## Troubleshooting

### Error: db_error
Vérifier que MongoDB est en cours d'exécution :
```bash
brew services start mongodb-community
```