## SpeedRun / FieldOps AI

This repo is split into a **FastAPI backend** (`backend/`) and a **Next.js frontend** (`frontend/`).

- Backend: FastAPI, SQLAlchemy, OpenAI integration.
- Frontend: Next.js 16, React 19, Tailwind CSS 4.

Use this README together with `backend/README.md` for backend-specific details.

---

## Local development

### Backend (FastAPI)

From the `backend` directory:

1. (Recommended) Create a virtualenv and activate it.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Ensure `backend/.env` exists with your config (the backend loads from `.env`). See `backend/README.md` for the variable names to set.
4. Start the dev server:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

See `backend/README.md` for more detail.

### Frontend (Next.js)

From the `frontend` directory:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `frontend/.env.local` with your backend URL:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

Then open `http://localhost:3000` in your browser.

---

## Deployment overview

### Backend on Render

This repo includes a `render.yaml` that defines a Python **Web Service** for the backend and a PostgreSQL database:

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root directory: `backend`

High-level steps:

1. Push this repo to GitHub/GitLab.
2. In Render, **New + Blueprint**, point to the repo, and Render will read `render.yaml`.
3. In the Render dashboard, set environment variables for the backend service:
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (link it to the `fieldops-db` database or another managed DB)
   - `FRONTEND_URL` (set later to your Vercel URL)
   - Optional overrides: `LABOR_RATE_PER_HOUR`, `LOW_STOCK_THRESHOLD`, `OLLAMA_MODEL`
4. Deploy. The backend will be available at a URL like `https://fieldops-backend.onrender.com`.

### Frontend on Vercel

Vercel will host the Next.js app in `frontend/`.

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Vercel, click **New Project** → **Import** your repo.
3. When prompted for **Root Directory**, choose `frontend`.
4. Use the default Next.js settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output: default (`.next`)
5. In Vercel Project Settings → **Environment Variables**, set:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL, e.g. `https://fieldops-backend.onrender.com`
6. Trigger a deploy. The frontend’s URL will look like `https://your-project.vercel.app`.

Once deployed, update your backend `FRONTEND_URL` env var (on Render) to the Vercel URL so CORS can be restricted accordingly.

