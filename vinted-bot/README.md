# 🤖 VintedBot AI

> Créez des annonces Vinted parfaites en 1 clic grâce à l'IA !

![VintedBot Preview](https://img.shields.io/badge/Status-Ready%20to%20Deploy-00D4AA?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Fonctionnalités

- 📸 **Upload de photo** - Glissez ou sélectionnez une photo de votre article
- 🤖 **Analyse IA** - L'IA détecte automatiquement le type d'article, la marque, l'état, etc.
- 📝 **Génération de titre** - Titre accrocheur optimisé pour Vinted
- 📄 **Description complète** - Description vendeuse avec tous les détails
- 💰 **Suggestion de prix** - Prix min/optimal/max basé sur le marché
- 🏷️ **Mots-clés & Hashtags** - Pour maximiser la visibilité
- 📷 **Conseils photo** - Améliorez vos prochaines photos

## 🚀 Déploiement sur Netlify

### Étape 1 : Fork ou téléchargez le projet

Téléchargez ce dossier ou clonez-le sur votre GitHub.

### Étape 2 : Déployez sur Netlify

1. Allez sur [netlify.com](https://netlify.com) et connectez-vous (ou créez un compte gratuit)
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Connectez votre GitHub et sélectionnez le repo
4. Les paramètres de build sont déjà configurés dans `netlify.toml` :
   - Build command: `npm run build`
   - Publish directory: `dist`

### Étape 3 : Configurez les variables d'environnement

Dans Netlify, allez dans **Site settings** → **Environment variables** et ajoutez :

| Variable | Valeur |
|----------|--------|
| `GROQ_KEY` | Votre clé API Groq |
| `HF_TOKEN` | Votre token Hugging Face (optionnel) |

### Étape 4 : Redéployez

Cliquez sur **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

🎉 **Votre site est en ligne !**

## 🔑 Obtenir les clés API (gratuit)

### Groq API (obligatoire)
1. Allez sur [console.groq.com](https://console.groq.com)
2. Créez un compte gratuit
3. Allez dans **API Keys** → **Create API Key**
4. Copiez la clé

### Hugging Face (optionnel)
1. Allez sur [huggingface.co](https://huggingface.co)
2. Créez un compte gratuit
3. Allez dans **Settings** → **Access Tokens**
4. Créez un nouveau token

## 🛠️ Développement local

```bash
# Installer les dépendances
npm install

# Installer Netlify CLI
npm install -g netlify-cli

# Créer un fichier .env avec vos clés
cp .env.example .env
# Éditez .env avec vos vraies clés

# Lancer en local
netlify dev
```

## 📁 Structure du projet

```
vinted-bot/
├── netlify/
│   └── functions/
│       └── analyze.js     # Fonction serverless pour l'API
├── src/
│   ├── App.jsx           # Composant React principal
│   ├── main.jsx          # Point d'entrée
│   └── styles.css        # Styles
├── index.html            # Page HTML
├── package.json
├── vite.config.js
└── netlify.toml          # Config Netlify
```

## ⚠️ Sécurité

- **NE JAMAIS** commit vos clés API dans le code
- Utilisez **toujours** les variables d'environnement Netlify
- Régénérez vos clés si elles ont été exposées

## 📝 License

MIT - Utilisez, modifiez et partagez librement !

---

Fait avec 💜 par la communauté
