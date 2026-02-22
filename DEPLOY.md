# Deployment steps (run one by one)

## Step 1 — Git and push to GitHub — DONE

- Git initialized, initial commit created.
- **Your turn:** Create a new empty repo on GitHub, then run:

```bash
cd /home/vedu/Work/SpeedRun
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Backend build check — DONE

- Backend: `pip install -r requirements.txt` and `from main import app` both succeed in `backend/`.
- Render will run the same build in the `backend` root.

---

## Step 3 — Frontend build check — DONE

- Frontend: `npm run build` succeeds in `frontend/`.
- Vercel will use `npm run build` with root directory `frontend`.

---

## Step 4 — Deploy backend on Render

1. Open [Render Dashboard](https://dashboard.render.com/).
2. **New +** → **Blueprint**.
3. Connect your GitHub account and select the SpeedRun repo.
4. Render will read `render.yaml` and create:
   - Web Service `fieldops-backend` (root: `backend`)
   - PostgreSQL database `fieldops-db`
5. For the **fieldops-backend** service, open **Environment** and set:
   - `OPENAI_API_KEY` — your OpenAI key
   - `DATABASE_URL` — from the **fieldops-db** “Internal Database URL” (or use “Connect” and copy the URL)
   - `FRONTEND_URL` — leave as `http://localhost:3000` for now; set to your Vercel URL after Step 5
6. Click **Deploy** (or let auto-deploy run).
7. Note the backend URL, e.g. `https://fieldops-backend.onrender.com`.

---

## Step 5 — Deploy frontend on Vercel

1. Open [Vercel](https://vercel.com/) and sign in with GitHub.
2. **Add New…** → **Project** → import your SpeedRun repo.
3. Set **Root Directory** to `frontend` (Edit → set to `frontend`).
4. Under **Environment Variables**, add:
   - Name: `NEXT_PUBLIC_API_URL`  
   - Value: your Render backend URL from Step 4 (e.g. `https://fieldops-backend.onrender.com`)
5. Deploy. Note the frontend URL (e.g. `https://your-project.vercel.app`).

---

## Step 6 — Point backend CORS to frontend

1. In Render, open the **fieldops-backend** service → **Environment**.
2. Set `FRONTEND_URL` to your Vercel frontend URL from Step 5 (e.g. `https://your-project.vercel.app`).
3. Save; Render will redeploy. CORS will then allow only that origin.

---

Done. Backend: Render. Frontend: Vercel. CORS: restricted to your Vercel URL.
