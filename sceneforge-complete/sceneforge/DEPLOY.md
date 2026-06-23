# SceneForge — Deployment Guide
# Get your app live on your phone today

## FOLDER STRUCTURE
```
sceneforge/
├── frontend/     ← your React app → deploy to Vercel
├── backend/      ← your API server → deploy to Railway
└── .gitignore
```

═══════════════════════════════════════════════════════
## STEP 1 — Push to GitHub (5 minutes)
═══════════════════════════════════════════════════════

1. Go to github.com → click "New repository"
2. Name it: sceneforge
3. Set to Private, click "Create repository"

Then in VS Code terminal:
```bash
cd sceneforge
git init
git add .
git commit -m "Initial SceneForge commit"
git remote add origin https://github.com/YOUR_USERNAME/sceneforge.git
git push -u origin main
```


═══════════════════════════════════════════════════════
## STEP 2 — Deploy Frontend to Vercel (3 minutes)
═══════════════════════════════════════════════════════

1. Go to vercel.com → Sign in with GitHub
2. Click "Add New Project"
3. Import your "sceneforge" repo
4. IMPORTANT: Change root directory to "frontend"
5. Framework will auto-detect as Vite ✓
6. Click "Deploy"

You'll get a URL like: https://sceneforge-abc123.vercel.app

→ Open that URL on your phone RIGHT NOW. The app loads.
  (API calls won't work yet until Step 3 — but the UI is live)


═══════════════════════════════════════════════════════
## STEP 3 — Deploy Backend to Railway (5 minutes)
═══════════════════════════════════════════════════════

1. Go to railway.app → Sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your "sceneforge" repo
4. IMPORTANT: Set root directory to "backend"
5. Railway auto-detects Node.js and runs "npm start"

Then add your environment variables:
→ In Railway dashboard → your service → "Variables" tab
→ Add these one by one:

  EVOLINK_API_KEY      = (your EvoLink key from evolink.ai/dashboard/keys)
  ANTHROPIC_API_KEY    = (your Anthropic key from console.anthropic.com)
  FRONTEND_URL         = https://your-app.vercel.app  ← your Vercel URL

Railway gives you a URL like: https://sceneforge-backend.up.railway.app


═══════════════════════════════════════════════════════
## STEP 4 — Connect Frontend to Backend (2 minutes)
═══════════════════════════════════════════════════════

1. Go to Vercel dashboard → your project → "Settings" → "Environment Variables"
2. Add:
   VITE_API_URL = https://sceneforge-backend.up.railway.app
3. Go to "Deployments" → click "Redeploy" on the latest deployment

Now your frontend talks to your backend. Everything works.


═══════════════════════════════════════════════════════
## STEP 5 — Open on your phone
═══════════════════════════════════════════════════════

Open Chrome on your Android phone:
→ https://your-app.vercel.app

Tap the 3-dot menu → "Add to Home screen"
→ SceneForge installs like a real app on your home screen

For iPhone:
→ Open in Safari → Share button → "Add to Home Screen"


═══════════════════════════════════════════════════════
## ADMIN PANEL — Set API keys from your phone
═══════════════════════════════════════════════════════

The admin panel is already built in the app.
To access it:
1. Open SceneForge → go to Settings tab
2. Tap the version number ("Storyboard Engine · v2.0") 5 times quickly
3. Password: sceneforge2026

From the admin panel you can:
→ Enable/disable EvoLink image generation
→ Enable/disable EvoLink video generation
→ Choose image model (Nanobanana 2, GPT Image 2, Seedream, etc.)
→ Choose video model (Seedance I2V, Kling V3, Wan 2.6, etc.)
→ Set quality, aspect ratio, duration defaults
→ Set credit markup %
→ Toggle maintenance mode


═══════════════════════════════════════════════════════
## LATER — Real App Store submission (Capacitor)
═══════════════════════════════════════════════════════

When you're ready to submit to Play Store / App Store:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init SceneForge com.yourname.sceneforge
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android   # opens Android Studio
npx cap open ios       # opens Xcode
```

This wraps your existing Vite app into a native app.
Same codebase. No React Native rewrite needed.


═══════════════════════════════════════════════════════
## COSTS (approximate)
═══════════════════════════════════════════════════════

Vercel (frontend):    FREE forever on hobby plan
Railway (backend):    $5/month (500 hours free to start)
EvoLink:              Pay per generation (your API key)
Anthropic:            Pay per token (~$0.003 per storyboard)

Total fixed cost: ~$5/month to run SceneForge
