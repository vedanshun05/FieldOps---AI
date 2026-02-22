# SpeedRun / FieldOps AI — Full Project Summary & Pitch

## One-line pitch

**FieldOps AI** is a **zero-UI, voice-driven ERP** for field service workers: speak a job summary into your phone, and the system transcribes it, extracts structured data, logs the job, updates inventory, generates invoices, records revenue, and schedules follow-ups—all without filling forms.

---

## Vision & problem

Field technicians spend time on paperwork and data entry instead of on the job. **FieldOps AI** turns a short voice note (“Just finished at Acme Corp, 2 hours plumbing, used 3 pipe fittings and a valve, bill them, follow up in 6 months”) into a full backend workflow: job logged, inventory decremented, invoice created, revenue recorded, follow-up scheduled. The UI is minimal: a dashboard plus a **voice recorder** as the main input. The rest is an **autonomous agent** that executes the right tools in the right order.

---

## Project structure (high level)

```
SpeedRun/
├── backend/          # FastAPI app — voice pipeline, agent, DB, APIs
├── frontend/         # Next.js app — dashboard, voice recorder, jobs/inventory/follow-ups
├── render.yaml       # Render: backend Web Service + PostgreSQL
├── README.md         # Local dev + deployment overview
├── DEPLOY.md         # Step-by-step Render + Vercel deployment
└── .gitignore        # venv, node_modules, .env, etc.
```

- **Backend**: Python 3, FastAPI, SQLAlchemy, Groq (Whisper + LLM), config via `.env`.
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, single configurable API base URL.
- **Deployment**: Backend on **Render** (Web Service + Postgres), frontend on **Vercel**.

---

## Backend (FastAPI) — structure & responsibilities

### Entrypoint & config

- **`main.py`** — FastAPI app, CORS from `FRONTEND_URL`, lifespan (DB init), routers: health, voice, dashboard.
- **`config.py`** — Settings from `.env`: `GROQ_API_KEY`, `GROQ_LLM_MODEL`, `GROQ_WHISPER_MODEL`, `DATABASE_URL`, `LABOR_RATE_PER_HOUR`, `LOW_STOCK_THRESHOLD`, `FRONTEND_URL`.
- **`database.py`** — SQLAlchemy engine (SQLite or Postgres), session factory, `Base`, `get_db`, `init_db()` (create tables on startup).

### API surface

| Area | Route(s) | Purpose |
|------|----------|--------|
| **Health** | `GET /api/health` | Liveness for Render/monitoring |
| **Voice pipeline** | `POST /api/voice` | Upload audio → transcribe → extract → run agent → return full response |
| **Dashboard** | `GET /api/dashboard/summary` | Today’s jobs, revenue (today/week/month), low stock, upcoming follow-ups, recent jobs |
| **Dashboard** | `GET /api/dashboard/jobs` | List jobs (e.g. last 50) |
| **Dashboard** | `GET /api/dashboard/inventory` | All inventory items + low-stock flag |
| **Dashboard** | `GET /api/dashboard/followups` | Pending follow-ups |
| **Dashboard** | `GET /api/dashboard/alerts` | Low stock + overdue/upcoming follow-up alerts |

### Voice pipeline (core value)

`POST /api/voice` runs a **3-stage pipeline**:

1. **Transcribe** — `services/transcription.py`: Groq Whisper (e.g. `whisper-large-v3`) turns audio into text; handles small files and common hallucinations.
2. **Extract** — `services/extraction.py`: Groq LLM (e.g. `llama-3.3-70b-versatile`) returns structured JSON: customer, job type, labor hours, materials (item, quantity, unit), follow-up date/reason, invoice required, confidence. Uses a strict schema and system prompt for field-service language.
3. **Execute** — `agent/orchestrator.py`: Deterministic workflow that decides which tools to run and in what order:
   - **Always**: `log_job` (persist job with transcript, materials, labor, status).
   - **If materials**: `update_inventory` (decrement stock).
   - **If invoice required**: `generate_invoice` (labor + materials) → `update_revenue` (daily revenue entry).
   - **If follow-up**: `schedule_followup` (date from relative text like “6 months” or “next week”).

