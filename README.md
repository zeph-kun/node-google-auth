# Google Auth - OAuth2 Application avec MongoDB

Une application Express.js pour l'authentification avec Google OAuth2 et persistance utilisateur dans MongoDB.

```mermaid
sequenceDiagram
    participant Browser as Navigateur
    participant App as Node.js App
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
    else State valide
        App->>Google: POST /oauth2.googleapis.com/token<br/>code, client_id, client_secret, grant_type=authorization_code
        Google->>App: access_token

        App->>GoogleAPI: GET /oauth2/v1/userinfo<br/>Authorization: Bearer access_token
        GoogleAPI->>App: profile {id, email, name, picture}

        Note over App: Ignore DB - session seulement
        App->>App: Met à jour session.user<br/>{id, email, name, picture}
        App->>Browser: Redirect /
    end

```

## Structure du projet

```
.
├── src/
│   ├── config/
│   │   ├── env.js              # Configuration et variables d'environnement
│   │   └── db.js               # Connexion MongoDB
│   ├── models/
│   │   └── User.js             # Schéma MongoDB User
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
├── .env.example                # Exemple de variables d'environnement
├── .gitignore                  # Fichiers à ignorer
└── README.md                   # Ce fichier
```

## Prérequis

- Node.js 14+
- MongoDB (local ou cloud via MongoDB Atlas)

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

Les logs indiquent :
- `✅ MongoDB connected successfully` - Connexion BD réussie
- `✅ New user created` - Nouvel utilisateur créé
- `✅ Existing user signed in` - Utilisateur existant connecté

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

## Flux d'authentification

1. Utilisateur clique sur "Login with Google"
2. État CSRF généré et stocké en session
3. Redirection vers Google
4. Google retourne un code d'autorisation
5. Échange du code contre un token d'accès
6. Récupération du profil utilisateur
7. **Upsert dans MongoDB** :
   - Si utilisateur existe → mise à jour des champs
   - Sinon → création d'un nouvel utilisateur
8. Stockage du profil en session
9. Redirection vers la page d'accueil

## Sécurité

✅ **Protection CSRF** avec le paramètre `state`
✅ **Cookies HttpOnly** et SameSite pour les sessions
✅ **Validation des paramètres** à chaque étape
✅ **Gestion sécurisée des sessions** (25h d'expiration)
✅ **Upsert utilisateur** pour éviter les doublons
✅ **.gitignore** configuré pour `.env` et `node_modules`

## Scripts

```bash
npm run dev        # Démarrer le serveur avec nodemon (rechargement auto)
npm start          # Démarrer le serveur en production
npm install        # Installer les dépendances
```

## Technologies utilisées

- **Express.js** - Framework web
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
