# iFake

Générateur de fausses conversations iMessage — outil interne pour créer, animer et exporter des conversations en vidéo.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (templates + images)
- Rendu vidéo client (Canvas + MediaRecorder)

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Si le site affiche une erreur serveur

```bash
npm run fix
```

Puis rafraîchir avec **Cmd+Shift+R**.

### Règles importantes

- **Toujours** utiliser `npm run dev` (jamais `next dev` directement)
- **Un seul** serveur à la fois — ne pas lancer plusieurs terminaux `npm run dev`
- Le script tue automatiquement les anciens serveurs et vide le cache `.next` à chaque démarrage
- URL : **http://localhost:3000** uniquement

## Configuration

| Variable | Description |
|---|---|
| `APP_PASSWORD` | Mot de passe partagé pour `/editor` (défaut: `ifake2024`) |
| `AUTH_SECRET` | Secret pour signer le cookie de session |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase (optionnel) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase (optionnel) |

Sans Supabase, les templates sont stockés en localStorage.

## Supabase

Exécuter `supabase/schema.sql` dans l'éditeur SQL Supabase.

## Sons

Placer les fichiers audio dans `public/sounds/` :

- `send.wav` (ou `.mp3` — adapter le chemin dans `src/lib/audioManager.ts`)
- `receive.wav`

## Déploiement Vercel

1. Pousser sur GitHub
2. Importer le repo dans Vercel
3. Configurer les variables d'environnement
4. Déployer

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Authentification |
| `/editor` | Éditeur de conversation |