Tools live in **`tools/`**: `job_logger.py`, `inventory.py`, `invoice.py`, `followup.py`, `revenue.py`. Each uses the DB session and the extraction result; the orchestrator records **agent traces** (reasoning + tool results) for transparency.

### 3-schema response design

The voice endpoint returns one payload that serves three audiences:

- **AI extraction schema** — Semantic, LLM-friendly view (intents, “mentioned” fields) for future AI or analytics.
- **Execution schema** — Normalized, deterministic contract (customer, job, labor, materials, follow_up, actions) for the agent and tooling.
- **Response schema** — UI-oriented: what changed (job_logged, inventory_updated, invoice_generated, followup_scheduled, revenue_added, low_stock_items, next_followup_date, job_summary).

So the same voice note drives **logging, inventory, invoicing, revenue, and follow-ups** in one shot, with clear traces and a single API response.

### Data model (`models/models.py`)

- **Job** — customer_name, job_type, materials_used (JSON), labor_hours, status, transcript, confidence_score, created_at; relations to Invoice and FollowUp.
- **Invoice** — job_id, labor_cost, materials_cost, total_amount, created_at.
- **Inventory** — item_name, quantity, unit, unit_cost, updated_at.
- **FollowUp** — job_id, customer_name, scheduled_date, reason, status (pending/completed/cancelled), created_at.
- **RevenueEntry** — date, amount, source, job_id, created_at.

All created via SQLAlchemy `Base.metadata.create_all` on startup (no separate migrations in this repo).

### Supporting code

- **`schemas/extraction.py`** — Pydantic models: `JobExtraction`, `MaterialUsed`, tool/agent result types, and the three pipeline schemas (AI extraction, execution, response).
- **`routes/voice.py`** — Builds the three schemas from extraction + agent result and returns `VoiceResponse`.
- **`routes/dashboard.py`** — Aggregations and filters for summary, jobs, inventory, follow-ups, alerts (using `LOW_STOCK_THRESHOLD` and date ranges).
- **`tests/`** — Pytest + pytest-asyncio for agent, tools, and schemas.

---

## Frontend (Next.js) — structure & responsibilities

### Stack

- **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **Lucide React** icons.
- Single env-driven API base: **`NEXT_PUBLIC_API_URL`** (e.g. `http://localhost:8000` in dev, Render URL in prod). All backend calls go through **`src/lib/api.js`**.

### Pages (App Router)

| Route | File | Purpose |
|-------|------|--------|
| `/` | `src/app/page.js` | Main dashboard: voice recorder, stats (jobs today, revenue today/week/month), low stock, upcoming follow-ups, recent jobs, alerts; shows agent trace after each voice submission. |
| `/jobs` | `src/app/jobs/page.js` | List of jobs (from `/api/dashboard/jobs`). |
| `/inventory` | `src/app/inventory/page.js` | Inventory list and low-stock highlighting (from `/api/dashboard/inventory`). |
| `/followups` | `src/app/followups/page.js` | Pending follow-ups (from `/api/dashboard/followups`). |

### Components

- **`VoiceRecorder.js`** — Records audio (e.g. WebM), sends to `POST /api/voice`, reports success/error and passes full response up (for agent trace and dashboard refresh).
- **`AgentTrace.js`** — Displays the agent’s steps and tool results from the last voice response (transparency).
- **`StatsCard.js`** — Reusable stat tile (icon, label, value).
- **`AlertBanner.js`** — Renders alerts from `/api/dashboard/alerts` (low stock, overdue/upcoming follow-ups).

### Data flow

- Dashboard loads **summary** and **alerts** on mount and on an interval (e.g. every 10s); after each voice submission it refetches so stats and alerts stay in sync.
- Jobs, inventory, and follow-ups pages each call their dashboard API once (or can be extended to refresh).
- No local DB; all state is server-driven via the FastAPI backend.

---

## Deployment & operations

- **Backend (Render)**  
  - **Blueprint** from `render.yaml`: one **Web Service** (`fieldops-backend`, root `backend`, `pip install -r requirements.txt`, `uvicorn main:app --host 0.0.0.0 --port $PORT`) and one **PostgreSQL** database (`fieldops-db`).  
  - Env vars (set in dashboard): `DATABASE_URL` (from DB), `OPENAI_API_KEY` or Groq keys as used by the app, `FRONTEND_URL` (Vercel URL after frontend deploy), optional `LABOR_RATE_PER_HOUR`, `LOW_STOCK_THRESHOLD`.

