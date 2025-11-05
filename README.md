# AI-Tax-Computation-Engine-BackEnd

## Overview

Django + DRF backend for the **AI-powered Tax Computation Engine**.
Parses Excel workbooks (no headers to preserve titles), detects modules (TB, IA, Deferred Tax, Provisions, Proof of Tax, Tax Comp), stores uploads, and exposes deterministic compute endpoints. AI is used only for classification/explanations (optional; Azure OpenAI).

---

## Prerequisites

* **Python 3.11+**
* **Pip** (or `py -m pip` on Windows)
* **Git**
* (Optional) Azure services: Blob Storage, Azure OpenAI

---

## Quick Start

```powershell
# 1) Clone
git clone <your-backend-repo-url> ai-tax-engine-backend
cd ai-tax-engine-backend

# 2) Create & activate venv
py -m venv venv
.\venv\Scripts\Activate.ps1

# 3) Install deps
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4) Configure environment
copy .env.example .env
# then edit .env with your values (see below)

# 5) Migrations
python manage.py makemigrations core
python manage.py migrate

# 6) Run dev server
python manage.py runserver
# http://127.0.0.1:8000/
```

---

## Environment

Create **`.env`** at project root:

```dotenv
# Django
DJANGO_SECRET_KEY=dev-secret
DJANGO_DEBUG=true
ALLOWED_HOSTS=*

# Storage (leave blank to store locally under ./media)
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=taxgptdata

# Azure OpenAI (optional)
ENDPOINT_URL=
AZURE_OPENAI_API_KEY=
DEPLOYMENT_NAME=

# Search/Embeddings (optional)
AZURE_SEARCH_ENDPOINT=
AZURE_SEARCH_API_KEY=
AZURE_SEARCH_INDEX=
EMBED_DIM=768
```

A safe template is provided in **`.env.example`**.

> Pro tip (already coded): the app fails fast if `DJANGO_SECRET_KEY` is missing.

---

## Project Structure (high level)

```
apps/
  core/        # Run model, storage helpers
  ingest/      # Upload + module detection (normalize.py)
  compute/     # Deterministic compute (PBT from TB, etc.)
configs/
  rules/       # default_ruleset.yaml (aliases & fingerprints)
media/         # (created at runtime) uploads/artifacts/...
taxengine/     # Django settings & urls
```

---

## Key Commands

```powershell
# Create superuser (if you add admin later)
python manage.py createsuperuser

# Reset local DB (dangerous: deletes db.sqlite3)
deactivate
del .\db.sqlite3
rd /s /q .\apps\core\migrations
mkdir .\apps\core\migrations
ni .\apps\core\migrations\__init__.py -ItemType File
.\venv\Scripts\Activate.ps1
python manage.py makemigrations core
python manage.py migrate
```

---

## API (dev)

Base: `http://localhost:8000/api/v1`

| Method | Path                             | Description                                |
| -----: | -------------------------------- | ------------------------------------------ |
|   POST | `/runs/ingest`                   | Upload workbook (`form-data: workbook`)    |
|    GET | `/runs/<run_id>/modules`         | Grouped modules and best sheets            |
|    GET | `/runs/<run_id>/module/<module>` | Table preview (top 20×12)                  |
|    GET | `/runs/<run_id>/compute/all`     | Deterministic compute (includes PBT if TB) |

---

## CORS (needed for Vite frontend)

We use `django-cors-headers`. In `settings.py`:

```python
CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
# For quick tests only:
# CORS_ALLOW_ALL_ORIGINS = True
```

---

## Ruleset YAML

Edit **`configs/rules/default_ruleset.yaml`** to tune aliases & fingerprints.

* Quote tokens with special chars (we already fixed):

  * `"p&l"` (ampersand)
  * `"% rate"` (percent)
* Add realistic aliases: *Wear & Tear*, *DT Note*, *iTax Ledger*, *Tax Computation*, etc.

---

## Troubleshooting

**Network Error in UI**
CORS not set. Add `CORS_ALLOWED_ORIGINS` above and restart.

**`Missing required env var: DJANGO_SECRET_KEY`**
Create `.env` or set the variable in your environment.

**`no such table: core_run`**
Run `python manage.py makemigrations core && python manage.py migrate`.

**`FileNotFoundError: media/artifacts/uploads/...`**
Fixed: the storage helper now creates parent folders. Ensure `MEDIA_ROOT` exists.

