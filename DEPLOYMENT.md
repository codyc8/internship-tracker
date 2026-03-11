# Deployment Guide

## Overview

- **Frontend:** React app → Vercel (auto-deploy on git push)
- **Backend:** Node.js API → Railway or Render (manual deploy or git-connected)

## Frontend (Vercel) — LIVE ✅

**Status:** Deployed and auto-connected to GitHub

**Live URL:** https://internship-tracker.vercel.app (generating now)

**What happens:**
1. Code pushed to GitHub `main` branch
2. Vercel detects push automatically
3. Frontend builds + deploys in ~2 minutes
4. Changes live immediately

**Next deploys:** Just `git push` and Vercel handles the rest

---

## Backend (Node.js + Express)

### Option A: Railway (Recommended)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select `codyc8/internship-tracker`
4. Add these environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=sqlite:///data/tracker.db
   ```
5. Deploy
6. Get the public URL from Railway dashboard
7. Update Vercel env variable `BACKEND_URL`

### Option B: Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub, select `codyc8/internship-tracker`
4. Set build command: `cd server && npm install`
5. Set start command: `node server/index.js`
6. Add environment variables (same as Railway)
7. Deploy

### Option C: Local (Development Only)

```bash
cd /data/.openclaw/workspace/internship-tracker
npm run dev:backend
```

Backend runs on `http://localhost:3001`

---

## Environment Variables

Once backend is deployed, get the public URL and add to Vercel:

**In Vercel dashboard:**
1. Project Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://internship-tracker-api.railway.app` (or your backend URL)
3. Redeploy frontend

**In frontend code** (already ready):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
fetch(`${API_URL}/api/applications`)
```

---

## Local Development

```bash
# Install everything
npm install
cd frontend && npm install && cd ..

# Run dev servers (both frontend + backend)
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

---

## Current Status

- ✅ Code pushed to GitHub: https://github.com/codyc8/internship-tracker
- ✅ Vercel project created and linked
- ⏳ First deploy in progress (should be live in ~2 min)
- ⏳ Backend needs to be deployed (Railway/Render)

---

## Next Steps

1. **Check Vercel deployment:** https://vercel.com/dashboard
2. **Set up backend:** Choose Railway or Render
3. **Update API URL:** Add VITE_API_URL env var to Vercel
4. **Test:** Visit live URL and start tracking applications!

---

## Troubleshooting

**Frontend shows "API unreachable"?**
- Backend not deployed yet
- VITE_API_URL env var missing
- CORS not enabled in backend (already set up)

**GitHub push blocked?**
- Check for secrets in commits (never commit `.env.tokens`, `.env`)
- Use `.gitignore` for sensitive files

**Backend won't start?**
- Make sure `npm install` runs in both root and `server/` directories
- Check NODE_ENV is set to production
- Database path might need adjustment for cloud deployment