- **Frontend (Vercel)**  
  - Import repo, **root directory** = `frontend`, default Next.js build; set **`NEXT_PUBLIC_API_URL`** to the Render backend URL.

- **CORS**  
  - Backend allows only `FRONTEND_URL` (no wildcard in production).

- **Docs**  
  - **README.md** — Local run (backend `.env`, frontend `.env.local`) and high-level Render/Vercel steps.  
  - **DEPLOY.md** — Step-by-step: git push, Render Blueprint, env vars, deploy; then Vercel project, root `frontend`, env; then set `FRONTEND_URL` for CORS.

---

## Technical highlights (for pitch / due diligence)

- **Voice-first, minimal UI** — Primary input is voice; dashboard and tables support oversight, not data entry.
- **Structured AI pipeline** — Whisper → LLM extraction (schema-enforced JSON) → deterministic agent with clear tool order and business rules.
- **Single-request workflow** — One voice call triggers job log, inventory update, invoice, revenue, and follow-up when applicable.
- **Observability** — Agent trace (reasoning + tool results) returned in the API and shown in the UI.
- **Production-ready layout** — Separate backend/frontend, env-based config, CORS locked to frontend origin, health check, Render + Vercel deployment path with `render.yaml` and docs.
- **Testability** — Pytest for agent, tools, and schemas; FastAPI dependency injection for DB.

---

## Repo layout (reference)

```
backend/
├── main.py              # FastAPI app, CORS, lifespan, routers
├── config.py            # Settings from .env (Groq, DB, labor, threshold, FRONTEND_URL)
├── database.py          # Engine, SessionLocal, Base, get_db, init_db
├── requirements.txt     # fastapi, uvicorn, pydantic, sqlalchemy, openai, etc.
├── README.md            # Env vars, local & prod uvicorn commands
├── agent/
│   └── orchestrator.py  # execute_workflow, tool selection, traces
├── models/
│   └── models.py        # Job, Invoice, Inventory, FollowUp, RevenueEntry
├── routes/
│   ├── voice.py         # POST /api/voice — full pipeline
│   ├── dashboard.py    # /api/dashboard/summary|jobs|inventory|followups|alerts
│   └── health.py        # GET /api/health
├── schemas/
│   └── extraction.py   # JobExtraction, tool/agent schemas, 3-pipeline schemas
├── services/
│   ├── transcription.py # Groq Whisper
│   └── extraction.py    # Groq LLM structured extraction
├── tools/
│   ├── job_logger.py    # Log job to DB
│   ├── inventory.py     # Decrement materials
│   ├── invoice.py      # Create invoice from job
│   ├── followup.py      # Schedule follow-up
│   └── revenue.py      # Add revenue entry
└── tests/               # Pytest

frontend/
├── package.json         # next, react, tailwind, lucide-react
├── next.config.mjs
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js      # Dashboard + voice
│   │   ├── jobs/page.js
│   │   ├── inventory/page.js
│   │   └── followups/page.js
│   ├── components/
│   │   ├── VoiceRecorder.js
│   │   ├── AgentTrace.js
│   │   ├── StatsCard.js
│   │   └── AlertBanner.js
│   └── lib/
│       └── api.js       # submitVoice, getDashboardSummary, getJobs, getInventory, getFollowups, getAlerts
```

---

## Summary

**SpeedRun / FieldOps AI** is a full-stack, voice-driven field service backend with a thin Next.js dashboard. The backend runs a **transcribe → extract → execute** pipeline with an **agent** that logs jobs, updates inventory, generates invoices, records revenue, and schedules follow-ups. The frontend provides a **voice recorder**, **dashboard metrics**, **agent trace**, and **jobs / inventory / follow-ups** views, all backed by a single configurable API. The repo is structured for **Render (backend + Postgres)** and **Vercel (frontend)** with clear env vars, CORS, and step-by-step deployment docs.