**YAML ScannerError (`%` or `&`)**
Quote special tokens in YAML.

**`openpyxl header/footer warning`**
Harmless; we don’t use headers/footers.

---

## Optional: Azure Storage

If `AZURE_STORAGE_CONNECTION_STRING` is set, uploads go to Blob Storage.
The dev preview endpoints still expect local files; add a small “download-to-temp” helper later if you want previews from blob.

---

## Deployment (Azure App Service quick notes)

* Set all env vars in **App Settings** (not in `.env`).
* Use **Gunicorn** or **Uvicorn** via a startup command (Linux App Service).
* Run `python manage.py migrate` in a startup/CI step.
* Use Azure Storage for uploads in prod.

---

# 📄 ai-tax-engine-frontend/README.md

## Overview

React + Vite + TypeScript UI for the Tax Engine.
Features a side-nav layout (Upload/Ingest, Run Summary, Compute, Export, Settings), glassy/futuristic styling, and path aliases (`@pages`, `@components`, etc.).

---

## Prerequisites

* **Node.js 20+** (or 18 LTS)
* **npm** (or `pnpm`/`yarn`)

---

## Quick Start

```powershell
# 1) Clone
git clone <your-frontend-repo-url> ai-tax-engine-frontend
cd ai-tax-engine-frontend

# 2) Install deps
npm install

# 3) Configure environment
copy .env.example .env
# then edit .env (see below)

# 4) Run dev
npm run dev
# http://localhost:5173/

# 5) Build preview
npm run build
npm run preview
```

---

## Environment

Create **`.env`**:

```dotenv
# API base for local backend
VITE_API_BASE=http://localhost:8000/api/v1
```

A sample **`.env.example`** is included.

---

## Path Aliases (Vite)

We use `vite-tsconfig-paths` so you can import like:

```ts
import Ingest from "@pages/Ingest";
import Sidebar from "@components/Sidebar";
```

`vite.config.ts` already includes:

```ts
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({ plugins: [react(), tsconfigPaths()] });
```

---

## Scripts

```bash
npm run dev       # start Vite (HMR)
npm run build     # production build
npm run preview   # serve dist/ locally
npm run lint      # (if ESLint configured)
```

---

## Folder Structure (high level)

```
src/
  api/
    client.ts            # axios instance (reads VITE_API_BASE)
  components/
    Sidebar.tsx
    Topbar.tsx
    FileDrop.tsx
    Table.tsx
  pages/
    Ingest.tsx
    RunSummary.tsx
    Compute.tsx
    Export.tsx
    Settings.tsx
  styles/
    app.css              # glassy/futuristic theme
  App.tsx
  main.tsx
  vite-env.d.ts
```

---

## Styling

All pages/components share **`src/styles/app.css`**:

* Glassmorphism, subtle gradients, sticky table headers.
* Auto light/dark via `prefers-color-scheme`.
* Responsive collapse of the sidebar under 960px.

If you want a manual light/dark toggle, add a small theme switch later (`data-theme` + `localStorage`).

---

## Connecting to Backend

Ensure the backend runs on `http://localhost:8000/` and your `.env` points to:

```
VITE_API_BASE=http://localhost:8000/api/v1
```

If you see a **Network Error** on upload:

* Confirm backend CORS allows `http://localhost:5173`.
* Check DevTools → Network → the POST shows `access-control-allow-origin`.

---

## Troubleshooting

**Imports like `@pages/Ingest` can’t be resolved**
Install and enable the plugin (already done):
`npm i -D vite-tsconfig-paths` and keep it in `vite.config.ts`.

**`vite.config.ts: Error: config must export or return an object.`**
Ensure you’re exporting a default config. (We’ve provided a working file.)

**UI shows “unknown” sheet types**
This is backend detection. Update `default_ruleset.yaml` aliases/fingerprints and use the improved `Normalizer.detect_modules`.

**Upload says 200 in backend but UI shows “Network Error”**
Set CORS in Django and restart.

---

## Build & Ship

```bash
npm run build
# outputs dist/
```

* For static hosting (Azure Static Web Apps/Nginx), serve `dist/`.
* To proxy backend in prod, configure your host to forward `/api/v1` to the Django app.

---

## Nice-to-Have Next

* Theme toggle (persisted).
* Toasts for success/error (e.g., react-hot-toast).
* “Trace” drawer on table cells (show lineage & rule).
* Download Excel from `/export` endpoint once backend writes the assembled report.

---

